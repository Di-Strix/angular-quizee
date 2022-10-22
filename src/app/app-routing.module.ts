import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', loadChildren: async () => (await import('./home/home.module')).HomeModule },
  { path: 'edit', loadChildren: async () => (await import('./editor/editor.module')).EditorModule },
  { path: 'solve', loadChildren: async () => (await import('./player/player.module')).PlayerModule },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
