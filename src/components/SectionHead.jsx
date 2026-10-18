import Split from './Split.jsx';

export default function SectionHead({ index, label, title, id }) {
  return (
    <div className="shead">
      <p className="eyebrow" data-fade><span className="eyebrow__dash" /> {index} — {label}</p>
      <Split as="h2" id={id} text={title} className="shead__title" data-split />
    </div>
  );
}
