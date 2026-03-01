export const computePosition = (
  text: string,
  charIndex: number,
): { readonly line: number; readonly column: number } => {
  const prefix = text.slice(0, charIndex);
  const lineOffset = prefix.split('\n').length - 1;
  const lastNewline = prefix.lastIndexOf('\n');
  const column = lastNewline === -1 ? charIndex + 1 : charIndex - lastNewline;
  return { line: 1 + lineOffset, column };
};
