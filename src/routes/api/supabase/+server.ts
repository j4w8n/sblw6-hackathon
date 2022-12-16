import type { RequestEvent } from './$types'
import { json } from '@sveltejs/kit'
import { TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET, TWITTER_BEARER, TWITTER_LIST_ID, TWITTER_ID, TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET } from '$env/static/private'
import { supabaseAdminClient } from '$lib/server/adminClient'
import { decodeJWTPayload, validateJson } from '$lib/server/helpers'
import { TwitterApi } from 'twitter-api-v2'

const userClient = new TwitterApi({
  appKey: TWITTER_CONSUMER_KEY,
  appSecret: TWITTER_CONSUMER_SECRET,
  accessToken: TWITTER_ACCESS_TOKEN,
  accessSecret: TWITTER_ACCESS_SECRET
})
const readWriteClient = userClient.readWrite

const appClientConsumer = await userClient.appLogin()
const appReadWriteClientConsumer = appClientConsumer.readWrite

const appClient = new TwitterApi(TWITTER_BEARER)
const appReadWriteClient = appClient.readWrite

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

  if (data.handle) {
    /* add to list on Twitter */
    //const { data: { id: user_id } } = await readWriteClient.v2.userByUsername(data.handle)

    /* getting 403 here because app has read-only perms by default */
    //const res = await appReadWriteClient.v2.addListMember(TWITTER_LIST_ID, user_id)
    //console.log(res)

    // const res = await fetch(`https://api.twitter.com/2/lists/${TWITTER_LIST_ID}/members`, {
    //   method: 'POST',
    //   headers: {
    //     Authorization: `Bearer ${TWITTER_BEARER}`,
    //     'user-agent': 'v2addMemberJS',
    //     'content-type': 'application/json',
    //     accept: 'application/json'
    //   },
    //   body: JSON.stringify({ user_id })
    // })
    // console.log(res)
  } else {
    return json({ message: 'Body must contain a valid Twitter handle.' })
  }

  return json({message: 'successful POST!'});
}