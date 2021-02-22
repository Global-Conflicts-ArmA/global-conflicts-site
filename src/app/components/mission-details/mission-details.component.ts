import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MissionsService } from '@app/services/missions.service';
import { MatDialog } from '@angular/material/dialog';
import { DiscordUser } from '@app/models/discorduser';
import { UserService } from '@app/services/user.service';
import { IMission, IReport, IReview, IUpdate } from '@app/models/mission';
import { SharedService } from '@app/services/shared';
import { DialogViewUpdateComponent } from './dialog-view-update.component';
import { DialogViewBugReportComponent } from './dialog-view-bug-report.component';
import { DialogSubmitBugReportComponent } from './dialog-submit-bug-report.component';
import { DialogSubmitReviewComponent } from './dialog-submit-review.component';
import { DialogViewReviewComponent } from './dialog-view-review.component';
import { DialogSubmitUpdateComponent } from './dialog-submit-update.component';
import { Overlay } from '@angular/cdk/overlay';
import { MatTableDataSource } from '@angular/material/table';
import { DialogEditDetailsComponent } from './dialog-edit-details.component';
import { MatSort } from '@angular/material/sort';

@Component({
	selector: 'app-mission-details',
	templateUrl: './mission-details.component.html',
	styleUrls: ['./mission-details.component.scss']
})
export class MissionDetailsComponent implements OnInit {
	@ViewChild('updatesSort') updatesSort: MatSort;
	@ViewChild('reportsSort') reportsSort: MatSort;
	@ViewChild('reviewsSort') reviewsSort: MatSort;

	constructor(
		private userService: UserService,
		public missionsService: MissionsService,
		private route: ActivatedRoute,
		public dialog: MatDialog,
		public overlay: Overlay
	) {}

	discordUser: DiscordUser | null;
	mission: IMission | null;
	dataSourceUpdates: MatTableDataSource<IUpdate>;
	updateColumns = ['date', 'versionStr', 'authorName', 'status', 'buttons'];
	dataSourceReports: MatTableDataSource<IReport>;
	reportColumns = ['date', 'versionStr', 'authorName', 'buttons'];
	dataSourceReviews: MatTableDataSource<IReview>;
	reviewColumns = ['date', 'versionStr', 'authorName', 'buttons'];
	uniqueName: string | null;
	doneLoading = false;

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
				this.dataSourceUpdates.sortingDataAccessor = (
					item,
					property
				) => {
					switch (property) {
						default:
							return item[property];
					}
				};
				this.dataSourceUpdates.sort = this.updatesSort;
				this.dataSourceReports = new MatTableDataSource<IReport>(
					mission.reports
				);
				this.dataSourceReports.sortingDataAccessor = (
					item,
					property
				) => {
					switch (property) {
						default:
							return item[property];
					}
				};
				this.dataSourceReports.sort = this.reportsSort;
				this.dataSourceReviews = new MatTableDataSource<IReview>(
					mission.reviews
				);
				this.dataSourceReviews.sortingDataAccessor = (
					item,
					property
				) => {
					switch (property) {
						default:
							return item[property];
					}
				};
				this.dataSourceReviews.sort = this.reviewsSort;
				this.doneLoading = true;
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
			minWidth: '20rem'
		});
		dialogRef.afterClosed().subscribe(() => {
			this.refresh();
		});
	}

	// TODO: make edit mission details dialog
	public editMission(mission: IMission | null = this.mission) {
		const dialogRef = this.dialog.open(DialogEditDetailsComponent, {
			data: mission,
			minWidth: '20rem'
		});
		dialogRef.afterClosed().subscribe(() => {
			this.refresh();
		});
	}

	public submitBugReport(mission: IMission | null = this.mission) {
		const dialogRef = this.dialog.open(DialogSubmitBugReportComponent, {
			data: mission,
			scrollStrategy: this.overlay.scrollStrategies.noop(),
			minHeight: '20rem',
			minWidth: '30rem'
		});
		dialogRef.afterClosed().subscribe(() => {
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

	public submitReview(mission: IMission | null = this.mission) {
		const dialogRef = this.dialog.open(DialogSubmitReviewComponent, {
			data: mission,
			scrollStrategy: this.overlay.scrollStrategies.noop(),
			minHeight: '20rem',
			minWidth: '30rem'
		});
		dialogRef.afterClosed().subscribe(() => {
			this.refresh();
		});
	}

	public viewReview(
		review: IReview,
		mission: IMission | null = this.mission
	) {
		console.log('changeLog: ', review.review);
		const dialogRef = this.dialog.open(DialogViewReviewComponent, {
			data: { mission, review },
			minWidth: '20rem'
		});
	}
}
