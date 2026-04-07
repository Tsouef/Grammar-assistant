const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g
const PHONE_RE =
  /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}|\+\d{1,3}[-.\s]\d[\d\s.-]{7,}\d|\b0[1-9](?:[\s.-]?\d{2}){4}\b/g

/**
 * Anonymize PII in text and return a restore function that maps tokens back
 * to originals. Use this wherever the AI response must be mapped back to the
 * original text (grammar error contexts, translated/rewritten output).
 */
export function anonymizePii(text: string): { anonymized: string; restore: (s: string) => string } {
  const map: Array<[string, string]> = []
  let counter = 0

  const anonymized = text
    .replace(EMAIL_RE, (match) => {
      const token = `«EMAIL${counter++}»`
      map.push([token, match])
      return token
    })
    .replace(PHONE_RE, (match) => {
      const token = `«PHONE${counter++}»`
      map.push([token, match])
      return token
    })

  function restore(s: string): string {
    let result = s
    for (const [token, original] of map) {
      result = result.split(token).join(original)
    }
    return result
  }

  return { anonymized, restore }
}
