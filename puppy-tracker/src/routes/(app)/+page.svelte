<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { CARE_META, CARE_TYPES, type CareType } from '$lib/careTypes';
	import { minutesSince, relativeFromSec } from '$lib/time';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Local, optimistic copies so a tap updates the UI instantly.
	let lastByType = $state<Record<string, number>>({ ...data.summary.lastByType });
	let today = $state({ ...data.summary.today });
	$effect(() => {
		// Re-sync when server data changes (e.g. after invalidateAll).
		lastByType = { ...data.summary.lastByType };
		today = { ...data.summary.today };
	});

	// Live clock so "2h ago" labels stay current without a network round-trip.
	let nowMs = $state(Date.now());
	$effect(() => {
		const id = setInterval(() => (nowMs = Date.now()), 30_000);
		return () => clearInterval(id);
	});

	let busy = $state<Record<string, boolean>>({});

	const quickTypes = CARE_TYPES.filter((t) => CARE_META[t].quickLog && t !== 'note');
	const cardTypes = CARE_TYPES.filter((t) => CARE_META[t].dashboardCard);

	async function log(type: CareType, extra: Record<string, unknown> = {}) {
		busy[type] = true;
		const nowSec = Math.floor(Date.now() / 1000);
		// Optimistic.
		const prev = lastByType[type];
		lastByType[type] = nowSec;
		today[type] = {
			count: (today[type]?.count ?? 0) + 1,
			amount: today[type]?.amount ?? null,
			duration: today[type]?.duration ?? null
		};
		try {
			const res = await fetch('/api/log', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ type, ...extra })
			});
			if (!res.ok) throw new Error(await res.text());
			await invalidateAll();
		} catch (err) {
			// Roll back optimistic change on failure.
			if (prev) lastByType[type] = prev;
			else delete lastByType[type];
			alert('Could not save. Check your connection and try again.');
			console.error(err);
		} finally {
			busy[type] = false;
		}
	}

	async function logNote() {
		const text = prompt('Add a note');
		if (text && text.trim()) await log('note', { notes: text.trim() });
	}

	function cardColor(type: CareType): string {
		const meta = CARE_META[type];
		const mins = minutesSince(lastByType[type], nowMs);
		if (mins === Infinity) return 'border-slate-200 dark:border-slate-700';
		if (meta.redAfterMin && mins >= meta.redAfterMin)
			return 'border-red-400 bg-red-50 dark:bg-red-900/20';
		if (meta.amberAfterMin && mins >= meta.amberAfterMin)
			return 'border-amber-400 bg-amber-50 dark:bg-amber-900/20';
		return 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20';
	}
</script>

<svelte:head><title>{data.dog?.name ?? 'Puppy'} · Home</title></svelte:head>

<!-- "Now" cards -->
<section class="grid grid-cols-2 gap-3">
	{#each cardTypes as type (type)}
		{@const meta = CARE_META[type]}
		<div class="rounded-2xl border-2 p-3 {cardColor(type)}">
			<div class="flex items-center justify-between">
				<span class="text-sm font-medium text-slate-500">{meta.label}</span>
				<span class="text-lg">{meta.emoji}</span>
			</div>
			<div class="mt-1 text-lg font-bold">{relativeFromSec(lastByType[type], nowMs)}</div>
			{#if today[type]?.count}
				<div class="text-xs text-slate-400">{today[type].count}× today</div>
			{:else}
				<div class="text-xs text-slate-400">none today</div>
			{/if}
		</div>
	{/each}
</section>

<!-- Quick-log buttons -->
<section class="mt-6">
	<h2 class="mb-2 text-sm font-semibold text-slate-500">Quick log</h2>
	<div class="grid grid-cols-2 gap-3">
		{#each quickTypes as type (type)}
			{@const meta = CARE_META[type]}
			<button
				onclick={() => log(type)}
				disabled={busy[type]}
				class="no-select flex items-center justify-center gap-2 rounded-2xl py-6 text-lg font-bold text-white shadow-sm transition active:scale-95 disabled:opacity-60 {meta.accent}"
			>
				<span class="text-2xl">{meta.emoji}</span>
				{meta.label}
			</button>
		{/each}
		<button
			onclick={logNote}
			class="no-select col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-slate-500 py-4 font-semibold text-white transition active:scale-95 hover:bg-slate-600"
		>
			📝 Add note
		</button>
	</div>
</section>

<p class="mt-6 text-center text-xs text-slate-400">
	Tap to log now · full history on the Timeline tab
</p>
