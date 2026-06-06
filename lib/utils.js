export function parseJsonArray(value) {
  if (Array.isArray(value)) return value
  if (typeof value === 'string' && value.length) {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch (e) {
      return []
    }
  }
  return []
}

export default { parseJsonArray }
