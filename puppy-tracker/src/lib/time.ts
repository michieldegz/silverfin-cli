// Time helpers. All stored timestamps are Unix epoch SECONDS (UTC).
// "Local day" uses the process timezone (set via the TZ env var in production).

export function nowSec(): number {
	return Math.floor(Date.now() / 1000);
}

/** Epoch seconds for 00:00:00 of the current local day. */
export function startOfLocalDaySec(): number {
	const d = new Date();
	d.setHours(0, 0, 0, 0);
	return Math.floor(d.getTime() / 1000);
}

/** Human-friendly relative label, e.g. "just now", "2h 14m ago", "3d ago". */
export function relativeFromSec(epochSec: number | null | undefined, nowMs = Date.now()): string {
	if (!epochSec) return 'never';
	const diffSec = Math.max(0, Math.floor(nowMs / 1000) - epochSec);
	if (diffSec < 45) return 'just now';
	const m = Math.floor(diffSec / 60);
	if (m < 60) return `${m}m ago`;
	const h = Math.floor(m / 60);
	const rem = m % 60;
	if (h < 24) return rem ? `${h}h ${rem}m ago` : `${h}h ago`;
	const d = Math.floor(h / 24);
	const hr = h % 24;
	return hr ? `${d}d ${hr}h ago` : `${d}d ago`;
}

/** Minutes since a given epoch second (for staleness colouring). */
export function minutesSince(epochSec: number | null | undefined, nowMs = Date.now()): number {
	if (!epochSec) return Infinity;
	return (Math.floor(nowMs / 1000) - epochSec) / 60;
}
