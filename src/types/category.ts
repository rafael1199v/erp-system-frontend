export interface Category {
	id: number;
	name: string;
	companyId: number;
}

export interface CreateCategory {
	name: string;
	companyId: number;
}
