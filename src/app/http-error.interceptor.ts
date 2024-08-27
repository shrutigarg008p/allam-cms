import {Injectable} from "@angular/core";
import {HttpEvent, HttpHandler, HttpInterceptor,HttpRequest,HttpResponse,HttpErrorResponse} from '@angular/common/http';
import { Router } from '@angular/router';
import {Observable, of, throwError} from "rxjs";
import {catchError, map} from 'rxjs/operators';
import Swal from 'sweetalert2/dist/sweetalert2.js';
 
@Injectable()
export class GlobalHttpInterceptorService implements HttpInterceptor {
    
  constructor(public router: Router) {
  }
 
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
 
    return next.handle(req).pipe(
      catchError((error) => {
        console.log('error is intercept')
        console.error(error);
        if(error.status == 0 && error.url == "https://alaam.net:4400/competition/api/upload"){
          Swal.fire('Oh','Please check the files, it looks corrupted','error');
        }else if(error.status == 0){
          Swal.fire('Oh','Please check your Internet connection','error');
        }else if(error.status == 401){
          Swal.fire('Oh',error.error.message,'error');
        }else{
          //Swal.fire('',error.message,'error');
          Swal.fire('Oh','Failed to load, please try again later','error');
        }
        
        return throwError(error.message);
      })
    )
  }
}