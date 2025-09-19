import { FormGroup } from '@angular/forms';
import { BaseViewModel } from '../../internal/base.viewmodel';
import { ContactUsSM } from '../../service-models/app/v1/contact-us-s-m';



export class ContactUsViewModel extends BaseViewModel {
  TestmonialFormData: ContactUsSM = new ContactUsSM();
  ContactUsForm!: FormGroup;
  ContactUsId: number = 0;
  ContactUsList :ContactUsSM [] = [];
  showAddModal = false;
  showEditModal = false;
  fileName: string = '';
  updateMode: boolean = false;
    filteredContactUs: ContactUsSM[] = [];
    searchTerm = '';
    sortField = 'name';
    sortDirection: 'asc' | 'desc' = 'asc';
}