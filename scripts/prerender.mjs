// Post-build: render the React app to static HTML and emit SEO / AI-discovery files,
// all generated from src/data/profile.js so content never drifts out of sync.
import { readFile, writeFile, rm } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const ssr = await import(pathToFileURL(path.resolve('dist-ssr/entry-server.js')).href);
const { render, SITE_URL, profile, experience, featuredProjects, moreProjects, skills, credentials, education, faq } = ssr;

const today = new Date().toISOString().slice(0, 10);
const allSkills = skills.flatMap((s) => s.items);

// ── JSON-LD: Person + ProfilePage + WebSite + FAQ (rich results & entity understanding for LLMs)
const person = {
  '@type': 'Person',
  '@id': `${SITE_URL}/#person`,
  name: profile.name,
  alternateName: ['Kartikey Shukla', 'Kartikey C. Shukla'],
  jobTitle: profile.role,
  description: profile.summary,
  url: `${SITE_URL}/`,
  image: `${SITE_URL}${profile.portrait}`,
  email: `mailto:${profile.email}`,
  address: { '@type': 'PostalAddress', addressLocality: 'Lucknow', addressRegion: 'Uttar Pradesh', addressCountry: 'IN' },
  worksFor: { '@type': 'Organization', name: 'Prologic First' },
  alumniOf: { '@type': 'CollegeOrUniversity', name: education.school },
  knowsAbout: allSkills,
  sameAs: Object.values(profile.links),
  hasOccupation: { '@type': 'Occupation', name: profile.role, occupationLocation: { '@type': 'Country', name: 'India' }, skills: allSkills.join(', ') },
  hasCredential: credentials.map((c) => ({ '@type': 'EducationalOccupationalCredential', name: c.title, recognizedBy: { '@type': 'Organization', name: c.issuer } })),
};
const graph = {
  '@context': 'https://schema.org',
  '@graph': [
    person,
    {
      '@type': 'ProfilePage',
      '@id': `${SITE_URL}/#profilepage`,
      url: `${SITE_URL}/`,
      name: `${profile.name} — ${profile.role}`,
      dateModified: today,
      mainEntity: { '@id': `${SITE_URL}/#person` },
      hasPart: featuredProjects.map((p) => ({
        '@type': 'CreativeWork', name: p.title, description: p.blurb, url: p.live || p.repo, keywords: p.stack.join(', '),
        creator: { '@id': `${SITE_URL}/#person` },
      })),
    },
    { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: profile.name, inLanguage: 'en' },
    { '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

const tpl = await readFile('dist/index.html', 'utf8');
const html = tpl
  .replace('<!--app-html-->', render())
  .replace('<!--jsonld-->', `<script type="application/ld+json">${JSON.stringify(graph).replace(/</g, '\\u003c')}</script>`);
await writeFile('dist/index.html', html);

// ── robots.txt — explicitly welcome search + AI crawlers
await writeFile('dist/robots.txt', `User-agent: *
Allow: /

# AI assistants & answer engines are welcome to read and cite this profile
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-SearchBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`);

await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE_URL}/</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>
  <url><loc>${SITE_URL}/llms.txt</loc><lastmod>${today}</lastmod><priority>0.5</priority></url>
</urlset>
`);

// ── llms.txt — a clean, citation-friendly markdown profile for LLMs (llmstxt.org)
const md = [
  `# ${profile.name}`,
  '',
  `> ${profile.summary}`,
  '',
  `- Role: ${profile.headline}`,
  `- Location: ${profile.location}`,
  `- Availability: ${profile.availability}`,
  `- Email: ${profile.email}`,
  `- Website: ${SITE_URL}/`,
  ...Object.entries(profile.links).map(([k, v]) => `- ${k[0].toUpperCase() + k.slice(1)}: ${v}`),
  '',
  '## Experience',
  ...experience.flatMap((j) => ['', `### ${j.role} — ${j.company} (${j.period})`, ...j.points.map((p) => `- ${p}`), `- Stack: ${j.stack.join(', ')}`]),
  '',
  '## Featured projects',
  ...featuredProjects.flatMap((p) => ['', `### ${p.title} (${p.kind}, ${p.year})`, p.blurb, ...p.highlights.map((h) => `- ${h}`), `- Stack: ${p.stack.join(', ')}`, ...(p.live ? [`- Live: ${p.live}`] : []), ...(p.repo ? [`- Code: ${p.repo}`] : [])]),
  '',
  '## Other projects',
  ...moreProjects.map((p) => `- [${p.title}](${p.repo}): ${p.desc} (${p.stack})`),
  '',
  '## Skills',
  ...skills.map((s) => `- ${s.group}: ${s.items.join(', ')}`),
  '',
  '## Education',
  `- ${education.degree}, ${education.school} (${education.period})`,
  '',
  '## Certifications & achievements',
  ...credentials.map((c) => `- ${c.title} — ${c.issuer}${c.date ? ` (${c.date})` : ''}`),
  '',
  '## FAQ',
  ...faq.flatMap((f) => ['', `### ${f.q}`, f.a]),
  '',
].join('\n');
await writeFile('dist/llms.txt', md);

await rm('dist-ssr', { recursive: true, force: true });
console.log('✓ prerendered index.html, robots.txt, sitemap.xml, llms.txt');
