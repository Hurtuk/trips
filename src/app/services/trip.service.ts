import { Injectable } from '@angular/core';
import { Country } from '../model/country';
import { Observable, of } from 'rxjs';
import { City } from '../model/city';
import { HttpClient } from '@angular/common/http';
import { UrlBuilderService } from './url-builder.service';
import { SimpleTrip } from '../model/simple-trip';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TripService {

  constructor(
    private http: HttpClient,
    private urlBuilder: UrlBuilderService
  ) { }

  public getVisitedCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(this.urlBuilder.buildUrl('getVisitedCountries'));
  }

  public getVisitedCities(): Observable<City[]> {
    return this.http.get<City[]>(this.urlBuilder.buildUrl('getVisitedCities'));
  }

  public getCountryByCode(code: string): Observable<Country> {
    return this.http.get<Country>(this.urlBuilder.buildUrl('getCountryByCode', code));
  }

  public getSimpleTrips(type: string, id: string): Observable<SimpleTrip[]> {
    return this.http.get<SimpleTrip[]>(this.urlBuilder.buildUrl('getSimpleTrips', type, id));
  }
}
