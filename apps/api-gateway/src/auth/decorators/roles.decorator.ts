/**
 * Décorateur pour spécifier les rôles requis sur une route
 * 
 * Usage:
 * @Roles('admin', 'hr_manager')
 * @Get('sensitive-data')
 * getSensitiveData() { ... }
 */

import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);