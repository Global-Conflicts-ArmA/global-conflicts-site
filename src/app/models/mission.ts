import { ILeader } from '@app/models/leader';

export interface IUpdate {
	reviewState?: string;
	version: {
		major: number;
		minor?: string;
	};
	_id?: string;
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

export interface IRatios {
	blufor?: number;
	opfor?: number;
	indfor?: number;
	civ?: number;
}

export interface IReport {
	_id?: string;
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
	_id?: string;
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

export interface IEdit {
	size?: {
		min: number;
		max: number;
	};
	type?: string;
	ratios?: IRatios;
	description?: string;
	jip?: boolean;
	respawn?: boolean;
	tags?: string[];
	timeOfDay?: string;
	era?: string;
	image?: string;
}

export interface IMission {
	reviewerNote?: string;
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
	ratios?: IRatios;
	description: string;
	jip: boolean;
	respawn: boolean;
	tags: string[];
	votes?: string[];
	timeOfDay: string;
	era: string;
	image?: string;
	uploadDate: Date;
	lastUpdate: Date;
	lastPlayed?: Date;
	updates: IUpdate[];
	lastVersion: {
		major: number;
		minor?: string;
	};
	lastVersionStr?: string;

	reports?: IReport[];
	reviews?: IReview[];
	history?: IHistory[];
	reviewChecklist?: IReviewChecklistItem[];
}

export interface IHistory {
	_id?: string;
	date?: Date;
	gmNote?: string;
	outcome?: string;
	aarReplayLink?: string;
	leaders?: ILeader[];
}

export interface IReviewChecklistItem {
	type: string;
	text: string;
	mandatory: boolean;
	value?: any;
}
