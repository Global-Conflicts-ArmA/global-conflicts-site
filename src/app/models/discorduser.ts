export interface DiscordUser {
	guildID?:               string;
	joinedTimestamp?:       number;
	lastMessageChannelID?:  null | string;
	premiumSinceTimestamp?: number | null;
	deleted?:               boolean;
	nickname?:              null | string;
	userID?:                string;
	displayName?:           string;
}
