import { Component, Inject, OnInit } from '@angular/core';
import {
	AbstractControl,
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
import { MatSelect } from '@angular/material/select';
import { MissionConstants } from '@app/constants/missionConstants';
import { DiscordUser } from '@app/models/discorduser';
import {
	IEdit,
	IMission,
	IRatios,
	IReport,
	IReview
} from '@app/models/mission';
import { MissionsService } from '@app/services/missions.service';
import { SharedService } from '@app/services/shared';
import { UserService } from '@app/services/user.service';
import { FileValidator } from 'ngx-material-file-input';

@Component({
	selector: 'dialog-edit-details',
	templateUrl: 'dialog-edit-details.html',
	styleUrls: ['./dialog-edit-details.component.scss']
})
export class DialogEditDetailsComponent implements OnInit {
	constructor(
		public dialogRef: MatDialogRef<DialogEditDetailsComponent>,
		@Inject(MAT_DIALOG_DATA) public mission: IMission,
		private formBuilder: FormBuilder,
		public missionsService: MissionsService,
		private userService: UserService,
		public mC: MissionConstants,
		public sharedService: SharedService
	) {}

	editGroup: FormGroup;
	discordUser: DiscordUser | null;
	readonly maxSizeImage: number = 2097152;

	missionImageFile = null;
	missionImageSrc: any;
	misType = 'CO';
	authError: string | null;
	missionFileName = '.pbo';

	missionTypeGroup: FormGroup;
	missionSizeGroup: FormGroup;
	missionDescGroup: FormGroup;
	fileImageGroup: FormGroup;

	ngOnInit(): void {
		this.discordUser = this.userService.getUserLocally();
		this.missionTypeGroup = this.formBuilder.group({
			missionType: [
				this.mC.MissionTypes.find((e) => e.title === this.mission.type),
				[Validators.required]
			],
			ratioLOL: [this.mission.type === 'LOL' && this.mission.ratios]
		});
		this.missionSizeGroup = this.formBuilder.group(
			{
				minPlayers: new FormControl(this.mission.size.min),
				maxPlayers: new FormControl(this.mission.size.max),
				ratioBluforE: new FormControl({
					value: this.mission.ratios?.blufor,
					disabled: false
				}),
				ratioBlufor: new FormControl({
					value: this.mission.ratios?.blufor ?? 1,
					disabled: !this.mission.ratios?.blufor
				}),
				ratioOpforE: new FormControl({
					value: this.mission.ratios?.opfor,
					disabled: false
				}),
				ratioOpfor: new FormControl({
					value: this.mission.ratios?.opfor ?? 1,
					disabled: !this.mission.ratios?.opfor
				}),
				ratioIndforE: new FormControl({
					value: this.mission.ratios?.indfor,
					disabled: false
				}),
				ratioIndfor: new FormControl({
					value: this.mission.ratios?.indfor ?? 1,
					disabled: !this.mission.ratios?.indfor
				}),
				ratioCivE: new FormControl({
					value: this.mission.ratios?.civ,
					disabled: false
				}),
				ratioCiv: new FormControl({
					value: this.mission.ratios?.civ ?? 1,
					disabled: !this.mission.ratios?.civ
				})
			},
			{
				validators: [
					this.checkMissionSize,
					this.checkMissionRatios.bind(this)
				]
			}
		);
		this.missionDescGroup = this.formBuilder.group({
			misDescription: [
				this.mission.description,
				[Validators.required, this.checkMissionDesc()]
			],
			misTags: [this.mission.tags, [Validators.required]],
			misTime: [this.mission.timeOfDay, [Validators.required]],
			misEra: [this.mission.era, [Validators.required]],
			misJip: [this.mission.jip, [Validators.required]],
			misRespawn: [this.mission.respawn, [Validators.required]]
		});
		this.fileImageGroup = this.formBuilder.group(
			{
				missionImage: [
					'',
					[FileValidator.maxContentSize(this.maxSizeImage)]
				],
				imgToggle: [this.mission.image],
				imgReplaceToggle: [false],
				imgRemoveToggle: [false],
				missionReplaceImage: [
					'',
					[FileValidator.maxContentSize(this.maxSizeImage)]
				]
			},
			{ validators: [this.checkImageFile.bind(this)] }
		);
	}

	onListChipRemoved(multiSelect: MatSelect, matChipIndex: number): void {
		const misTags = this.missionDescGroup.get('misTags');
		if (misTags) {
			const selectedChips = [...misTags.value];
			selectedChips.splice(matChipIndex, 1);
			misTags.patchValue(selectedChips);
			multiSelect.writeValue(selectedChips);
		}
	}

	selectMissionType() {
		const missionType = this.missionTypeGroup.get('missionType');
		if (missionType && missionType.value) {
			this.misType = missionType.value.str ?? missionType.value.title;
			this.buildMissionFileName();
		}
		this.missionSizeGroup.get('ratioBluforE')?.setErrors(null);
	}

	buildMissionFileName() {
		const safeMissionType =
			this.missionTypeGroup.get('missionType')?.value?.str ??
			this.missionTypeGroup.get('missionType')?.value?.title;
		const terrainObj = this.missionsService.getTerrainData(
			this.mission.terrain
		);
		const versionString = this.missionsService.buildVersionStr(
			this.mission.lastVersion
		);
		return `${safeMissionType}${this.mission.size.max}_${this.mission.name}_V${versionString}.${terrainObj.class}.pbo`;
	}

	getTypeErrorMessage() {
		const missionType = this.missionTypeGroup.get('missionType');
		if (missionType) {
			if (missionType.hasError('required')) {
				return `You must select a mission type`;
			}
			return null;
		}
		return null;
	}

	checkMissionSize(controlGroup: AbstractControl) {
		const minSizeCtrl = controlGroup.get('minPlayers');
		const maxSizeCtrl = controlGroup.get('maxPlayers');
		if (minSizeCtrl && maxSizeCtrl) {
			let hasError = false;
			const minSize = minSizeCtrl.value;
			const maxSize = maxSizeCtrl.value;
			if (!maxSize || maxSize === '') {
				hasError = true;
				maxSizeCtrl.setErrors({
					maxNotSet: true
				});
			}
			if (!minSize || minSize === '') {
				hasError = true;
				maxSizeCtrl.setErrors({
					minNotSet: true
				});
			} else {
				if (minSize < 2) {
					hasError = true;
					maxSizeCtrl.setErrors({
						minTooSmall: true
					});
				}
				if (maxSize && minSize > maxSize) {
					hasError = true;
					maxSizeCtrl.setErrors({
						minOverMax: true
					});
				}
			}
			if (hasError) {
				if (maxSizeCtrl.untouched) {
					maxSizeCtrl.markAsTouched();
				}
			} else {
				maxSizeCtrl.setErrors(null);
			}
		}
		return null;
	}

	getSizeErrorMessage() {
		const maxSize = this.missionSizeGroup.get('maxPlayers');
		if (maxSize) {
			if (maxSize.hasError('minNotSet')) {
				return `You must provide a minimum player count`;
			}
			if (maxSize.hasError('maxNotSet')) {
				return `You must provide a maximum player count`;
			}
			if (maxSize.hasError('minOverMax')) {
				return `Minimum size over maximum`;
			}
			if (maxSize.hasError('minTooSmall')) {
				return `Minimum size too small! Must be 2 or more`;
			}
			return null;
		}
		return null;
	}

	getIfTVT(type = this.missionTypeGroup.get('missionType')) {
		if (
			this.missionTypeGroup.get('ratioLOL')?.value &&
			this.missionTypeGroup.get('missionType')?.value === 'LOL'
		) {
			return true;
		}
		return type && type.value ? type.value.ratio ?? false : false;
	}

	ratioOverride() {
		const status = this.missionTypeGroup.get('ratioLOL')?.value;
		if (!status) {
			this.missionSizeGroup.get('ratioBluforE')?.setErrors(null);
		}
		return status;
	}

	checkMissionRatios(controlGroup: AbstractControl) {
		const tvt = this.getIfTVT();
		if (tvt) {
			const enabledBlu = controlGroup.get('ratioBluforE')?.value;
			const enabledOp = controlGroup.get('ratioOpforE')?.value;
			const enabledInd = controlGroup.get('ratioIndforE')?.value;
			const enabledCiv = controlGroup.get('ratioCivE')?.value;
			if (
				[enabledBlu, enabledOp, enabledInd, enabledCiv].filter(Boolean)
					.length < 2
			) {
				controlGroup.get('ratioBluforE')?.setErrors({
					tooFew: true
				});
			} else {
				controlGroup.get('ratioBluforE')?.setErrors(null);
			}
		}
	}

	getRatioErrorMessage() {
		const desc = this.missionSizeGroup.get('ratioBluforE');
		if (desc) {
			if (desc.hasError('required')) {
				return `You must provide a ratio in the format of 1.5:1`;
			}
			if (desc.hasError('tooFew')) {
				return `You must select at least two teams`;
			}
			return null;
		}
		return null;
	}

	checkMissionDesc() {
		return (control: FormControl) => {
			const desc = control.value;
			if (desc) {
				if (desc.length && desc.length < 10) {
					return {
						nameMinLength: true
					};
				}
				return null;
			}
			return null;
		};
	}

	getDescErrorMessage() {
		const desc = this.missionDescGroup.get('misDescription');
		if (desc) {
			if (desc.hasError('required')) {
				return `You must provide a short description`;
			}
			if (desc.hasError('missingRatio')) {
				return `You must provide a TVT ratio at the start of your mission eg: 1.5:1 |`;
			}
			if (desc.hasError('nameMinLength')) {
				return `Your description must be at least 10 characters`;
			}
			return null;
		}
		return null;
	}

	getTagsErrorMessage() {
		const control = this.missionDescGroup.get('misTags');
		if (control) {
			if (control.hasError('required')) {
				return `You must select at least one tag`;
			}
			return null;
		}
		return null;
	}

	getReqErrorMessage(controlStr: string) {
		const control = this.missionDescGroup.get(controlStr);
		if (control) {
			if (control.hasError('required')) {
				return `You must choose an option`;
			}
			return null;
		}
		return null;
	}

	checkImageFile(controlGroup: AbstractControl) {
		if (this.mission.image) {
			let hasError = false;
			const toggle = controlGroup.get('imgReplaceToggle')?.value;
			const removeToggle = controlGroup.get('imgRemoveToggle')?.value;
			if (toggle && !removeToggle) {
				const files = controlGroup.get('missionReplaceImage')?.value;
				if (files && files.files[0]) {
					const file = files.files[0];
					const fileNameArray = file.name.split('.');
					const fileExt = fileNameArray[
						fileNameArray.length - 1
					].toLowerCase();
					const acceptedFileExt = ['png', 'jpeg', 'jpg'];
					if (!acceptedFileExt.includes(fileExt)) {
						hasError = true;
						controlGroup.get('missionReplaceImage')?.setErrors({
							requiredFileType: true
						});
					} else {
						if (
							controlGroup
								.get('missionReplaceImage')
								?.hasError('maxContentSize')
						) {
							hasError = true;
						}
					}
				} else {
					hasError = true;
					controlGroup.get('missionReplaceImage')?.setErrors({
						required: true
					});
				}
			}
			if (!hasError) {
				controlGroup.get('missionReplaceImage')?.setErrors(null);
			}
		} else {
			let hasError = false;
			const toggle = controlGroup.get('imgToggle')?.value;
			if (toggle) {
				const files = controlGroup.get('missionImage')?.value;
				if (files && files.files[0]) {
					const file = files.files[0];
					const fileNameArray = file.name.split('.');
					const fileExt = fileNameArray[
						fileNameArray.length - 1
					].toLowerCase();
					const acceptedFileExt = ['png', 'jpeg', 'jpg'];
					if (!acceptedFileExt.includes(fileExt)) {
						hasError = true;
						controlGroup.get('missionImage')?.setErrors({
							requiredFileType: true
						});
					} else {
						if (
							controlGroup
								.get('missionImage')
								?.hasError('maxContentSize')
						) {
							hasError = true;
						}
					}
				} else {
					hasError = true;
					controlGroup.get('missionImage')?.setErrors({
						required: true
					});
				}
			}
			if (!hasError) {
				controlGroup.get('missionImage')?.setErrors(null);
			}
		}
	}

	setImagePreview(file: any) {
		const fileNameArray = file.name.split('.');
		const fileExt = fileNameArray[fileNameArray.length - 1].toLowerCase();
		const acceptedFileExt = ['png', 'jpeg', 'jpg'];
		if (acceptedFileExt.includes(fileExt)) {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = (_event) => {
				this.missionImageSrc = reader.result as string;
			};
		}
	}

	getImageErrorMessage() {
		const missionImage = this.fileImageGroup.get('missionImage');
		const toggleStatus = this.fileImageGroup.get('imgToggle')?.value;
		if (missionImage && toggleStatus) {
			if (missionImage.hasError('required')) {
				return 'Please select a file';
			}
			if (missionImage.hasError('requiredFileType')) {
				return `Can only accept jpg and png image files.`;
			}
			if (missionImage.hasError('maxContentSize')) {
				const actualSize = missionImage.getError('maxContentSize')
					?.actualSize;
				const maxSize = missionImage.getError('maxContentSize')
					?.maxSize;
				return `The total size must not exceed ${this.sharedService.bytesToSize(
					maxSize
				)}	(size: ${this.sharedService.bytesToSize(actualSize)}).`;
			}
		}
		return null;
	}

	changeImageToggle() {
		const toggleStatus = this.fileImageGroup.get('imgToggle')?.value;
		if (!toggleStatus) {
			this.fileImageGroup.get('missionImage')?.setValue(null);
			this.fileImageGroup.get('missionImage')?.setErrors(null);
			this.missionImageFile = null;
			this.missionImageSrc = null;
		}
	}

	getReplaceImageErrorMessage() {
		const missionImage = this.fileImageGroup.get('missionReplaceImage');
		const toggleStatus = this.fileImageGroup.get('imgReplaceToggle')?.value;
		if (missionImage && toggleStatus) {
			if (missionImage.hasError('required')) {
				return 'Please select a file';
			}
			if (missionImage.hasError('requiredFileType')) {
				return `Can only accept jpg and png image files.`;
			}
			if (missionImage.hasError('maxContentSize')) {
				const actualSize = missionImage.getError('maxContentSize')
					?.actualSize;
				const maxSize = missionImage.getError('maxContentSize')
					?.maxSize;
				return `The total size must not exceed ${this.sharedService.bytesToSize(
					maxSize
				)}	(size: ${this.sharedService.bytesToSize(actualSize)}).`;
			}
		}
		return null;
	}

	changeImageReplaceToggle() {
		const toggleStatus = this.fileImageGroup.get('imgReplaceToggle')?.value;
		if (!toggleStatus) {
			this.fileImageGroup.get('missionReplaceImage')?.setValue(null);
			this.fileImageGroup.get('missionReplaceImage')?.setErrors(null);
			this.missionImageFile = null;
			this.missionImageSrc = null;
		}
	}

	changeImageRemoveToggle() {
		const toggleStatus = this.fileImageGroup.get('imgRemoveToggle')?.value;
		if (toggleStatus) {
			this.fileImageGroup.get('missionReplaceImage')?.setValue(null);
			this.fileImageGroup.get('missionReplaceImage')?.setErrors(null);
			this.missionImageFile = null;
			this.missionImageSrc = null;
		}
	}

	buildFormData(
		formData: { append: (arg0: any, arg1: any) => void },
		data: { data: IEdit; uniqueName: string } | null,
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

	checkForm() {
		const type = this.missionTypeGroup.errors;
		const size = this.missionSizeGroup.errors;
		const desc = this.missionDescGroup.errors;
		const image = this.fileImageGroup.errors;
		return [type, size, desc, image].some((e) => e !== null);
	}

	submit() {
		const misType = this.missionTypeGroup.get('missionType')?.value.title;
		const minSize = this.missionSizeGroup.get('minPlayers')?.value;
		const maxSize = this.missionSizeGroup.get('maxPlayers')?.value;
		const edit: IEdit = {};
		if (
			['TVT', 'COTVT'].includes(misType) ||
			(misType === 'LOL' && this.missionTypeGroup.get('ratioLOL')?.value)
		) {
			const parsedRatios: IRatios = {};
			if (this.missionSizeGroup.get('ratioBluforE')?.value) {
				parsedRatios.blufor = this.missionSizeGroup.get(
					'ratioBlufor'
				)?.value;
			}
			if (this.missionSizeGroup.get('ratioOpforE')?.value) {
				parsedRatios.opfor = this.missionSizeGroup.get(
					'ratioOpfor'
				)?.value;
			}
			if (this.missionSizeGroup.get('ratioIndforE')?.value) {
				parsedRatios.indfor = this.missionSizeGroup.get(
					'ratioIndfor'
				)?.value;
			}
			if (this.missionSizeGroup.get('ratioCivE')?.value) {
				parsedRatios.civ = this.missionSizeGroup.get('ratioCiv')?.value;
			}
			if (parsedRatios && parsedRatios !== this.mission.ratios) {
				edit.ratios = parsedRatios;
			}
		}
		if (misType !== this.mission.type) {
			edit.type = misType;
		}
		if (
			this.missionDescGroup.get('misDescription')?.value &&
			this.missionDescGroup.get('misDescription')?.value !==
				this.mission.description
		) {
			edit.description = this.missionDescGroup.get(
				'misDescription'
			)?.value;
		}
		if (
			minSize &&
			maxSize &&
			(minSize !== this.mission.size.min ||
				maxSize !== this.mission.size.max)
		) {
			edit.size = {
				min: minSize,
				max: maxSize
			};
		}
		if (
			this.missionDescGroup.get('misJip')?.value &&
			this.missionDescGroup.get('misJip')?.value !== this.mission.jip
		) {
			edit.jip = this.missionDescGroup.get('misJip')?.value;
		}
		if (
			this.missionDescGroup.get('misRespawn')?.value &&
			this.missionDescGroup.get('misRespawn')?.value !==
				this.mission.respawn
		) {
			edit.respawn = this.missionDescGroup.get('misRespawn')?.value;
		}
		if (
			this.missionDescGroup.get('misTags')?.value &&
			this.missionDescGroup.get('misTags')?.value !== this.mission.tags
		) {
			edit.tags = this.missionDescGroup.get('misTags')?.value;
		}
		if (
			this.missionDescGroup.get('misTime')?.value &&
			this.missionDescGroup.get('misTime')?.value !==
				this.mission.timeOfDay
		) {
			edit.timeOfDay = this.missionDescGroup.get('misTime')?.value;
		}
		if (
			this.missionDescGroup.get('misEra')?.value &&
			this.missionDescGroup.get('misEra')?.value !== this.mission.era
		) {
			edit.era = this.missionDescGroup.get('misEra')?.value;
		}
		if (this.mission.image) {
			if (this.fileImageGroup.get('imgReplaceToggle')?.value) {
				if (this.fileImageGroup.get('imgRemoveToggle')?.value) {
					edit.image = 'remove';
				} else {
					if (this.mission.image !== this.missionImageSrc) {
						edit.image = this.missionImageSrc;
					}
				}
			}
		} else {
			if (this.fileImageGroup.get('imgToggle')?.value) {
				edit.image = this.missionImageSrc;
			}
		}
		console.log('edit: ', edit);
		const request = {
			data: edit,
			uniqueName: this.mission.uniqueName
		};
		const formData: any = new FormData();
		this.buildFormData(formData, request);
		this.missionsService.submitEdit(formData).subscribe(
			() => {
				console.log('upload success');
				this.dialogRef.close();
			},
			(httpError) => {
				console.log('upload error');
				this.dialogRef.close();
			}
		);
	}
}
