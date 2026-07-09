interface TiptapMark {
  type: string;
}

interface TiptapNode {
  type?: string;
  text?: string;
  marks?: TiptapMark[];
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderMarks(text: string, marks: TiptapMark[] = []): string {
  return marks.reduce((acc, mark) => {
    switch (mark.type) {
      case "bold":
        return `<strong>${acc}</strong>`;
      case "italic":
        return `<em>${acc}</em>`;
      case "strike":
        return `<s>${acc}</s>`;
      case "code":
        return `<code>${acc}</code>`;
      default:
        return acc;
    }
  }, escapeHtml(text));
}

function renderNode(node: TiptapNode): string {
  const children = (node.content ?? []).map(renderNode).join("");

  switch (node.type) {
    case "doc":
      return children;
    case "paragraph":
      return `<p>${children}</p>`;
    case "heading": {
      const level = Number(node.attrs?.level) || 2;
      return `<h${level}>${children}</h${level}>`;
    }
    case "bulletList":
      return `<ul>${children}</ul>`;
    case "orderedList":
      return `<ol>${children}</ol>`;
    case "listItem":
      return `<li>${children}</li>`;
    case "blockquote":
      return `<blockquote>${children}</blockquote>`;
    case "codeBlock":
      return `<pre><code>${children}</code></pre>`;
    case "hardBreak":
      return "<br />";
    case "horizontalRule":
      return "<hr />";
    case "text":
      return renderMarks(node.text ?? "", node.marks);
    default:
      return children;
  }
}

export function renderTiptapContent(doc: unknown): string {
  if (!doc || typeof doc !== "object") return "";
  return renderNode(doc as TiptapNode);
}

function extractText(node: TiptapNode): string {
  if (node.type === "text") return node.text ?? "";
  const children = (node.content ?? []).map(extractText).join(" ");
  return node.type === "paragraph" || node.type === "heading" ? `${children} ` : children;
}

export function extractTiptapExcerpt(doc: unknown, maxLength = 90): string {
  if (!doc || typeof doc !== "object") return "";
  const text = extractText(doc as TiptapNode).replace(/\s+/g, " ").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}
