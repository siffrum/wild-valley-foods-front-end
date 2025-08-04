import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import {
  LayoutViewModel,
  LoaderInfo,
  layoutVM,
} from '../models/internal/common-models';
import { SweetAlertIcon } from '../models/internal/custom-sweet-alert-options';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommonService extends BaseService {
  layoutViewModel!: LayoutViewModel;
  layoutVM: layoutVM = new layoutVM();
  loaderInfo: LoaderInfo = { message: '', showLoader: false };
  constructor() {
    super();
  }

  async presentLoading(message: string = '') {
    this.loaderInfo = { message, showLoader: true };
  }

  async presentAlert() {}
  async showConfirmationAlert(
    title: string,
    text: string,
    showCancelButton: boolean,
    icon: SweetAlertIcon
  ) {
    let customClass = {
      container: 'container-modifier',
      confirmButton: 'btn btn-success m-3',
      cancelButton: 'btn btn-danger m-3',
      popup: '...',
      title: '...',
      closeButton: '...',
      icon: icon,
      image: '...',
      htmlContainer: '...',
      input: '...',
      validationMessage: '...',
      actions: '...',
      denyButton: '...',
      loader: '...',
      footer: '....',
      timerProgressBar: '....',
    };
    return await this.showSweetAlert({
      customClass,
      title,
      text,
      showCancelButton,
      icon,
      buttonsStyling: false,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    });
    // const swalWithBootstrapButtons = Swal.mixin({
    //   customClass: {
    //     container: "container-modifier",
    //     confirmButton: "btn btn-success m-3",
    //     cancelButton: "btn btn-danger m-3",
    //     popup: "...",
    //     title: "...",
    //     closeButton: "...",
    //     icon: icon,
    //     image: "...",
    //     htmlContainer: "...",
    //     input: "...",
    //     validationMessage: "...",
    //     actions: "...",
    //     denyButton: "...",
    //     loader: "...",
    //     footer: "....",
    //     timerProgressBar: "....",
    //   },
    //   buttonsStyling: false,
    // });
    // let x = await swalWithBootstrapButtons.fire({
    //   title: title,
    //   text: text,
    //   icon: icon,
    //   showCancelButton: showCancelButton,
    //   confirmButtonText: "Yes, delete it!",
    //   cancelButtonText: "No, cancel!",
    // });
    // return x.isConfirmed;
  }
  async ShowToastAtTopEnd(title: string, icon: SweetAlertIcon) {
    this.showSweetAlertToast({ title, icon });
    // const Toast = Swal.mixin({
    //   toast: true,
    //   position: "bottom",
    //   showConfirmButton: false,
    //   timer: 2500,
    //   timerProgressBar: true,
    //   // icon: icon,
    //   didOpen: (toast: any) => {
    //     toast.addEventListener("mouseenter", Swal.stopTimer);
    //     toast.addEventListener("mouseleave", Swal.resumeTimer);
    //   },
    // });
    // Toast.fire({
    //   title: title,
    //   icon: icon,
    // });
  }
  async showInfoOnAlertWindowPopup(
    icon: SweetAlertIcon,
    title: string,
    text: string
  ) {
    let customClass = {
      container: 'container-modifier',
      confirmButton: 'btn btn-success m-3',
      cancelButton: 'btn btn-danger m-3',
      popup: '...',
      title: '...',
      closeButton: '...',
      icon: icon,
      image: '...',
      htmlContainer: '...',
      input: '...',
      validationMessage: '...',
      actions: '...',
      denyButton: '...',
      loader: '...',
      footer: '....',
      timerProgressBar: '....',
    };
    return await this.showSweetAlert({
      customClass,
      title,
      text,
      icon,
      showClass: {
        popup: 'animate__animated animate__fadeInDown',
      },
      html: `<i class="${icon}"></i>${text}`,
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp',
      },
    });

    //   customClass: {
    //     container: "container-modifier",
    //     popup: "...",
    //     title: title,
    //     icon: icon,
    //     image: "...",
    //     htmlContainer: "...",
    //     input: "...",
    //     validationMessage: "...",
    //     actions: "...",
    //     denyButton: "...",
    //     loader: "...",
    //     footer: "....",
    //     timerProgressBar: "....",
    //   },
    // });
    // let x = swal.fire({
    //   icon: icon,
    //   title: title,
    //   text: text,
    //   showClass: {
    //     popup: "animate__animated animate__fadeInDown",
    //   },
    //   html: `<i class="${icon}"></i>${text}`,
    //   hideClass: {
    //     popup: "animate__animated animate__fadeOutUp",
    //   },
    // });
    // return x;
  }

  async showSweetAlert(alertOptions: SweetAlertOptions) {
    // alertOptions.toast = false;
    return (await Swal.fire(alertOptions)).isConfirmed;
  }
  /**Show custom sweet alert*/
  async showSweetAlertConfirmation(alertOptions: SweetAlertOptions) {
    // alertOptions.toast = false;
    return await Swal.fire(alertOptions);
  }

  /** Show a toast message as per options
   * @argument alertOptions Contains the properties of sweet alert like position, timer, text, title etc  */
  async showSweetAlertToast(alertOptions: SweetAlertOptions) {
    alertOptions.toast = true;
    if (!alertOptions.position) alertOptions.position = 'bottom';
    if (!alertOptions.showConfirmButton) alertOptions.showConfirmButton = false;
    if (!alertOptions.timer) alertOptions.timer = 3000;
    if (!alertOptions.timerProgressBar) alertOptions.timerProgressBar = true;
    alertOptions.didOpen = (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    };
    return await Swal.fire(alertOptions);
  }

  async dismissLoader() {
    this.loaderInfo.showLoader = false;
    this.loaderInfo.message = '';
  }

  /**Change Enum value  to string Array*/
  enumToStringArray(enumType: any) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(enumType)
      .filter(StringIsNumber)
      .map((key) => enumType[key]);
  }

  /**Change Enum value to string*/
  singleEnumToString(enumme: any, selectedValue: any) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    var x = Object.keys(enumme)
      .filter(StringIsNumber)
      .map((key) => enumme[key])[selectedValue];
    return x;
  }

  // Convert Doc to Base64
  convertFileToBase64(file: File): Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event: any) =>
      result.next(btoa(event.target.result.toString()));
    return result;
  }
}
