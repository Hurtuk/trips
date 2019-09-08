import { Injectable, NgZone } from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import * as am4maps from "@amcharts/amcharts4/maps";
import * as am4lang_fr_FR from "@amcharts/amcharts4/lang/fr_FR";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import am4geodata_worldHigh from "@amcharts/amcharts4-geodata/worldHigh";
import am4geodata_caribbeanHigh from "@amcharts/amcharts4-geodata/region/world/caribbeanHigh";
import { Router } from '@angular/router';
import { TripService } from './trip.service';
import { City } from '../model/city';
import { BehaviorSubject } from 'rxjs';
import { SummaryModal } from '../modals/summary-modal';
import { Trip } from '../model/trip';
import { Visit } from '../model/visit';

am4core.useTheme(am4themes_animated);

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  private UNVISITED_COLOR = am4core.color("#d9d9d9");
  private VISITED_COLOR = am4core.color("#ffd06d");
  private FULL_VISITED_COLOR = am4core.color("#f29d00");
  private visitedCities: BehaviorSubject<City[]> = new BehaviorSubject([]);
  private tempChart = new Map<SummaryModal, am4maps.MapChart[]>();

  constructor(
    private zone: NgZone,
    private route: Router,
    private tripService: TripService
  ) { }

  public disposeTempChart(modal: SummaryModal) {
    if (this.tempChart.get(modal)) {
      this.tempChart.get(modal).map(chart => chart.dispose());
    }
  }

  /**
   * Creates the main chart of the world
   */
  public buildTheWorld(elementId: string) {
    this.zone.runOutsideAngular(() => {
      // Create the chart
      const map = am4core.create(elementId, am4maps.MapChart);
      this.createCountries(map);
      this.createCities(map);
    });
  }

  /**
   * Creates the country map for country-summary
   */
  public buildCountry(modal: SummaryModal, elementId: string, countryCode: string) {
    this.zone.runOutsideAngular(() => {
      // Create the chart
      const chart = am4core.create(elementId, am4maps.MapChart);
      if (!this.tempChart.get(modal)) {
        this.tempChart.set(modal, []);
      }
      this.tempChart.get(modal).push(chart);
      chart.language.locale = am4lang_fr_FR.default;
      // Colors
      chart.background.fillOpacity = 0;
      // Fill the data
      const polygonSeries = new am4maps.MapPolygonSeries();
      chart.projection = new am4maps.projections.Miller();
      chart.geodata = am4geodata_worldHigh;
      // Create the data
      switch (countryCode) {
        case "US":
          chart.deltaLongitude = 125;
          chart.homeZoomLevel = 3;
          break;
        case "RU":
          chart.deltaLongitude = -100;
          chart.homeZoomLevel = 2;
          break;
        case "NZ":
          chart.deltaLongitude = -170;
          chart.homeZoomLevel = 9;
          break;
        default:
          chart.geodata = am4geodata_worldHigh;
      }
      polygonSeries.include = [countryCode];
      polygonSeries.useGeodata = true;
      // Color
      const polygonTemplate = polygonSeries.mapPolygons.template;
      polygonTemplate.fill = am4core.color("#9F774A");
      polygonTemplate.stroke = am4core.color("#7c5b36");
      polygonTemplate.strokeWidth = 3;
      chart.series.push(polygonSeries);
      // Generate the cities
      const imageSeries = chart.series.push(new am4maps.MapImageSeries());
      const imageSeriesTemplate = imageSeries.mapImages.template;
      const circle = imageSeriesTemplate.createChild(am4core.Circle);
      circle.radius = 10;
      circle.fill = am4core.color("#B27799");
      circle.stroke = am4core.color("#FFFFFF");
      circle.strokeWidth = 2;
      circle.nonScaling = true;
      circle.tooltipText = "{name}";
      imageSeriesTemplate.propertyFields.latitude = "latitude";
      imageSeriesTemplate.propertyFields.longitude = "longitude";
      this.visitedCities.subscribe(cities => {
        imageSeries.data = cities.filter(c => c.country.codeAlpha2 === countryCode);
      });
    });
  }

  /**
   * Creates the countries for the world chart
   */
  private createCountries(map: am4maps.MapChart) {
    map.language.locale = am4lang_fr_FR.default;
    map.projection = new am4maps.projections.Miller();
    // Colors
    map.background.fill = am4core.color("#eff6fc");
    map.background.fillOpacity = 1;
    // Create the data and exclude Antarctica
    map.geodata = am4geodata_worldLow;
    const polygonSeries = new am4maps.MapPolygonSeries();
    polygonSeries.useGeodata = true;
    polygonSeries.exclude = ['AQ'];
    // Fill the data
    this.loadCountriesData(polygonSeries);
    // Set the style of visited countries
    const polygonTemplate = polygonSeries.mapPolygons.template;
    polygonTemplate.tooltipText = "{name}";
    polygonTemplate.propertyFields.fill = "fill";
    // Open modal on click
    polygonTemplate.events.on('hit', ev =>
      this.zone.run(() => {
        const count = ev.target.dataItem.dataContext['value'];
        const id = ev.target.dataItem.dataContext['id'];
        //if (count > 1) {
          this.route.navigate(['country/' + id]);
        //} else if (count === 1) {
          // TODO get the only trip id
          // this.route.navigate(['trip/' + ev.target.dataItem.dataContext['id']]);
        //}
      })
    );
    map.series.push(polygonSeries);
  }

  /**
   * Creates the cities for the world chart
   */
  private createCities(map: am4maps.MapChart) {
    const imageSeries = map.series.push(new am4maps.MapImageSeries());
    const imageSeriesTemplate = imageSeries.mapImages.template;
    const circle = imageSeriesTemplate.createChild(am4core.Circle);
    circle.radius = 10;
    circle.fill = am4core.color("#B27799");
    circle.stroke = am4core.color("#FFFFFF");
    circle.strokeWidth = 2;
    circle.nonScaling = true;
    circle.tooltipText = "{name}";
    imageSeriesTemplate.propertyFields.latitude = "latitude";
    imageSeriesTemplate.propertyFields.longitude = "longitude";
    imageSeriesTemplate.events.on('hit', ev =>
      this.zone.run(() => {
        const count = ev.target.dataItem.dataContext['value'];
        const id = ev.target.dataItem.dataContext['id'];
        //if (count > 1) {
          this.route.navigate(['city/' + id]);
        //} else if (count === 1) {
          // TODO get the only trip id
          // this.route.navigate(['trip/' + ev.target.dataItem.dataContext['id']]);
        //}
      })
    );
    this.loadCitiesData(imageSeries);
  }

  private average(numbers: number[]) {
    return numbers.reduce((prev, cur) => prev += cur, 0) / numbers.length;
  }

  /**
   * Creates the trip map
  */
  public createTrip(modal: SummaryModal, elementId: string, trip: Trip, cities: City[] = null) {
    this.zone.runOutsideAngular(() => {
      let stays: { startFrom: City, visits: Visit[]; };
      if (trip === null) {
        stays = { startFrom: cities[0], visits: [{ id: null, startDate: null, endDate: null, transport: null, city: cities[1], latitude: cities[1].latitude, longitude: cities[1].longitude }] };
      } else {
        stays = this.tripService.getCitiesCountriesByTrip(trip);
      }
      // Focus on one region or the way to
      const countriesNb = [...new Set([stays.startFrom.country.codeAlpha2, ...stays.visits.map(v => v.city.country.codeAlpha2)])].length;
      // Create the chart
      const chart = am4core.create(elementId, am4maps.MapChart);
      if (!this.tempChart.get(modal)) {
        this.tempChart.set(modal, []);
      }
      this.tempChart.get(modal).push(chart);
      chart.language.locale = am4lang_fr_FR.default;
      const polygonSeries = new am4maps.MapPolygonSeries();
      if (countriesNb > 1 && stays.startFrom.country.codeAlpha2 === "FR") {
        // Display trip from France to destination
        chart.projection = new am4maps.projections.Orthographic();
        chart.deltaLatitude = -this.average([stays.startFrom.latitude, ...stays.visits.map(v => v.latitude)]);
        chart.deltaLongitude = -this.average([stays.startFrom.longitude, ...stays.visits.map(v => v.longitude)]);
        chart.backgroundSeries.mapPolygons.template.polygon.fill = am4core.color("#d0e1e5");
        chart.backgroundSeries.mapPolygons.template.polygon.fillOpacity = 1;
      } else if (countriesNb > 1 || trip === null) {
        // Display zoomed world on visited countries
        chart.projection = new am4maps.projections.Miller();
        chart.homeZoomLevel = 5;
        chart.homeGeoPoint = {
          latitude: this.average([stays.startFrom.latitude, ...stays.visits.map(v => v.latitude)]),
          longitude: this.average([stays.startFrom.longitude, ...stays.visits.map(v => v.longitude)])
        };
      } else {
        // Display single country
        chart.projection = new am4maps.projections.Miller();
        polygonSeries.include = [stays.startFrom.country.codeAlpha2];
      }
      // Colors
      chart.background.fillOpacity = 0;
      // Create the data
      chart.geodata = am4geodata_worldHigh;
      polygonSeries.useGeodata = true;
      // Color
      const polygonTemplate = polygonSeries.mapPolygons.template;
      polygonTemplate.fill = am4core.color("#9F774A");
      polygonTemplate.stroke = am4core.color("#7c5b36");
      polygonTemplate.strokeWidth = 1;
      chart.series.push(polygonSeries);
      // Lines
      const lineSeries = chart.series.push(new am4maps.MapLineSeries());
      lineSeries.data = [{
        "multiGeoLine": [
          [
            { latitude: stays.startFrom.latitude, longitude: stays.startFrom.longitude },
            ...stays.visits.map(v => ({ latitude: v.latitude, longitude: v.longitude }))
          ]
        ]
      }];
      lineSeries.mapLines.template.line.stroke = am4core.color("#000000");
      lineSeries.mapLines.template.line.strokeOpacity = 0.5;
      lineSeries.mapLines.template.line.strokeWidth = 1;
      lineSeries.mapLines.template.line.strokeDasharray = "2,2";
      // Generate the cities
      const imageSeries = chart.series.push(new am4maps.MapImageSeries());
      const imageSeriesTemplate = imageSeries.mapImages.template;
      const circle = imageSeriesTemplate.createChild(am4core.Circle);
      circle.radius = 10;
      circle.fill = am4core.color("#B27799");
      circle.stroke = am4core.color("#FFFFFF");
      circle.strokeWidth = 2;
      circle.nonScaling = true;
      circle.tooltipText = "{name}";
      imageSeriesTemplate.propertyFields.latitude = "latitude";
      imageSeriesTemplate.propertyFields.longitude = "longitude";
      imageSeries.data = [stays.startFrom, ...stays.visits.map(v => ({ name: v.city.name, latitude: v.latitude, longitude: v.longitude }))];
    });

    return false;
  }

  private calculateZoom(cities: City[]): number {


    return 0;
  }

  /**
   * Loads the data of the visited countries
   */
  private loadCountriesData(polygonSeries: am4maps.MapPolygonSeries) {
    this.tripService.getVisitedCountries()
      .subscribe(countries => {
        polygonSeries.data = countries.map(c => ({
          id: c.codeAlpha2,
          name: c.name,
          value: c.count,
          fill: !c.count ? this.UNVISITED_COLOR: c.count > 1 ? this.FULL_VISITED_COLOR: this.VISITED_COLOR
        }));
      });
  }

  /**
   * Loads the data of the visited cities
   */
  private loadCitiesData(imageSeries: am4maps.MapImageSeries) {
    this.tripService.getVisitedCities()
      .subscribe(cities => {
        this.visitedCities.next(cities);
        imageSeries.data = cities;
      });
  }
}
