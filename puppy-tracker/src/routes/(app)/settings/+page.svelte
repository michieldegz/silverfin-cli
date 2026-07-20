<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head><title>Settings · Puppy</title></svelte:head>

<h1 class="mb-3 text-xl font-bold">Settings</h1>

<section class="mb-5 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
	<h2 class="mb-2 font-semibold">Dog</h2>
	<a href="/dog" class="text-brand-600 underline">Edit dog profile →</a>
</section>

<section class="mb-5 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
	<h2 class="mb-2 font-semibold">Your name</h2>
	<form method="POST" action="?/rename" use:enhance class="flex gap-2">
		<input
			name="name"
			value={data.user?.name ?? ''}
			class="flex-1 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
		/>
		<button type="submit" class="rounded-lg bg-brand-600 px-4 font-semibold text-white">Save</button>
	</form>
</section>

<section class="mb-5 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
	<h2 class="mb-2 font-semibold">Change PIN</h2>
	<form method="POST" action="?/changePin" use:enhance class="flex flex-col gap-2">
		<input
			name="pin"
			type="password"
			inputmode="numeric"
			placeholder="New PIN"
			class="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
		/>
		<input
			name="confirm"
			type="password"
			inputmode="numeric"
			placeholder="Confirm PIN"
			class="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
		/>
		<button type="submit" class="rounded-lg bg-brand-600 py-2 font-semibold text-white">Update PIN</button>
	</form>
	<p class="mt-2 text-xs text-slate-400">
		Household members: {data.members.map((m) => m.name).join(', ')}. Everyone starts with the same
		default PIN — change yours here.
	</p>
</section>

{#if form?.error}
	<p class="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-700 dark:bg-red-900/30">{form.error}</p>
{/if}
{#if form?.ok}
	<p class="mb-3 rounded-lg bg-emerald-50 p-2 text-sm text-emerald-700 dark:bg-emerald-900/30">Saved.</p>
{/if}

<form method="POST" action="?/logout" use:enhance>
	<button type="submit" class="w-full rounded-xl border border-red-300 py-3 font-semibold text-red-600">
		Sign out
	</button>
</form>
