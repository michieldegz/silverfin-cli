<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { CARE_META, type CareType } from '$lib/careTypes';
	import { relativeFromSec } from '$lib/time';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let nowMs = $state(Date.now());
	$effect(() => {
		const id = setInterval(() => (nowMs = Date.now()), 30_000);
		return () => clearInterval(id);
	});

	function timeLabel(sec: number): string {
		return new Date(sec * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	function dayLabel(sec: number): string {
		return new Date(sec * 1000).toLocaleDateString([], {
			weekday: 'short',
			day: 'numeric',
			month: 'short'
		});
	}

	// Group entries by local day for section headers.
	const groups = $derived.by(() => {
		const out: { day: string; items: typeof data.entries }[] = [];
		for (const e of data.entries) {
			const day = dayLabel(e.occurredAt);
			const last = out[out.length - 1];
			if (last && last.day === day) last.items.push(e);
			else out.push({ day, items: [e] });
		}
		return out;
	});

	async function del(id: number) {
		if (!confirm('Delete this entry?')) return;
		const res = await fetch(`/api/log/${id}`, { method: 'DELETE' });
		if (res.ok) await invalidateAll();
		else alert('Could not delete.');
	}

	async function editTime(id: number, occurredAt: number) {
		const current = new Date(occurredAt * 1000).toISOString().slice(0, 16);
		const next = prompt('Adjust time (YYYY-MM-DDThh:mm)', current);
		if (!next) return;
		const ms = Date.parse(next);
		if (Number.isNaN(ms)) return alert('Invalid date.');
		const res = await fetch(`/api/log/${id}`, {
			method: 'PATCH',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ occurredAt: Math.floor(ms / 1000) })
		});
		if (res.ok) await invalidateAll();
		else alert('Could not update.');
	}

	function detailLine(e: (typeof data.entries)[number]): string {
		const parts: string[] = [];
		if (e.amount != null) parts.push(e.type === 'weight' ? `${e.amount} kg` : `${e.amount} g`);
		if (e.durationMin != null) parts.push(`${e.durationMin} min`);
		if (e.rating != null) parts.push('★'.repeat(e.rating));
		if (e.notes) parts.push(e.notes);
		return parts.join(' · ');
	}
</script>

<svelte:head><title>Timeline · Puppy</title></svelte:head>

<h1 class="mb-3 text-xl font-bold">Timeline</h1>

{#if data.entries.length === 0}
	<p class="mt-10 text-center text-slate-400">No entries yet. Log something from the Home tab.</p>
{:else}
	{#each groups as group (group.day)}
		<h2 class="mt-4 mb-1 text-xs font-semibold tracking-wide text-slate-400 uppercase">
			{group.day}
		</h2>
		<ul class="flex flex-col gap-1.5">
			{#each group.items as e (e.id)}
				{@const meta = CARE_META[e.type as CareType] ?? { label: e.type, emoji: '•' }}
				<li class="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm dark:bg-slate-800">
					<span class="text-2xl">{meta.emoji}</span>
					<div class="min-w-0 flex-1">
						<div class="flex items-baseline gap-2">
							<span class="font-semibold">{meta.label}</span>
							<span class="text-xs text-slate-400">{timeLabel(e.occurredAt)}</span>
							<span class="text-xs text-slate-400">· {relativeFromSec(e.occurredAt, nowMs)}</span>
						</div>
						{#if detailLine(e)}
							<div class="truncate text-sm text-slate-500">{detailLine(e)}</div>
						{/if}
						{#if e.userName}
							<div class="flex items-center gap-1 text-xs text-slate-400">
								<span class="h-2 w-2 rounded-full" style="background:{e.userColor}"></span>
								{e.userName}
							</div>
						{/if}
					</div>
					<div class="flex shrink-0 flex-col gap-1">
						<button onclick={() => editTime(e.id, e.occurredAt)} class="text-xs text-slate-400 hover:text-brand-600">edit</button>
						<button onclick={() => del(e.id)} class="text-xs text-slate-400 hover:text-red-600">delete</button>
					</div>
				</li>
			{/each}
		</ul>
	{/each}
{/if}
