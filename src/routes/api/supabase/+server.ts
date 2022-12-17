import type { RequestEvent } from './$types'
import { json } from '@sveltejs/kit'
import { 
  TWITTER_ACCESS_TOKEN, 
  TWITTER_ACCESS_SECRET, 
  TWITTER_LIST_ID, 
  TWITTER_CONSUMER_KEY, 
  TWITTER_CONSUMER_SECRET 
} from '$env/static/private'
import { decodeJWTPayload, validateJson } from '$lib/server/helpers'
import { TwitterApi } from 'twitter-api-v2'
import { supabaseAdminClient } from '$lib/server/adminClient'

const userClient = new TwitterApi({
  appKey: TWITTER_CONSUMER_KEY,
  appSecret: TWITTER_CONSUMER_SECRET,
  accessToken: TWITTER_ACCESS_TOKEN,
  accessSecret: TWITTER_ACCESS_SECRET
})
const readWriteClient = userClient.readWrite

export function GET() {
  return json({message: 'successful GET!'})
}

export async function POST(event: RequestEvent) {
  const data = await validateJson(event)

  if (data.error) return json(data)

  if (!data.jwt || !data.handle) return json({ message: 'Body must contain an object with a jwt and handle property.' })
  
  /* decode and validate JWT */
  const payload = JSON.parse(decodeJWTPayload(data.jwt))
  if (payload.iss !== 'rockthecode.dev' || payload.aud !== 'sblw6')
    return json({ message: `JWT is not from rockthecode.dev` })

  if (payload.nbf * 1000 > Date.now())
    return json({ message: `JWT is not valid until ${new Date(payload.nbf * 1000)}` })
  
  if (payload.exp * 1000 < Date.now())
    return json({ message: 'JWT has expired' })

  if (!data.handle) return json({ message: 'Body must contain a valid Twitter handle.' })
  
  /* check if this JWT has already been used */
  const { data: usedData, error: usedError } = await supabaseAdminClient
    .from('jwts')
    .select('used')
    .eq('jwt', data.jwt)
  
  if (usedError) {
    console.log(usedError)
    throw usedError
  }
  if (usedData?.length! > 0 && usedData![0].used) return json({ message: 'JWT has already been used.' })

  /* add to list on Twitter */
  const { data: { id: user_id } } = await readWriteClient.v2.userByUsername(data.handle)
  const res = await readWriteClient.v2.addListMember(TWITTER_LIST_ID, user_id)
  if (!res.data?.is_member) {
    console.log(res)
    return json({ message: 'Unable to add user to list' })
  }

  /* if added to twitter list, set `used` to true */
  const { data: setUsed, error: setError } = await supabaseAdminClient
    .from('jwts')
    .update({ used: true })
    .eq('jwt', data.jwt)

  if(setError) {
    console.log(setError)
    throw setError
  }

  return json({ message: 'successful POST!' });
}