import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Mission} from '../models/mission';


@Injectable({
	providedIn: 'root'
})
export class MissionsService {

	constructor(private httpClient: HttpClient) {
	}

	public list(): Observable<Mission[]> {
		return this.httpClient.get<Mission[]>('/api/missions');
	}

	public upload(formData: FormData): Observable<any> {
		return this.httpClient.post(`/api/missions`, formData);
	}
}
