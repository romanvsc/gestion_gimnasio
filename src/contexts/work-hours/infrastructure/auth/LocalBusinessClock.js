const BUSINESS_TIME_ZONE = 'America/Argentina/Buenos_Aires'

function getPart(parts, type) {
  return parts.find(part => part.type === type)?.value
}

export function createLocalBusinessClock({ timeZone = BUSINESS_TIME_ZONE } = {}) {
  return {
    today() {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).formatToParts(new Date())

      return `${getPart(parts, 'year')}-${getPart(parts, 'month')}-${getPart(parts, 'day')}`
    }
  }
}

export { BUSINESS_TIME_ZONE }
