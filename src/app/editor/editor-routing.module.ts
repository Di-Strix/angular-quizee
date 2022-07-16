import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { EditorComponent } from './editor.component';

const routes: Route[] = [
  { path: ':id', component: EditorComponent },
  { path: '', pathMatch: 'full', component: EditorComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditorRoutingModule {}
