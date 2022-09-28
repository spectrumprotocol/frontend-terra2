import { Pipe, PipeTransform } from '@angular/core';
import { PercentPipe} from '@angular/common';



@Pipe({
  name: 'percentsuperscript'
})
export class PercentSuperscriptPipe implements PipeTransform {

  constructor(
      private percentPipe: PercentPipe
  ) { }

  private extractE(value: string){
    const indexOfE = value.indexOf('e');
    return value.substring(indexOfE);
  }

  transform(value: number, decimals?: number, digitsInfo?: string, locale?: string) {
    if (value == null) {
      return value;
    }
    if (value > 1e7){
      try {
        const valueString = value.toExponential(2).toString();
        const leftPart = valueString.substring(0, 4);
        const rightPart = valueString.substring(4);
        const extractedEPart = this.extractE(rightPart);
        // const signOfE = extractedEPart.substring(1, 2);
        const eValue = +extractedEPart.substring(2);
        const powerBy = eValue + 2;
        const rightPartSuperscript = `10<sup>${powerBy}</sup>` ;
        return ` ${leftPart}x${rightPartSuperscript}%`;
      } catch (e) {
        console.error('percentsuperscript', e, value);
        return ` ` + this.percentPipe.transform(value, digitsInfo, locale);
      }
    }
    return ` ` + this.percentPipe.transform(value, digitsInfo, locale);
  }

}
