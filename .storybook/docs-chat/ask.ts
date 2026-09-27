const ENDPOINT = 'https://s3z4dh4a42.execute-api.us-east-2.amazonaws.com/ask';

export interface AskSource {
	source: string;
	similarity: number;
}

export interface AskResponse {
	answer: string;
	sources: AskSource[];
}

/**
 * POSTs a question to the docs RAG endpoint. Throws an Error with a
 * user-facing message on network failure, non-2xx status, or unparseable body.
 *
 * The endpoint only allows CORS from the deployed CloudFront origin, so this
 * always fails from local dev.
 */
export async function ask(question: string): Promise<AskResponse> {
	let response: Response;
	try {
		response = await fetch(ENDPOINT, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ question }),
		});
	} catch {
		// CORS rejections and network failures both land here as an opaque TypeError.
		throw new Error('Could not reach the docs assistant. Check your connection and try again.');
	}
	if (!response.ok) {
		throw new Error(`The docs assistant returned an error (HTTP ${response.status}).`);
	}
	try {
		return await response.json();
	} catch {
		throw new Error('The docs assistant returned an unreadable response.');
	}
}
