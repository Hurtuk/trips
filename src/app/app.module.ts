import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialogModule} from '@angular/material/dialog';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ModalComponent } from './modal.component';
import { TripSummaryComponent } from './modals/trip-summary/trip-summary.component';
import { WorldComponent } from './world/world.component';
import { CountrySummaryComponent } from './modals/country-summary/country-summary.component';
import { HttpClientModule } from '@angular/common/http';
import { UrlBuilderService } from './services/url-builder.service';
import { TripRecapComponent } from './modals/trip-recap/trip-recap.component';
import { CitySummaryComponent } from './modals/city-summary/city-summary.component';
import { Nl2pPipe } from './pipes/nl2p.pipe';
import { PhotoComponent } from './photo/photo.component';
import { CostsComponent } from './modals/costs/costs.component';

@NgModule({
  declarations: [
    AppComponent,
    ModalComponent,
    TripSummaryComponent,
    WorldComponent,
    CountrySummaryComponent,
    TripRecapComponent,
    CitySummaryComponent,
    Nl2pPipe,
    PhotoComponent,
    CostsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    UrlBuilderService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
