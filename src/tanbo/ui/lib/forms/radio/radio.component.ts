import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';

import { RadioStateService } from './radio-state.service';
import { attrToBoolean } from '../../utils';

@Component({
  selector: 'ui-input[type=radio]',
  templateUrl: './radio.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: RadioComponent,
    multi: true
  }]
})
export class RadioComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() name: string;
  @Input() value: string = '';
  @Input() forId: string;
  @Input() text: string = '';
  @Input() checkedIcon: string = 'ui-icon-radio-checked';
  @Input() uncheckedIcon: string = 'ui-icon-radio-unchecked';

  @Input()
  @HostBinding('class.ui-disabled')
  set disabled(isDisabled: any) {
    this._disabled = attrToBoolean(isDisabled);
  }

  get disabled() {
    return this._disabled;
  }

  @Input()
  @HostBinding('class.ui-readonly')
  set readonly(isReadonly: any) {
    this._readonly = attrToBoolean(isReadonly);
  }

  get readonly() {
    return this._readonly;
  }

  @Input()
  @HostBinding('class.ui-checked')
  set checked(isChecked: any) {
    this._checked = attrToBoolean(isChecked);
  }

  get checked() {
    return this._checked;
  }

  @Output() uiChange = new EventEmitter<string>();

  @ViewChild('rawInput')
  rawInput: ElementRef;
  sub: Subscription;

  @HostBinding('class.ui-focus')
  focus = false;

  private _disabled: boolean = false;
  private _readonly: boolean = false;
  private _checked: boolean = false;

  private onChange: (_: any) => any;
  private onTouched: () => any;

  constructor(private radioStateService: RadioStateService) {
  }

  @HostListener('click')
  click() {
    if (this.disabled || this.readonly) {
      return;
    }
    this.rawInput.nativeElement.checked = true;
    this.rawInput.nativeElement.focus();
    if (this.onChange) {
      this.onChange(this.value);
    }

    // 当自身被点击时，发布事件，更新其它radio状态
    this.radioStateService.publishEvent();
    this.uiChange.emit(this.value);
  }

  blur() {
    this.focus = false;
    if (this.onTouched) {
      this.onTouched();
    }
  }
  ngOnInit() {
    // 当某一个radio被点击时，更新其它radio状态
    this.sub = this.radioStateService.state.subscribe(() => {
      this.checked = this.rawInput.nativeElement.checked;
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  writeValue(value: any) {
    if (typeof value === 'number') {
      this.checked = this.value === ('' + value);
    } else {
      this.checked = this.value === value;
    }
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
}