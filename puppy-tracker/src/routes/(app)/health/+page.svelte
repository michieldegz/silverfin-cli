<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const CATEGORY_META: Record<string, { label: string; emoji: string }> = {
		vaccination: { label: 'Vaccination', emoji: '💉' },
		deworming: { label: 'Deworming', emoji: '🪱' },
		flea_tick: { label: 'Flea & tick', emoji: '🐛' },
		vet_appt: { label: 'Vet', emoji: '🩺' },
		weight_check: { label: 'Weight', emoji: '⚖️' }
	};

	let showAdd = $state(false);

	function dueLabel(sec: number | null): string {
		if (!sec) return 'no date';
		return new Date(sec * 1000).toLocaleDateString([], {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function isOverdue(sec: number | null): boolean {
		return !!sec && sec * 1000 < Date.now();
	}

	const upcoming = $derived(data.events.filter((e) => !e.completedAt));
	const done = $derived(data.events.filter((e) => e.completedAt));
</script>

<svelte:head><title>Health · Puppy</title></svelte:head>

<div class="mb-3 flex items-center justify-between">
	<h1 class="text-xl font-bold">Health</h1>
	<button
		onclick={() => (showAdd = !showAdd)}
		class="rounded-full bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white"
	>
		{showAdd ? 'Cancel' : '+ Add'}
	</button>
</div>

{#if showAdd}
	<form
		method="POST"
		action="?/add"
		use:enhance={() => async ({ update }) => {
			await update();
			showAdd = false;
		}}
		class="mb-4 flex flex-col gap-2 rounded-xl bg-white p-3 shadow-sm dark:bg-slate-800"
	>
		<input
			name="title"
			placeholder="e.g. Rabies booster"
			required
			class="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
		/>
		<div class="flex gap-2">
			<select
				name="category"
				class="flex-1 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
			>
				{#each Object.entries(CATEGORY_META) as [value, m] (value)}
					<option {value}>{m.emoji} {m.label}</option>
				{/each}
			</select>
			<input
				name="dueDate"
				type="date"
				class="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
			/>
		</div>
		<button type="submit" class="rounded-lg bg-brand-600 py-2 font-semibold text-white">Save</button>
	</form>
{/if}

<h2 class="mb-1 text-xs font-semibold tracking-wide text-slate-400 uppercase">Upcoming</h2>
{#if upcoming.length === 0}
	<p class="text-sm text-slate-400">All caught up 🎉</p>
{:else}
	<ul class="flex flex-col gap-1.5">
		{#each upcoming as e (e.id)}
			{@const m = CATEGORY_META[e.category] ?? { label: e.category, emoji: '•' }}
			<li class="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm dark:bg-slate-800">
				<form method="POST" action="?/toggle" use:enhance>
					<input type="hidden" name="id" value={e.id} />
					<button
						type="submit"
						aria-label="Mark done"
						class="h-6 w-6 rounded-full border-2 border-slate-300 dark:border-slate-500"
					></button>
				</form>
				<div class="min-w-0 flex-1">
					<div class="font-medium">{m.emoji} {e.title}</div>
					<div class="text-xs {isOverdue(e.dueDate) ? 'font-semibold text-red-600' : 'text-slate-400'}">
						{isOverdue(e.dueDate) ? 'Overdue · ' : 'Due '}{dueLabel(e.dueDate)}
					</div>
				</div>
				<form method="POST" action="?/remove" use:enhance>
					<input type="hidden" name="id" value={e.id} />
					<button type="submit" class="text-xs text-slate-400 hover:text-red-600">delete</button>
				</form>
			</li>
		{/each}
	</ul>
{/if}

{#if done.length > 0}
	<h2 class="mt-5 mb-1 text-xs font-semibold tracking-wide text-slate-400 uppercase">Done</h2>
	<ul class="flex flex-col gap-1.5">
		{#each done as e (e.id)}
			{@const m = CATEGORY_META[e.category] ?? { label: e.category, emoji: '•' }}
			<li class="flex items-center gap-3 rounded-xl bg-white/60 p-3 dark:bg-slate-800/50">
				<form method="POST" action="?/toggle" use:enhance>
					<input type="hidden" name="id" value={e.id} />
					<button
						type="submit"
						aria-label="Mark not done"
						class="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white"
					>✓</button>
				</form>
				<div class="min-w-0 flex-1 text-slate-400 line-through">{m.emoji} {e.title}</div>
			</li>
		{/each}
	</ul>
{/if}
