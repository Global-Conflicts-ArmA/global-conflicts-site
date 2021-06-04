import {
	ChangeDetectorRef,
	Component,
	HostListener,
	OnInit,
	ViewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MissionsService } from '@app/services/missions.service';
import { MatDialog } from '@angular/material/dialog';
import { DatabaseUser } from '@app/models/databaseUser';
import { UserService } from '@app/services/user.service';
import {
	IHistory,
	IMission,
	IReport,
	IReview,
	IUpdate
} from '@app/models/mission';
import { DialogViewUpdateComponent } from './dialog-view-update.component';
import { DialogViewBugReportComponent } from './dialog-view-bug-report.component';
import { DialogSubmitBugReportComponent } from './dialog-submit-bug-report.component';
import { DialogSubmitReviewComponent } from './dialog-submit-review.component';
import { DialogSubmitUpdateComponent } from './dialog-submit-update.component';
import { Overlay } from '@angular/cdk/overlay';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import {
	DialogActionsComponent,
	MissionActions
} from '@app/components/mission-details/dialog-actions/dialog-actions.component';
import { MissionUploadComponent } from '@app/components/mission-upload/mission-upload.component';
import { DialogAddGameplayHistoryComponent } from '@app/components/mission-details/dialog-add-gameplay-history/dialog-add-gameplay-history.component';
import { ILeader } from '@app/models/leader';
import { DialogAddAarComponent } from '@app/components/mission-details/dialog-add-aar/dialog-add-aar.component';
import { MatAccordion } from '@angular/material/expansion';
import { DialogViewGmNotesComponent } from '@app/components/mission-details/dialog-view-gm-notes/dialog-view-gm-notes.component';

@Component({
	selector: 'app-mission-details',
	templateUrl: './mission-details.component.html',
	styleUrls: ['./mission-details.component.scss']
})
export class MissionDetailsComponent implements OnInit {
	constructor(
		private userService: UserService,
		public missionsService: MissionsService,
		private route: ActivatedRoute,
		public dialog: MatDialog,
		public overlay: Overlay,
		private router: Router,
		private changeDetectorRef: ChangeDetectorRef
	) {}

	discordUser: DatabaseUser | null;
	mission: IMission | null;
	dataSourceUpdates: MatTableDataSource<IUpdate>;
	updateColumns = ['date', 'versionStr', 'authorName', 'status', 'buttons'];
	uniqueName: string | null;
	doneLoading = false;
	loadingVote = false;

	userVotesCount = 0;

	public innerWidth;
	@ViewChild(MatSort) sort: MatSort;

	@HostListener('window:resize', ['$event'])
	onResize(event) {
		this.innerWidth = window.innerWidth;
	}


	ngOnInit(): void {
		this.discordUser = this.userService.getUserLocally();
		this.uniqueName = this.route.snapshot.paramMap.get('id');
		this.refresh();
		this.missionsService.getUserVotes().subscribe(value => {
			if(value['votes']){
				this.userVotesCount = value['votes'].length;
			}

		})
	}

	refresh() {
		this.missionsService.getFileName(this.uniqueName).subscribe(
			async (mission) => {
				mission.authorName = await this.userService.getDiscordUsername(
					mission.authorID
				);
				mission.updates.map(async (update: IUpdate) => {
					update.authorName = await this.userService.getDiscordUsername(
						update.authorID
					);
					update.versionStr = this.missionsService.buildVersionStr(
						update.version
					);
				});
				mission.reports?.map(async (report: IReport) => {
					report.authorName = await this.userService.getDiscordUsername(
						report.authorID
					);
					report.versionStr = this.missionsService.buildVersionStr(
						report.version
					);
				});
				mission.reviews?.map(async (review: IReview) => {
					review.authorName = await this.userService.getDiscordUsername(
						review.authorID
					);
					review.versionStr = this.missionsService.buildVersionStr(
						review.version
					);
				});
				this.mission = mission;
				this.dataSourceUpdates = new MatTableDataSource<IUpdate>(
					mission.updates
				);

				mission.history?.map(async (history: IHistory) => {
					history.leaders?.map(async (leader) => {
						if (leader.discordID) {
							leader.displayName = await this.userService.getDiscordUsername(
								leader.discordID
							);
						}
					});
				});

				this.doneLoading = true;
			},
			(error) => {
				console.log('error');
			}
		);
	}

