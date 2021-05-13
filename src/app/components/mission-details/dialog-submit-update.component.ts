import { Component, Inject, OnInit } from '@angular/core';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	Validators
} from '@angular/forms';
import {
	MatDialog,
	MatDialogRef,
	MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MissionConstants } from '@app/constants/missionConstants';
import { DiscordUser } from '@app/models/discorduser';
import { IMission, IUpdate } from '@app/models/mission';
import { MissionsService } from '@app/services/missions.service';
import { SharedService } from '@app/services/shared';
import { UserService } from '@app/services/user.service';
import { FileValidator } from 'ngx-material-file-input';

@Component({
	selector: 'dialog-submit-update',
	templateUrl: 'dialog-submit-update.html'
})
export class DialogSubmitUpdateComponent implements OnInit {
	constructor(
		public dialogRef: MatDialogRef<DialogSubmitUpdateComponent>,
		@Inject(MAT_DIALOG_DATA) public mission: IMission,
		private formBuilder: FormBuilder,
		private missionsService: MissionsService,
		private userService: UserService,
		private sharedService: SharedService,
		private mC: MissionConstants,
		private router: Router
	) {}

	updateGroup: FormGroup;
	discordUser: DiscordUser | null;
	versionString: string;
	missionToUpload: File | null;
	readonly maxSize: number = 8388608;
	newVersion: {
		major: number;
		minor?: string;
	};

	ngOnInit(): void {
		this.discordUser = this.userService.getUserLocally();
		this.updateGroup = this.formBuilder.group({
			versionType: [false],
			changelog: ['', [Validators.required]],
			missionFile: [
				'',
				[
					Validators.required,
					FileValidator.maxContentSize(this.maxSize),
					this.checkFileName()
				]
			]
		});
		this.buildVersion(false);
	}

	getFileErrorMessage() {
		const missionFile = this.updateGroup.get('missionFile');
		const terrainObj = this.missionsService.getTerrainData(
			this.mission.terrain
		);
		if (missionFile) {
			if (missionFile.hasError('required')) {
				return 'Please select a file';
			}
			if (missionFile.hasError('requiredFileType')) {
				return 'Mission must be a PBO file';
			}
			if (missionFile.hasError('requiredTerrain')) {
				return 'Mission file must have a naming scheme of missionName.terrain.pbo';
			}
			if (missionFile.hasError('notSameTerrain')) {
				return `Mission must be on the same terrain: ${terrainObj?.display_name}`;
			}
			if (missionFile.hasError('maxContentSize')) {
				const actualSize = missionFile.getError('maxContentSize')
					?.actualSize;
				const maxSize = missionFile.getError('maxContentSize')?.maxSize;
				return `The total size must not exceed ${this.sharedService.bytesToSize(
					maxSize
				)}	(size: ${this.sharedService.bytesToSize(actualSize)}).`;
			}
		}
		return 'unknown error';
	}

	checkFileName() {
		return (control: FormControl) => {
			const files = control.value;
			const uploadedTerrainObject = this.missionsService.getTerrainData(
				this.mission.terrain
			);

			if (files && files.files[0]) {
				const file = files.files[0];
				const fileNameArray = file.name.split('.');
				if (
					'pbo' !==
					fileNameArray[fileNameArray.length - 1].toLowerCase()
				) {
					return {
						requiredFileType: true
					};
				}
				if (fileNameArray.length !== 3) {
					return {
						requiredTerrain: true
					};
				} else {

					if (fileNameArray[1].toLowerCase() !== uploadedTerrainObject?.class.toLowerCase()) {
						return {
							notSameTerrain: true
						};
					}
				}
				return null;
			}
			return null;
		};
	}

	buildVersion(checked: boolean) {
		console.log('checked: ', checked);
		let version = this.mission.lastVersion;
		console.log('version: ', version);
		console.log('version major: ', version.major);
		console.log('version minor: ', version.minor);
		if (checked) {
			version = {
				major: version.major + 1
			};
			delete version.minor;
		} else {
			if (version.minor) {
				if (version.minor === 'z') {
					version = {
						major: version.major + 1
					};
					delete version.minor;
				} else {
					version = {
						major: version.major,
						minor: String.fromCharCode(
							version.minor.charCodeAt(0) + 1
						)
					};
				}
			} else {
				version = {
					major: version.major,
					minor: 'a'
				};
			}
		}
		this.newVersion = version;
		this.versionString = this.missionsService.buildVersionStr(version);
		console.log('version new: ', version);
	}

	checkForm() {
		const versionType = this.updateGroup.get('versionType')?.errors;
		const changelog = this.updateGroup.get('changelog')?.errors;
		return [versionType, changelog].some((e) => e !== null);
	}

	getChangeLogErrorMessages() {
		const changelog = this.updateGroup.get('changelog');
		if (changelog) {
			if (changelog.hasError('required')) {
				return `You must provide a changelog`;
			}
			return null;
		}
		return null;
	}

	buildMissionFileName() {
		const typeObject = this.mC.MissionTypes.find(
			(e) => e.title === this.mission.type
		);
		const safeMissionType = typeObject?.str ?? typeObject?.title;
		const terrainObj = this.missionsService.getTerrainData(
			this.mission.terrain
		);
		if(terrainObj){
			return `${safeMissionType}${this.mission.size.max}_${this.mission.name}_V${this.versionString}.${terrainObj.class}.pbo`;
		}

	}

	buildFormData(
		formData: { append: (arg0: any, arg1: any) => void },
		data: IUpdate | null,
		parentKey?: string | undefined
	) {
		if (
			data &&
			typeof data === 'object' &&
			!(data instanceof Date) &&
			!(data instanceof File) &&
			!(data instanceof Blob)
		) {
			Object.keys(data).forEach((key) => {
				this.buildFormData(
					formData,
					data[key],
					parentKey ? `${parentKey}[${key}]` : key
				);
			});
		} else {
			const value = data == null ? '' : data;
			formData.append(parentKey, value);
		}
	}

	submit() {
		this.sharedService.uploadingState = 'uploading';
		const fileName = this.buildMissionFileName();

		if(!fileName){
			return;
		}

		const update: IUpdate = {
			version: this.newVersion,
			authorID: this.discordUser?.id ?? '',
			date: new Date(),
			fileName,
			changeLog: this.updateGroup.get('changelog')?.value
		};
		const formData: any = new FormData();
		this.buildFormData(formData, update);
		console.log('fileName: ', fileName);
		formData.append('uniqueName', this.mission.uniqueName);
		console.log('uniqueName: ', this.mission.uniqueName);
		formData.append('fileData', this.missionToUpload);
		this.missionsService.submitUpdate(formData).subscribe(
			() => {
				this.sharedService.uploadingState = 'success';
				this.dialogRef.close();
			},
			(httpError) => {
				this.sharedService.uploadingState = 'error';
				this.dialogRef.close();
			}
		);
	}
}
