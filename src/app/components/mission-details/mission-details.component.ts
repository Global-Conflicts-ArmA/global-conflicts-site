import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { MissionsService } from '../../services/missions.service';

import { DiscordUser } from '../../models/discorduser';
import { UserService } from '../../services/user.service';
import { IMission } from '../../models/mission';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
	selector: 'app-mission-details',
	templateUrl: './mission-details.component.html',
	styleUrls: ['./mission-details.component.scss']
})
export class MissionDetailsComponent implements OnInit {
	constructor(
		private userService: UserService,
		private missionsService: MissionsService,
		private route: ActivatedRoute,
		private sanitizer: DomSanitizer
	) { }
	discordUser: DiscordUser | null;
	mission: IMission | null;

	async ngOnInit(): Promise<void> {
		this.discordUser = this.userService.getUserLocally();
		const missionFileName = this.route.snapshot.paramMap.get('id');

		this.missionsService
			.getMissionFileName(missionFileName)
			.subscribe((mission) => {
				this.mission = mission;
			});
	}

	public getImage(b64Image: string) {
		return this.sanitizer.bypassSecurityTrustResourceUrl(b64Image);
	}

}