	public viewUpdate(
		update: IUpdate,
		mission: IMission | null = this.mission
	) {
		console.log('changeLog: ', update.changeLog);
		const dialogRef = this.dialog.open(DialogViewUpdateComponent, {
			data: { mission, update },
			minWidth: '20rem'
		});
	}

	public updateMission(mission: IMission | null = this.mission) {
		const dialogRef = this.dialog.open(DialogSubmitUpdateComponent, {
			data: mission,
			minWidth: '600px'
		});
		dialogRef.afterClosed().subscribe(() => {
			this.refresh();
		});
	}

	public editMission(mission: IMission | null = this.mission) {
		const dialogRef = this.dialog.open(MissionUploadComponent, {
			data: mission,
			minWidth: '20rem'
		});
		dialogRef.afterClosed().subscribe((value) => {
			if (value) {
				this.refresh();
			}
		});
	}

	public submitBugReport(report?: IReport) {
		const dialogRef = this.dialog.open(DialogSubmitBugReportComponent, {
			data: { mission: this.mission, report },
			scrollStrategy: this.overlay.scrollStrategies.noop(),
			minHeight: '20rem',
			autoFocus: false,
			minWidth: '30rem'
		});
		dialogRef.afterClosed().subscribe((action) => {
			if (action === 'delete_report') {
				this.removeReportEntry(report);
			}
			this.refresh();
		});
	}

	public viewBugReport(
		report: IReport,
		mission: IMission | null = this.mission
	) {
		console.log('report: ', report.report);
		const dialogRef = this.dialog.open(DialogViewBugReportComponent, {
			data: { mission, report },
			minWidth: '20rem'
		});
	}

	public submitReview(review?: IReview) {
		// if has review, it's an update of a review
		const dialogRef = this.dialog.open(DialogSubmitReviewComponent, {
			data: { mission: this.mission, review },
			scrollStrategy: this.overlay.scrollStrategies.noop(),
			minHeight: '20rem',
			autoFocus: false,
			minWidth: '30rem'
		});
		dialogRef.afterClosed().subscribe((action) => {
			if (action === 'delete_review') {
				this.removeReviewEntry(review);
			}
			this.refresh();
		});
	}

	removeReviewEntry(element) {
		if (this.mission) {
			this.missionsService
				.removeReviewEntry(this.mission.uniqueName, element._id)
				.subscribe((value) => {
					// @ts-ignore
					this.refresh();
				});
		}
	}

	removeReportEntry(element) {
		if (this.mission) {
			this.missionsService
				.removeReportEntry(this.mission.uniqueName, element._id)
				.subscribe((value) => {
					// @ts-ignore
					this.refresh();
				});
		}
	}

	hasActions() {
		return (
			this.discordUser?.role === 'Admin' ||
			this.mission?.authorID === this.discordUser?.id
		);
	}

	openActions(update: IUpdate) {
		const dialogRef = this.dialog.open(DialogActionsComponent, {
			width: '600px',
			data: {
				discordUser: this.discordUser,
				mission: this.mission,
				update
			},
			autoFocus: false
		});
		dialogRef.afterClosed().subscribe((result) => {
			if (result === MissionActions.REMOVE_ARCHIVE) {
				this.router.navigate([`mission-list`]);
			}
		});
	}

	canUpdateMission() {
		return (
			this.discordUser?.role === 'Admin' ||
			this.mission?.authorID === this.discordUser?.id
		);
	}

