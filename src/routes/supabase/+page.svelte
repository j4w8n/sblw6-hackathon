<script lang="ts">
  import { createWorker, PSM } from "tesseract.js"
  import { filedrop } from 'filedrop-svelte'
	import type { Files, FileDropOptions } from "filedrop-svelte"
  import { supabaseClient } from "$lib/supabase"

  let attendee: string
	let files: Files;
  let jwt: Promise<any>
  let options: FileDropOptions = {}
  let start_date: string
  let ticket: Promise<any>
  

  async function process_ticket(): Promise<any> {
    const worker = await createWorker()
    await worker.loadLanguage('eng')
    await worker.initialize('eng')

    /* grabs Launch Week start date */
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.AUTO
    })
    const { data: { lines: lwDate } } = await worker.recognize(files.accepted[0])

    /**
     * will be line 5, but we don't want to assume there are lines
     * if someone uploads a file with no scannable text.
     * 
     * remove the line returns
    */
    
    start_date = lwDate[5]?.text.replaceAll('\n', '')
    const verify_start_date = start_date === 'December 12th 2022'

    /* grabs attendee number */
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SINGLE_BLOCK_VERT_TEXT
    })
    const { data: { lines } } = await worker.recognize(files.accepted[0])

    /** 
     * will be line 0, but we don't want to assume there are lines
     * if someone uploads a file with no scannable text.
     * 
     * remove the line returns
     * 
     * split the result of `No dddddddd`, to leave only the number
    */
    attendee = lines[0]?.text.replaceAll('\n', '').split(' ')[1]

    const attendee_regex = /\d{8}/g
    const verify_attendee_regex = attendee_regex.test(attendee)
    
    await worker.terminate()

    console.log({start_date}, {attendee})

    if (!verify_start_date || !verify_attendee_regex) {
      throw 'Not a valid Supabase Week 6 ticket.'
    }
  }

  async function create_jwt(): Promise<any> {
    const { data, error } = await supabaseClient.functions.invoke(
      'jwt', 
      { body: JSON.stringify({ attendee, start_date }) }
    )

    if (error) throw error
    return data
  }

  /** 
   * run promises in series, to ensure the jwt isn't created
   * unless the ticket is valid.
  */
  const handle_ticket = () => ticket = process_ticket()
    .then(() => jwt = create_jwt())

</script>

<h1 class="text-supabase-green">Supabase Launch Week 6</h1>
<h2>Turn your ticket into a JWT!</h2>
<div class="block-centered">
  <p>
    Your JWT expires on 2022-12-26T00:00:00, and uses algorithm HS512 if you'd like to verify the signature.
  </p>
  <p>
    Once you have your JWT, send a <code>POST</code> request to https://rockthecode.dev/api/supabase. 
    If your JWT is valid, I'll add you to my Supabase Launch Week 6 list on Twitter!
  </p>
  <p>The request body must include a <code>jwt</code> and Twitter <code>handle</code>:</p>
</div>
<pre class="code">
  <code>
const body = &lbrace;
  jwt,
  handle: 'j4w8n'
&rbrace;
  </code>
</pre>

{#if !files}
  <div class="dropzone" use:filedrop={options} on:filedrop={(e) => {
    files = e.detail.files
    handle_ticket()
  }}>
    Drop your ticket, or tap to choose file.
  </div>
{:else}
  <div class="block-centered">
  {#await ticket}
    <h3 class="block">We're processing your ticket...</h3>
  {:then}
    <h3 class="block">We're processing your ticket... <span class="text-supabase-green">DONE!</span></h3>
    {#await jwt}
      <h3 class="block">We're creating your JWT...</h3>
    {:then value}
      {#if value.error?.code === '23505'}
        <h3 class="block" style="color: red;">We already have your ticket. Duplicate submissions are not allowed.</h3>
      {:else}
        <h3 class="block">We're creating your JWT... <span class="text-supabase-green">DONE!</span></h3>
        <h3 class="block">Your JWT is <br><code class="text-gray">{value.jwt}</code></h3>
        <h3 class="block">Your key, to the verify JWT, is <br><code class="text-gray">{value.key}</code></h3>
      {/if}
    {:catch error}
      <h4>Error: {error}</h4>
    {/await}
  {:catch error}
    <h4>Error: {error}</h4>
  {/await}
  </div>
{/if}

<style>
  .block {
    max-width: 400px;
    overflow-wrap:break-word;
    text-align: left;
  }
  .block-centered {
    max-width: 400px;
    overflow-wrap:break-word;
    margin-left: auto;
    margin-right: auto;
  }
  .code {
    text-align: left;
    max-width: 300px;
    margin-left: auto;
    margin-right: auto;
  }
  .dropzone {
    border-style: dashed;
    border-width: 4px;
    border-color: #3fcf8e;
    border-radius: 10px;
    cursor: pointer;
    padding: 100px 75px;
    max-width: 300px;
    margin-left: auto;
    margin-right: auto;
    background-color: lightgray;
    text-align:center
  }
  .text-supabase-green {
    color: #3fcf8e;
  }
  .text-gray {
    color: #6b7280;
  }
</style>