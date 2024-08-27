import {Pipe, PipeTransform} from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';
@Pipe({
    name: 'sanitizerUrl'
  })
  export class SanitizerUrlPipe implements PipeTransform {
  
    constructor (
      private sanitize: DomSanitizer
    ) {}
  
    transform(value: string): SafeUrl {
      return this.sanitize.bypassSecurityTrustUrl(value);
    }
  }