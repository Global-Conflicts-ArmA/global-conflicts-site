import {Component, OnInit} from '@angular/core';
import {MissionType} from '../../mission-type.enum';
import {ServerType} from '../../server-type.enum';

@Component({
	selector: 'app-mission-upload',
	templateUrl: './mission-upload.component.html',
	styleUrls: ['./mission-upload.component.scss']
})
export class MissionUploadComponent implements OnInit {

	constructor() {
	}

	MissionType = MissionType;
	missionType: MissionType;
	ServerType = ServerType;
	serverType: ServerType;

	missionToUpload: File;
	description: string;
	minPlayers: number;
	type: MissionType;
	server: ServerType;

	uploadPressed = false;


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
	}


	selectMissionType(type: MissionType) {
		this.missionType = type;
	}

	missionTypeInvalid() {
		if (this.uploadPressed) {
			if (this.missionType == null) {
				return true;
			}
		}

		return false;
	}

	serverTypeInvalid() {
		if (this.uploadPressed) {
			if (this.serverType == null) {
				return true;
			}
		}

		return false;
	}

	minPLayersInvalid() {
		if (this.uploadPressed) {
			if (this.minPlayers == null || this.minPlayers < 2 || this.minPlayers > 99) {
				return true;
			}
		}

		return false;
	}

	descriptionInvalid() {
		if (this.uploadPressed) {
			if (this.description == null || this.description.length > 50 || this.description.trim().length === 0) {
				return true;
			}
		}

		return false;
	}

	missionPboInvalid() {
		if (this.uploadPressed) {
			if (this.missionToUpload == null) {
				return true;
			}
		}

		return false;
	}

	upload() {
		this.uploadPressed = true;
		this.missionTypeInvalid();
	}

	selectServerType(type: ServerType) {
		this.serverType = type;
	}
}
