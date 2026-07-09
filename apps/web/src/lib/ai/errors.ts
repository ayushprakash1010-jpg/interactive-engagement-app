export class ProviderError extends Error {
  constructor(message: string, public readonly provider: string, public readonly originalError?: unknown) {
    super(message);
    this.name = 'ProviderError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public readonly details?: unknown) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'The AI provider timed out.') {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class SchemaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SchemaError';
  }
}

export class ParsingError extends Error {
  constructor(message: string = 'Failed to parse JSON response from the AI provider.') {
    super(message);
    this.name = 'ParsingError';
  }
}
