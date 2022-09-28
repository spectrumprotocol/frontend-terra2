import { Injectable } from '@angular/core';
import {PercentPipe} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class UiUtilsService {

  constructor(
      private percentPipe: PercentPipe
  ) {

  }

  transformPercentSuperscript(value: number, decimals?: number, digitsInfo?: string, locale?: string){
    function extractE(a: string){
      const indexOfE = a.indexOf('e');
      return a.substring(indexOfE);
    }

    if (value == null) {
      return value;
    }
    if (value > 1e7){
      try {
        const valueString = value.toExponential(2).toString();
        const leftPart = valueString.substring(0, 4);
        const rightPart = valueString.substring(4);
        const extractedEPart = extractE(rightPart);
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
