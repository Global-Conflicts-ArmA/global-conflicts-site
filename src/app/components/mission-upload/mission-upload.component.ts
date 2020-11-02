import {Component, OnInit} from '@angular/core';
import {MissionType} from '../../mission-type.enum';
import {MissionsService} from '../../services/missions.service';
import {DiscordUser} from '../../models/discorduser';
import {UserService} from '../../services/user.service';

@Component({
	selector: 'app-mission-upload',
	templateUrl: './mission-upload.component.html',
	styleUrls: ['./mission-upload.component.scss']
})
export class MissionUploadComponent implements OnInit {

	constructor(private missionsService: MissionsService, private userService: UserService) {
	}

	discordUser: DiscordUser | null;
	MissionType = MissionType;
	missionType: MissionType;


	missionToUpload: File;
	description: string;
	missionName: string;
	minPlayers: number;
	maxPlayers: number;
	version: number;
	uploadPressed = false;

	missionErrors: object = {};
	authError: string | null;

	uploadingState;
	missionFileName = '';


	formatBytes(bytes, decimals) {
		if (bytes === 0) {
			return '0 Bytes';
		}
		const k = 1024;
		const dm = decimals <= 0 ? 0 : decimals || 2;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
	}

	ngOnInit(): void {
		this.discordUser = this.userService.getUserLocally();
	}

	buildMissionFileName() {


		const safeMisisonName = (this.missionName ?? '').replace(' ', '_').replace(/\W/g, '');
		const safeMissionType = this.missionType === 'COOP' ? 'CO' : this.missionType ?? '';
		const spaceMaxPlayersMissionName = safeMisisonName && (this.maxPlayers || this.missionType) ? '_' : '';
		const spaceMissionNameVersion = (safeMisisonName || this.missionType || this.maxPlayers) && this.version ? '_V' : '';
		let mapName = '';
		if (this.missionToUpload) {
			mapName = (this.missionToUpload.name).substring(
				this.missionToUpload.name.indexOf('.') + 1,
				this.missionToUpload.name.lastIndexOf('.')
			);
			mapName = '.' + mapName;
		}


		this.missionFileName = `${safeMissionType}${this.maxPlayers ?? ''}${spaceMaxPlayersMissionName}${safeMisisonName}${spaceMissionNameVersion}${this.version >= 1 ? this.version : ''}${mapName}.pbo`;
	}


	selectMissionType(type: MissionType) {
		this.missionType = type;
		this.validateMissionType();
		this.buildMissionFileName();
	}

	validateMissionType() {

		if (this.uploadPressed) {
			if (this.missionType == null) {
				this.missionErrors['missionType'] = 'Missing mission type';
			} else {
				delete this.missionErrors['missionType'];
			}
		}
		return this.missionErrors['missionType'];


	}


	validateMinPlayers() {
		if (this.uploadPressed) {
			if (this.minPlayers == null) {
				this.missionErrors['minPlayers'] = 'Missing min. player count.';
			} else if (this.minPlayers < 2 || this.minPlayers > 99) {
				this.missionErrors['minPlayers'] = 'Invalid player count';
			} else {
				delete this.missionErrors['minPlayers'];
			}
		}

		return this.missionErrors['minPlayers'];
	}

	validateMaxPlayers() {
		if (this.uploadPressed) {
			if (this.maxPlayers == null) {
				this.missionErrors['maxPlayers'] = 'Missing max. player count.';
			} else if (this.maxPlayers < 2 || this.minPlayers > 99) {
				this.missionErrors['maxPlayers'] = 'Invalid max player count';
			} else {
				delete this.missionErrors['maxPlayers'];
			}
		}

		return this.missionErrors['maxPlayers'];
	}


	validateVersion() {
		if (this.uploadPressed) {
			if (this.version == null) {
				this.missionErrors['version'] = 'Missing version';
			} else if (this.version > 99 || this.version < 1) {
				this.missionErrors['version'] = 'Invalid version';
			} else {
				delete this.missionErrors['version'];
			}
		}


		return this.missionErrors['version'];

	}


	validateDescription() {
		if (this.uploadPressed) {
			if (this.description == null || this.description.trim().length === 0) {
				this.missionErrors['description'] = 'Missing description';
			} else if (this.description.length >= 50) {
				this.missionErrors['description'] = 'The description can only be up to 50 characters in length';
			} else {
				delete this.missionErrors['description'];
			}
		}
		return this.missionErrors['description'];

	}


	validateMisssionName() {
		if (this.uploadPressed) {
			if (this.missionName == null || this.missionName.trim().length === 0) {
				this.missionErrors['missionName'] = 'Missing name';
			} else if (this.missionName.length >= 23) {
				this.missionErrors['missionName'] = 'The name can only be up to 23 characters in length';
			} else {
				delete this.missionErrors['missionName'];
			}
		}
		return this.missionErrors['missionName'];

	}

	validateMissionPBO() {
		if (this.uploadPressed) {
			if (this.missionToUpload == null) {
				this.missionErrors['mission'] = 'Missing mission file';
			} else {
				delete this.missionErrors['mission'];
			}
		}
		return this.missionErrors['mission'];
	}


	validateAllInputs() {
		this.validateMissionType();
		this.validateMinPlayers();
		this.validateMaxPlayers();
		this.validateVersion();
		this.validateMisssionName();
		this.validateDescription();
		this.validateMissionPBO();
	}

	upload() {
		this.uploadPressed = true;
		this.validateAllInputs();
		if (Object.keys(this.missionErrors).length > 0) {
			return;
		}
		const formData: any = new FormData();
		formData.append('description', this.description);
		formData.append('minPlayers', this.minPlayers);
		formData.append('maxPlayers', this.maxPlayers);
		formData.append('missionType', this.missionType);
		formData.append('version', this.version);
		formData.append('missionName', this.missionName);
		formData.append('missionFile', this.missionToUpload, this.missionFileName);
		this.uploadingState = 'uploading';
		this.authError = null;
		this.missionsService.upload(formData).subscribe(value => {
			this.uploadingState = 'success';
			this.authError = null;
		}, httpError => {
			this.missionErrors = httpError.error.missionErrors ?? {};
			this.authError = httpError.error.authError;
			this.uploadingState = 'error';
		});

	}

}
