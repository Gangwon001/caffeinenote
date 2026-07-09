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

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

function renderMarks(text: string, marks: TiptapMark[] = []): string {
  return marks.reduce((acc, mark) => {
    switch (mark.type) {
      case "bold":
        return `<strong>${acc}</strong>`;
      case "italic":
        return `<em>${acc}</em>`;
      case "underline":
        return `<u>${acc}</u>`;
      case "strike":
        return `<s>${acc}</s>`;
      case "code":
        return `<code>${acc}</code>`;
      case "link": {
        const href = (mark as unknown as { attrs?: { href?: string } }).attrs?.href ?? "";
        return `<a href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer">${acc}</a>`;
      }
      default:
        return acc;
    }
  }, escapeHtml(text));
}

function alignStyle(node: TiptapNode): string {
  const align = node.attrs?.textAlign;
  return align && align !== "left" ? ` style="text-align:${align}"` : "";
}

function renderNode(node: TiptapNode): string {
  const children = (node.content ?? []).map(renderNode).join("");

  switch (node.type) {
    case "doc":
      return children;
    case "paragraph":
      return `<p${alignStyle(node)}>${children}</p>`;
    case "heading": {
      const level = Number(node.attrs?.level) || 2;
      return `<h${level}${alignStyle(node)}>${children}</h${level}>`;
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
    case "image": {
      const src = String(node.attrs?.src ?? "");
      const alt = String(node.attrs?.alt ?? "");
      return `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" />`;
    }
    case "table":
      return `<table><tbody>${children}</tbody></table>`;
    case "tableRow":
      return `<tr>${children}</tr>`;
    case "tableCell":
      return `<td>${children}</td>`;
    case "tableHeader":
      return `<th>${children}</th>`;
    case "youtube": {
      const src = String(node.attrs?.src ?? "");
      const width = node.attrs?.width ?? 640;
      const height = node.attrs?.height ?? 360;
      return `<iframe src="${escapeAttr(src)}" width="${width}" height="${height}" allowfullscreen></iframe>`;
    }
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
