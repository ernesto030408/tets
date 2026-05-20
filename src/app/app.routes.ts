import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { Login } from './components/login/login';
import { Admin } from './components/admin/admin';
import { roleGuard } from './guards/role-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  }, 
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then(m => m.Login)
  }, 
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/admin').then(m => m.Admin),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] },
    children: [
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full'
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./components/share/Users/list-users/list-users')
            .then(m => m.ListUsers)
      },
      {
        path: 'tasks',
        loadComponent: () => 
          import('./components/share/Tasks/list-task/list-task')
            .then(m => m.ListTask)
      },
      {
        path: 'createTask',
        loadComponent: () => 
          import('./components/share/Tasks/create-task/create-task')
            .then(m => m.CreateTask)
      },
      {
        path: 'updateTask/:id',
        loadComponent: () => 
          import('./components/share/Tasks/update-task/update-task')
            .then(m => m.UpdateTask)
      }
    ]
  },
  {
    path: 'user',
    loadComponent: () => import('./components/user/user').then(m => m.User),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['User'] },
    children: [
      {
        path: '',
        redirectTo: 'tasks',
        pathMatch: 'full'
      },
      {
        path: 'tasks',
        loadComponent: () => 
          import('./components/share/Tasks/list-task/list-task')
            .then(m => m.ListTask)
      },
      {
        path: 'createTask',
        loadComponent: () => 
          import('./components/share/Tasks/create-task/create-task')
            .then(m => m.CreateTask)
      },
      {
        path: 'updateTask/:id',
        loadComponent: () => 
          import('./components/share/Tasks/update-task/update-task')
            .then(m => m.UpdateTask)
      }
    ]
  }, 
  {
    path: 'createUser',
    loadComponent: () => import('./components/share/Users/create-user/create-user').then(m => m.CreateUser),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./components/share/Users/update-user/update-user').then(m => m.UpdateUser),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];