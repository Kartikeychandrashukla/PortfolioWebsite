// Single source of truth for the whole site.
// Every section, the JSON-LD schema, sitemap and llms.txt are generated from this file —
// edit content here, not inside components.

export const SITE_URL = 'https://kartikeychandrashukla.vercel.app'; // TODO: replace with your final domain

export const profile = {
  name: 'Kartikey Chandra Shukla',
  shortName: 'Kartikey',
  initials: 'KCS',
  pronouns: 'He/Him',
  role: 'Full Stack Developer',
  headline: 'Full Stack Developer — React.js, ASP.NET Core, C#, REST APIs, SQL & AI/RAG systems',
  tagline: 'I build full-stack products that think.',
  location: 'Lucknow, Uttar Pradesh, India',
  availability: 'Open to work — On-site · Hybrid · Remote',
  email: 'kartikey.picc@gmail.com',
  portrait: '/images/portrait-640.webp',
  summary:
    'Full Stack Developer from Lucknow, India, and a 2026 B.Tech Computer Science graduate of VIT Bhopal. ' +
    'I build production web applications with React, ASP.NET Core, Node.js and PostgreSQL, and I specialise in ' +
    'putting LLMs to practical use — RAG pipelines, AI help centres and context-aware assistants. ' +
    'At Prologic First I shipped a centralised SSO platform and an AI-powered help centre for hospitality software.',
  about: [
    'I write the whole stack: the React interface a user touches, the .NET or Node API behind it, the SQL that holds it together — and lately, the language model that makes it useful.',
    'At Prologic First I build software for the hospitality industry. I shipped a single sign-on system that lets people move across multiple products with one session, and an AI help centre that answers questions about any screen using a RAG pipeline — cutting support calls about product features.',
    'Outside work I build for clients and for myself: an e-commerce platform for Snekart, a restaurant ordering app, forecasting engines, network monitors and 250+ solved LeetCode problems along the way.',
  ],
  links: {
    linkedin: 'https://www.linkedin.com/in/kartikey-chandra-shukla-972797251/',
    github: 'https://github.com/Kartikeychandrashukla',
    leetcode: 'https://leetcode.com/u/Mrhoodie1234',
  },
};

export const stats = [
  { value: '3', label: 'Companies shipped for' },
  { value: '20+', label: 'Projects built' },
  { value: '250+', label: 'LeetCode problems' },
  { value: '2026', label: 'B.Tech CSE, VIT' },
];

// Big statement text (scroll-scrubbed word reveal)
export const manifesto =
  'I care about software that people actually use. Interfaces that feel instant. APIs that don’t break. ' +
  'And AI that answers the real question — grounded in your data, not guessing.';

export const experience = [
  {
    company: 'Prologic First',
    role: 'Full Stack Developer Trainee',
    period: 'Apr 2026 — Present',
    start: '2026-04',
    mode: 'Work from office · Gurugram',
    points: [
      'Built an AI-powered Help Center for hospitality products — a RAG pipeline with LlamaIndex that lets users query product guides, documents and tutorial videos in natural language.',
      'Owned the full build: React UI, .NET Core backend and LLM integration through providers like Groq, guiding users through unfamiliar screens and workflows.',
      'Added a caching layer for previously answered queries, cutting redundant LLM calls and speeding up frequent questions.',
      'Built a Centralized Profile Management System (.NET Core, React, PostgreSQL) — one profile & master-data layer shared across products.',
    ],
    stack: ['React', '.NET Core', 'LlamaIndex', 'Groq', 'PostgreSQL'],
  },
  {
    company: 'Prologic First',
    role: 'Full Stack Developer Intern',
    period: 'Feb 2026 — Apr 2026',
    start: '2026-02',
    mode: 'Work from office · Gurugram',
    points: [
      'Built a centralized SSO system with .NET Core, React and PostgreSQL — one authenticated session across multiple hospitality products.',
      'Developed authentication, authorization, session management and REST APIs backed by SQL stored procedures, eliminating separate logins.',
      'Shipped reusable auth APIs and UI components so new products integrate faster; fixed bugs and improved UI in the Asset Manager.',
    ],
    stack: ['ASP.NET Core', 'React', 'PostgreSQL', 'SSO', 'REST'],
  },
  {
    company: 'SniperThink',
    role: 'Frontend Developer',
    period: 'Aug 2025 — Oct 2025',
    start: '2025-08',
    mode: 'Remote',
    points: [
      'Architected an infinite-scrolling carousel in React/Next.js + TypeScript showcasing 6 AI features with auto-navigation — reducing user interaction time by 40%.',
      'Built responsive component architecture (TwoPanelChat, LeadLifecycleTimeline) with Tailwind CSS, reaching 95% mobile compatibility.',
    ],
    stack: ['Next.js', 'TypeScript', 'Tailwind'],
  },
  {
    company: 'Bluestock Fintech',
    role: 'Software Development Engineer Intern',
    period: 'Mar 2025 — Apr 2025',
    start: '2025-03',
    mode: 'Remote',
    points: ['Completed a software development engineering internship at Bluestock Fintech, a #startupindia fintech company.'],
    stack: ['JavaScript', 'APIs'],
  },
];

