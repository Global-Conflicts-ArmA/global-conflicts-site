export class DiscordUser {
	id: string;
	token: string;
	username: string;
	role: string;
	roleColor: string;
	avatarLink: string;

	constructor(id: string, token: string, username: string, role: string, roleColor: string, avatarLink: string) {
		this.id = id;
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
