export default function PageHeader({ eyebrow, title, lead, children }) {
  return (
    <section className="page-head">
      <div className="container">
        {children}
        {eyebrow && <p className="eyebrow eyebrow--gold">{eyebrow}</p>}
        <h1>{title}</h1>
        {lead && <p className="page-head__lead">{lead}</p>}
      </div>
    </section>
  );
}
