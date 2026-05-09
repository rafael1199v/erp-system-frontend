export interface Unit {
	unitCen: string;
	name: string;
	abbreviation: string | null;
}

export interface CreateUnit {
	name: string;
	abbreviation?: string | null;
}
