import { Component, OnInit, Output, EventEmitter, Renderer, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl, NgForm } from '@angular/forms';
import { MultifilesService } from './multifiles.service';
import Swal from 'sweetalert2/dist/sweetalert2.js';
@Component({
  selector: 'app-multi-files-upload',
  templateUrl: './multi-files-upload.component.html',
  styleUrls: ['./multi-files-upload.component.css']
})

export class MultiFilesUploadComponent implements OnInit {

  file: File;
  duration:number = 0;

  constructor(private renderer: Renderer,
    private formBuilder: FormBuilder,
    private multifilesService: MultifilesService
  ) { }

  @Output() onDataPickedBefore: EventEmitter<any> = new EventEmitter<any>();
  @Output() onDataPicked: EventEmitter<any> = new EventEmitter<any>();

  public documentGrp: FormGroup;
  public totalfiles: Array<File> =[];
  public totalFileName = [];
  public lengthCheckToaddMore =0;
  loading: boolean;

  @ViewChild('variable', {static: false}) 
  // this InputVar is a reference to our input. 
  InputVar: ElementRef; 
  reset()   
  { 
    // We will clear the value of the input  
    // field using the reference variable. 
    this.InputVar.nativeElement.value = ""; 
  } 

  ngOnInit() {

    this.documentGrp = this.formBuilder.group({
      /* doc_name: '',
      doc_description: '', */
      file_time: [10],
      documentFile:new FormControl(File),

      items: this.formBuilder.array([this.createUploadDocuments()])
    });

  }
  createUploadDocuments(): FormGroup {
    return this.formBuilder.group({
      /* doc_name: '',
      doc_description: '', */
      file_time: [10],
      documentFile : File
    });
  }

  get items(): FormArray {
    return this.documentGrp.get('items') as FormArray;
  };
  
addItem(): void {
  //console.log("length is ",this.totalfiles.length);
  //console.log("lengthCheckToaddMore ", this.lengthCheckToaddMore);
  if(this.totalfiles.length==5){
    Swal.fire('','You can select only 5 mp3 file.','error');
    return;
  }

  if(this.totalfiles.length!=0)
  /* this.items.value[0].doc_name != "" && this.items.value[0].doc_description != "" && */
  if( this.items.value[0].file_time != 0 && ((this.lengthCheckToaddMore) === (this.totalfiles.length)) )
  {
      
      this.items.insert(0, this.createUploadDocuments())
      this.lengthCheckToaddMore=this.lengthCheckToaddMore+1;
  }
}

  removeItem(index: number) {
  
   this.totalfiles.splice(index);
   this.totalFileName.splice(index);
    this.items.removeAt(index);
    this.lengthCheckToaddMore=this.lengthCheckToaddMore-1;
   // console.log("name are ",this.totalFileName);
    
  }

  public fileSelectionEvent(fileInput: any,oldIndex, variable) {

    console.log("newIndex is ", oldIndex);
    var name = fileInput.target.files[0].name;
    var ext = name.substring(name.lastIndexOf('.') + 1);

    if (ext.toLowerCase() == 'mp3') {
      if (fileInput.target.files && fileInput.target.files[0]) {
        this.file = fileInput.target.files[0];
        console.log('size', this.file.size)
        new Audio(URL.createObjectURL(this.file)).onloadedmetadata = (e:any) =>{
          this.duration = e.currentTarget.duration;
          console.log('duration', this.duration);
          if(this.duration >= 30){
            Swal.fire('','You can select only less than 30 seconds of mp3 file.','error');
            //this.documentGrp.controls['documentFile'].reset();
            //this.documentGrp.reset();
            variable.value = null;
            return;
          }
          var reader = new FileReader();
          reader.onload = (event: any) => {
          }
          if(oldIndex==0)
          {
            this.totalfiles.unshift((fileInput.target.files[0]))
            this.totalFileName.unshift(fileInput.target.files[0].name)
          }
          else
          {
            this.totalfiles[oldIndex]=(fileInput.target.files[0]);
            this.totalFileName[oldIndex]=fileInput.target.files[0].name
          }
          reader.readAsDataURL(fileInput.target.files[0]);

          if(this.totalfiles.length == 1)
          {
            this.lengthCheckToaddMore=1;
          }

        }
        console.log('test', this.duration)
      
      }
    }else{
      variable.value = null;
      Swal.fire('','File type should be mp3','error');
      return;
    }
  
    /* setTimeout(function () {
      if(this.totalfiles.length == 1)
      {
        this.lengthCheckToaddMore=1;
      }
    }, 2000); */

  }
  public OnSubmit(formValue: any) {

    this.loading = true;
    let main_form: FormData = new FormData();
    this.onDataPickedBefore.emit(this.loading);

    for(let j=0;j<this.totalfiles.length; j++)
    {
      console.log("the values is ",<File>this.totalfiles[j]);
      console.log("the name is ",this.totalFileName[j]);
      main_form.append('file_time[]',formValue.items[j].file_time)
      main_form.append('file[]',<File>this.totalfiles[j])
    }
    console.log(formValue.items)
   
    

    //reverseFileNames=this.totalFileName.reverse();
   
    /* let AllFilesObj= []

    formValue.items.forEach((element, index) => { 
     
      console.log("index is ",index);
      console.log("element is ", element);
      
      let eachObj=
      {
         'doc_name' : element.doc_name,
        'doc_description' : element.doc_description, 
        'file_name' : this.totalFileName[index]
      }
      AllFilesObj.push(eachObj); 
    }); */

    //console.log("the Array data is ",AllFilesObj);
    //main_form.append("fileInfo",JSON.stringify(AllFilesObj))
  
    this.multifilesService.saveFiles(main_form).subscribe(data => {
      console.log("result is ", data);
      this.loading = false;
      this.onDataPicked.emit(data);
    },
    err => {
      this.loading = false;
    })
  }

}
