import { getActiveDog } from '$lib/server/dog';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const dog = getActiveDog();
	return {
		user: locals.user,
		dog: dog ? { id: dog.id, name: dog.name, photoPath: dog.photoPath } : null
	};
};
