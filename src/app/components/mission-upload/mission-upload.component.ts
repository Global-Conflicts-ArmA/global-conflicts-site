import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
	AbstractControl,
	FormBuilder,
	FormControl,
	FormGroup,
	Validators
} from '@angular/forms';
import { MissionConstants } from '@app/constants/missionConstants';
import { MissionsService } from '@app/services/missions.service';
import { DiscordUser } from '@app/models/discorduser';
import { IMission, IRatios, IUpdate } from '@app/models/mission';
import { UserService } from '@app/services/user.service';
import { FileValidator } from 'ngx-material-file-input';
import { SharedService } from '@app/services/shared';
import {
	MatAutocomplete,
	MatAutocompleteSelectedEvent
} from '@angular/material/autocomplete';
import { Router } from '@angular/router';

@Component({
	selector: 'app-mission-upload',
	templateUrl: './mission-upload.component.html',
	styleUrls: ['./mission-upload.component.scss'],
	providers: [MissionConstants]
})
export class MissionUploadComponent implements OnInit {
	constructor(
		private missionsService: MissionsService,
		private userService: UserService,
		private formBuilder: FormBuilder,
		public mC: MissionConstants,
		public sharedService: SharedService,
		private router: Router
	) {}

	discordUser: DiscordUser | null;
	misType = 'CO';
	missionToUpload: File | null;
	description: string;
	missionName: string;
	version: number;
	uploadPressed = false;
	missionErrors: object = {};
	authError: string | null;
	missionFileName = '.pbo';
	missionDescription = '';
	missionImageFile = null;
	missionImageSrc: any;
	missionTerrain = '';

	readonly maxSize: number = 8388608;
	readonly maxSizeImage: number = 2097152;
	readonly minNameLength: number = 6;
	readonly maxNameLength: number = 30;

	fileUploadGroup: FormGroup;
	missionNameGroup: FormGroup;
	missionTypeGroup: FormGroup;
	missionSizeGroup: FormGroup;
	missionDescGroup: FormGroup;
	fileImageGroup: FormGroup;

	filtredTags: string[];

	@ViewChild('tagsTextInput') tagsTextInput: ElementRef<HTMLInputElement>;
	@ViewChild('auto') matAutocomplete: MatAutocomplete;

	ngOnInit(): void {
		this.discordUser = this.userService.getUserLocally();
		this.fileUploadGroup = this.formBuilder.group({
			missionFile: [
				'',
				[
					Validators.required,
					FileValidator.maxContentSize(this.maxSize),
					this.checkFileName()
				]
			]
		});
		this.missionNameGroup = this.formBuilder.group({
			missionName: ['', [Validators.required, this.checkMissionName()]]
		});
		this.missionTypeGroup = this.formBuilder.group({
			missionType: ['', [Validators.required]],
			ratioLOL: ['']
		});
		this.missionSizeGroup = this.formBuilder.group(
			{
				minPlayers: new FormControl(''),
				maxPlayers: new FormControl(''),
				ratioBluforE: new FormControl({
					value: false,
					disabled: false
				}),
				ratioBlufor: new FormControl({ value: 1, disabled: true }),
				ratioOpforE: new FormControl({ value: false, disabled: false }),
				ratioOpfor: new FormControl({ value: 1, disabled: true }),
				ratioIndforE: new FormControl({
					value: false,
					disabled: false
				}),
				ratioIndfor: new FormControl({ value: 1, disabled: true }),
				ratioCivE: new FormControl({ value: false, disabled: false }),
				ratioCiv: new FormControl({ value: 1, disabled: true })
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
				'',
				[Validators.required, this.checkMissionDesc()]
			],
			misTags: [[], [Validators.required]],
			misTime: ['', [Validators.required]],
			misEra: ['', [Validators.required]],
			misJip: [true, [Validators.required]],
			misRespawn: [false, [Validators.required]]
		});
		this.fileImageGroup = this.formBuilder.group(
			{
				missionImage: [
					'',
					[FileValidator.maxContentSize(this.maxSizeImage)]
				],
				imgToggle: ['']
			},
			{ validators: [this.checkImageFile.bind(this)] }
		);

