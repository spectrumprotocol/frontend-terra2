import { Injectable } from '@angular/core';
import {PercentSuperscriptPipe} from '../pipes/percent-superscript.pipe';

@Injectable({
  providedIn: 'root'
})
export class UiUtilsService {

  constructor(
      private percentSuperscriptPipe: PercentSuperscriptPipe
  ) {

  }

  transformPercentSuperscript(value: number){
    return this.percentSuperscriptPipe.transform(value);
  }

}
