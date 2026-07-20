<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let selectedId = $state<number | null>(form?.userId ?? data.members[0]?.id ?? null);
	let pin = $state('');

	const next = $derived(page.url.searchParams.get('next') ?? '/');
</script>

<svelte:head><title>Sign in · Puppy</title></svelte:head>

<main class="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 p-6">
	<div class="text-center">
		<div class="text-5xl">🐶</div>
		<h1 class="mt-2 text-2xl font-bold">Puppy Tracker</h1>
		<p class="text-sm text-slate-500">Who's logging?</p>
	</div>

	<form method="POST" use:enhance class="flex flex-col gap-4">
		<input type="hidden" name="next" value={next} />
		<input type="hidden" name="userId" value={selectedId ?? ''} />

		<div class="grid grid-cols-2 gap-3">
			{#each data.members as m (m.id)}
				<button
					type="button"
					onclick={() => (selectedId = m.id)}
					class="flex items-center gap-2 rounded-xl border-2 p-3 text-left font-medium transition
						{selectedId === m.id
						? 'border-brand-600 bg-brand-50 dark:bg-brand-700/20'
						: 'border-slate-200 dark:border-slate-700'}"
				>
					<span class="h-3 w-3 shrink-0 rounded-full" style="background:{m.color}"></span>
					<span class="truncate">{m.name}</span>
				</button>
			{/each}
		</div>

		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium text-slate-600 dark:text-slate-300">PIN</span>
			<input
				name="pin"
				type="password"
				inputmode="numeric"
				autocomplete="current-password"
				bind:value={pin}
				placeholder="••••"
				class="rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-2xl tracking-widest dark:border-slate-600 dark:bg-slate-800"
			/>
		</label>

		{#if form?.error}
			<p class="rounded-lg bg-red-50 p-2 text-center text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
				{form.error}
			</p>
		{/if}

		<button
			type="submit"
			disabled={!selectedId || pin.length < 3}
			class="rounded-xl bg-brand-600 py-3 text-lg font-semibold text-white disabled:opacity-40"
		>
			Sign in
		</button>
	</form>
</main>