		this.filtredTags = this.mC.MissionTags;
	}
	filterTags(value: string) {
		const filterValue = value.toLowerCase();

		this.filtredTags = this.mC.MissionTags.filter((tag) => {
			return tag.toLowerCase().indexOf(filterValue) === 0;
		});

		const misTagsControl = this.missionDescGroup.get('misTags');
		if (!misTagsControl) {
			return;
		}

		const currentTags = misTagsControl.value as string[];

		const indexFound = this.mC.MissionTags.findIndex(
			(item) => value.toLowerCase() === item.toLowerCase()
		);
		if (
			indexFound !== -1 &&
			currentTags.indexOf(this.mC.MissionTags[indexFound]) === -1
		) {
			currentTags.push(this.mC.MissionTags[indexFound]);
			misTagsControl.setValue(currentTags);
			this.tagsTextInput.nativeElement.value = '';
			this.filtredTags = this.mC.MissionTags;
		}
	}

	tagsTextInputBlur() {
		const misTagsControl = this.missionDescGroup.get('misTags');
		if (!misTagsControl) {
			return;
		}

		this.tagsTextInput.nativeElement.value = '';
		this.filtredTags = this.mC.MissionTags;
	}

	onTagSelected(event: MatAutocompleteSelectedEvent): void {
		const misTagsControl = this.missionDescGroup.get('misTags');
		if (!misTagsControl) {
			return;
		}

		const currentTags = misTagsControl.value as string[];
		const indexFound = currentTags.indexOf(event.option.viewValue);
		if (indexFound === -1) {
			currentTags.push(event.option.viewValue);
			misTagsControl.setValue(currentTags);
		} else {
			currentTags.splice(indexFound, 1);
			misTagsControl.patchValue(currentTags);
		}
	}

	onListChipRemoved(matChipIndex: number): void {
		const misTags = this.missionDescGroup.get('misTags');
		if (misTags) {
			const selectedChips = [...misTags.value];
			selectedChips.splice(matChipIndex, 1);
			misTags.patchValue(selectedChips);
		}
	}

	makeUniqueMissionMapName(missionName: string, terrain: string) {
		const safeMissionName = missionName
			.replace(' ', '_')
			.replace(/\W/g, '');
		return safeMissionName + '_' + terrain;
	}

	checkFileName() {
		return (control: FormControl) => {
			const files = control.value;
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
					if (fileNameArray[1] in this.mC.MissionTerrains) {
					} else {
						return {
							notAcceptedTerrain: true
						};
					}
				}
				return null;
			}
			return null;
		};
	}

	getFileErrorMessage() {
		const missionFile = this.fileUploadGroup.get('missionFile');
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
			if (missionFile.hasError('notAcceptedTerrain')) {
				return 'Mission must be on an accepted terrain';
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

	checkMissionName(
		minNameLength = this.minNameLength,
		maxNameLength = this.maxNameLength
	) {
		return (control: FormControl) => {
			const name = control.value;
			if (name) {
				if (name.length && name.length < minNameLength) {
					return {
						nameMinLength: true
					};
				}
				if (name.length && name.length > maxNameLength) {
					return {
						nameMaxLength: true
					};
				}
				const format = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
				if (format.test(name)) {
					return {
						nameInvalidChars: true
					};
				}
				return null;
			}
			return null;
		};
	}

	getNameErrorMessage() {
		const missionName = this.missionNameGroup.get('missionName');
		if (missionName) {
			if (missionName.hasError('required')) {
				return `A mission name is required!`;
			}
			if (missionName.hasError('nameMinLength')) {
				return `Name is too short! Needs to be at least 6 characters`;
			}
			if (missionName.hasError('nameMaxLength')) {
				return `Name is too long! Needs to be under 30 characters`;
			}
			if (missionName.hasError('nameInvalidChars')) {
				return `Name has invalid characters in it, please only use AlphaNumerics and spaces`;
			}
			return null;
		}
		return null;
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

	buildMissionDesc() {
		const desc = this.missionDescGroup.get('misDescription');
		this.missionDescription = desc ? desc.value ?? '' : '';
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
		const missionName = this.missionNameGroup.get('missionName')?.value;
		const safeMissionName = missionName
			.replace(' ', '_')
			.replace(/\W/g, '');
		const safeMissionType = this.missionTypeGroup.get('missionType')?.value
			?.str
			? this.missionTypeGroup.get('missionType')?.value?.str
			: this.missionTypeGroup.get('missionType')?.value?.title;
		const safeMaxPlayers = this.sharedService.padZeros(
			this.missionSizeGroup.get('maxPlayers')?.value
		);
		let mapName = '';
		if (this.missionToUpload) {
			mapName = this.missionToUpload.name.substring(
				this.missionToUpload.name.indexOf('.') + 1,
				this.missionToUpload.name.lastIndexOf('.')
			);
			this.missionTerrain = mapName;
		}
		this.missionFileName = `${safeMissionType}${safeMaxPlayers}_${safeMissionName}_V1.${mapName}.pbo`;
	}

	submitMission() {
		const nameVar = this.missionNameGroup.get('missionName')?.value;
		const uniqueNameVar = this.makeUniqueMissionMapName(
			nameVar,
			this.missionTerrain
		);
		this.missionsService.findOne(uniqueNameVar).subscribe((result) => {
			if (result == null) {
				this.sendMission(nameVar, uniqueNameVar);
			} else {
				this.sharedService.uploadingState = 'name-conflict';
			}
		});
	}

	buildFormData(
		formData: { append: (arg0: any, arg1: any) => void },
		data: IMission | null,
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

	sendMission(nameVar: string, uniqueNameVar: string) {
		const misType = this.missionTypeGroup.get('missionType')?.value.title;
		const minSize = this.missionSizeGroup.get('minPlayers')?.value;
		const maxSize = this.missionSizeGroup.get('maxPlayers')?.value;
		const parsedRatios: IRatios = {};
		if (
			['TVT', 'COTVT'].includes(misType) ||
			(misType === 'LOL' && this.missionTypeGroup.get('ratioLOL')?.value)
		) {
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
		}
		const uploadUpdate: IUpdate = {
			version: {
				major: 1
			},
			authorID: this.discordUser?.id ?? '',
			date: new Date(),
			fileName: this.missionFileName ?? '',
			changeLog: 'First Version'
		};
		const mission: IMission = {
			uniqueName: uniqueNameVar,
			name: nameVar,
			authorID: this.discordUser?.id ?? '',
			terrain: this.missionTerrain,
			type: misType,
			size: {
				min: minSize,
				max: maxSize
			},
			description:
				this.missionDescGroup.get('misDescription')?.value ?? '',
			jip: this.missionDescGroup.get('misJip')?.value ?? false,
			respawn: this.missionDescGroup.get('misRespawn')?.value ?? false,
			tags: this.missionDescGroup.get('misTags')?.value ?? [''],
			timeOfDay: this.missionDescGroup.get('misTime')?.value ?? 'Custom',
			era: this.missionDescGroup.get('misEra')?.value ?? 'Custom',
			lastVersion: {
				major: 1
			},
			uploadDate: new Date(),
			lastUpdate: new Date(),
			updates: [uploadUpdate]
		};
		if (parsedRatios) {
			mission.ratios = parsedRatios;
		}
		if (this.fileImageGroup.get('imgToggle')?.value) {
			mission.image = this.missionImageSrc;
		}
		this.sharedService.uploadingState = 'uploading';
		this.authError = null;
		const formData: any = new FormData();
		this.buildFormData(formData, mission);
		formData.append('fileName', this.missionFileName);
		formData.append('fileData', this.missionToUpload);
		this.missionsService.upload(formData).subscribe(
			() => {
				this.sharedService.uploadingState = 'success';
				this.authError = null;
				this.router.routeReuseStrategy.shouldReuseRoute = () => false;
				this.router.onSameUrlNavigation = 'reload';
				this.router.navigate(['/mission-list']);
			},
			(httpError) => {
				this.missionErrors = httpError.error.missionErrors ?? {};
				this.authError = httpError.error.authError;
				this.sharedService.uploadingState = 'error';
			}
		);
	}

	onRatioEnabledChange(controlName: string) {
		if (this.missionSizeGroup.get(controlName)?.enabled) {
			this.missionSizeGroup.get(controlName)?.disable();
		} else {
			this.missionSizeGroup.get(controlName)?.enable();
		}
	}
}
