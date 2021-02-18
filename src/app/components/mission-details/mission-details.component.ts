import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MissionsService } from '../../services/missions.service';
import { MatDialog } from '@angular/material/dialog';

import { DiscordUser } from '../../models/discorduser';
import { UserService } from '../../services/user.service';
import { IMission, IReport, IUpdate, IReview } from '../../models/mission';
import { SharedService } from '@app/services/shared';
import { DialogViewUpdateComponent } from './dialog-view-update.component';
import { DialogViewBugReportComponent } from './dialog-view-bug-report.component';
import { DialogSubmitBugReportComponent } from './dialog-submit-bug-report.component';
import { DialogSubmitReviewComponent } from './dialog-submit-review.component';
import { DialogViewReviewComponent } from './dialog-view-review.component';
import { DialogSubmitUpdateComponent } from './dialog-submit-update.component';
import {
	BlockScrollStrategy,
	Overlay,
	ScrollStrategy,
	ScrollStrategyOptions
} from '@angular/cdk/overlay';
import { MatTable } from '@angular/material/table';
import { DialogEditDetailsComponent } from './dialog-edit-details.component';

@Component({
	selector: 'app-mission-details',
	templateUrl: './mission-details.component.html',
	styleUrls: ['./mission-details.component.scss']
})
export class MissionDetailsComponent implements OnInit {
	@ViewChild('updatesTable') updatesTable: MatTable<IUpdate>;
	@ViewChild('bugReportsTable') bugReportsTable: MatTable<IReport>;
	@ViewChild('reviewsTable') reviewsTable: MatTable<IReview>;

	constructor(
		private userService: UserService,
		public missionsService: MissionsService,
		private sharedService: SharedService,
		private route: ActivatedRoute,
		public dialog: MatDialog,
		public overlay: Overlay
	) {}
	discordUser: DiscordUser | null;
	mission: IMission | null;
	reports: IReport[];
	updates: IUpdate[];
	reviews: IReview[];
	updateColumns = ['date', 'versionStr', 'authorName', 'status', 'buttons'];
	reportColumns = ['date', 'versionStr', 'authorName', 'buttons'];
	reviewColumns = ['date', 'versionStr', 'authorName', 'buttons'];
	uniqueName: string | null;

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
				mission.reports = mission.reports ?? [];
				mission.reports.map(async (report: IReport) => {
					report.authorName = await this.userService.getDiscordUsername(
						report.authorID
					);
					report.versionStr = this.missionsService.buildVersionStr(
						report.version
					);
				});
				mission.reviews = mission.reviews ?? [];
				mission.reviews.map(async (review: IReview) => {
					review.authorName = await this.userService.getDiscordUsername(
						review.authorID
					);
					review.versionStr = this.missionsService.buildVersionStr(
						review.version
					);
				});
				this.mission = mission;
				this.reports = mission.reports;
				this.reviews = mission.reviews;
				this.updates = mission.updates;
				console.log('mission: ', mission);
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
	}

	// TODO: make edit mission details dialog
	public editMission(mission: IMission | null = this.mission) {
		const dialogRef = this.dialog.open(DialogEditDetailsComponent, {
			data: mission,
			minWidth: '20rem'
		});
	}

	public submitBugReport(
		mission: IMission | null = this.mission,
		table = this.bugReportsTable
	) {
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

	public submitReview(
		mission: IMission | null = this.mission,
		table = this.reviewsTable
	) {
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
