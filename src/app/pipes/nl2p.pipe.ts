import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nl2p'
})
export class Nl2pPipe implements PipeTransform {

  transform(value: string): string {
    return value
      .replace(" ?", "&nbsp;?")
      .replace(" !", "&nbsp;!")
      .replace(" :", "&nbsp;:")
      .replace(" ;", "&nbsp;;")
      .split("\n").map(v => !v ? '': ('<p>' + v + '</p>')).join('');
  }

}