	canEditRe(re: IReport | IReview) {
		return (
			this.discordUser?.role === 'Admin' ||
			re?.authorID === this.discordUser?.id
		);
	}

	canAddGameplayHistory() {
		return this.discordUser?.role === 'Admin';
	}

	canEditHistory() {
		return this.discordUser?.role === 'Admin';
	}

	addGAmeplayHistory() {
		const dialogRef = this.dialog.open(DialogAddGameplayHistoryComponent, {
			data: { mission: this.mission },
			scrollStrategy: this.overlay.scrollStrategies.noop(),
			minHeight: '20rem',
			autoFocus: false,
			minWidth: '70rem'
		});
		dialogRef.afterClosed().subscribe((history) => {
			if (history && this.mission) {
				this.missionsService
					.submitGameplayHistory(this.mission, history)
					.subscribe(
						(value) => {
							this.refresh();
						},
						(error) => {
							console.log(error);
						}
					);
			}
		});
	}

	editHistory(oldHistory: IHistory) {
		const dialogRef = this.dialog.open(DialogAddGameplayHistoryComponent, {
			data: { mission: this.mission, oldHistory },
			scrollStrategy: this.overlay.scrollStrategies.noop(),
			minHeight: '20rem',
			autoFocus: false,
			minWidth: '70rem'
		});
		dialogRef.afterClosed().subscribe((editedHistory) => {
			if (editedHistory && this.mission) {
				this.missionsService
					.submitGameplayHistory(this.mission, editedHistory)
					.subscribe(
						(value) => {
							this.refresh();
						},
						(error) => {
							console.log(error);
						}
					);
			}
		});
	}

	submitAAR(history: IHistory, leader: ILeader, oldAar: string | undefined) {
		this.changeDetectorRef.detach();

		const dialogRef = this.dialog.open(DialogAddAarComponent, {
			data: { mission: this.mission, history, leader, oldAar },
			scrollStrategy: this.overlay.scrollStrategies.noop(),
			minHeight: '20rem',
			autoFocus: false,
			minWidth: '60rem'
		});
		dialogRef.afterClosed().subscribe((aar: string) => {
			this.changeDetectorRef.reattach();
			if (aar && aar.length > 0 && this.mission) {
				console.log(aar);
				if (history._id) {
					this.missionsService
						.submitAar(this.mission, history._id, aar, leader)
						.subscribe((value) => {
							leader.aar = aar;
							document.getElementById(leader._id ?? '')?.click();
						});
				}
			}
		});
	}

	getSide(leader: ILeader): string {
		if (leader.side) {
			return '' + leader.side;
		} else {
			return 'no-side';
		}
	}

	viewGmNote(gmNote: string) {
		this.dialog.open(DialogViewGmNotesComponent, {
			data: gmNote,

			autoFocus: false,
			minWidth: '60rem'
		});
	}

	vote() {
		if (this.mission && this.discordUser) {
			this.loadingVote = true;
			if (
				!this.mission.votes ||
				!this.mission.votes?.includes(this.discordUser.id) ||
				this.userVotesCount >= 4
			) {
				this.missionsService
					.submitVote(this.mission)
					.subscribe((value) => {
						if (this.mission && this.discordUser) {
							if(!this.mission.votes){
								this.mission.votes = []
							}
							this.mission.votes?.push(this.discordUser.id);
							this.userVotesCount += 1;
							this.loadingVote = false;
						}
					});
			} else {
				this.missionsService
					.retractVote(this.mission)
					.subscribe((value) => {
						if (
							this.mission &&
							this.mission.votes &&
							this.discordUser
						) {
							this.loadingVote = false;
							const index = this.mission.votes.indexOf(
								this.discordUser.id,
								0
							);
							if (index > -1) {
								this.mission.votes.splice(index, 1);
								this.userVotesCount -= 1;
							}
						}
					});
			}
		}
	}


}
