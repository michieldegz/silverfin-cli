import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { dogs } from '$lib/server/db/schema';
import { getActiveDog } from '$lib/server/dog';
import { regenerateHealthSchedule } from '$lib/server/db/seed';
import type { Actions, PageServerLoad } from './$types';

function toDateInput(sec: number | null): string {
	if (!sec) return '';
	return new Date(sec * 1000).toISOString().slice(0, 10);
}

export const load: PageServerLoad = async () => {
	const dog = getActiveDog();
	return {
		dog: dog
			? {
					...dog,
					birthDateInput: toDateInput(dog.birthDate),
					adoptionDateInput: toDateInput(dog.adoptionDate)
				}
			: null
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const dog = getActiveDog();
		if (!dog) return fail(400, { error: 'No dog to edit' });

		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		if (!name) return fail(400, { error: 'Name is required' });

		const breed = String(form.get('breed') ?? '').trim() || null;
		const sex = String(form.get('sex') ?? '').trim() || null;
		const birthStr = String(form.get('birthDate') ?? '');
		const adoptionStr = String(form.get('adoptionDate') ?? '');
		const regen = form.get('regenerate') === 'on';

		const birthMs = birthStr ? Date.parse(birthStr) : NaN;
		const adoptionMs = adoptionStr ? Date.parse(adoptionStr) : NaN;
		const birthDate = Number.isNaN(birthMs) ? null : Math.floor(birthMs / 1000);
		const adoptionDate = Number.isNaN(adoptionMs) ? null : Math.floor(adoptionMs / 1000);

		db.update(dogs)
			.set({ name, breed, sex, birthDate, adoptionDate })
			.where(eq(dogs.id, dog.id))
			.run();

		if (regen && birthDate) {
			regenerateHealthSchedule(dog.id, birthDate);
		}

		return { ok: true, regenerated: regen && !!birthDate };
	}
};
