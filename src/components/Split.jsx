// Splits text into masked word spans for GSAP reveals. Plain text is preserved
// (real spaces between words), so crawlers and screen readers read it normally.
export default function Split({ text, as: Tag = 'span', className, ...rest }) {
  const words = text.split(' ');
  // The space must sit *between* the inline-block word masks, or it collapses.
  return (
    <Tag className={className} {...rest}>
      {words.flatMap((w, i) => [
        <span className="w" key={i}><span className="wi">{w}</span></span>,
        i < words.length - 1 ? ' ' : null,
      ])}
    </Tag>
  );
}
