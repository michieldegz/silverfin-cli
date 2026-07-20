import {
	createHmac,
	randomBytes,
	scryptSync,
	timingSafeEqual
} from 'node:crypto';
import { env } from '$env/dynamic/private';

export interface SessionUser {
	id: number;
	name: string;
	color: string;
}

export const SESSION_COOKIE = 'puppy_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days (seconds)

function secret(): string {
	const s = env.SESSION_SECRET;
	if (!s || s.length < 16) {
		// Fail loud in prod-ish setups; a weak secret would make sessions forgeable.
		throw new Error('SESSION_SECRET must be set to a random string of 16+ chars');
	}
	return s;
}

// ---- PIN hashing (scrypt) ----

export function hashPin(pin: string): string {
	const salt = randomBytes(16);
	const derived = scryptSync(pin, salt, 32);
	return `${salt.toString('hex')}:${derived.toString('hex')}`;
}

export function verifyPin(pin: string, stored: string): boolean {
	const [saltHex, hashHex] = stored.split(':');
	if (!saltHex || !hashHex) return false;
	const salt = Buffer.from(saltHex, 'hex');
	const expected = Buffer.from(hashHex, 'hex');
	const actual = scryptSync(pin, salt, expected.length);
	return expected.length === actual.length && timingSafeEqual(expected, actual);
}

// ---- Signed session token: base64url(json).hmac ----

function b64url(buf: Buffer): string {
	return buf.toString('base64url');
}

export function createSessionToken(userId: number): string {
	const payload = JSON.stringify({ uid: userId, exp: nowSec() + SESSION_MAX_AGE });
	const body = b64url(Buffer.from(payload));
	const mac = createHmac('sha256', secret()).update(body).digest('base64url');
	return `${body}.${mac}`;
}

export function verifySessionToken(token: string | undefined): number | null {
	if (!token) return null;
	const [body, mac] = token.split('.');
	if (!body || !mac) return null;
	const expected = createHmac('sha256', secret()).update(body).digest('base64url');
	const macBuf = Buffer.from(mac);
	const expBuf = Buffer.from(expected);
	if (macBuf.length !== expBuf.length || !timingSafeEqual(macBuf, expBuf)) return null;
	try {
		const { uid, exp } = JSON.parse(Buffer.from(body, 'base64url').toString());
		if (typeof uid !== 'number' || typeof exp !== 'number') return null;
		if (exp < nowSec()) return null;
		return uid;
	} catch {
		return null;
	}
}

function nowSec(): number {
	return Math.floor(Date.now() / 1000);
}
