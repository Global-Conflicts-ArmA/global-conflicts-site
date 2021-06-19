import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '@app/models/user';
import { IMission, IUpdate } from '@app/models/mission';
import { MissionsService } from '@app/services/missions.service';

@Component({
	selector: 'app-dialog-submit-audit-review',
	templateUrl: './dialog-submit-audit-review.component.html',
	styleUrls: ['./dialog-submit-audit-review.component.scss']
})
export class DialogSubmitAuditReviewComponent implements OnInit {
	constructor(
		public missionsService: MissionsService,
		public dialogRef: MatDialogRef<DialogSubmitAuditReviewComponent>,
		@Inject(MAT_DIALOG_DATA)
		public data: {
			discordUser: User;
			mission: IMission;
			update: IUpdate;
		}
	) {}

	ngOnInit(): void {
		if (!this.data.mission.reviewChecklist) {
			this.missionsService.getQuestionnaire().subscribe((value) => {
				this.data.mission.reviewChecklist = value;
			});
		}
	}

	isButtonDisabled() {
		if (!this.data.mission.reviewChecklist) {
			return true;
		}

		for (const item of this.data.mission.reviewChecklist) {
			if (item.value === undefined) {
				return true;
			}
		}

		return false;
	}

	aprove() {
		if (confirm('Are you sure you want to aprove this mission?')) {
			this.dialogRef.close({
				reviewState: 'review_accepted',
				reviewChecklist: this.data.mission.reviewChecklist,
				reviewerNotes: this.data.mission.reviewerNote
			});
		}
	}

	reprove() {
		if (confirm('Are you sure you want to reprove this mission?')) {
			this.dialogRef.close({
				reviewState: 'review_reproved',
				reviewChecklist: this.data.mission.reviewChecklist,
				reviewerNotes: this.data.mission.reviewerNote
			});
		}
	}
}
