import { DiscordUser } from '@app/models/discordUser';

export interface ILeader {
	_id?: string,
	side?: string;
	role?: string;
	displayName?: string;
	discordID?: string;
	aar?: string;
}