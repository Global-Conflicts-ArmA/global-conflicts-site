export class User {
	deleted?: boolean;
	nickname?: null;
	userID: string;
	roleslist: Roleslist[];
	displayName?: string;
	avatar?: string;

	constructor(
		deleted: boolean | undefined,
		nickname: null | undefined,
		userID: string,
		roleslist: Roleslist[],
		displayName: string | undefined,
		avatar: string | undefined
	) {
		this.deleted = deleted;
		this.nickname = nickname;
		this.userID = userID;
		this.roleslist = roleslist;
		this.displayName = displayName;
		this.avatar = avatar;
	}

	trustedMissionMakerRoles = ['Admin', 'GM', 'Mission Maker'];

	isAMemberOfOurDiscord(): boolean {
		return !!this.displayName;
	}

	isMissionMaker(): boolean {
		return !!this.roleslist?.find((role) => {
			return role.id === '784154506233118770';
		});
	}

	isAdmin(): boolean {
		return !!this.roleslist?.find((role) => {
			return role.id === '635885925003690006';
		});
	}

	isGM() {
		return !!this.roleslist?.find((role) => {
			return role.id === '746505982972002365';
		});
	}

	isMissionReviewer() {
		return !!this.roleslist?.find((role) => {
			return role.id === '850452993911947324';
		});
	}

	getAvatarLink() {
		return `https://cdn.discordapp.com/avatars/${this.userID}/${this.avatar}.webp`;
	}
}

export interface Roleslist {
	id?: string;
	name?: string;
	color?: string;
}
