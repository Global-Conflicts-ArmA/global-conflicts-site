import { Component, Inject } from '@angular/core';
import {
	MatDialog,
	MatDialogRef,
	MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { IMission, IUpdate } from '@app/models/mission';
import { MissionsService } from '@app/services/missions.service';

@Component({
	selector: 'dialog-view-update',
	templateUrl: 'dialog-view-update.html',
	styleUrls: ['./mission-report-review-bug-dialog.scss']
})
export class DialogViewUpdateComponent {
	constructor(
		public dialogRef: MatDialogRef<DialogViewUpdateComponent>,
		@Inject(MAT_DIALOG_DATA) public data: {mission: IMission, update: IUpdate},
		public missionsService: MissionsService
	) {}
}
