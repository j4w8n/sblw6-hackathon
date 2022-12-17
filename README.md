# Supabase Launch Week 6 Hackathon

I've already been working on an open source project. Its daunting goal is for the world to use https/api/json for transporting HTML content, like newsletters. Currently, this is done with email protocols.

So as for the Supabase hackathon, this is just a fun, meta app for launch week. I did learn a bit about Deno modules for crypto, an optical character recognition npm module, and the Twitter API.

This project uses the Supabase DB for holding Launch Week ticket info (jwt and attendee #), and an Edge Function which creates JWTs from the ticket info.

If you go to https://rockthecode.dev/supabase, you'll be able to upload your Launch Week 6 ticket and receive a JWT. The JWT has information from the ticket - the start date for Launch Week, and your attendee ID. I was hoping to grab the @handle as well, but the OCR technology couldn't grab the data accurately. This process has not been tested against golden tickets.

You can then POST the JWT, and your Twitter handle to https://rockthecode.dev/api/supabase and I'll add you to my SBLW6 Twitter list! Be sure to do this before 00:00 UTC on 12/26/2022 though - that's when your JWT expires!


Thanks,

Jason Creviston