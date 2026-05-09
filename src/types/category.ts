export interface Category {
	categoryCen: string;
	name: string;
	description: string | null;
}

export interface CreateCategory {
	name: string;
	description?: string | null;
}
