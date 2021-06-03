import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { DialogActionsComponent } from "@app/components/mission-details/dialog-actions/dialog-actions.component";
import { MissionsService } from "@app/services/missions.service";
import { UserService } from "@app/services/user.service";
import { DatePipe } from "@angular/common";
import { DiscordUser } from "@app/models/discordUser";
import { IHistory, IMission } from "@app/models/mission";
import { ILeader } from "@app/models/leader";

@Component({
	selector: "app-dialog-add-aar",
	templateUrl: "./dialog-add-aar.component.html",
	styleUrls: ["./dialog-add-aar.component.scss"]
})
export class DialogAddAarComponent implements OnInit {
	constructor(
		public dialogRef: MatDialogRef<DialogActionsComponent>,
		public missionsService: MissionsService,
		public userService: UserService,
		private datePipe: DatePipe,
		@Inject(MAT_DIALOG_DATA)
		public data: {
			discordUser: DiscordUser;
			mission: IMission;
			leader: ILeader;
			history: IHistory;
			oldAar: string;
		}
	) {
	}

	aarText= `
## Use this space to write down your initial plan, your **successes** and **failures**.
### Imagine that future leaders will read this. Try to keep up the tactical and professional spirit that Global Conflicts endorses.

Here is a short list of topics you can cover:
- Your thoughts of the mission;
- How you overcame the obstacles presented by the mission, or failed to;
- In hindsight, would you have changed anything?
- The interactions between your squads/groups. As a general rule of professionalism, if you are complementing someone, feel free to name. If you have critical feedback, try to avoid naming names to avoid drama.

Feel free to post links. For pictures make sure they are under 1200px wide/tall. You can edit the submitted AAR.
`;


	ngOnInit(): void {
		if (this.data.oldAar) {
			this.aarText = this.data.oldAar;
		}
	}

	submitAAR() {
		this.dialogRef.close(this.aarText.trim());
	}
}
