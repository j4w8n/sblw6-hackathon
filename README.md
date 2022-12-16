# Supabase Launch Week 6 Hackathon

This is just a fun, meta app for launch week. Nothing much here. I did learn a bit about Deno modules for crypto, an optical character recognition npm module, and the Twitter API.

This project uses the Supabase DB for holding Launch Week ticket info, and an Edge Function which creates JWTs from that info.

If you go to https://rockthecode.dev/supabase, you'll be able to upload your Launch Week 6 ticket and receive a JWT. The JWT as information from the ticket - the start date for Launch Week, and your attendee ID. I was hoping to grab the @handle as well, but the OCR technology couldn't grab the data accurately.

You can then POST the JWT, and your Twitter handle to https://rockthecode.dev/api/supabase and I'll add you to my SBLW6 Twitter list! Be sure to do this before 00:00 on 12/19/2022 though - that's when your JWT expires!


Thanks,

Jason Creviston