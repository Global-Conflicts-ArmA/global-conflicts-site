import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '@app/services/user.service';
import { MatDialog } from "@angular/material/dialog";
import { DialogJoinDiscordComponent } from "@app/components/home/dialog-join-discord/dialog-join-discord.component";

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
	constructor(
		private route: ActivatedRoute,
		private userService: UserService,
		public dialog: MatDialog,
	) {}

	ngOnInit(): void {
		this.route.queryParams.subscribe((params) => {
			if (params['token']) {
				this.userService.saveToken(params['token']);
				this.userService.saveUser();
			}
		});
	}
}
