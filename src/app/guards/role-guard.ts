import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth)
  const router = inject(Router)

  const requiredRoles = route.data['roles'] as string[]
  if (!authService.isAuthenticated()) {
    router.navigate(['/login'])
    return false
  }
  if (authService.hasRole(requiredRoles)) {
    return true;
  }

  // Si no tiene el rol, redirigir según su rol actual
  const user = authService.getCurrentUser();
  if (user?.role === 'Admin') {
    router.navigate(['/admin']);
  } else {
    router.navigate(['/user']);
  }

  return false;
};
