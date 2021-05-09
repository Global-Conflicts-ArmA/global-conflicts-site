import { Component, Inject } from '@angular/core';
import {
	MatDialog,
	MatDialogRef,
	MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { IMission, IReport } from '@app/models/mission';
import { MissionsService } from '@app/services/missions.service';
import { UserService } from '@app/services/user.service';

@Component({
	selector: 'dialog-view-bug-report',
	templateUrl: 'dialog-view-bug-report.html',
	styleUrls: ['./mission-report-review-bug-dialog.scss']
})
export class DialogViewBugReportComponent {
	enableErrorLog = false;

	constructor(
		public dialogRef: MatDialogRef<DialogViewBugReportComponent>,
		@Inject(MAT_DIALOG_DATA)
		public data: { mission: IMission; report: IReport },
		private userService: UserService,
		public missionsService: MissionsService
	) {
		this.userService
			.getDiscordUsername(data.report.authorID)
			.then((result) => {
				data.report.authorName = result;
			})
			.catch((err) => {
				data.report.authorName = 'error';
			});
	}
}
