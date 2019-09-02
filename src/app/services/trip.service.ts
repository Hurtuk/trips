import { Injectable } from '@angular/core';
import { Country } from '../model/country';
import { Observable, of } from 'rxjs';
import { City } from '../model/city';
import { HttpClient } from '@angular/common/http';
import { UrlBuilderService } from './url-builder.service';

@Injectable({
  providedIn: 'root'
})
export class TripService {

  private countries = [
    {codeAlpha2: 'CA', codeAlpha3: 'CAN', name: 'Canada', count: 1},
    {codeAlpha2: 'FR', codeAlpha3: 'FRA', name: 'France', count: 3},
    {codeAlpha2: 'US', codeAlpha3: 'USA', name: 'Etats-Unis', count: 1},
    {codeAlpha2: 'GB', codeAlpha3: 'GBR', name: 'Grande-Bretagne', count: 1},
    {codeAlpha2: 'RU', codeAlpha3: 'RUS', name: 'Russie', count: 0},
  ];

  private cities = [{
    id: 1,
    latitude: 48.856614,
    longitude: 2.352222,
    name: "Paris",
    country: this.countries[1]
  }, {
    id: 2,
    latitude: 40.712775,
    longitude: -74.005973,
    name: "New York",
    country: this.countries[2]
  }, {
    id: 3,
    latitude: 49.282729,
    longitude: -123.120738,
    name: "Vancouver",
    country: this.countries[0]
  }];

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
    return of(this.countries.find(c => c.codeAlpha2 === code));
  }
}
