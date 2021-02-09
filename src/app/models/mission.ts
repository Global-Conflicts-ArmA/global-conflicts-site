export interface IUpdate {
	version: number;
	authorID: string;
	date: Date;
	changeLog?: string;
	addressesReports?: string;
	fileName: string;
	path?: string;
}

export interface IMission {
	uniqueName: string;
	name: string;
	author: string;
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
