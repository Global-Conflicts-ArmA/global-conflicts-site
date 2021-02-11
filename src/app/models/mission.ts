export interface IUpdate {
	version: number;
	authorID: string;
	authorName?: string;
	date: Date;
	changeLog: string;
	addressesReports?: string;
	fileName: string;
	path?: string;
	archive?: boolean;
	main?: boolean;
	ready?: boolean;
	test?: boolean;
}

export interface IMission {
	uniqueName: string;
	name: string;
	authorName?: string;
	authorID: string;
	terrain: string;
	type: string;
	size: {
		min: number,
		max: number
	};
	ratios: number[];
	description: string;
	tags: string[];
	timeOfDay: string;
	era: string;
	image?: string;
	uploadDate: Date;
	lastUpdate: Date;
	updates: IUpdate[];
	version: number;
	paths?: string[];
	reports?: any[];
	reviews?: any[];
}
