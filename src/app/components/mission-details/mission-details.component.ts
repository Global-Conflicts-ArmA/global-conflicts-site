import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MissionsService } from '../../services/missions.service';
import { MatDialog } from '@angular/material/dialog';

import { DiscordUser } from '../../models/discorduser';
import { UserService } from '../../services/user.service';
import { IMission, IUpdate } from '../../models/mission';
import { SharedService } from '@app/services/shared';

@Component({
	selector: 'app-mission-details',
	templateUrl: './mission-details.component.html',
	styleUrls: ['./mission-details.component.scss']
})
export class MissionDetailsComponent implements OnInit {
	constructor(
		private userService: UserService,
		public missionsService: MissionsService,
		private sharedService: SharedService,
		private route: ActivatedRoute,
		public dialog: MatDialog
	) {}
	discordUser: DiscordUser | null;
	mission: IMission | null;
	updates: IUpdate[];
	updateColumns = ['date', 'version', 'authorName', 'status', 'buttons'];
	reportColumns = ['date', 'version', 'authorName', 'buttons'];
	reviewColumns = ['date', 'version', 'authorName', 'buttons'];

	ngOnInit(): void {
		this.discordUser = this.userService.getUserLocally();
		const uniqueName = this.route.snapshot.paramMap.get('id');

		this.missionsService
			.getFileName(uniqueName)
			.subscribe(async (mission) => {
				mission.authorName = await this.userService.getDiscordUsername(
					mission.authorID
				);
				mission.updates.map(async (update: IUpdate) => {
					update.authorName = await this.userService.getDiscordUsername(
						update.authorID
					);
				});
				mission.reports = mission.reports ?? [];
				mission.reviews = mission.reviews ?? [];
				this.mission = mission;
				console.log('mission: ', mission);
			});
	}

	public showText(text: string) {
		console.log(text);
	}

	public updateMission() {
		//  	const dialogRef = this.dialog.open(DialogContentExampleDialog);
		//  	dialogRef.afterClosed().subscribe(result => {
		//  		console.log(`Dialog result: ${result}`);
		//  	});
	}
}

// @Component({
// 	selector: 'dialog-content-example-dialog',
// 	templateUrl: 'mission-update-dialog.html',
// })
// export class DialogContentExampleDialog { }
