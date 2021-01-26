import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormControl, AbstractControl} from '@angular/forms';
import {MissionTerrains} from '../../mission-enums';
import {MissionConstants} from '../../constants/missionConstants';
import {MissionsService} from '../../services/missions.service';
import {DiscordUser} from '../../models/discorduser';
import {UserService} from '../../services/user.service';
import {FileValidator} from 'ngx-material-file-input';
import {MatSelect, MatSelectChange} from '@angular/material/select';

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
	uploadingState: string;
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
	missionEraGroup: FormGroup;
	missionDescGroup: FormGroup;
	fileImageGroup: FormGroup;

	ngOnInit(): void {
		console.log('MissionTypes:', this.mC.MissionTypes);
		console.log('MissionTypes count:', this.mC.MissionTypes.length);
		console.log('MissionTerrains:', MissionTerrains);
		console.log('MissionEras:', this.mC.MissionEras);
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
			]]
    });
		this.missionSizeGroup = this.formBuilder.group(
			{
				minPlayers: new FormControl(''),
				maxPlayers: new FormControl(''),
				ratioBluforE: new FormControl({value: true}),
				ratioBlufor: new FormControl({value: 1, disabled: false}),
				ratioOpforE: new FormControl({value: true}),
				ratioOpfor: new FormControl({value: 1, disabled: false}),
				ratioIndforE: new FormControl({value: true}),
				ratioIndfor: new FormControl({value: 1, disabled: false}),
				ratioCivE: new FormControl({value: true}),
				ratioCiv: new FormControl({value: 1, disabled: false}),
	    }, { validators: [this.checkMissionSize] }
		);
		this.missionDescGroup = this.formBuilder.group({
      misDescription: ['', [
				Validators.required,
				this.checkMissionDesc()
			]],
			misTags: [''],
			misTime: [Validators.required],
			missionEra: ['', [
				Validators.required
			]]
    });
		this.fileImageGroup = this.formBuilder.group({
      missionImage: ['', [
				Validators.required,
				this.checkImageFile(),
				FileValidator.maxContentSize(this.maxSizeImage)
			]]
    });
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
		return type && type.value ? (type.value.ratio ?? false): false
	}

	checkMissionRatio(type = this.missionTypeGroup.get('missionType')) {
		return function (control: FormControl) {
	    if (type && type.value && type.value.ratio) {
				const ratio = control.value
				if (!ratio || ratio.length == 0) {
					return {
						required: true
					}
				}
				const regexp = /^[0-9](\.[0-9])*:[0-9](\.[0-9])*(:[0-9](\.[0-9])*)*/g;
				if (!ratio.match(regexp)) {
					return {
			      wrongFormat: true
			    }
				}
	      return null
	    }
	    return null
	  };
	}

	getRatioErrorMessage() {
		let desc = this.missionSizeGroup.get('misRatio');
		if (desc) {
			if (desc.hasError('required')) {
				return `You must provide a ratio in the format of 1.5:1`;
			}
			if (desc.hasError('wrongFormat')) {
				return `You must provide a TVT ratio with a proper format eg: 1.5:1`;
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

	checkImageFile() {
	  return function (control: FormControl) {
	    const files = control.value;
	    if (files && files.files[0]) {
				const file = files.files[0];
				const fileNameArray = file.name.split('.');
				const fileExt = fileNameArray[fileNameArray.length - 1].toLowerCase();
				const acceptedFileExt = ['png','jpeg','jpg'];
				if (!acceptedFileExt.includes(fileExt)) {
	        return {
	          requiredFileType: true
	        };
	      }
	      return null;
	    }
	    return null;
	  };
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
		if (missionImage) {
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
    return 'unknown error';
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

	buildMissionDesc() {
		const desc = this.missionDescGroup.get('misDescription');
		this.missionDescription = desc ? desc.value ?? '' : '';
	}

	selectMissionType() {
		let missionType = this.missionTypeGroup.get('missionType');
		if (missionType && missionType.value) {
			this.misType = missionType.value.str ?? missionType.value.title;
			console.log('value:',missionType.value);
			console.log('misType:',this.misType);
			let isTVT = this.getIfTVT();
			console.log('isTVT:', isTVT);
			this.buildMissionFileName();
		}
	}

	buildMissionFileName() {
		let missionName = this.missionNameGroup.get('missionName')?.value ?? '';
		const safeMissionName = missionName.replace(' ', '_').replace(/\W/g, '');
		const safeMissionType = this.misType;
		const safeMaxPlayers = this.maxPlayers ? this.padZeros(this.maxPlayers) : '';
		const spaceMaxPlayersMissionName = safeMissionName && (safeMaxPlayers || this.misType) ? '_' : '';
		const spaceMissionNameVersion = (safeMissionName || this.misType || safeMaxPlayers) && this.version ? '_V' : '';
		let mapName = '';
		if (this.missionToUpload) {
			mapName = (this.missionToUpload.name).substring(
				this.missionToUpload.name.indexOf('.') + 1,
				this.missionToUpload.name.lastIndexOf('.')
			);
			mapName = '.' + mapName;
		}
		this.missionFileName = `${safeMissionType}${safeMaxPlayers ?? ''}${spaceMaxPlayersMissionName}${safeMissionName}${spaceMissionNameVersion}${this.version >= 1 ? this.version : ''}${mapName}.pbo`;
	}

	upload() {
		this.uploadPressed = true;
		if (Object.keys(this.missionErrors).length > 0) {
			return;
		}
		const formData: any = new FormData();
		formData.append('description', this.description);
		formData.append('minPlayers', this.minPlayers);
		formData.append('maxPlayers', this.maxPlayers);
		formData.append('missionType', this.misType);
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
