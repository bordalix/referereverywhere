async function gatherResponse(response) {
	const { headers } = response
	const contentType = headers.get('content-type') || ''
	if (contentType.includes('application/json')) {
		return JSON.stringify(await response.json())
	}
	return response.text()
}

const parseRequest = (request) => {
	const origin = new URL(request.url)
	const search = origin.search.substring(1)
	const params = new URLSearchParams(search)
	return {
		referer: params.get('referer'),
		tofetch: params.get('tofetch'),
	}
}

async function handleRequest(request) {
	// validate request
	const { referer, tofetch } = parseRequest(request)
	if (!referer || !tofetch) return new Response('invalid request')
	// fetch url with hacked referer
	const response = await fetch(tofetch, { headers: { Referer: referer } })
	// gather response and return
	const results = await gatherResponse(response)
	return new Response(results)
}

addEventListener('fetch', (event) => {
	return event.respondWith(handleRequest(event.request))
})
