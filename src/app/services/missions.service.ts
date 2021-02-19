import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IMission, IReport } from '../models/mission';
import { MissionConstants, ITerrain } from '../constants/missionConstants';
import { DomSanitizer } from '@angular/platform-browser';
import { DiscordUser } from '@app/models/discorduser';
import * as fileSaver from 'file-saver';

@Injectable({
	providedIn: 'root'
})
export class MissionsService {
	constructor(
		private httpClient: HttpClient,
		private mC: MissionConstants,
		private sanitizer: DomSanitizer
	) {}

	public list(): Observable<IMission[]> {
		return this.httpClient.get<IMission[]>('/api/missions');
	}

	public findOne(id: string): Observable<any> {
		return this.httpClient.get('/api/missions/' + id);
	}

	public upload(formData: FormData): Observable<any> {
		return this.httpClient.post(`/api/missions`, formData);
	}

	public submitReport(formData: FormData) {
		return this.httpClient.post(`/api/missions/report`, formData);
	}

	public submitReview(formData: FormData) {
		return this.httpClient.post(`/api/missions/review`, formData);
	}

	public submitUpdate(formData: FormData) {
		return this.httpClient.post(`/api/missions/update`, formData);
	}

	public submitEdit(formData: FormData) {
		return this.httpClient.post(`/api/missions/edit`, formData);
	}

	public getTerrainData(terrainName: string | undefined) {
		return terrainName ? this.mC.MissionTerrains[terrainName] : undefined;
	}

	public getImage(mission: IMission | null) {
		if (mission?.image) {
			return this.sanitizer.bypassSecurityTrustResourceUrl(mission.image);
		} else {
			const terrain = this.getTerrainData(mission?.terrain);
			return terrain?.defaultImage ?? '../../../assets/imgs/noImage.png';
		}
	}

	public getDate(dateString: string) {
		const date = new Date(Date.parse(dateString));
		return date.toISOString().split('T')[0];
	}

	public getFileName(uniqueName: string | null): Observable<IMission> {
		return this.httpClient.get<IMission>(`/api/missions/${uniqueName}`);
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
}
