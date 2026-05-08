import { NextResponse } from 'next/server'

export type MobileApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_ERROR'

export function mobileSuccess<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(
    {
      success: true,
      data
    },
    init
  )
}

export function mobileError(
  code: MobileApiErrorCode,
  message: string,
  status = 400
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message
      }
    },
    { status }
  )
}
