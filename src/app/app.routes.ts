import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './modules/private/home/home.component';
import { LoginComponent } from './modules/public/login/login.component';
import { authGuard } from './guards/auth.guard';
import { PageNotFoundComponent } from './modules/public/page-not-found/page-not-found.component';
import { ListDocumentsComponent } from './modules/private/documents/list-documents/list-documents.component';
import { NgModule } from '@angular/core';
import { AdminLayoutComponent } from './views/admin-layout/admin-layout.component';

export const routes: Routes = [
   //   PRIVATE ROUTES
   {
      path: 'home',
      component: AdminLayoutComponent,
      children: [ { path: '', component: HomeComponent } ],
      canActivate: [ authGuard ]
   },
   {
      path: 'cargar-documentos/:id',
      component: AdminLayoutComponent,
      children: [ { path: '', component: ListDocumentsComponent } ],
      canActivate: [ authGuard ]
   },
   //   PUBLIC ROUTES
   {
      path: 'login',
      component: LoginComponent
   },
   {
      path: 'page-not-found',
      component: PageNotFoundComponent
   },
   //   DEFAULT ROUTES
   {
      path: '',
      redirectTo: 'login',
      pathMatch: 'full'
   },
   {
      path: '**',
      pathMatch: 'full',
      redirectTo: 'page-not-found'
   }
];

@NgModule({
   imports: [
      RouterModule.forRoot(routes, {
         useHash: true,
         /* Activa las anclas en angular */
         anchorScrolling: 'enabled',
         /* Restaura el scroll a la posición inicial */
         scrollPositionRestoration: 'enabled'
      })
   ],
   exports: [ RouterModule ]
})
export class AppRoutingModule {}
