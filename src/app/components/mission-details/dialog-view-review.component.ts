import { Component, Inject } from '@angular/core';
import {
	MatDialog,
	MatDialogRef,
	MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { IMission, IReview } from '@app/models/mission';
import { MissionsService } from '@app/services/missions.service';

@Component({
	selector: 'dialog-view-review',
	templateUrl: 'dialog-view-review.html',
	styleUrls: ['./mission-report-review-bug-dialog.scss']
})
export class DialogViewReviewComponent {
	enableErrorLog = false;
	constructor(
		public dialogRef: MatDialogRef<DialogViewReviewComponent>,
		@Inject(MAT_DIALOG_DATA)
		public data: { mission: IMission; review: IReview },
		public missionsService: MissionsService
	) {}
}
