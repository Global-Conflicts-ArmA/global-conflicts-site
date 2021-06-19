import { Component, Inject, OnInit } from '@angular/core';
import {
	MAT_DIALOG_DATA,
	MatDialog,
	MatDialogRef
} from '@angular/material/dialog';
import { IMission, IUpdate } from '@app/models/mission';
import { MissionsService } from '@app/services/missions.service';
import { DialogSubmitAuditReviewComponent } from '@app/components/mission-details/dialog-submit-audit-review/dialog-submit-audit-review.component';
import { UserService } from '@app/services/user.service';

export enum MissionActions {
	REMOVE_FROM_MAIN = 'remove_from_main',
	REMOVE_FROM_TEST = 'remove_from_test',
	COPY_TO_TEST = 'copy_to_test',
	COPY_TO_MAIN = 'copy_to_main',
	MARK_AS_READY = 'mark_as_ready',
	ASK_FOR_REVIEW = 'ask_for_review',
	REMOVE_ARCHIVE = 'remove_archive',
	SUBMIT_AUDIT = 'submit_audit'
}

export enum MissionReviewStates {
	REVIEW_STATE_PENDING = 'review_pending',
	REVIEW_STATE_REPROVED = 'review_reproved',
	REVIEW_STATE_ACCEPTED = 'review_accepted',
	REVIEW_STATE_ACCEPTS_WITH_CAVEATS = 'review_accepted_with_caveats'
}

@Component({
	selector: 'app-dialog-actions',
	templateUrl: './dialog-actions.component.html',
	styleUrls: ['./dialog-actions.component.scss']
})
export class DialogActionsComponent implements OnInit {
	constructor(
		public dialog: MatDialog,
		public dialogRef: MatDialogRef<DialogActionsComponent>,
		public missionsService: MissionsService,
		public userService: UserService,
		@Inject(MAT_DIALOG_DATA)
		public data: {
			mission: IMission;
			update: IUpdate;
		}
	) {}

	loading = false;

	public get getActionType(): typeof MissionActions {
		return MissionActions;
	}

	ngOnInit(): void {}

	canCopyToTestServer() {
		return (
			(this.userService.loggedUser?.isAdmin() ||
				this.data.mission?.authorID ===
					this.userService.loggedUser?.userID) &&
			!this.data.update.test
		);
	}

	canRemoveFromMainServer() {
		return this.userService.loggedUser?.isAdmin() && this.data.update.main;
	}

	canRemoveFromTestServer() {
		return (
			(this.userService.loggedUser?.isAdmin() ||
				this.data.mission?.authorID ===
					this.userService.loggedUser?.userID) &&
			this.data.update.test
		);
	}

	canCopyToMainServer() {
		return this.userService.loggedUser?.isAdmin() && !this.data.update.main;
	}

	canAskForReview() {
		return (
			this.userService.loggedUser?.isAdmin() ||
			(this.data.mission?.authorID ===
				this.userService.loggedUser?.userID &&
				!this.data.update.reviewState)
		);
	}

	doAction(action: MissionActions) {
		if (this.data.update._id != null) {
			this.loading = true;
			this.missionsService
				.missionAction(
					action,
					this.data.mission.uniqueName,
					this.data.update._id,
					this.data.update.fileName
				)
				.subscribe((value) => {
					this.loading = false;
					if (value['ok']) {
						switch (action) {
							case MissionActions.REMOVE_FROM_MAIN:
								this.data.update.main = false;
								break;
							case MissionActions.REMOVE_FROM_TEST:
								this.data.update.test = false;
								break;
							case MissionActions.COPY_TO_TEST:
								this.data.update.test = true;
								break;
							case MissionActions.COPY_TO_MAIN:
								this.data.update.main = true;
								break;
							case MissionActions.ASK_FOR_REVIEW:
								this.dialogRef.close(
									MissionActions.ASK_FOR_REVIEW
								);
								return;
							case MissionActions.REMOVE_ARCHIVE:
								this.dialogRef.close(
									MissionActions.REMOVE_ARCHIVE
								);
								return;
						}
						this.dialogRef.close();
					}
				});
		}
	}

	canRemoveArchive() {
		return this.userService.loggedUser?.isAdmin();
	}

	removeArchive() {
		if (
			confirm(
				'ARE YOU SURE YOU WANT TO REMOVE THIS UPDATE ENTRY AND ARCHIVE?'
			)
		) {
			this.doAction(MissionActions.REMOVE_ARCHIVE);
		}
	}

	canReviewMission() {
		return (
			this.userService.loggedUser?.isAdmin() ||
			(this.userService.loggedUser?.isMissionReviewer() &&
				this.data.update.reviewState ===
					MissionReviewStates.REVIEW_STATE_PENDING)
		);
	}

	openReviewDialog() {
		this.dialog
			.open(DialogSubmitAuditReviewComponent, {
				data: { mission: this.data.mission },
				autoFocus: false,
				minWidth: '20rem'
			})
			.afterClosed()
			.subscribe((result) => {
				if (!result) {
					return;
				}
				if (this.data.update._id != null) {
					this.missionsService
						.submitAuditReview(
							this.data.mission.uniqueName,
							this.data.update._id,
							this.data.update.fileName,
							result['reviewChecklist'],
							result['reviewerNotes'],
							result['reviewState']
						)
						.subscribe((value) => {
							this.data.update.reviewState = result['reviewState'];
							this.dialogRef.close();
						});
				}
			});
	}
}
