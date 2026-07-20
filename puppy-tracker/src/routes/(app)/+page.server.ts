import type { SummaryPayload } from '../api/summary/+server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const res = await fetch('/api/summary');
	const summary: SummaryPayload = res.ok
		? await res.json()
		: { lastByType: {}, today: {}, generatedAt: 0 };
	return { summary };
};
