import { Injectable, NgZone } from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import * as am4maps from "@amcharts/amcharts4/maps";
import * as am4lang_fr_FR from "@amcharts/amcharts4/lang/fr_FR";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import am4geodata_worldHigh from "@amcharts/amcharts4-geodata/worldHigh";
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

  private UNVISITED_COLOR = am4core.color("#d8c3a2");
  private VISITED_COLOR = am4core.color("#d86d61");
  private FULL_VISITED_COLOR = am4core.color("#b53300");
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
      map.deltaLongitude = -11;
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
      polygonTemplate.opacity = .7;
      polygonTemplate.stroke = am4core.color("#7c5b36");
      polygonTemplate.strokeWidth = 3;
      chart.series.push(polygonSeries);
      // Generate the cities
      const imageSeries = chart.series.push(new am4maps.MapImageSeries());
      const imageSeriesTemplate = imageSeries.mapImages.template;
      const marker = imageSeriesTemplate.createChild(am4core.Image);
      marker.href = "assets/point.png";
      marker.width = 40;
      marker.height = 40;
      marker.nonScaling = true;
      marker.horizontalCenter = "middle";
      marker.verticalCenter = "bottom";
      marker.tooltipText = "{name}";
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
    polygonTemplate.propertyFields.opacity = "opacity";
    polygonTemplate.stroke = am4core.color("#804e2f");
    polygonTemplate.strokeOpacity = .7;
    polygonTemplate.strokeWidth = 1;
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
    const marker = imageSeriesTemplate.createChild(am4core.Image);
    marker.href = "assets/point.png";
    marker.width = 40;
    marker.height = 40;
    marker.nonScaling = true;
    marker.horizontalCenter = "middle";
    marker.verticalCenter = "bottom";
    marker.tooltipText = "{name}";
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
        const zoomData = this.getAverageAndRange([stays.startFrom, ...stays.visits.map(v => v.city)]);
        if (zoomData.range < 30) {
          chart.homeZoomLevel = 30 - Math.ceil(zoomData.range);
          chart.projection = new am4maps.projections.Miller();
        } else {
          chart.projection = new am4maps.projections.Orthographic();
          chart.backgroundSeries.mapPolygons.template.polygon.fill = am4core.color("#d0e1e5");
          chart.backgroundSeries.mapPolygons.template.polygon.fillOpacity = 1;
        }
        chart.deltaLatitude = -this.average([stays.startFrom.latitude, ...stays.visits.map(v => v.latitude)]);
        chart.deltaLongitude = -this.average([stays.startFrom.longitude, ...stays.visits.map(v => v.longitude)]);
      } else if (countriesNb > 1 || trip === null) {
        // Display zoomed world on visited countries
        chart.projection = new am4maps.projections.Miller();
        const zoomData = this.calculateZoomPoint([stays.startFrom, ...stays.visits.map(v => v.city)]);
        chart.homeZoomLevel = zoomData.zoom;
        chart.homeGeoPoint = zoomData.center;
      } else {
        // Display single country
        chart.projection = new am4maps.projections.Miller();
        polygonSeries.include = [stays.startFrom.country.codeAlpha2];
        const zoomData = this.getAverageAndRange([stays.startFrom, ...stays.visits.map(v => v.city)]);
        if (stays.visits.length > 2 && zoomData.range < 3) {
          chart.homeZoomLevel = 6 - Math.ceil(zoomData.range);
          chart.homeGeoPoint = zoomData.average;
        }
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
      const marker = imageSeriesTemplate.createChild(am4core.Image);
      marker.href = "assets/point.png";
      marker.width = 40;
      marker.height = 40;
      marker.nonScaling = true;
      marker.horizontalCenter = "middle";
      marker.verticalCenter = "bottom";
      marker.tooltipText = "{name}";
      imageSeriesTemplate.propertyFields.latitude = "latitude";
      imageSeriesTemplate.propertyFields.longitude = "longitude";
      imageSeries.data = [stays.startFrom, ...stays.visits.map(v => ({ name: v.city.name, latitude: v.latitude, longitude: v.longitude }))];
    });

    return false;
  }

  private getAverageAndRange(cities: City[]): { average: { longitude: number, latitude: number }, range: number } {
    const maxLatitude = Math.max(...cities.map(c => c.latitude));
    const maxLongitude = Math.max(...cities.map(c => c.longitude));
    const minLatitude = Math.min(...cities.map(c => c.latitude));
    const minLongitude = Math.min(...cities.map(c => c.longitude));
    return {
      average: {
        latitude: (maxLatitude + minLatitude) / 2,
        longitude: (maxLongitude + minLongitude) / 2
      },
      range: Math.max(maxLatitude - minLatitude, maxLongitude - minLongitude)
    };
  }

  private calculateZoomPoint(cities: City[]): {center: { latitude: number, longitude: number }, zoom: number } {
    const ref = this.getAverageAndRange(cities);
    let zoom: number;
    if (ref.range < 1) {
      zoom = 32;
    } else if (ref.range < 20) {
      zoom = 13;
    } else if (ref.range < 100) {
      zoom = 8;
    } else {
      zoom = 5;
    }

    return {
      center: ref.average,
      zoom: zoom
    };
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
          fill: !c.count ? this.UNVISITED_COLOR: c.count > 1 ? this.FULL_VISITED_COLOR: this.VISITED_COLOR,
          opacity: !c.count ? .6: 1
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
        imageSeries.data = cities.filter(c => c.showGlobal);
      });
  }
}
