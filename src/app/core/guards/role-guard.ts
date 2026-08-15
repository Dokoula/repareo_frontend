import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { RoleUtilisateur } from '../models/user.model';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRoles = route.data?.['roles'] as RoleUtilisateur[] | undefined;

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  if (expectedRoles && expectedRoles.length > 0) {
    const hasPermission = authService.hasRole(expectedRoles);
    if (!hasPermission) {
      authService.redirectByRole();
      return false;
    }
  }

  return true;
};
