import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IMission } from '../models/mission';
import { MissionConstants } from '../constants/missionConstants';
import { DomSanitizer } from '@angular/platform-browser';
import * as fileSaver from 'file-saver';
// @ts-ignore
import Terrains from '../../assets/terrains.json';

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
		return terrainName ? Terrains.find(terrain=>{
			return terrain.class.toLowerCase() === terrainName.toLowerCase()
		}) : undefined;
	}

	public getImage(mission: IMission | null) {
		if (mission?.image) {
			return this.sanitizer.bypassSecurityTrustResourceUrl(mission.image);
		} else {

			return '../../../assets/imgs/noImage.png';
		}
	}

	public getDate(dateString: string) {
		const date = new Date(Date.parse(dateString));
		return date.toISOString().split('T')[0];
	}

	public getFileName(uniqueName: string | null): Observable<IMission> {
		return this.httpClient.get<IMission>(`/api/missions/${uniqueName}`, {
			headers: {
				'Cache-Control': 'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
				'Pragma': 'no-cache',
				'Expires': '0'
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

	public removeReviewEntry(uniqueName:string, reviewID: string){
		return this.httpClient.delete(`/api/missions/review/${uniqueName}/${reviewID}`);
	}

	public removeReportEntry(uniqueName:string, reportID: string){
		return this.httpClient.delete(`/api/missions/report/${uniqueName}/${reportID}`);
	}

    public missionAction(action:string, uniqueName:string,  updateId: string, filename:string,) {
		return this.httpClient.post(`/api/missions/${uniqueName}/action`,{
			"action":action,
			"uniqueName":uniqueName,
			"updateId":updateId,
			"filename":filename
		});
    }
}
