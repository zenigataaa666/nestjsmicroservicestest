/**
 * Décorateur pour marquer une route comme publique (sans authentification)
 * 
 * Usage:
 * @Public()
 * @Post('login')
 * login() { ... }
 */

import { SetMetadata } from '@nestjs/common';

export const Public = () => SetMetadata('isPublic', true);