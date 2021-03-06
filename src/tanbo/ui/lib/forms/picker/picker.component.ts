import { Component, EventEmitter, Input, Output, Inject, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { from, Subscription, Observable } from 'rxjs';

import { attrToBoolean } from '../../utils';
import { UI_SELECT_ARROW_CLASSNAME } from '../help';
import { PickerCell } from './picker-help';

@Component({
  selector: 'ui-picker',
  templateUrl: './picker.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: PickerComponent,
    multi: true
  }]
})
export class PickerComponent implements OnDestroy, ControlValueAccessor {
  @Input() position = 'bottomLeft';
  @Input() size: string = '';
  @Input() forId: string;
  @Input() name: string;
  @Input() placeholder: string = '';
  @Input() arrowIconClassName: string = '';
  @Input() format = ',';
  @Input() displayFormat = '/';
  /*tslint:disable*/
  @Input() dataProvide: (cell: PickerCell) => null | PickerCell[] | Promise<null | PickerCell[]> | Observable<null | PickerCell[]>;
  /*tslint:enable*/
  @Input()
  set value(v: PickerCell[]) {
    if (Array.isArray(v)) {
      this._value = v;
    }
  }

  get value() {
    return this._value;
  }

  @Input()
  set disabled(isDisabled: any) {
    this._disabled = attrToBoolean(isDisabled);
  }

  get disabled() {
    return this._disabled;
  }

  @Input()
  set readonly(isReadonly: any) {
    this._readonly = attrToBoolean(isReadonly);
  }

  get readonly() {
    return this._readonly;
  }

  @Input()
  set data(v: PickerCell[]) {
    this.list = [v];
  }

  @Output() uiItemChecked = new EventEmitter<PickerCell>();
  @Output() uiChange = new EventEmitter<PickerCell[]>();

  list: PickerCell[][] = [];
  open = false;

  get text() {
    return this.value.map(item => item.label).join(this.displayFormat);
  }

  focus = false;
  private _disabled: boolean = false;
  private _readonly: boolean = false;
  private _value: PickerCell[] = [];
  private onChange: (_: any) => any;
  private onTouched: () => any;
  private sub: Subscription;

  constructor(@Inject(UI_SELECT_ARROW_CLASSNAME) arrowIcon: string) {
    this.arrowIconClassName = arrowIcon;
  }

  writeValue(value: any) {
    this.value = value;
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  saveItem(item: PickerCell, index: number) {
    this.value.length = index;
    this.value.push(item);
    if (this.onChange) {
      this.onChange(this.value);
    }
    this.uiItemChecked.emit(item);
    this.uiChange.emit(this.value);

    this.list.length = index + 1;
    if (Array.isArray(item.children)) {
      this.list.push(item.children);
      return;
    }
    if (typeof this.dataProvide === 'function') {
      let result = this.dataProvide(item);
      this.sub = from(
        (result instanceof Promise || result instanceof Observable) ?
          result :
          [result]
      ).subscribe(value => {
        if (Array.isArray(value) && value.length) {
          item.children = value;
          this.list.length = index + 1;
          this.list.push(value);
        } else {
          this.open = false;
        }
        Promise.resolve().then(() => {
          this.sub.unsubscribe();
        });
      });
    } else {
      this.open = false;
    }
  }

  toggle() {
    if (this.disabled) {
      return;
    }
    this.focus = true;
    if (this.readonly) {
      return;
    }
    this.open = !this.open;
  }

  escape() {
    this.focus = false;
    this.open = false;
    if (this.onTouched) {
      this.onTouched();
    }
  }

  reset() {
    this.list.length = 1;
    this.value = [];
    if (this.onChange) {
      this.onChange(this.value);
    }
    this.uiChange.emit(this.value);
  }
}