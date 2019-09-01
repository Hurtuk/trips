import { Injectable, NgZone } from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import * as am4maps from "@amcharts/amcharts4/maps";
import * as am4lang_fr_FR from "@amcharts/amcharts4/lang/fr_FR";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import { Router } from '@angular/router';

am4core.useTheme(am4themes_animated);

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  constructor(
    private zone: NgZone,
    private route: Router
  ) { }

  public buildTheWorld() {
    this.zone.runOutsideAngular(() => {
      // Create the chart
      const map = am4core.create("world", am4maps.MapChart);
      map.geodata = am4geodata_worldLow;
      map.language.locale = am4lang_fr_FR.default;
      map.projection = new am4maps.projections.Miller();
      // Create the data and exclude Antarctica
      const polygonSeries = new am4maps.MapPolygonSeries();
      polygonSeries.useGeodata = true;
      polygonSeries.exclude = ['AQ'];
      // Fill the data
      polygonSeries.data = [{
        "id": "CA",
        "name": "Canada",
        "value": 2,
        "fill": am4core.color("#ffd3d3")
      }, {
        "id": "FR",
        "name": "France",
        "value": 50,
        "fill": am4core.color("#ffd3d3")
      }];
      // Set the style of visited countries
      const polygonTemplate = polygonSeries.mapPolygons.template;
      //polygonTemplate.tooltipText = "{name} : {value} voyages";
      polygonTemplate.propertyFields.fill = "fill";
      // Open modal on click
      polygonTemplate.events.on('hit', ev =>
        this.zone.run(() =>
          this.route.navigate(['country/' + ev.target.dataItem.dataContext['id']])));
      
      map.series.push(polygonSeries);



      const imageSeries = map.series.push(new am4maps.MapImageSeries());
      let imageSeriesTemplate = imageSeries.mapImages.template;
      let circle = imageSeriesTemplate.createChild(am4core.Circle);
      circle.radius = 10;
      circle.fill = am4core.color("#B27799");
      circle.stroke = am4core.color("#FFFFFF");
      circle.strokeWidth = 2;
      circle.nonScaling = true;
      circle.tooltipText = "{title}";
      imageSeriesTemplate.propertyFields.latitude = "latitude";
      imageSeriesTemplate.propertyFields.longitude = "longitude";
      imageSeriesTemplate.events.on('hit', ev =>
        this.zone.run(() =>
          this.route.navigate(['city/' + ev.target.dataItem.dataContext['id']])));
      imageSeries.data = [{
        "latitude": 48.856614,
        "longitude": 2.352222,
        "title": "Paris"
      }, {
        "latitude": 40.712775,
        "longitude": -74.005973,
        "title": "New York"
      }, {
        "latitude": 49.282729,
        "longitude": -123.120738,
        "title": "Vancouver"
      }];
    });
  }
}
