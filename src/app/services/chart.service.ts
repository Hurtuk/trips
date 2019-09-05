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

am4core.useTheme(am4themes_animated);

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  private UNVISITED_COLOR = am4core.color("#d9d9d9");
  private VISITED_COLOR = am4core.color("#ffd06d");
  private FULL_VISITED_COLOR = am4core.color("#f29d00");
  private visitedCities: BehaviorSubject<City[]> = new BehaviorSubject([]);
  private tempChart = new Map<SummaryModal, am4maps.MapChart>();

  constructor(
    private zone: NgZone,
    private route: Router,
    private tripService: TripService
  ) { }

  public disposeTempChart(modal: SummaryModal) {
    if (this.tempChart.get(modal)) {
      this.tempChart.get(modal).dispose();
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
      this.tempChart.set(modal, chart);
      chart.language.locale = am4lang_fr_FR.default;
      chart.projection = new am4maps.projections.Miller();
      // Colors
      chart.background.fillOpacity = 0;
      // Create the data
      chart.geodata = am4geodata_worldHigh;
      const polygonSeries = new am4maps.MapPolygonSeries();
      polygonSeries.useGeodata = true;
      // Fill the data
      polygonSeries.include = [countryCode];
      // Color
      let polygonTemplate = polygonSeries.mapPolygons.template;
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
