export interface Mission {
	name: string;
	author: string;
	authorID: string;
	file: File;
	fileName: string;
	terrain: string;
	type: string;
	size: number[];
	ratios: number[];
	description: string;
	tags: string[];
	timeOfDay: string;
	era: string;
	image: string;
	uploadDate: Date;
	updates: Array<any>;
	version: number;
	paths: string[];
}
