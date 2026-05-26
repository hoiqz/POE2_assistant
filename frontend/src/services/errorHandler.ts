export interface ErrorInfo {
  message: string
  code?: string
  details?: string
}

export function getErrorMessage(error: any): ErrorInfo {
  // Handle network errors
  if (!error.response) {
    return {
      message: 'Network error. Please check your connection.',
      code: 'NETWORK_ERROR',
      details: error.message,
    }
  }

  // Handle server errors with custom message
  if (error.response?.data?.error) {
    return {
      message: error.response.data.error,
      code: `HTTP_${error.response.status}`,
    }
  }

  // Handle specific HTTP status codes
  const status = error.response?.status
  switch (status) {
    case 401:
      return {
        message: 'Your session has expired. Please login again.',
        code: 'UNAUTHORIZED',
      }
    case 403:
      return {
        message: 'You do not have permission to perform this action.',
        code: 'FORBIDDEN',
      }
    case 404:
      return {
        message: 'The resource you are looking for does not exist.',
        code: 'NOT_FOUND',
      }
    case 400:
      return {
        message: 'Invalid request. Please check your input.',
        code: 'BAD_REQUEST',
      }
    case 500:
    case 502:
    case 503:
    case 504:
      return {
        message: 'Server error. Please try again later.',
        code: `HTTP_${status}`,
      }
    default:
      return {
        message: 'An unexpected error occurred.',
        code: `HTTP_${status}`,
        details: error.message,
      }
  }
}

export function isAuthError(error: any): boolean {
  return error.response?.status === 401
}

export function isNetworkError(error: any): boolean {
  return !error.response && error.message
}
