import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { DatabaseUser } from "@app/models/databaseUser";
import { IMission, IUpdate } from '@app/models/mission';
import { MissionsService } from '@app/services/missions.service';

export enum MissionActions {
	REMOVE_FROM_MAIN = 'remove_from_main',
	REMOVE_FROM_TEST = 'remove_from_test',
	COPY_TO_TEST = 'copy_to_test',
	COPY_TO_MAIN = 'copy_to_main',
	MARK_AS_READY = 'mark_as_ready',
	REMOVE_ARCHIVE = 'remove_archive'
}

@Component({
	selector: "app-dialog-actions",
	templateUrl: "./dialog-actions.component.html",
	styleUrls: ["./dialog-actions.component.scss"]
})
export class DialogActionsComponent implements OnInit {
	constructor(
		public dialogRef: MatDialogRef<DialogActionsComponent>,
		public missionsService: MissionsService,

		@Inject(MAT_DIALOG_DATA)
		public data: { discordUser: DatabaseUser; mission: IMission, update: IUpdate }
	) {}

	loading = false;

	public get getActionType(): typeof MissionActions {
		return MissionActions;
	}

	ngOnInit(): void {}

	canCopyToTestServer() {
		return (
			this.data.discordUser?.role === "Admin" ||
			this.data.mission?.authorID === this.data.discordUser?.id
		) && !this.data.update.test;
	}

	canRemoveFromMainServer() {
		return this.data.discordUser?.role === "Admin"  && this.data.update.main;
	}

	canRemoveFromTestServer() {
		return (
			this.data.discordUser?.role === "Admin" ||
			this.data.mission?.authorID === this.data.discordUser?.id
		) && this.data.update.test;
	}

	canCopyToMainServer() {
		return this.data.discordUser?.role === "Admin" && !this.data.update.main;
	}

	canMarkAsReady() {
		return (
			this.data.discordUser?.role === "Admin" ||
			this.data.mission?.authorID === this.data.discordUser?.id
		)  && !this.data.update.ready;
	}

	doAction(action: MissionActions) {
		if (this.data.update._id != null) {
			this.loading = true;
			this.missionsService.missionAction(
				action,
				this.data.mission.uniqueName,
				this.data.update._id,
				this.data.update.fileName
			).subscribe(value => {
				this.loading = false;
				if(value["ok"]){
					switch (action){
						case MissionActions.REMOVE_FROM_MAIN:
							this.data.update.main = false
							break;
						case MissionActions.REMOVE_FROM_TEST:
							this.data.update.test = false
							break;
						case MissionActions.COPY_TO_TEST:
							this.data.update.test = true
							break;
						case MissionActions.COPY_TO_MAIN:
							this.data.update.main = true
							break;
						case MissionActions.MARK_AS_READY:
							this.data.update.ready = true
							break;
						case MissionActions.REMOVE_ARCHIVE:
							this.dialogRef.close(MissionActions.REMOVE_ARCHIVE)
							return;
					}
					this.dialogRef.close()

				}

			});
		}
	}

	canRemoveArchive() {
		return this.data.discordUser?.role === "Admin" ;
	}

    removeArchive() {
		if(confirm("ARE YOU SURE YOU WANT TO REMOVE THIS UPDATE ENTRY AND ARCHIVE?")) {
			this.doAction(MissionActions.REMOVE_ARCHIVE)
		}

    }
}
