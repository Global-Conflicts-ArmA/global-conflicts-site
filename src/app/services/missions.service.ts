import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IHistory, IMission, IReviewChecklistItem } from '../models/mission';
import { MissionConstants } from '../constants/missionConstants';
import { DomSanitizer } from '@angular/platform-browser';
import * as fileSaver from 'file-saver';
// @ts-ignore
import { ILeader } from '@app/models/leader';
import { DatePipe } from '@angular/common';
import { ITerrain } from '@app/models/terrain';
import { UserService } from '@app/services/user.service';

@Injectable({
	providedIn: 'root'
})
export class MissionsService {
	constructor(
		private httpClient: HttpClient,
		private mC: MissionConstants,
		private sanitizer: DomSanitizer,
		private userService: UserService,
		private datePipe: DatePipe
	) {
		if (this.terrainList.length === 0 && this.userService.loggedUser) {
			this.httpClient
				.get<ITerrain[]>('api/configs/terrains')
				.subscribe((value) => {
					this.terrainList = value;
				});
		}
	}

	public terrainList: ITerrain[] = [];

	public list(): Observable<IMission[]> {
		return this.httpClient.get<IMission[]>('/api/missions');
	}

	public findOne(id: string): Observable<any> {
		return this.httpClient.get('/api/missions/' + id);
	}

	public upload(formData: FormData): Observable<any> {
		return this.httpClient.post(`/api/missions`, formData);
	}

	public submitReport(formData: FormData, isUpdate) {
		if (isUpdate) {
			return this.httpClient.put(`/api/missions/report`, formData);
		} else {
			return this.httpClient.post(`/api/missions/report`, formData);
		}
	}

	public submitReview(formData: FormData, isUpdate) {
		if (isUpdate) {
			return this.httpClient.put(`/api/missions/review`, formData);
		} else {
			return this.httpClient.post(`/api/missions/review`, formData);
		}
	}

	public submitUpdate(formData: FormData) {
		return this.httpClient.post(`/api/missions/update`, formData);
	}

	public submitEdit(formData: FormData) {
		return this.httpClient.post(`/api/missions/edit`, formData);
	}

	public getTerrainData(terrainName: string | undefined) {
		return terrainName
			? this.terrainList.find((terrain) => {
					return (
						terrain.class.toLowerCase() ===
						terrainName.toLowerCase()
					);
			  })
			: undefined;
	}

	public getImage(mission: IMission | null) {
		if (mission?.image) {
			return this.sanitizer.bypassSecurityTrustResourceUrl(mission.image);
		} else {
			return `https://globalconflicts.net/content/terrain_pics/${mission?.terrain}.jpg`;
		}
	}

	public getDate(dateString: string) {
		const date = new Date(Date.parse(dateString));
		return date.toISOString().split('T')[0];
	}

	public getLastPlayedDate(mission: IMission) {
		if (mission.history) {
			return this.datePipe.transform(
				mission.history.reverse()[0].date,
				'MM/dd/yyyy'
			);
		} else {
			return '--';
		}
	}

	public getFileName(uniqueName: string | null): Observable<IMission> {
		return this.httpClient.get<IMission>(`/api/missions/${uniqueName}`, {
			headers: {
				'Cache-Control':
					'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
				Pragma: 'no-cache',
				Expires: '0'
			}
		});
	}

	public buildVersionStr(versionObj: {
		major: number;
		minor?: string;
	}): string {
		if (versionObj.major === -1) {
			return 'General';
		}
		let string = versionObj.major.toString();
		if (versionObj.minor) {
			string = string + versionObj.minor;
		}
		return string;
	}

	public downloadFile(filename: string) {
		console.log(filename);
		this.httpClient
			.get('/api/missions/download/' + filename, { responseType: 'blob' })
			.subscribe(
				(res) => {
					const blob: any = new Blob([res]);
					const url = window.URL.createObjectURL(blob);
					console.log(url);
					fileSaver.saveAs(blob, filename);
				},
				(err) => {
					console.log('err: ', err);
					alert('Could not find mission in archive');
				}
			);
	}

	public removeReviewEntry(uniqueName: string, reviewID: string) {
		return this.httpClient.delete(
			`/api/missions/review/${uniqueName}/${reviewID}`
		);
	}

	public removeReportEntry(uniqueName: string, reportID: string) {
		return this.httpClient.delete(
			`/api/missions/report/${uniqueName}/${reportID}`
		);
	}

	public missionAction(
		action: string,
		uniqueName: string,
		updateId: string,
		filename: string
	) {
		return this.httpClient.post(
			`/api/missions/${uniqueName}/action/${action}`,
			{
				action,
				uniqueName,
				updateId,
				filename
			}
		);
	}

	public submitAuditReview(
		uniqueName: string,
		updateId: string,
		filename: string,
		reviewChecklist: [],
		reviewerNotes: string,
		reviewState: string
	) {
		return this.httpClient.post(`/api/audit_review/submit_audit_review`, {
			uniqueName,
			updateId,
			filename,
			reviewChecklist,
			reviewerNotes,
			reviewState
		});
	}

	public submitGameplayHistory(mission: IMission, history: IHistory) {
		return this.httpClient.post(
			`/api/missions/${mission.uniqueName}/history`,
			history
		);
	}

	public submitAar(
		mission: IMission,
		historyID: string,
		aar: string,
		leader: ILeader
	) {
		return this.httpClient.post(
			`/api/missions/${mission.uniqueName}/history/aar`,
			{ historyID, aar, leader }
		);
	}

	public submitVote(mission: IMission) {
		return this.httpClient.put(
			`/api/missions/${mission.uniqueName}/votes`,
			null
		);
	}

	public getUserVotes() {
		return this.httpClient.get('/api/missions/votes/vote_count', {
			headers: {
				'Cache-Control':
					'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
				Pragma: 'no-cache',
				Expires: '0'
			}
		});
	}

	public retractVote(mission: IMission) {
		return this.httpClient.delete(
			`/api/missions/${mission.uniqueName}/votes/`
		);
	}

	public getVotedMissions(): Observable<IMission[]> {
		return this.httpClient.get<IMission[]>(
			`/api/missions/votes/voted_missions`,
			{
				headers: {
					'Cache-Control':
						'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
					Pragma: 'no-cache',
					Expires: '0'
				}
			}
		);
	}

	public resetVotes() {
		return this.httpClient.get(`/api/missions/votes/reset_votes`);
	}

	public resetMyVotes() {
		return this.httpClient.get(`/api/missions/votes/reset_my_votes`);
	}

	public getQuestionnaire() {
		return this.httpClient.get<IReviewChecklistItem[]>(
			`/api/audit_review/questionnaire`
		);
	}
}
