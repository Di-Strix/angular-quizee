import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', loadChildren: async () => (await import('./home/home.module')).HomeModule },
  { path: 'edit', loadChildren: async () => (await import('./editor/editor.module')).EditorModule },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
