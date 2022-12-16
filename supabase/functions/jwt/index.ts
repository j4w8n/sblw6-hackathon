import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'
import { create } from 'https://deno.land/x/djwt@v2.8/mod.ts'
import { crypto } from 'https://deno.land/std@0.167.0/crypto/mod.ts'
import { supabaseAdminClient } from '../shared/supabase.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey',
}

const headers = { ...corsHeaders, 'Content-Type': 'application/json' }

const key = await crypto.subtle.generateKey(
  { name: 'HMAC', hash: 'SHA-512' },
  true,
  ['sign', 'verify'],
)

const jwk = await crypto.subtle.exportKey('jwk', key)

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const json = await req.json()
  const jwt = await create(
    { alg: 'HS512', typ: 'JWT' }, 
    {
      iss: 'rockthecode.dev',
      aud: 'sblw6',
      iat: Math.floor(Date.now() / 1000),
      nbf: (Date.parse('2022-12-12T00:00:00') / 1000),
      exp: (Date.parse('2022-12-26T00:00:00') / 1000),
      ...json
    }, 
    key
  )

  /* add info to database for later verification */
  const { error } = await supabaseAdminClient.from('jwts').insert([
    { jwt, attendee: json.attendee }
  ])

  if (error) {
    console.log(error)
    return new Response(
      JSON.stringify({ jwt: null, key: null, error }),
      { headers },
    )
  }

  return new Response(
    JSON.stringify({ jwt, key: jwk.k, error: null }),
    { headers },
  )
})
