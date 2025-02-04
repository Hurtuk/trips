import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-photo',
    templateUrl: './photo.component.html',
    styleUrls: ['./photo.component.scss']
})
export class PhotoComponent {

  @Input() photoUrl: string;

  constructor() { }

}
