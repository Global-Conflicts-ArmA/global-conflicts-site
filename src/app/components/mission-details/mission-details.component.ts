import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MissionsService } from '@app/services/missions.service';
import { MatDialog } from '@angular/material/dialog';
import { DatabaseUser } from '@app/models/databaseUser';
import { UserService } from '@app/services/user.service';
import { IMission, IReport, IReview, IUpdate } from '@app/models/mission';
import { DialogViewUpdateComponent } from './dialog-view-update.component';
import { DialogViewBugReportComponent } from './dialog-view-bug-report.component';
import { DialogSubmitBugReportComponent } from './dialog-submit-bug-report.component';
import { DialogSubmitReviewComponent } from './dialog-submit-review.component';
import { DialogViewReviewComponent } from './dialog-view-review.component';
import { DialogSubmitUpdateComponent } from './dialog-submit-update.component';
import { Overlay } from '@angular/cdk/overlay';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import {
	DialogActionsComponent,
	MissionActions
} from '@app/components/mission-details/dialog-actions/dialog-actions.component';
import { MissionUploadComponent } from '@app/components/mission-upload/mission-upload.component';

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
		private router: Router
	) {}

	discordUser: DatabaseUser | null;
	mission: IMission | null;
	dataSourceUpdates: MatTableDataSource<IUpdate>;
	updateColumns = ['date', 'versionStr', 'authorName', 'status', 'buttons'];
	dataSourceReports: MatTableDataSource<IReport>;
	reportColumns = ['date', 'versionStr', 'authorName', 'buttons'];
	dataSourceReviews: MatTableDataSource<IReview>;
	reviewColumns = ['date', 'versionStr', 'authorName', 'buttons'];
	uniqueName: string | null;
	doneLoading = false;

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
	}

	refresh() {
		this.missionsService
			.getFileName(this.uniqueName)
			.subscribe(async (mission) => {
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
				this.dataSourceReports = new MatTableDataSource<IReport>(
					mission.reports
				);
				this.dataSourceReviews = new MatTableDataSource<IReview>(
					mission.reviews
				);

				this.doneLoading = true;
			}, error => {
			console.log("error")
		});
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

	// TODO: make edit mission details dialog
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
			data: {mission:this.mission, report},
			scrollStrategy: this.overlay.scrollStrategies.noop(),
			minHeight: '20rem',
			autoFocus: false,
			minWidth: '30rem'
		});
		dialogRef.afterClosed().subscribe((action) => {
			if(action==="delete_report"){
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

	public submitReview(review?:IReview) {
		// if has review, it's an update of a review
		const dialogRef = this.dialog.open(DialogSubmitReviewComponent, {
			data: {mission:this.mission, review},
			scrollStrategy: this.overlay.scrollStrategies.noop(),
			minHeight: '20rem',
			autoFocus: false,
			minWidth: '30rem'
		});
		dialogRef.afterClosed().subscribe((action) => {
			if(action==="delete_review"){
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
				this.router.navigate([
					`mission-list`
				]);

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
}
