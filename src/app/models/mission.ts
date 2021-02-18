export interface IUpdate {
	version: {
		major: number;
		minor?: string;
	};
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
	versionStr?: string;
}

export interface IReport {
	version: {
		major: number;
		minor?: string;
	};
	authorID: string;
	authorName?: string;
	date: Date;
	report: string;
	log?: string;
	versionStr?: string;
}

export interface IReview {
	version: {
		major: number;
		minor?: string;
	};
	authorID: string;
	authorName?: string;
	date: Date;
	review: string;
	versionStr?: string;
}

export interface IMission {
	uniqueName: string;
	name: string;
	authorName?: string;
	authorID: string;
	terrain: string;
	type: string;
	size: {
		min: number;
		max: number;
	};
	ratios: number[];
	description: string;
	jip: boolean;
	respawn: boolean;
	tags: string[];
	timeOfDay: string;
	era: string;
	image?: string;
	uploadDate: Date;
	lastUpdate: Date;
	updates: IUpdate[];
	lastVersion: {
		major: number;
		minor?: string;
	};
	lastVersionStr?: string;
	paths?: string[];
	reports?: any[];
	reviews?: any[];
}
