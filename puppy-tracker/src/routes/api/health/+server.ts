import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Public endpoint used by the Docker healthcheck.
export const GET: RequestHandler = () => json({ ok: true });
