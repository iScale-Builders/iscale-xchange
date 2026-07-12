import sanitizeHtml from "sanitize-html"

// Allow-list for the rich-text description HTML that ultimately reaches
// dangerouslySetInnerHTML (RichTextDisplay). It mirrors what the Tiptap
// StarterKit editor can produce and discards everything else — <script>, event
// handlers, and javascript:/data: URLs — which closes the stored-XSS vector.
// The client editor is not a trust boundary (server actions are callable
// directly), so we sanitize on write AND at the render boundary.
const RICH_TEXT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "hr",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "blockquote",
    "pre",
    "code",
    "strong",
    "b",
    "em",
    "i",
    "s",
    "strike",
    "u",
    "mark",
    "ul",
    "ol",
    "li",
    "a",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { a: ["http", "https", "mailto"] },
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      rel: "noopener noreferrer nofollow",
      target: "_blank",
    }),
  },
  disallowedTagsMode: "discard",
}

// Returns a safe HTML string for storage/render. Idempotent, so it is safe to
// apply both when writing and when rendering.
export function sanitizeRichText(html: string | null | undefined): string {
  if (!html) return ""
  return sanitizeHtml(html, RICH_TEXT_OPTIONS)
}
