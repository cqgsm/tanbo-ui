import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { transition, trigger, style, animate, keyframes } from '@angular/animations';
import { Subscription } from 'rxjs';

import { ModalController } from './modal-controller';

@Component({
  selector: 'ui-modal-base',
  templateUrl: './modal-base.component.html',
  animations: [
    trigger('modalAnimation', [
      transition(':enter', animate('.1s', keyframes([
        style({
          marginTop: -300,
          opacity: 0,
          offset: 0
        }),
        style({
          marginTop: 0,
          opacity: 1,
          offset: 1
        })
      ]))),
      transition(':leave', animate(100, keyframes([
        style({
          marginTop: 0,
          opacity: 1,
          offset: 0
        }),
        style({
          marginTop: -300,
          opacity: 0,
          offset: 1
        })
      ])))
    ])
  ]
})
export class ModalBaseComponent implements OnDestroy, OnInit {
  templates: Array<TemplateRef<any>> = [];

  get isShow() {
    return this.templates.length > 0;
  }

  private subs: Subscription[] = [];

  constructor(private modalController: ModalController) {
  }

  ngOnInit() {
    this.subs.push(this.modalController.template.subscribe(template => {
      this.templates.push(template);
    }));
    this.subs.push(this.modalController.onHide.subscribe(template => {
      if (template) {
        const index = this.templates.indexOf(template);
        if (index > -1) {
          this.templates.splice(index, 1);
        }
      } else {
        this.templates.pop();
      }
    }));
  }

  ngOnDestroy() {
    this.subs.forEach(item => item.unsubscribe());
    this.templates = [];
  }
}