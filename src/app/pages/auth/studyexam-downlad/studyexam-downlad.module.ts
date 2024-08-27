import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudyExamDownloadRoutingModule } from './studyexam-downlad-routing.module';
import { StudyExamDownloadComponent } from './studyexam-downlad.component';
import {SharedModule} from '../../../shared/shared.module';

import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { PipesModule } from "../../../pipes/pipes.module";
import { Pipe, PipeTransform} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'

@Pipe({ name: 'safeHtml'})
export class SafeHtmlPipe implements PipeTransform  {
  constructor(private sanitized: DomSanitizer) {}
  transform(value) 
  {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}

@NgModule({
  imports: [
    CommonModule,
    StudyExamDownloadRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    PipesModule
  ],
  declarations: [StudyExamDownloadComponent,
    SafeHtmlPipe]
})
export class StudyExamDownloadModule { }
