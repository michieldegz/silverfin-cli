<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head><title>Dog profile · Puppy</title></svelte:head>

<h1 class="mb-3 text-xl font-bold">Dog profile</h1>

{#if !data.dog}
	<p class="text-slate-400">No dog configured.</p>
{:else}
	<form method="POST" use:enhance class="flex flex-col gap-3">
		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium text-slate-500">Name</span>
			<input
				name="name"
				value={data.dog.name}
				required
				class="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
			/>
		</label>
		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium text-slate-500">Breed</span>
			<input
				name="breed"
				value={data.dog.breed ?? ''}
				class="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
			/>
		</label>
		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium text-slate-500">Sex</span>
			<select
				name="sex"
				value={data.dog.sex ?? ''}
				class="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
			>
				<option value="">—</option>
				<option value="M">Male</option>
				<option value="F">Female</option>
			</select>
		</label>
		<div class="grid grid-cols-2 gap-3">
			<label class="flex flex-col gap-1">
				<span class="text-sm font-medium text-slate-500">Birth date</span>
				<input
					name="birthDate"
					type="date"
					value={data.dog.birthDateInput}
					class="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
				/>
			</label>
			<label class="flex flex-col gap-1">
				<span class="text-sm font-medium text-slate-500">Adoption date</span>
				<input
					name="adoptionDate"
					type="date"
					value={data.dog.adoptionDateInput}
					class="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
				/>
			</label>
		</div>

		<label class="mt-1 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm dark:bg-amber-900/20">
			<input name="regenerate" type="checkbox" class="mt-0.5" />
			<span>
				Regenerate the vaccination &amp; deworming schedule from this birth date.
				<span class="text-slate-500">(Keeps events you've already ticked off.)</span>
			</span>
		</label>

		{#if form?.error}
			<p class="rounded-lg bg-red-50 p-2 text-sm text-red-700 dark:bg-red-900/30">{form.error}</p>
		{/if}
		{#if form?.ok}
			<p class="rounded-lg bg-emerald-50 p-2 text-sm text-emerald-700 dark:bg-emerald-900/30">
				Saved{form.regenerated ? ' · schedule regenerated' : ''}.
			</p>
		{/if}

		<button type="submit" class="rounded-xl bg-brand-600 py-3 font-semibold text-white">Save</button>
	</form>
{/if}
