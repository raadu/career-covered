// The original filename is user-controlled (from the uploaded file), so it
// must never be embedded raw into a header — a filename containing CRLF or
// unescaped quotes could otherwise inject extra header fields.
export function buildContentDisposition(
  type: 'inline' | 'attachment',
  filename: string,
): string {
  const safe =
    Array.from(filename)
      .filter((char) => {
        const code = char.codePointAt(0) ?? 0;
        return code > 0x1f && code !== 0x7f && char !== '"';
      })
      .join('')
      .trim() || 'resume.pdf';
  return `${type}; filename="${safe}"`;
}
