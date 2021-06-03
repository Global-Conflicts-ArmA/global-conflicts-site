import { Component, OnInit } from '@angular/core';
import { DatabaseUser } from '../../models/databaseUser';
import { UserService } from '../../services/user.service';

@Component({
	selector: 'app-user-settings',
	templateUrl: './user-settings.component.html',
	styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {
	constructor(private userService: UserService) {}

	// TODO: implement formControls for these
	discordUser: DatabaseUser | null;
	missionEditDM = false;
	missionReportDM = false;
	missionReviewDM = false;
	missionRemoveDM = false;
	missionAcceptDM = false;

	ngOnInit(): void {}
}