export const featuredProjects = [
  {
    slug: 'snekart',
    title: 'Snekart',
    kind: 'Client · E-commerce',
    year: '2026',
    blurb:
      'Full e-commerce platform for India’s first emotion-targeted wellness-kit brand. Shop by emotion, occasion or festival; checkout with Razorpay; track orders; read the blog.',
    highlights: [
      'Razorpay payments with HMAC-verified signatures & webhooks',
      'ASP.NET Core API — repositories, services, BCrypt auth',
      'Admin panel, reviews, blog, newsletter & transactional email',
    ],
    stack: ['React 19', 'Vite', 'Tailwind', 'ASP.NET Core', 'PostgreSQL', 'Razorpay', 'Docker'],
    live: 'https://www.snekart.in',
    image: '/images/snekart',
    imageAlt: 'Snekart homepage — “Every Emotion. The Right Care.” hero with wellness gift kits',
    accent: 'violet',
  },
  {
    slug: 'ai-help-widget',
    title: 'AI Contextual Help Widget',
    kind: 'Product · AI / RAG',
    year: '2026',
    blurb:
      'An embeddable help microservice that knows which screen you are on. Ask anything — it answers from screen-scoped docs, guides and video, without hallucinating.',
    highlights: [
      'RAG with LlamaCloud vector search + metadata-filtered retrieval',
      'Chat with history condensation & LLM-generated step-by-step guides',
      'Auto-extracts docs and YouTube tutorials via YouTube Data API',
    ],
    stack: ['.NET 10', 'ASP.NET Core', 'React', 'TypeScript', 'LlamaCloud', 'LLMs'],
    image: '/images/ai-help-widget-570.webp',
    imageAlt: 'AI help widget answering “how to settle NC check” with step-by-step instructions grounded in product documentation',
    imageVariant: 'widget',
    accent: 'blue',
  },
  {
    slug: 'yummy-burger',
    title: 'Yummy Burger',
    kind: 'Restaurant · Food ordering',
    year: '2025',
    blurb:
      'A full-stack ordering site for a premium handcrafted-burger restaurant — interactive menu, real-time cart and fast checkout.',
    highlights: [
      'Order processing under 100 ms with WebSocket updates',
      'Category filtering + lazy loading — 60% faster navigation',
      'Fully responsive React Bootstrap UI',
    ],
    stack: ['React', 'Node.js', 'Express', 'MongoDB', 'WebSockets'],
    live: 'https://food-delivery-app-frontend-dah2.onrender.com/',
    image: '/images/yummy-burger',
    imageAlt: 'Burger restaurant website homepage with “New Burger with Onion” hero and online ordering',
    repo: 'https://github.com/Kartikeychandrashukla/Food-delivery-app',
    accent: 'amber',
  },
  {
    slug: 'universal-forecast',
    title: 'Universal Utility Forecast',
    kind: 'Data · ML platform',
    year: '2025',
    blurb:
      'End-to-end time-series forecasting & anomaly detection — upload data, auto-select the best model, read the dashboard, export valuation reports.',
    highlights: ['ARIMA, Prophet, regression & ensembles', 'Automated model selection', 'Docker-ready for industrial workflows'],
    stack: ['Python', 'Prophet', 'ARIMA', 'Docker'],
    repo: 'https://github.com/Kartikeychandrashukla/universal-utility-forecast',
    accent: 'blue',
  },
  {
    slug: 'smart-network-monitor',
    title: 'Smart Network Monitor',
    kind: 'Realtime · Dashboard',
    year: '2025',
    blurb:
      'Real-time network monitoring: continuous ping health checks, latency & uptime charts, a D3 topology map and alerts over Email and Telegram.',
    highlights: ['WebSocket live updates', 'D3.js network topology', 'Automated Email + Telegram alerts'],
    stack: ['React', 'Node.js', 'WebSockets', 'D3.js'],
    repo: 'https://github.com/Kartikeychandrashukla/Smart-Network-Monitor',
    accent: 'violet',
  },
  {
    slug: 'rate-limiter',
    title: 'Adaptive Rate Limiter',
    kind: 'Security · Tooling',
    year: '2025',
    blurb:
      'A rate-limiting playground with behavioural analytics — simulate 25+ API types from login to payments and watch abuse get throttled.',
    highlights: ['25+ API traffic profiles', 'Behavioural abuse detection', 'Live, deployed demo'],
    stack: ['JavaScript', 'HTML', 'CSS'],
    live: 'https://rate-limited-cheker.vercel.app',
    repo: 'https://github.com/Kartikeychandrashukla/Rate_limited_cheker',
    accent: 'pink',
  },
];

