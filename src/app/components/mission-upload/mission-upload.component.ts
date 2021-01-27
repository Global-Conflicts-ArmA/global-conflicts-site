import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormControl, AbstractControl} from '@angular/forms';
import {MissionTerrains} from '../../mission-enums';
import {MissionConstants} from '../../constants/missionConstants';
import {MissionsService} from '../../services/missions.service';
import {DiscordUser} from '../../models/discorduser';
import {UserService} from '../../services/user.service';
import {FileValidator} from 'ngx-material-file-input';
import {MatSelect} from '@angular/material/select';

@Component({
	selector: 'app-mission-upload',
	templateUrl: './mission-upload.component.html',
	styleUrls: ['./mission-upload.component.scss'],
	providers: [MissionConstants],
})
export class MissionUploadComponent implements OnInit {

	constructor(
		private missionsService: MissionsService,
		private userService: UserService,
		private formBuilder: FormBuilder,
		private mC: MissionConstants,
	) {
	}

	discordUser: DiscordUser | null;
	misType: string = 'CO';
	missionToUpload: File;
	ratio: string;
	description: string;
	missionName: string;
	minPlayers: number = 2;
	maxPlayers: number = 99;
	version: number;
	uploadPressed = false;
	missionErrors: object = {};
	authError: string | null;
	uploadingState: string = 'ready';
	missionFileName = '.pbo';
	missionDescription = '';
	missionImageFile = null;
	missionImageSrc: any;
	missionTerrain: string = '';

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

