import { Component, inject, OnInit } from '@angular/core';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NgZorroModule } from '../../../ng-zorro.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventManagerService } from '../../../services/events-manager/event-manager.service';
import { ContactsProviderServicesService } from '../../../services/contacts-provider/contacts-provider.services.service';
import { mailRegexpValidation } from '../../../utils/constant';
import { NzNotificationService } from 'ng-zorro-antd/notification';


@Component({
  selector: 'app-contacts-provider',
  standalone: true,
  imports: [NgZorroModule, CommonModule],
  templateUrl: './contacts-provider.component.html',
  styleUrl: './contacts-provider.component.scss'
})
export class ContactsProviderComponent implements OnInit {
  loader: boolean = false;
  contactsProvider!: FormGroup;
  contacts: any = [];
  clientSelected: any = this.eventManager.clientSelected();

  idProvider: any = 0;

  readonly #modal = inject(NzModalRef);
  readonly nzModalData: any = inject(NZ_MODAL_DATA);


  constructor(private formBuilder: FormBuilder,
    private eventManager: EventManagerService,
    private contact: ContactsProviderServicesService,
    private notificationService: NzNotificationService,
  ) {

    this.createFormContactProvider();

  }


  ngOnInit(): void {
    this.idProvider = this.clientSelected.idProvider;

    this.getContactsByIDProvider(this.idProvider);
  }

  createFormContactProvider() {
    this.contactsProvider = this.formBuilder.group({
      idProvider: [''],
      idContactsProvider: [],
      idOccupation: [''],
      name: ['', Validators.required,],
      SurName: ['', Validators.required,],
      phone: [''],
      email: ['', [Validators.required, Validators.pattern(mailRegexpValidation)]]

    });
  }

  getContactsByIDProvider(idProvider: any) {
    this.contact.getContactById(idProvider).subscribe((data: any) => {
      this.contacts = data.contacts;
      const contactWithOccupation15 = this.contacts.find((contact: any) => contact.idOccupation === 15);
      if (contactWithOccupation15) {

        this.contactsProvider.patchValue(contactWithOccupation15);
      } else {
        console.log("No se encontró ningún contacto con idOccupation 15.");
      }
    });
  }


  submitContactsProvider() {
    if (this.contactsProvider.invalid) {
      Object.values(this.contactsProvider.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.loader = true;

    const docForm: Object = { ...this.contactsProvider.value };
    const payload: any = {
      ...docForm,
      idOccupation: 15,
      idProvider: `${this.idProvider}`,  
    };
    if (payload.idContactsProvider) {      
      this.putContact(payload);

    } else {      
      const { idContactsProvider, ...contact } = payload;
      this.postContact(contact);
    }

  }

  createNotificacion(type: string, title: string, message: string) {
    this.notificationService.create(type, title, message);
  }

  postContact(payload: any) {
    this.contact.addContactsProvider(payload).subscribe({
      next: (res: any) => {
        this.loader = false;
        this.createNotificacion('success', 'Representante legal creado', 'El representante legal se creó correctamente.');
        this.#modal.destroy();
      },
      error: (error: any) => {
        this.loader = false;
        this.createNotificacion('error', 'Error', 'Lo sentimos, hubo un error en el servidor.');
      },
      complete: () => { }
    });
  }


  putContact(payload: any) {

    this.contact.updateContactProvider(payload).subscribe({     
      next: (res: any) => {
        this.loader = false;
        this.createNotificacion('success', 'Representante legal Actualizado', 'El representante legal se actualizo correctamente.');
        this.#modal.destroy();
      },
      error: (error: any) => {
        this.loader = false;
        this.createNotificacion('error', 'Error', 'Lo sentimos, hubo un error en el servidor.');
      },
      complete: () => { }
    });
  }


}
