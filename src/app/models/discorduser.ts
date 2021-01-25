export class DiscordUser {
	token: string;
	username: string;
	role: string;
	roleColor: string;
	avatarLink: string;

	constructor(token: string, username: string, role: string, roleColor: string, avatarLink: string) {
		this.token = token;
		this.username = username;
		this.role = role;
		this.roleColor = roleColor;
		this.avatarLink = avatarLink;
	}

	trustedMissionMakerRoles = ['Admin', 'GM', 'Mission Maker'];

	isAMemberOfOurDiscord(): boolean {
		return !!this.username;
	}

	isProcessed(): boolean {
		return this.role?.length > 0;
	}

	isTrustedMissionMaker(): boolean {
		return this.trustedMissionMakerRoles.indexOf((this.role ?? '')) !== -1;
	}

}
