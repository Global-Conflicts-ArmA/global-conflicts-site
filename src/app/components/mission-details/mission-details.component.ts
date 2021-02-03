import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { MissionsService } from '../../services/missions.service';

import { DiscordUser } from '../../models/discorduser';
import { UserService } from '../../services/user.service';

@Component({
	selector: 'app-mission-details',
	templateUrl: './mission-details.component.html',
	styleUrls: ['./mission-details.component.scss']
})
export class MissionDetailsComponent implements OnInit {
	constructor(
		private userService: UserService,
		private missionsService: MissionsService,
		private route: ActivatedRoute
	) {}
	discordUser: DiscordUser | null;

	async ngOnInit(): Promise<void> {
		this.discordUser = this.userService.getUserLocally();
		const missionFileName = this.route.snapshot.paramMap.get('id');
		if (missionFileName) {
			this.missionsService
				.getMissionFileName(missionFileName)
				.subscribe((mission) => {
					console.log(mission);
				});
		}
	}
}
