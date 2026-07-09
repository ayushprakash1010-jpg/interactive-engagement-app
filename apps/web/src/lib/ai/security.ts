/**
 * Sanitizes context data by redacting likely PII such as emails and phone numbers.
 * @param context Any JSON-serializable object or string
 * @returns Sanitized object
 */
export function sanitizeContext<T>(context: T): T {
  if (!context) return context;
  
  let str = typeof context === 'string' ? context : JSON.stringify(context);
  
  // Basic email redaction
  str = str.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]');
  
  // Basic phone number redaction (simplified)
  str = str.replace(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[REDACTED_PHONE]');
  
  if (typeof context === 'string') {
    return str as unknown as T;
  }
  
  try {
    return JSON.parse(str);
  } catch (e) {
    return context; // Fallback to original if parsing fails
  }
}
