import { mobileSuccess } from '@/lib/mobile/api-response'

export async function POST() {
  return mobileSuccess({
    loggedOut: true,
    message: 'Discard the mobile bearer token on the client.'
  })
}
