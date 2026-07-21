export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Strip angle brackets
    .replace(/javascript:/gi, '') // Strip js protocol
    .replace(/on\w+=/gi, '') // Strip event handlers
    .trim()
    .slice(0, 1000) // Max length
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase().slice(0, 254)
}
