<script lang="ts">
	import { page } from '$app/state';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: any } = $props();

	const tabs = [
		{ href: '/', label: 'Home', emoji: '🏠' },
		{ href: '/timeline', label: 'Timeline', emoji: '📜' },
		{ href: '/health', label: 'Health', emoji: '💉' },
		{ href: '/settings', label: 'Settings', emoji: '⚙️' }
	];

	function isActive(href: string): boolean {
		return href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);
	}
</script>

<div class="mx-auto flex min-h-dvh max-w-lg flex-col">
	<header class="flex items-center justify-between px-4 pt-4 pb-2">
		<div class="flex items-center gap-2">
			<span class="text-2xl">🐶</span>
			<span class="font-semibold">{data.dog?.name ?? 'Puppy'}</span>
		</div>
		{#if data.user}
			<a
				href="/settings"
				class="flex items-center gap-2 rounded-full bg-slate-100 py-1 pr-3 pl-1 text-sm dark:bg-slate-800"
			>
				<span class="h-6 w-6 rounded-full text-center leading-6 text-white" style="background:{data.user.color}">
					{data.user.name.charAt(0)}
				</span>
				{data.user.name}
			</a>
		{/if}
	</header>

	<main class="flex-1 px-4 pb-24">
		{@render children()}
	</main>

	<nav
		class="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95"
		style="padding-bottom: env(safe-area-inset-bottom)"
	>
		<div class="mx-auto grid max-w-lg grid-cols-4">
			{#each tabs as t (t.href)}
				<a
					href={t.href}
					class="flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition
						{isActive(t.href) ? 'text-brand-600' : 'text-slate-400'}"
				>
					<span class="text-xl">{t.emoji}</span>
					{t.label}
				</a>
			{/each}
		</div>
	</nav>
</div>
