type jsonResponse = { 
  attendee: string | null
  start_date: string | null
  error: Error | null
}

export const validateJson = async (request: Request): Promise<jsonResponse> => {
  const json = request.body ? await request.json().catch((err: Error) => {
    if (err.name === 'SyntaxError') {
      console.error(err)
      return { attendee: null, start_date: null, error: 'Invalid JSON' }
    } else {
      console.error(
        { data: { url: request.url }, error: err.message }
      )
      return { attendee: null, start_date: null, error: err.message }
    }
  }): { attendee: null, start_date: null, error: 'Body is null'}

  if (!json.error) json.error = null
  return json
}