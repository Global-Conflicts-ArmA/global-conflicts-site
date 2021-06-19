import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
	MatDialog,
	MatDialogRef,
	MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { User } from '@app/models/user';
import { IMission, IReport, IReview } from '@app/models/mission';
import { MissionsService } from '@app/services/missions.service';
import { UserService } from '@app/services/user.service';
import { MissionActions } from '@app/components/mission-details/dialog-actions/dialog-actions.component';

@Component({
	selector: 'dialog-submit-review',
	templateUrl: 'dialog-submit-review.html'
})
export class DialogSubmitReviewComponent implements OnInit {
	enableErrorLog = false;

	constructor(
		public dialogRef: MatDialogRef<DialogSubmitReviewComponent>,
		@Inject(MAT_DIALOG_DATA)
		public data: { mission: IMission; review: IReview },
		private formBuilder: FormBuilder,
		public missionsService: MissionsService,
		public userService: UserService
	) {}

	reviewGroup: FormGroup;

	ngOnInit(): void {
		this.reviewGroup = this.formBuilder.group({
			version: [this.data.review?.version ?? '', [Validators.required]],
			review: [this.data.review?.review ?? '', [Validators.required]]
		});
	}

	compareVersions(o1: any, o2: any) {
		return o1.major === o2.major && o1.minor === o2.minor;
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
		if (!this.userService.loggedUser) {
			return;
		}
		const review: IReview = {
			version: this.reviewGroup.get('version')?.value,
			authorID: this.userService.loggedUser.userID,
			date: new Date(),
			review: this.reviewGroup.get('review')?.value ?? ''
		};
		if (this.data.review) {
			review._id = this.data.review._id;
		}
		console.log('review: ', review);
		const request = {
			data: review,
			uniqueName: this.data.mission.uniqueName
		};
		const formData: any = new FormData();
		this.buildFormData(formData, request);
		this.missionsService
			.submitReview(formData, !!this.data.review)
			.subscribe(
				() => {
					this.dialogRef.close();
				},
				(httpError) => {
					this.dialogRef.close();
				}
			);
	}

	removeEntry() {
		if (confirm('ARE YOU SURE YOU WANT TO REMOVE THIS REVIEW?')) {
			this.dialogRef.close({ action: 'delete_review' });
		}
	}
}
