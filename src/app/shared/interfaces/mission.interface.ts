export interface Mission {
	name: string;
	author: string;
	type: string;
	terrain: string;
	description: string;
	playercount: number;
	framework: string;
	createDate: number;
	updateDate: number;
	version: number;
	tested?: boolean;
	reportedBugs?: Array<any>;
	onMainServer?: boolean;
	onTestServer?: boolean;
}
