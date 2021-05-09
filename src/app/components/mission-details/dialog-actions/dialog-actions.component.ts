import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { DiscordUser } from "@app/models/discorduser";
import { IMission, IUpdate } from '@app/models/mission';
import { MissionsService } from "@app/services/missions.service";

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
		public data: { discordUser: DiscordUser; mission: IMission, update: IUpdate }
	) {}

    REMOVE_FROM_MAIN = "remove_from_main";
    REMOVE_FROM_TEST = "remove_from_test";
    COPY_TO_TEST = "copy_to_test";
    COPY_TO_MAIN = "copy_to_main";
    MARK_AS_READY = "mark_as_ready";
    REMOVE_ARCHIVE = "remove_archive";

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

	doAction(action: string) {
		if (this.data.update._id != null) {
			this.missionsService.missionAction(
				action,
				this.data.mission.uniqueName,
				this.data.update._id,
				this.data.update.fileName
			).subscribe(value => {
				this.dialogRef.close("refresh");
				console.log(value);
			});
		}
	}

	canRemoveArchive() {
		return this.data.discordUser?.role === "Admin" ;
	}

    removeArchive() {
		if(confirm("ARE YOU SURE YOU WANT TO REMOVE THIS UPDATE ENTRY AND ARCHIVE?")) {
			this.doAction(this.REMOVE_ARCHIVE)
		}

    }
}
