import { Fragment } from "react";

// A product description written in one plain-text field, with a tiny format:
//   blank line        → new paragraph (the first paragraph is shown as a larger lead)
//   "- " or "• "      → bullet point
//   "1. "             → numbered point
//   "## "             → small heading
//   "Label: value"    → a run of these lines becomes a specifications table
//   **text**          → bold
// Text without any of this still shows as normal paragraphs.

const BULLET = /^\s*[-•*]\s+/;
const NUMBER = /^\s*\d+[.)]\s+/;
const HEADING = /^\s*#{2,3}\s+/;
const SPEC = /^\s*([^:]{1,30}):\s+(.+)$/;

export function parseDescription(text = "") {
  const blocks = [];
  let para = [];
  const flush = () => {
    if (para.length) blocks.push({ type: "p", text: para.join(" ") });
    para = [];
  };
  const push = (type, item) => {
    const last = blocks[blocks.length - 1];
    if (last?.type === type) last.items.push(item);
    else blocks.push({ type, items: [item] });
  };
  for (const raw of String(text).replace(/\r/g, "").split("\n")) {
    const line = raw.trim();
    if (!line) flush();
    else if (HEADING.test(line)) (flush(), blocks.push({ type: "h", text: line.replace(HEADING, "") }));
    else if (BULLET.test(line)) (flush(), push("ul", line.replace(BULLET, "")));
    else if (NUMBER.test(line)) (flush(), push("ol", line.replace(NUMBER, "")));
    else if (SPEC.test(line) && !/https?:$/i.test(line.match(SPEC)[1])) {
      flush();
      const [, k, v] = line.match(SPEC);
      push("specs", [k.trim(), v.trim()]);
    } else para.push(line);
  }
  flush();
  // a single "Label: value" line is more likely a sentence than a table
  return blocks.map((b) => (b.type === "specs" && b.items.length === 1 ? { type: "p", text: b.items[0].join(": ") } : b));
}

// plain text for meta descriptions, search and table previews
export function descriptionText(text = "") {
  return String(text)
    .replace(/\*\*/g, "")
    .replace(/^\s*(#{2,3}|[-•*]|\d+[.)])\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function Inline({ text }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>,
  );
}

export default function RichDescription({ text, className = "" }) {
  const blocks = parseDescription(text);
  if (!blocks.length) return null;
  let leadDone = false;
  return (
    <div className={"rdesc " + className}>
      {blocks.map((b, i) => {
        if (b.type === "p") {
          const lead = !leadDone;
          leadDone = true;
          return (
            <p key={i} className={lead ? "rdesc__lead" : undefined}>
              <Inline text={b.text} />
            </p>
          );
        }
        leadDone = true;
        if (b.type === "h") return <h3 key={i}>{b.text}</h3>;
        if (b.type === "specs")
          return (
            <dl key={i} className="rdesc__specs">
              {b.items.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>
                    <Inline text={v} />
                  </dd>
                </div>
              ))}
            </dl>
          );
        const List = b.type === "ol" ? "ol" : "ul";
        return (
          <List key={i} className={"rdesc__list rdesc__list--" + b.type}>
            {b.items.map((it, j) => (
              <li key={j}>
                <Inline text={it} />
              </li>
            ))}
          </List>
        );
      })}
    </div>
  );
}