	ngOnInit(): void {
		this.discordUser = this.userService.getUserLocally();
		this.fileUploadGroup = this.formBuilder.group({
      missionFile: ['', [
				Validators.required,
				FileValidator.maxContentSize(this.maxSize),
				this.checkFileName()
			]]
    });
		this.missionNameGroup = this.formBuilder.group({
      missionName: ['', [
				Validators.required,
				this.checkMissionName()
			]]
    });
		this.missionTypeGroup = this.formBuilder.group({
      missionType: ['', [
				Validators.required
			]],
			ratioLOL: ['']
    });
		this.missionSizeGroup = this.formBuilder.group(
			{
				minPlayers: new FormControl(''),
				maxPlayers: new FormControl(''),
				ratioBluforE: new FormControl(true),
				ratioBlufor: new FormControl({value: 1, disabled: false}),
				ratioOpforE: new FormControl(true),
				ratioOpfor: new FormControl({value: 1, disabled: false}),
				ratioIndforE: new FormControl(true),
				ratioIndfor: new FormControl({value: 1, disabled: false}),
				ratioCivE: new FormControl(true),
				ratioCiv: new FormControl({value: 1, disabled: false}),
	    }, { validators: [this.checkMissionSize, this.checkMissionRatios.bind(this)] }
		);
		this.missionDescGroup = this.formBuilder.group({
      misDescription: ['', [
				Validators.required,
				this.checkMissionDesc()
			]],
			misTags: ['', [Validators.required]],
			misTime: ['', [Validators.required]],
			misEra: ['', [
				Validators.required
			]]
    });
		this.fileImageGroup = this.formBuilder.group({
      missionImage: ['', [
				FileValidator.maxContentSize(this.maxSizeImage)
			]],
			imgToggle: ['']
    }, { validators: [this.checkImageFile.bind(this)] });
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

	checkFileName() {
	  return function (control: FormControl) {
	    const files = control.value;
	    if (files && files.files[0]) {
				const file = files.files[0];
				const fileNameArray = file.name.split('.');
				if ('pbo' !== fileNameArray[fileNameArray.length - 1].toLowerCase()) {
	        return {
	          requiredFileType: true
	        }
	      }
				if (fileNameArray.length !== 3) {
					return {
	          requiredTerrain: true
	        }
				} else {
					if (fileNameArray[1] in MissionTerrains) {
					} else {
						return {
		          notAcceptedTerrain: true
		        }
					}
				}
	      return null;
	    }
	    return null;
	  };
	}

	getFileErrorMessage() {
		let missionFile = this.fileUploadGroup.get('missionFile');
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
				let actualSize = missionFile.getError('maxContentSize')?.actualSize;
				let maxSize = missionFile.getError('maxContentSize')?.maxSize;
	      return `The total size must not exceed ${this.bytesToSize(maxSize)}	(size: ${this.bytesToSize(actualSize)}).`;
	    }
		}
    return 'unknown error';
  }

	checkMissionName(minNameLength = this.minNameLength, maxNameLength = this.maxNameLength) {
	  return function (control: FormControl) {
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
			// TODO: check existing mission names for duplicates
	  };
	}

	getNameErrorMessage() {
		let missionName = this.missionNameGroup.get('missionName');
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
		let missionType = this.missionTypeGroup.get('missionType');
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
			let hasError: boolean = false;
			let minSize = minSizeCtrl.value;
			let maxSize = maxSizeCtrl.value;
			if (!maxSize || maxSize === '') {
				hasError = true;
				maxSizeCtrl.setErrors({
					maxNotSet: true
				})
			}
			if (!minSize || minSize === '') {
				hasError = true;
				maxSizeCtrl.setErrors({
					minNotSet: true
				})
			} else {
				if (minSize < 2) {
					hasError = true;
					maxSizeCtrl.setErrors({
						minTooSmall: true
					})
				}
				if (maxSize && minSize > maxSize) {
					hasError = true;
					maxSizeCtrl.setErrors({
						minOverMax: true
					})
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
		return null
	}

	getSizeErrorMessage() {
		let maxSize = this.missionSizeGroup.get('maxPlayers')
		if (maxSize) {
			if (maxSize.hasError('minNotSet')) {
				return `You must provide a minimum player count`
			}
			if (maxSize.hasError('maxNotSet')) {
				return `You must provide a maximum player count`
			}
			if (maxSize.hasError('minOverMax')) {
				return `Minimum size over maximum`
			}
			if (maxSize.hasError('minTooSmall')) {
				return `Minimum size too small! Must be 2 or more`
			}
			return null
		}
		return null
  }

	getIfTVT(type = this.missionTypeGroup.get('missionType')) {
		if (this.missionTypeGroup.get('ratioLOL')?.value) {
			return true
		}
		return type && type.value ? (type.value.ratio ?? false): false
	}

	ratioOverride() {
		const status = this.missionTypeGroup.get('ratioLOL')?.value;
		if (!status) {
			this.missionSizeGroup.get('ratioBluforE')?.setErrors(null)
		}
		return status
	}

	checkMissionRatios(controlGroup: AbstractControl) {
		const tvt = this.getIfTVT();
		if (tvt) {
			const enabledBlu = controlGroup.get('ratioBluforE')?.value;
			const enabledOp = controlGroup.get('ratioOpforE')?.value;
			const enabledInd = controlGroup.get('ratioIndforE')?.value;
			const enabledCiv = controlGroup.get('ratioCivE')?.value;
			if ([enabledBlu, enabledOp, enabledInd, enabledCiv].filter(Boolean).length < 2) {
				controlGroup.get('ratioBluforE')?.setErrors({
					tooFew: true
				})
			} else {
				controlGroup.get('ratioBluforE')?.setErrors(null)
			}
		}
	}

	getRatioErrorMessage() {
		let desc = this.missionSizeGroup.get('ratioBluforE');
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
	  return function (control: FormControl) {
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
			// TODO: check existing mission names for duplicates
	  };
	}

	getDescErrorMessage() {
		let desc = this.missionDescGroup.get('misDescription');
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
		let control = this.missionDescGroup.get('misTags');
		if (control) {
			if (control.hasError('required')) {
				return `You must select at least one tag`;
			}
			return null;
		}
		return null;
  }

	getReqErrorMessage(controlStr:string) {
		let control = this.missionDescGroup.get(controlStr);
		if (control) {
			if (control.hasError('required')) {
				return `You must choose an option`;
			}
			return null;
		}
		return null;
  }

	checkImageFile(controlGroup: AbstractControl) {
		let hasError: boolean = false;
		const toggle = controlGroup.get('imgToggle')?.value;
		if (toggle) {
			const files = controlGroup.get('missionImage')?.value;
			if (files && files.files[0]) {
				const file = files.files[0];
				const fileNameArray = file.name.split('.');
				const fileExt = fileNameArray[fileNameArray.length - 1].toLowerCase();
				const acceptedFileExt = ['png','jpeg','jpg'];
				if (!acceptedFileExt.includes(fileExt)) {
					hasError = true;
					controlGroup.get('missionImage')?.setErrors({
						requiredFileType: true
					})
	      } else {
					if (controlGroup.get('missionImage')?.hasError('maxContentSize')) {
						hasError = true
		      }
				}
	    } else {
				hasError = true;
				controlGroup.get('missionImage')?.setErrors({
					required: true
				})
			}
		}
		if (!hasError) {
			controlGroup.get('missionImage')?.setErrors(null)
		}
	}

	setImagePreview(file: any) {
		const fileNameArray = file.name.split('.');
		const fileExt = fileNameArray[fileNameArray.length - 1].toLowerCase();
		const acceptedFileExt = ['png','jpeg','jpg'];
		if (acceptedFileExt.includes(fileExt)) {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = (_event) => {
				this.missionImageSrc = reader.result as string;
			}
		}
	}

	getImageErrorMessage() {
		let missionImage = this.fileImageGroup.get('missionImage');
		let toggleStatus = this.fileImageGroup.get('imgToggle')?.value;
		if (missionImage && toggleStatus) {
			if (missionImage.hasError('required')) {
	      return 'Please select a file';
	    }
			if (missionImage.hasError('requiredFileType')) {
	      return `Can only accept jpg and png image files.`;
	    }
			if (missionImage.hasError('maxContentSize')) {
				let actualSize = missionImage.getError('maxContentSize')?.actualSize;
				let maxSize = missionImage.getError('maxContentSize')?.maxSize;
	      return `The total size must not exceed ${this.bytesToSize(maxSize)}	(size: ${this.bytesToSize(actualSize)}).`;
	    }
		}
    return null;
  }

	bytesToSize(bytes: number) {
  	var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  	if (bytes == 0) return '0 Byte';
  	var i = Math.floor(Math.log(bytes) / Math.log(1024));
  	return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
	}

	padZeros(count: number, size = 2) {
		let stringCount = count.toString();
    while (stringCount.length < size) {stringCount = "0" + stringCount;}
    return stringCount;
	}

	changeImageToggle() {
		const toggleStatus = this.fileImageGroup.get('imgToggle')?.value;
		if (!toggleStatus) {
			this.fileImageGroup.get('missionImage')?.setValue(null);
			this.fileImageGroup.get('missionImage')?.setErrors(null);
			this.missionImageFile = null;
			this.missionImageSrc = null
		}
	}

	buildMissionDesc() {
		const desc = this.missionDescGroup.get('misDescription');
		this.missionDescription = desc ? desc.value ?? '' : '';
	}

	selectMissionType() {
		let missionType = this.missionTypeGroup.get('missionType');
		if (missionType && missionType.value) {
			this.misType = missionType.value.str ?? missionType.value.title;
			this.buildMissionFileName();
		}
		this.missionSizeGroup.get('ratioBluforE')?.setErrors(null)
	}

	buildMissionFileName() {
		const missionName = this.missionNameGroup.get('missionName')?.value;
		const safeMissionName = missionName.replace(' ', '_').replace(/\W/g, '');
		const safeMissionType = this.missionTypeGroup.get('missionType')?.value?.str ? this.missionTypeGroup.get('missionType')?.value?.str : this.missionTypeGroup.get('missionType')?.value?.title;
		const safeMaxPlayers = this.padZeros(this.missionSizeGroup.get('maxPlayers')?.value);
		//const safeVersion = this.getMissionVersion();
		const safeVersion = 1;
		let mapName = '';
		if (this.missionToUpload) {
			mapName = (this.missionToUpload.name).substring(
				this.missionToUpload.name.indexOf('.') + 1,
				this.missionToUpload.name.lastIndexOf('.')
			);
			this.missionTerrain = mapName;
			mapName = '.' + mapName;
		}
		this.missionFileName = `${safeMissionType}${safeMaxPlayers}_${safeMissionName}_V${safeVersion}${mapName}.pbo`;
	}

	submitMission() {
		const formData: any = new FormData();
		formData.append('name', this.missionNameGroup.get('missionName')?.value);
		formData.append('author', this.discordUser?.username);
		formData.append('authorID', this.discordUser?.id);
		formData.append('fileName', this.missionFileName);
		formData.append('terrain', this.missionTerrain);
		const misType = this.missionTypeGroup.get('missionType')?.value;
		formData.append('type', misType.title);
		formData.append('size', [this.missionSizeGroup.get('minPlayers')?.value, this.missionSizeGroup.get('maxPlayers')?.value]);
		if (misType.ratio || this.missionTypeGroup.get('ratioLOL')?.value) {
			const parsedRatios: number[] = [
				this.missionSizeGroup.get('ratioBluforE')?.value ? this.missionSizeGroup.get('ratioBlufor')?.value : -1,
				this.missionSizeGroup.get('ratioOpforE')?.value ? this.missionSizeGroup.get('ratioOpfor')?.value : -1,
				this.missionSizeGroup.get('ratioIndforE')?.value ? this.missionSizeGroup.get('ratioIndfor')?.value : -1,
				this.missionSizeGroup.get('ratioCivE')?.value ? this.missionSizeGroup.get('ratioCiv')?.value : -1,
			];
			formData.append('ratios', parsedRatios);
		}
		formData.append('description', this.missionDescGroup.get('misDescription')?.value);
		formData.append('tags', this.missionDescGroup.get('misTags')?.value);
		formData.append('timeOfDay', this.missionDescGroup.get('misTime')?.value);
		formData.append('era', this.missionDescGroup.get('misEra')?.value);
		if (this.fileImageGroup.get('imgToggle')?.value) {
			formData.append('image', this.missionImageSrc);
		}
		//const safeVersion = this.getMissionVersion();
		const safeVersion = 1;
		formData.append('version', safeVersion);
		formData.append('updates', []);
		formData.append('fileData', this.missionToUpload);
		for (var key of formData.entries()) {
    	console.log(key[0] + ', ' + key[1]);
    }
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
