import { Injectable, NgZone } from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import am4themes_dataviz from "@amcharts/amcharts4/themes/dataviz";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import * as am4maps from "@amcharts/amcharts4/maps";
import * as am4charts from "@amcharts/amcharts4/charts";
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
  private tempChart = new Map<any, am4charts.SerialChart[]>();

  constructor(
    private zone: NgZone,
    private route: Router,
    private tripService: TripService
  ) { }

  public disposeTempChart(chartParent: any) {
    const charts = this.tempChart.get(chartParent);
    if (charts) {
      while (charts.length) {
        charts.pop().dispose();
      }
    }
  }

  /**
   * Creates the main chart of the world
   */
  public buildTheWorld(elementId: string) {
    this.zone.runOutsideAngular(() => {
      // Create the chart
      const map = am4core.create(elementId, am4maps.MapChart);
      map.seriesContainer.draggable = false;
      map.seriesContainer.resizable = false;
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
      chart.seriesContainer.draggable = false;
      chart.seriesContainer.resizable = false;
      // Fill the data
      const polygonSeries = new am4maps.MapPolygonSeries();
      chart.projection = new am4maps.projections.Miller();
      chart.geodata = am4geodata_worldHigh;
      // Create the data
      switch (countryCode) {
        case "US":
          chart.deltaLongitude = 120;
          chart.homeZoomLevel = 3.2;
          break;
        case "RU":
          chart.deltaLongitude = -100;
          chart.homeZoomLevel = 2;
          break;
        case "NZ":
          chart.deltaLongitude = -175;
          chart.homeZoomLevel = 18;
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
      // Doesn't work for now
      /*imageSeriesTemplate.events.on('hit', ev =>
        this.zone.run(() => {
          modal.close();
          this.route.navigate(['city/' + ev.target.dataItem.dataContext['id']]);
        })
      );*/
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
        this.route.navigate(['city/' + ev.target.dataItem.dataContext['id']]);
      })
    );
    this.loadCitiesData(imageSeries);
  }

  /**
   * Creates the trip map
  */
  public createTrip(modal: SummaryModal, elementId: string, trip: Trip, cities: City[] = null) {
    this.zone.runOutsideAngular(() => {
      let stays: { startFrom: City, visits: Visit[]; };
      if (trip === null) {
        stays = { startFrom: cities[0], visits: [{ id: null, startDate: null, endDate: null, transport: cities[1].transport, city: cities[1], latitude: cities[1].latitude, longitude: cities[1].longitude }] };
      } else {
        stays = this.tripService.getCitiesCountriesByTrip(trip);
      }
      const differentCities = [stays.startFrom, ...stays.visits.map(v => v.city)];
      // Focus on one region or the way to
      const countriesNb = [...new Set(differentCities.map(c => c.country.codeAlpha2))].length;
      // Create the chart
      const chart = am4core.create(elementId, am4maps.MapChart);
      if (!this.tempChart.get(modal)) {
        this.tempChart.set(modal, []);
      }
      this.tempChart.get(modal).push(chart);
      chart.seriesContainer.draggable = false;
      chart.seriesContainer.resizable = false;
      chart.language.locale = am4lang_fr_FR.default;
      chart.projection = new am4maps.projections.Miller();
      const polygonSeries = new am4maps.MapPolygonSeries();
      const polygonTemplate = polygonSeries.mapPolygons.template;
      // BG color
      chart.backgroundSeries.mapPolygons.template.polygon.fill = am4core.color("#bfa58d");
      chart.backgroundSeries.mapPolygons.template.polygon.fillOpacity = .5;
      // Countries color
      polygonTemplate.fill = am4core.color("#e9d0a9");
      polygonTemplate.stroke = am4core.color("#bfa58d");
      polygonTemplate.strokeWidth = 1;
      // Select countries
      if (countriesNb > 1) {
        let ss = polygonTemplate.states.create("active");
        ss.properties.fill = this.VISITED_COLOR;
      }
      // Zoom
      this.zoomOnCities(chart, polygonSeries, differentCities);
      // Colors
      chart.background.fillOpacity = 0;
      // Create the data
      chart.geodata = am4geodata_worldHigh;
      polygonSeries.useGeodata = true;
      chart.series.push(polygonSeries);
      // Lines
      const lineSeries = chart.series.push(new am4maps.MapLineSeries());
      lineSeries.data = [{ "multiGeoLine": [differentCities.map(v => ({ latitude: v.latitude, longitude: v.longitude }))] }];
      lineSeries.mapLines.template.line.strokeWidth = 2;
      lineSeries.mapLines.template.line.strokeOpacity = 0.2;
      lineSeries.mapLines.template.line.stroke = am4core.color("#000000");
      lineSeries.mapLines.template.line.nonScalingStroke = true;
      lineSeries.mapLines.template.opacity = 1;
      lineSeries.mapLines.template.line.opacity = 1;
      lineSeries.zIndex = 10;
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
      imageSeriesTemplate.propertyFields.latitude = "latitude";
      imageSeriesTemplate.propertyFields.longitude = "longitude";
      differentCities.map(c => {
        let city = imageSeries.mapImages.create();
        city.latitude = c.latitude;
        city.longitude = c.longitude;
        city.tooltipText = c.name;
        return city;
      });
      // Transport
      this.createTransportCities(
        lineSeries, imageSeries,
        trip === null ?
          [{city: stays.startFrom, transport: null}, {city: stays.visits[0].city, transport: stays.visits[0].transport}] :
          [{city: stays.startFrom, transport: null}, ...stays.visits.map(v => ({city: v.city, transport: v.transport}))]);
    });
  }

  public generateCosts(modal: any, elementId: string, costs: {year: number, cities: string[], transportCost: number, stayCost: number, days: number, km: number}[]) {
    this.zone.runOutsideAngular(() => {
      if (!this.tempChart.get(modal)) {
        this.tempChart.set(modal, []);
      }

      am4core.useTheme(am4themes_dataviz);

      const barwidth = 70, ywidth = 70;
      const data = costs.map(c => ({name: "[font-family:Caveat]" + c.year + "[/]\n[font-size:18px bold]" + c.cities.join("\n"), transport: c.transportCost, stay: c.stayCost, costByNight: Math.round(c.stayCost / c.days), costByKm: Math.round(c.transportCost / (c.km / 200))}));

      let container = am4core.create(elementId, am4core.Container);
      container.width = am4core.percent(100);
      container.height = am4core.percent(100);
      container.layout = "vertical";
      container.fontFamily = '"Amatic SC", cursive';
      container.fontSize = 25;

      /* FIRST CHART */

      // Total costs
      let chart = container.createChild(am4charts.XYChart);
      chart.height = am4core.percent(75);
      chart.numberFormatter.numberFormat = '#€';

      chart.data = data;

      chart.padding(20, 5, 2, 5);

      // Cities/countries names
      let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.renderer.grid.template.location = 0;
      categoryAxis.dataFields.category = "name";
      categoryAxis.renderer.ticks.template.disabled = false;
      categoryAxis.renderer.minGridDistance = 1;
      categoryAxis.renderer.labels.template.wrap = true;
      categoryAxis.renderer.labels.template.maxWidth = 100;
      categoryAxis.renderer.labels.template.fontSize = ".75em";
      categoryAxis.renderer.labels.template.textAlign = "middle";
      categoryAxis.renderer.grid.template.opacity = 0;

      // Y axis
      let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.tooltip.disabled = true;
      valueAxis.zIndex = 1;
      valueAxis.renderer.baseGrid.disabled = true;
      valueAxis.renderer.fontSize = "0.8em";
      valueAxis.renderer.width = ywidth;
      valueAxis.fontFamily = "Caveat";
      valueAxis.renderer.grid.template.strokeWidth = 3;

      // Transport
      let series = chart.series.push(new am4charts.ColumnSeries());
      series.name = "Transport";
      series.dataFields.valueY = "transport";
      series.dataFields.categoryX = "name";
      series.yAxis = valueAxis;
      // Configure columns
      series.columns.template.width = am4core.percent(barwidth);
      series.columns.template.tooltipText = "[font-size:13px]Transport : {valueY}";
      series.columns.template.fillOpacity = .8;
      // Add label
      let bullet = series.bullets.push(new am4charts.Bullet());
      let image = bullet.createChild(am4core.Image);
      image.href = "assets/icons/plane.png";
      image.width = 30;
      image.height = 30;
      image.horizontalCenter = "middle";
      image.verticalCenter = "middle";
      bullet.locationY = .5;

      // Logement
      series = chart.series.push(new am4charts.ColumnSeries());
      series.name = "Logement";
      series.dataFields.valueY = "stay";
      series.dataFields.categoryX = "name";
      series.yAxis = valueAxis;
      // Make it stacked
      series.stacked = true;
      // Configure columns
      series.columns.template.width = am4core.percent(barwidth);
      series.columns.template.tooltipText = "[font-size:13px]Logement : {valueY}";
      series.columns.template.fillOpacity = .8;
      // Add label
      bullet = series.bullets.push(new am4charts.Bullet());
      image = bullet.createChild(am4core.Image);
      image.href = "assets/icons/appartement.png";
      image.width = 25;
      image.height = 25;
      image.horizontalCenter = "middle";
      image.verticalCenter = "middle";
      bullet.locationY = .5;

      this.tempChart.get(modal).push(chart);

      /* SECOND CHART */

      chart = container.createChild(am4charts.XYChart);
      chart.height = am4core.percent(25);
      chart.numberFormatter.numberFormat = '#€';

      chart.data = data;

      chart.padding(2, 5, 20, 5);

      // Cities/countries names
      categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = "name";
      categoryAxis.renderer.labels.template.disabled = true;
      categoryAxis.renderer.cellStartLocation = 0.15;
      categoryAxis.renderer.cellEndLocation = 0.85;
      chart.xAxes.push(categoryAxis);

      // Y axis
      valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.tooltip.disabled = true;
      valueAxis.zIndex = 1;
      valueAxis.renderer.baseGrid.disabled = true;
      valueAxis.renderer.fontSize = "0.8em";
      valueAxis.renderer.inversed = true;
      valueAxis.renderer.width = ywidth;
      valueAxis.fontFamily = "Caveat";
      valueAxis.renderer.grid.template.strokeWidth = 3;

      series = chart.series.push(new am4charts.ColumnSeries());
      series.name = "Prix par 200km";
      series.dataFields.valueY = "costByKm";
      series.dataFields.categoryX = "name";
      series.stacked = true;
      // Configure columns
      series.columns.template.width = am4core.percent(100);
      series.columns.template.tooltipText = "[font-size:13px]Prix pour 200km : {valueY}";
      series.columns.template.fillOpacity = .8;
      // Add label
      bullet = series.bullets.push(new am4charts.Bullet());
      image = bullet.createChild(am4core.Image);
      image.href = "assets/icons/plane.png";
      image.width = 20;
      image.height = 20;
      image.horizontalCenter = "middle";
      image.verticalCenter = "middle";
      bullet.locationY = .5;

      series = chart.series.push(new am4charts.ColumnSeries());
      series.name = "Prix par nuitée";
      series.dataFields.valueY = "costByNight";
      series.dataFields.categoryX = "name";
      // Configure columns
      series.columns.template.width = am4core.percent(100);
      series.columns.template.tooltipText = "[font-size:13px]Prix par nuit : {valueY}";
      series.columns.template.fillOpacity = .8;
      // Add label
      bullet = series.bullets.push(new am4charts.Bullet());
      image = bullet.createChild(am4core.Image);
      image.href = "assets/icons/appartement.png";
      image.width = 18;
      image.height = 18;
      image.horizontalCenter = "middle";
      image.verticalCenter = "middle";
      bullet.locationY = .5;

      this.tempChart.get(modal).push(chart);
    });
  }

  private zoomOnCities(chart: am4maps.MapChart, polygonSeries: am4maps.MapPolygonSeries, cities: City[]) {
    chart.maxZoomLevel = 800;
    chart.events.on("ready", function() {
      let maxLatitude: number, minLatitude: number, minLongitude: number, maxLongitude: number;

      for (let c of cities) {
        if (maxLatitude == undefined || (c.latitude > maxLatitude)) {
          maxLatitude = c.latitude;
        }
        if (minLatitude == undefined || (c.latitude < minLatitude)) {
          minLatitude = c.latitude;
        }
        if (minLongitude == undefined || (c.longitude < minLongitude)) {
          minLongitude = c.longitude;
        }
        if (maxLongitude == undefined || (c.longitude > maxLongitude)) {
          maxLongitude = c.longitude;
        }

        polygonSeries.getPolygonById(c.country.codeAlpha2).isActive = true;
      }

      chart.zoomToRectangle(maxLatitude, maxLongitude, minLatitude, minLongitude, .75, true, 8000);
    });
  }

  private createTransportCities(lineSeries: am4maps.MapLineSeries, citiesSeries: am4maps.MapImageSeries, transports: {city: City, transport: string}[]) {
    const toWest: boolean[] = [];
    for (let i = 1; i < citiesSeries.mapImages.length; i++) {
      let line = lineSeries.mapLines.create();
      line.imagesToConnect = [citiesSeries.mapImages.getIndex(i-1), citiesSeries.mapImages.getIndex(i)];
      toWest.push(transports[i - 1].city.longitude > transports[i].city.longitude);
    }

    let plane = lineSeries.mapLines.getIndex(0).lineObjects.create();
    plane.position = 0;
    plane.width = 48;
    plane.height = 48;
    plane.opacity = 1;
    plane.zIndex = 20;

    let planeImage = plane.createChild(am4core.Image);
    planeImage.width = 40;
    planeImage.height = 40;
    planeImage.nonScaling = true;
    planeImage.horizontalCenter = "middle";
    planeImage.verticalCenter = "middle";
    planeImage.zIndex = 20;
    planeImage.opacity = 1;

    let currentLine = 0;
    const numLines = lineSeries.mapLines.length;
    function animateTransport() {
      // Source : https://www.amcharts.com/demos/animations-along-lines/
      plane.mapLine = lineSeries.mapLines.getIndex(currentLine);
      plane.parent = lineSeries;

      // Calculate the way
      if (toWest[currentLine]) {
        planeImage.rotation = 180;
        planeImage.href = "assets/icons/" + transports[currentLine+1].transport.replace(/\.png/gi, "_west.png");
      } else {
        planeImage.rotation = 0;
        planeImage.href = "assets/icons/" + transports[currentLine+1].transport;
      }

      let from = 0, to = 1;
      let animation = plane.animate({
        from: from,
        to: to,
        property: "position"
      }, 3000, transports[currentLine+1].transport === "plane.png" ? am4core.ease.sinInOut: am4core.ease.linear);
      animation.events.on("animationended", animateTransport)
      currentLine = (currentLine + 1) % numLines;
    }
    
    animateTransport();
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
        const filteredCities = cities.filter(c => c.showGlobal);
        const countriesCount = [];
        filteredCities.map(c => c.country.codeAlpha2).forEach(country => countriesCount[country] ? countriesCount[country]++ : countriesCount[country] = 1);
        imageSeries.data = filteredCities.filter(c => countriesCount[c.country.codeAlpha2] < 3);
      });
  }
}
