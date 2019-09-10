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
          // Sorting by page
          if (!this.chaptersByPage.get(p)) {
            this.chaptersByPage.set(p, []);
          }
          this.chaptersByPage.get(p).push(chapter);
          if (p === 1 || (chapter.images && chapter.images.length) || (chapter.from && chapter.to) || perPage === 2) {
            p++;
            perPage = 1;
          } else {
            perPage++;
          }
          // Creating maps
          setTimeout(() => {
            if (chapter.from && chapter.to) {
              this.chartService.createTrip(this, 'map-chapter-' + chapter.number, null, [chapter.from, chapter.to]);
            }
          }, 0);
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

  public getDateSuffixe(page: number, inPage: number, date: string): string {
    if (!date) {
      return '';
    }
    if ((inPage === 0 && this.chaptersByPage.get(page).length === 1) || inPage === 1) {
      if (this.chaptersByPage.get(page + 1) && this.chaptersByPage.get(page + 1)[0].date && this.chaptersByPage.get(page + 1)[0].date === date) {
        return ' (1/2)';
      } else if (page > 1
        && ((inPage === 0 && this.chaptersByPage.get(page - 1)[this.chaptersByPage.get(page - 1).length - 1].date === date)
          || (inPage === 1 && this.chaptersByPage.get(page)[inPage - 1].date === date))) {
        return ' (2/2)';
      }
    } /*else if (page > 1) {
      if ((inPage === 0 && this.chaptersByPage.get(page - 1)[this.chaptersByPage.get(page - 1).length - 1].date === date)
        || (inPage === 1 && this.chaptersByPage.get(page)[inPage - 1].date === date)) {
        return ' (2/2)';
      }
    }*/
    return '';
  }

}
