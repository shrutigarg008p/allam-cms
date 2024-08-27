import { NgModule } from '@angular/core';
import { OrderrByPipe } from "./orderby.pipe";
import { FormatTitlePipe } from "./format-title.pipe";
import { Format } from "./format";
import { OrderBy } from "./orderBy";
import { CustomPipe } from "./custom.pipe";
import { SanitizerUrlPipe } from "./sanitize-url.pipe";

@NgModule({
  declarations: [OrderrByPipe, FormatTitlePipe, Format, OrderBy,CustomPipe, SanitizerUrlPipe],
  imports: [],
  exports: [OrderrByPipe, FormatTitlePipe, Format, OrderBy,CustomPipe, SanitizerUrlPipe]
})
export class PipesModule {}