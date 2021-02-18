import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
	MatDialog,
	MatDialogRef,
	MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { DiscordUser } from '@app/models/discorduser';
import { IMission, IReport, IReview } from '@app/models/mission';
import { MissionsService } from '@app/services/missions.service';
import { UserService } from '@app/services/user.service';

@Component({
	selector: 'dialog-submit-review',
	templateUrl: 'dialog-submit-review.html'
})
export class DialogEditDetailsComponent implements OnInit {
	enableErrorLog = false;
	constructor(
		public dialogRef: MatDialogRef<DialogEditDetailsComponent>,
		@Inject(MAT_DIALOG_DATA) public mission: IMission,
		private formBuilder: FormBuilder,
		public missionsService: MissionsService,
		private userService: UserService
	) {}

	reviewGroup: FormGroup;
	discordUser: DiscordUser | null;

	ngOnInit(): void {
		this.discordUser = this.userService.getUserLocally();
		this.reviewGroup = this.formBuilder.group(
			{
				version: ['', [Validators.required]],
				review: ['', [Validators.required]]
			}
		);
	}

	buildFormData(
		formData: { append: (arg0: any, arg1: any) => void },
		data: { data: IReview; uniqueName: string } | null,
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
		const review: IReview = {
			version: this.reviewGroup.get('version')?.value,
			authorID: this.discordUser?.id ?? '',
			date: new Date(),
			review: this.reviewGroup.get('review')?.value ?? ''
		};
		console.log('review: ', review);
		const request = {
			data: review,
			uniqueName: this.mission.uniqueName
		};
		const formData: any = new FormData();
		this.buildFormData(formData, request);
		this.missionsService.submitReview(formData).subscribe(
			() => {
				console.log('upload success');
			},
			(httpError) => {
				console.log('upload error');
			}
		);
	}
}
