export function decodeBasicHtmlEntities(value) {
  return String(value || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

export function cleanText(value) {
  return decodeBasicHtmlEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, ". ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+\./g, ".")
    .replace(/\.+/g, ".")
    .trim();
}

export function getFirstSentence(value, maxLength = 220) {
  const text = cleanText(value);
  if (!text) return "";

  const sentence = text.match(new RegExp(`^.{40,${maxLength}}?[.!?](\\s|$)`));
  return sentence ? sentence[0].trim() : text.slice(0, maxLength).trim();
}
