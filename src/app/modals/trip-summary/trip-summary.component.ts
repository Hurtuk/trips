import { Component } from '@angular/core';
import { SummaryModal } from '../summary-modal';
import { ChartService } from 'src/app/services/chart.service';
import { TripService } from 'src/app/services/trip.service';
import { Trip } from 'src/app/model/trip';
import { Chapter } from 'src/app/model/chapter';

@Component({
  selector: 'app-trip-summary',
  templateUrl: './trip-summary.component.html',
  styleUrls: ['./trip-summary.component.scss']
})
export class TripSummaryComponent implements SummaryModal {

  public trip: Trip;
  public chapters: Chapter[];
  public currentPage = 1;
  public chaptersByPage = new Map<number, Chapter[]>();

  constructor(
    private chartService: ChartService,
    private tripService: TripService
  ) { }

  public initFromId(id: number): void {
    this.tripService.getTripById(id)
      .subscribe(t => {
        this.trip = t;
        this.chartService.createTrip(this, 'global-map', this.trip);
      });
    this.tripService.getChaptersByTrip(id)
      .subscribe(c => {
        this.chapters = c;
        let p = 1, perPage = 1;
        this.chapters.forEach(chapter => {
          if ((chapter.images && chapter.images.length) || (chapter.from && chapter.to) || perPage === 2) {
            p++;
            perPage = 0;
          }
          if (!this.chaptersByPage.get(p)) {
            this.chaptersByPage.set(p, []);
          }
          this.chaptersByPage.get(p).push(chapter);
          perPage++;
        });
      });
  }

  public ngOnDestroy() {
    this.chartService.disposeTempChart(this);
  }

  public citiesToString(): string {
    return this.trip.visits.map(v => v.city.name).join(' — ');
  }

  public array(length: number): number[] {
    return Array(length);
  }

  public getTransports(): string[] {
    return [...new Set(this.trip.visits.map(v => v.transport))];
  }

}
