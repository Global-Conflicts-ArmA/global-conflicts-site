export interface Mission {
	name: string;
	author: string;
	authorID: string;
	type: string;
	terrain: string;
	description: string;
	maxPlayers: number;
	minPlayers: number;
	uploadDate: Date;
	version: string;
	fileName: string;
	paths: string[];
}
