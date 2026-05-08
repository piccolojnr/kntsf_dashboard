import { NextRequest } from 'next/server'
import { z } from 'zod'
import { mobileSuccess } from '@/lib/mobile/api-response'
import { authenticateMobileCredentials } from '@/lib/mobile/auth'
import { handleMobileRouteError } from '@/lib/mobile/route-helpers'

const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required')
})

export async function POST(request: NextRequest) {
  try {
    const body = loginSchema.parse(await request.json())
    const result = await authenticateMobileCredentials(body)
    return mobileSuccess(result)
  } catch (error) {
    console.error('Login error:', error)
    return handleMobileRouteError(error)
  }
}
