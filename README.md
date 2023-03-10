# Supabase Launch Week 6 Hackathon

THIS REPO HAS BEEN ARCHIVED

I've already been working on an open source project; so I didn't want to start another right now.

Because of that, my project for the Supabase hackathon is simply a fun, meta app for launch week. I did learn a bit about Deno modules for crypto, an optical character recognition npm module, and the Twitter API.

This project uses an Edge Function, which creates JWTs from the ticket info; and the DB for storing the JWTs and ticket info.

If you go to https://rockthecode.dev/supabase, you'll be able to upload your Launch Week 6 ticket and receive a JWT. The JWT has information from the ticket: the start date for Launch Week, and your attendee ID. I was hoping to grab the @handle as well, but the OCR technology couldn't grab the data accurately. This process has not been tested against golden tickets.

You can then POST the JWT and your Twitter handle to https://rockthecode.dev/api/supabase and I'll add you to my SBLW6 Twitter list! Be sure to do this before 00:00 UTC on 2022-02-01 though - that's when your JWT expires!

Team:
Jason Creviston - [GitHub](https://github.com/j4w8n) [Twitter](https://twitter.com/j4w8n)
