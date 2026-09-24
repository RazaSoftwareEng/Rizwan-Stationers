import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";

export default function NotFound() {
  return (
    <>
      <PageHeader eyebrow="404" title="Page not found" />
      <section className="section">
        <div className="container empty">
          <p>That page doesn't exist — maybe it got lost under the papers.</p>
          <Link to="/" className="btn btn--lg">Back to home</Link>
        </div>
      </section>
    </>
  );
}
