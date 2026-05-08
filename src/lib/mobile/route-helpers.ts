import { ZodError } from 'zod'
import { MobileAuthError } from './auth'
import { mobileError } from './api-response'

export function handleMobileRouteError(error: unknown) {
  if (error instanceof MobileAuthError) {
    return mobileError(error.code, error.message, error.status)
  }

  if (error instanceof ZodError) {
    return mobileError('BAD_REQUEST', error.errors[0]?.message || 'Invalid request body', 400)
  }

  const message = error instanceof Error ? error.message : 'Internal server error'
  return mobileError('INTERNAL_ERROR', message, 500)
}