export const moreProjects = [
  { title: 'AI Resume Parser', desc: 'Flask app that tests ATS-friendliness — extracts name, skills & history from PDFs with AI.', stack: 'Python · Flask · AI', repo: 'https://github.com/Kartikeychandrashukla/Resume_parser' },
  { title: 'ClientFlow CRM', desc: 'MERN CRM for customers, tasks & campaigns with Google OAuth.', stack: 'MongoDB · Express · React · Node', repo: 'https://github.com/Kartikeychandrashukla/clientflow' },
  { title: 'AI Desktop Assistant', desc: 'Voice assistant: speech-to-text, opens apps & sites, calls APIs.', stack: 'Python · Speech · APIs', repo: 'https://github.com/Kartikeychandrashukla/Aritificial-intelligence-assistant' },
  { title: 'Password Analyser', desc: 'Entropy, crack-time estimates and breach checks via HaveIBeenPwned.', stack: 'JavaScript · HIBP API', repo: 'https://github.com/Kartikeychandrashukla/Password_Analyser' },
  { title: 'Study Room Scheduler', desc: 'Library study-room booking with live occupancy tracking.', stack: 'TypeScript', repo: 'https://github.com/Kartikeychandrashukla/Study_booking_system' },
  { title: 'Lost & Found', desc: 'Report and recover lost items on campus.', stack: 'JavaScript', repo: 'https://github.com/Kartikeychandrashukla/Lost_And_Found' },
  { title: 'Weather Forecast', desc: 'Animated real-time weather for any city via OpenWeatherMap.', stack: 'JavaScript · API', repo: 'https://github.com/Kartikeychandrashukla/Weather-Forecast' },
];

export const skills = [
  { group: 'Languages', items: ['JavaScript', 'TypeScript', 'C#', 'Python', 'C++', 'SQL'] },
  { group: 'Frontend', items: ['React.js', 'Next.js', 'Vite', 'Tailwind CSS', 'Bootstrap', 'HTML', 'CSS'] },
  { group: 'Backend', items: ['ASP.NET Core', '.NET 10', 'Node.js', 'Express.js', 'REST APIs', 'Microservices', 'WebSockets'] },
  { group: 'AI', items: ['RAG pipelines', 'LlamaIndex', 'LlamaCloud', 'Groq', 'LLM integration', 'Semantic search'] },
  { group: 'Data', items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Stored procedures'] },
  { group: 'Auth & Ops', items: ['SSO', 'JWT', 'Google OAuth 2.0', 'Razorpay', 'Docker', 'CI/CD', 'Git', 'Postman'] },
];

export const process = [
  { n: '01', title: 'Understand the real problem', text: 'Before code: who uses it, what slows them down, what “done” looks like.' },
  { n: '02', title: 'Ship a working slice', text: 'UI, API and database end-to-end — small, real, in front of people fast.' },
  { n: '03', title: 'Make it fast, safe, smart', text: 'Caching, auth, tests — and AI only where it genuinely removes work.' },
];

export const credentials = [
  { title: 'Quantitative Research Job Simulation', issuer: 'JPMorgan Chase & Co. (Forage)', date: 'Oct 2025' },
  { title: 'The Bits and Bytes of Computer Networking', issuer: 'Google · Coursera' },
  { title: 'SQL Certificate', issuer: 'HackerRank' },
  { title: 'Build Your Generative AI Productivity Skills', issuer: 'Microsoft & LinkedIn Learning' },
  { title: 'SDE Internship Certificate', issuer: 'Bluestock Fintech', date: 'Apr 2025' },
  { title: '250+ problems solved', issuer: 'LeetCode · Data Structures & Algorithms', url: 'https://leetcode.com/u/Mrhoodie1234' },
];

export const education = {
  school: 'Vellore Institute of Technology, Bhopal',
  degree: 'B.Tech, Computer Science and Engineering',
  period: '2022 — 2026',
};

export const faq = [
  { q: 'Who is Kartikey Chandra Shukla?', a: 'Kartikey Chandra Shukla is a Full Stack Developer from Lucknow, India, and a 2026 Computer Science graduate of VIT Bhopal. He builds web applications with React, ASP.NET Core, Node.js and PostgreSQL, and AI features such as RAG-based help centres.' },
  { q: 'What does Kartikey work on?', a: 'At Prologic First he built a centralized SSO platform, a centralized profile management system and an AI-powered help centre (RAG with LlamaIndex) for hospitality software. He also built the Snekart e-commerce platform and the Yummy Burger ordering site.' },
  { q: 'Is Kartikey available for hire?', a: 'Yes. He is open to full-stack and AI engineering roles — on-site, hybrid or remote — and to freelance projects. Email kartikey.picc@gmail.com.' },
  { q: 'What is his tech stack?', a: 'React, Next.js, TypeScript, ASP.NET Core / C#, Node.js, Express, PostgreSQL, MySQL, MongoDB, LlamaIndex, Groq, Docker and Razorpay.' },
];
