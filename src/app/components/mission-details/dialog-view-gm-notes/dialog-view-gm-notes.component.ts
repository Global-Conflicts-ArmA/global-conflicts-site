import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogActionsComponent } from '@app/components/mission-details/dialog-actions/dialog-actions.component';
import { MissionsService } from '@app/services/missions.service';
import { UserService } from '@app/services/user.service';
import { DatePipe } from '@angular/common';
import { DiscordUser } from '@app/models/discordUser';
import { IHistory, IMission } from '@app/models/mission';
import { ILeader } from '@app/models/leader';

@Component({
	selector: 'app-dialog-view-gm-notes',
	templateUrl: './dialog-view-gm-notes.component.html',
	styleUrls: ['./dialog-view-gm-notes.component.scss']
})
export class DialogViewGmNotesComponent implements OnInit {
	constructor(
		public dialogRef: MatDialogRef<DialogActionsComponent>,
		@Inject(MAT_DIALOG_DATA)
		public gmNote: string
	) {}

	ngOnInit(): void {}
}
