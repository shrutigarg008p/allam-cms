import {AbstractControl} from '@angular/forms';
import * as moment from 'moment';

export class AlaamValidator {
  static dateValidator(AC: AbstractControl) {
    //alert(AC.value);
    if (AC && AC.value && !moment(AC.value, 'YYYY-MM-DD',true).isValid())  {
      return {'dateValidator': true};
    }
    return null;
  }
}