import { Component, OnInit } from '@angular/core';
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

	votedMissions: IMission[] = [];
	userVotesCount = 4;
	loadingVote: boolean;

	constructor(
		public userService: UserService,
		public missionsService: MissionsService
	) {}

	getVotedMissions() {
		if (this.userService.loggedUser) {
			this.missionsService.getVotedMissions().subscribe(
				(missions) => {
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
				},
				(error) => {}
			);
		}
	}

	ngOnInit(): void {
		this.getVotedMissions();
	}

	vote(mission: IMission) {
		if (mission && this.userService.loggedUser) {
			this.loadingVote = true;
			if (
				!mission.votes ||
				!mission.votes?.includes(this.userService.loggedUser.userID)
			) {
				this.missionsService.submitVote(mission).subscribe((value) => {
					if (mission && this.userService.loggedUser) {
						mission.votes?.push(this.userService.loggedUser.userID);
						this.userVotesCount += 1;
						this.loadingVote = false;
					}
				});
			} else {
				this.missionsService.retractVote(mission).subscribe((value) => {
					if (
						mission &&
						mission.votes &&
						this.userService.loggedUser
					) {
						this.loadingVote = false;
						const index = mission.votes.indexOf(
							this.userService.loggedUser.userID,
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
		return this.userService.loggedUser?.isAdmin();
	}

	resetVotes() {
		if (confirm('Are you sure you want to reset ALL votes?')) {
			this.missionsService.resetVotes().subscribe(
				(value) => {
					this.getVotedMissions();
				},
				(error) => {
					console.log(error);
				}
			);
		}
	}

	resetMyVotes() {
		if (confirm('Are you sure you want to reset your votes?')) {
			this.missionsService.resetMyVotes().subscribe(
				(value) => {
					this.getVotedMissions();
				},
				(error) => {
					console.log(error);
				}
			);
		}
	}

	isVotingDisabled(mission: IMission) {
		if (!this.userService.loggedUser) {
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
		if (this.userService.loggedUser) {
			return mission.votes?.includes(this.userService.loggedUser.userID);
		}
	}

	getVotingTooltip(mission: IMission) {
		if (this.userService.loggedUser) {
			if (mission.votes?.includes(this.userService.loggedUser.userID)) {
				return 'Retract vote';
			} else {
				return 'Vote for this mission to be played on the next session';
			}
		}
		return '';
	}

	getVotingBtnText(mission: IMission) {
		if (this.userService.loggedUser) {
			if (mission.votes?.includes(this.userService.loggedUser.userID)) {
				return 'Retract vote';
			} else {
				return 'Vote';
			}
		}
		return 'Vote';
	}
}
