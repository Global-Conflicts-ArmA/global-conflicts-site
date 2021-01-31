import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IMission } from '../models/mission';

@Injectable({
	providedIn: 'root'
})
export class MissionsService {
	constructor(private httpClient: HttpClient) {}

	public list(): Observable<IMission[]> {
		return this.httpClient.get<IMission[]>('/api/missions');
	}

	public upload(formData: FormData): Observable<any> {
		return this.httpClient.post(`/api/missions`, formData);
	}

	public getMissionFileName(missionFileName: string): Observable<IMission> {
		return this.httpClient.get<IMission>(
			`/api/missions/${missionFileName}`
		);
	}
}
