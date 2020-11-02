export class DiscordUser {
	token: string;
	username: string;
	role: string;
	roleColor: string;

	constructor(token: string, username: string, role: string, roleColor: string) {
		this.token = token;
		this.username = username;
		this.role = role;
		this.roleColor = roleColor;
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
