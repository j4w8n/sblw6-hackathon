import type { RequestEvent } from "@sveltejs/kit"

export function decodeJWTPayload(token: string) {
  // Regex checks for base64url format
  const base64UrlRegex = /^([a-z0-9_-]{4})*($|[a-z0-9_-]{3}=?$|[a-z0-9_-]{2}(==)?$)$/i
  
  const parts = token.split('.')

  if (parts.length !== 3) {
    throw new Error('JWT is not valid: not a JWT structure')
  }

  if (!base64UrlRegex.test(parts[1])) {
    throw new Error('JWT is not valid: payload is not in base64url format')
  }

  const base64Url = parts[1]
  return Buffer.from(base64Url, 'base64').toString('utf-8')
}

export const validateJson = async ({ request, getClientAddress }: RequestEvent): Promise<any> => {
  return request.body ? await request.json().catch((err: any) => {
    if (err.name === 'SyntaxError') {
      console.error(err)
      return { error: 'Invalid JSON' }
    }
    else
      console.error(
        { data: { url: request.url, client_ip: getClientAddress() }, error: err.message }
      )
      return { error: err.message }
  }): { error: 'Body is null'}
}