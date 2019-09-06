import { Injectable } from '@angular/core';
import { Country } from '../model/country';
import { Observable, of } from 'rxjs';
import { City } from '../model/city';
import { HttpClient } from '@angular/common/http';
import { UrlBuilderService } from './url-builder.service';
import { SimpleTrip } from '../model/simple-trip';
import { Trip } from '../model/trip';
import { Visit } from '../model/visit';

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

  public getCityById(id: number): Observable<City> {
    return this.http.get<City>(this.urlBuilder.buildUrl('getCityById', id));
  }

  public getSimpleTrips(type: string, id: string): Observable<SimpleTrip[]> {
    return this.http.get<SimpleTrip[]>(this.urlBuilder.buildUrl('getSimpleTrips', type, id));
  }

  public getCityPhoto(cityId: number): Observable<string> {
    return this.http.get<string>(this.urlBuilder.buildUrl('getCityPhoto', cityId));
  }

  public getTripById(id: number): Observable<Trip> {
    return this.http.get<Trip>(this.urlBuilder.buildUrl('getTripById', id));
  }

  public getCitiesCountriesByTrip(trip: Trip): {startFrom: City, visits: Visit[]} {
    const results: {startFrom: City, visits: Visit[]} = {startFrom: null, visits: []};
    
    if (trip.visits[0].endDate < trip.visits[trip.visits.length - 1].endDate) {
      results.startFrom = trip.visits[0].city;
      for (let i = 1; i < trip.visits.length; i++) {
        if (trip.visits[i].cityFrom) {
          results.visits.push(trip.visits[i]);
        }
      }
    } else {
      results.startFrom = trip.visits[0].cityFrom;
      results.visits.push(trip.visits[0]);
    }

    return results;
  }
}
