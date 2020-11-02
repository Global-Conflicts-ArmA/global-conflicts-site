import {Component, OnInit} from '@angular/core';
import {UserService} from '../../services/user.service';
import {DiscordUser} from '../../models/discorduser';


@Component({
	selector: 'app-toolbar',
	templateUrl: './toolbar.component.html',
	styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit {

	constructor(private userService: UserService) {
	}

	discordUser: DiscordUser | null;

	ngOnInit(): void {
		this.discordUser = this.userService.getUserLocally();
	}


	logout() {
		this.userService.logout();
	}


}
