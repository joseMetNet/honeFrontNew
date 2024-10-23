import { Component, OnInit } from '@angular/core';
import { DocumentsCrudService } from '../../../../services/documents/documents-crud.service';
import { DocumentInterface } from '../../../../models/client.interface';
import { EventManagerService } from '../../../../services/events-manager/event-manager.service';
import { NgZorroModule } from '../../../../ng-zorro.module';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable, Observer } from 'rxjs';
import { CommonModule } from '@angular/common';

import { NzUploadFile } from 'ng-zorro-antd/upload';
import { ProviderAssistanceComponent } from '../../../../shared/modals/provider-assistance/provider-assistance.component';

import { FetchBackend } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { presetColors } from 'ng-zorro-antd/core/color';

@Component({
   selector: 'app-remaining-documents',
   standalone: true,
   imports: [NgZorroModule, CommonModule],
   templateUrl: './remaining-documents.component.html',
   styleUrl: './remaining-documents.component.scss'
})
export class RemainingDocumentsComponent implements OnInit {
   loading: boolean = false;
   clientSelected: any = this.eventManager.clientSelected();
   counterApi: any = this.eventManager.getPercentApi();
   loadingData: boolean = false;

   documentList: DocumentInterface[] = [];

   formDate!: FormGroup;
   message1: string = 'El documento No puede ser mayor a 30 días de la fecha de expedición.';
   message2: string = 'Recuerda que la fecha de expedición del documento debe ser del año presente.';
   
   message: string[] = [
      'Resolución actualizada Superintendencia de Vigilancia y Seguridad Privada (Si aplica).',
      'Resolución para trabajo en alturas (Si aplica).',
      'Resolución para trabajo en confinados (Si aplica).'
    ]
   customColors: string[] = ['#f37248'];
   presetColors = presetColors;

   constructor(
      private eventManager: EventManagerService,
      private documentService: DocumentsCrudService,
      private notificationService: NzNotificationService,

      public formBuilder: FormBuilder,
   ) {
      this.createtiektcForm();
   }

   ngOnInit(): void {
      this.getDocumentsToUpload();
   }

   /**
    * Obtiene el listado de documentos sin cargar
    */
   createtiektcForm() {
      this.formDate = this.formBuilder.group({
         fecha: [""],
      });
   }

   getDocumentsToUpload() {
      this.loadingData = true;
      const { idProvider, idTypeProvider, idClientHoneSolutions } = this.clientSelected;
      this.documentService.getDocumentsToUpload(idProvider, idTypeProvider, idClientHoneSolutions).subscribe({
         next: (res: any) => {
            this.documentList = res;
            this.loadingData = false;
         },
         error: (error: any) => {
            this.loadingData = false;
         },
         complete: () => { }
      });
   }

   private getBase64(img: File, callback: (img: string) => void): void {
      const reader = new FileReader();
      reader.addEventListener('load', () => callback(reader.result!.toString()));
      reader.readAsDataURL(img);
   }

   /**
    * Carga un archivo y lo envia al api de carga de documentos
    * @param event - evento del input que contiene el archivo para cargar
    * @param item - elemento de la lista para saber cual documento de carga ej (cedula, nit, rethus)
    */
   loadFiles(event: any, item: any) {
      if (event.target.files.length > 0) {
         const file: FileList = event.target.files[0];
         this.uploadDocuments(file, item);
      }
   }

   /**
    * Carga un archivo y lo envia al api de carga de documentos
    * @param file - recibe el archivo para cargar
    * @param item - elemento de la lista para saber cual documento de carga ej (cedula, nit, rethus)
    */
   uploadDocuments(file: any, item: any) {
      const fechaForm = this.formDate.get("fecha")?.value;

      this.loadingData = true;
      const { idProvider } = this.clientSelected;
      // const today = new Date();
      const today = (fechaForm === 0 || fechaForm === null || fechaForm === undefined || fechaForm === '') ? new Date() : fechaForm;
      const fileToUpload = new FormData();
      fileToUpload.append('archivo', file);
      const body = {
         posicion: 0,
         nombre: file.name,
         documento: item.idTypeDocuments,
         nombredcoumentos: item.NameDocument,
         fechavencimiento: today,
         idUser: idProvider
      };
      fileToUpload.append('datos', JSON.stringify(body));

      this.documentService.uploadDocuments(idProvider, fileToUpload).subscribe({
         next: (res: any) => {
            this.loadingData = false;
            this.createNotificacion('success', 'Carga exitosa', 'El documento se subió de manera satisfactoria');
            this.getDocumentsToUpload();
            location.reload();
            this.eventManager.getPercentApi.set(this.counterApi + 1);
         },
         error: (error: any) => {
            this.loadingData = false;
            this.createNotificacion('error', 'Error', 'Lo sentimos, hubo un error en el servidor.');
         },
         complete: () => { }
      });
   }

   /**
    * Crea una notificacion de alerta
    * @param type - string recibe el tipo de notificacion (error, success, warning, info)
    * @param title - string recibe el titulo de la notificacion
    * @param message - string recibe el mensaje de la notificacion
    */
   createNotificacion(type: string, title: string, message: string) {
      this.notificationService.create(type, title, message);
   }


   /**
    * 
    * @param current Bloquea las fechas antes de la fecha actual, habilita por 30 dias y bloquea fechas posterior 
    * @returns 
    */
   disableDates = (current: Date): boolean => {
      const today = new Date();
      const maxDate = new Date();
      maxDate.setDate(today.getDate() + 30);
      return current < today || current > maxDate;
   };
   
   
}
