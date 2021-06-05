import { Component, OnInit } from '@angular/core';
import { DatabaseUser } from '@app/models/databaseUser';
import { UserService } from '@app/services/user.service';
import { MissionsService } from '@app/services/missions.service';
import { IMission } from '@app/models/mission';

@Component({
	selector: 'app-voted-missions',
	templateUrl: './voted-missions.component.html',
	styleUrls: ['./voted-missions.component.scss']
})
export class VotedMissionsComponent implements OnInit {
	doneLoading: boolean;
	discordUser: DatabaseUser | null;
	votedMissions: IMission[] = [];
	userVotesCount = 0;
	loadingVote: boolean;

	constructor(
		private userService: UserService,
		public missionsService: MissionsService
	) {}

	getVotedMissions() {
		this.missionsService.getVotedMissions().subscribe((missions) => {
			missions.map(async (mission) => {
				mission.authorName = await this.userService.getDiscordUsername(
					mission.authorID
				);
			});
			this.votedMissions = missions.sort((a, b) => {
				if (a.votes && b.votes) {
					if (a.votes?.length < b.votes?.length) {
						return 1;
					}
					if (a.votes?.length > b.votes?.length) {
						return -1;
					}
				}
				return 0;
			});
			this.missionsService.getUserVotes().subscribe((value) => {
				if (value && value['votes']) {
					this.userVotesCount = value['votes'].length;
				}
			});

			this.doneLoading = true;
		});
	}

	ngOnInit(): void {
		this.discordUser = this.userService.getUserLocally();
		this.getVotedMissions();
	}

	vote(mission: IMission) {
		if (mission && this.discordUser) {
			this.loadingVote = true;
			if (
				!mission.votes ||
				!mission.votes?.includes(this.discordUser.id)
			) {
				this.missionsService.submitVote(mission).subscribe((value) => {
					if (mission && this.discordUser) {
						mission.votes?.push(this.discordUser.id);
						this.userVotesCount += 1;
						this.loadingVote = false;
					}
				});
			} else {
				this.missionsService.retractVote(mission).subscribe((value) => {
					if (mission && mission.votes && this.discordUser) {
						this.loadingVote = false;
						const index = mission.votes.indexOf(
							this.discordUser.id,
							0
						);
						if (index > -1) {
							mission.votes.splice(index, 1);
							this.userVotesCount -= 1;
						}
					}
				});
			}
		}
	}

	canResetVotes() {
		return this.discordUser?.role === 'Admin';
	}

	resetVotes() {
		this.missionsService.resetVotes().subscribe(
			(value) => {
				this.getVotedMissions();
			},
			(error) => {
				console.log(error);
			}
		);
	}

	isVotingDisabled(mission: IMission) {
		if (!this.discordUser) {
			return true;
		}
		if (this.loadingVote) {
			return true;
		}
		if (this.missionHasMyVote(mission) && this.userVotesCount >= 4) {
			return false;
		}
		if (!this.missionHasMyVote(mission) && this.userVotesCount >= 4) {
			return true;
		}
	}

	private missionHasMyVote(mission: IMission) {
		if(this.discordUser){
			return mission.votes?.includes(this.discordUser.id);
		}
	}

	getVotingTooltip(mission: IMission) {
		if (this.discordUser) {
			if (mission.votes?.includes(this.discordUser.id)) {
				return 'Retract vote';
			} else {
				return 'Vote for this mission to be played on the next session';
			}
		}
		return '';
	}

	getVotingBtnText(mission: IMission) {
		if (this.discordUser) {
			if (mission.votes?.includes(this.discordUser.id)) {
				return 'Retract vote';
			} else {
				return 'Vote';
			}
		}
		return 'Vote';
	}
}
