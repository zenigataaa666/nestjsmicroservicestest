/**
 * Controller REST pour l'authentification
 * 
 * Expose les endpoints HTTP pour le frontend
 */

import {
    Controller,
    Post,
    Body,
    UseGuards,
    Get,
    Req,
    HttpCode,
    HttpStatus,
    HttpException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /**
     * POST /api/v1/auth/login
     * Connexion utilisateur
     */
    @Post('login')
    @Public()
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 5, ttl: 60000 } }) // Max 5 tentatives par minute
    @ApiOperation({
        summary: 'Connexion utilisateur',
        description: 'Authentification par email/password (DB locale ou LDAP)'
    })
    @ApiResponse({
        status: 200,
        description: 'Connexion réussie',
        schema: {
            example: {
                access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                token_type: 'Bearer',
                expires_in: 86400,
                user: {
                    id: 'uuid',
                    username: 'john_doe',
                    email: 'user@example.com',
                    first_name: 'John',
                    last_name: 'Doe',
                    full_name: 'John Doe',
                    roles: ['user'],
                    permissions: ['employees.read']
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Identifiants invalides' })
    async login(@Body() loginDto: LoginDto) {
        try {
            return await this.authService.login(loginDto);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Erreur lors de la connexion', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * POST /api/v1/auth/refresh
     * Rafraîchir le token JWT
     */
    @Post('refresh')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Rafraîchir le token JWT',
        description: 'Génère un nouveau token à partir d\'un token valide'
    })
    @ApiResponse({
        status: 200,
        description: 'Token rafraîchi',
        schema: {
            example: {
                access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                token_type: 'Bearer',
                expires_in: 86400
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Token invalide' })
    async refresh(@Req() req) {
        return this.authService.refresh(req.user);
    }

    /**
     * GET /api/v1/auth/me
     * Récupérer le profil utilisateur
     */
    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Profil utilisateur',
        description: 'Récupère les informations de l\'utilisateur connecté'
    })
    @ApiResponse({
        status: 200,
        description: 'Profil récupéré',
        schema: {
            example: {
                id: 'uuid',
                username: 'john_doe',
                email: 'john@example.com',
                first_name: 'John',
                last_name: 'Doe',
                full_name: 'John Doe',
                roles: ['user'],
                permissions: ['employees.read']
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Non authentifié' })
    async getProfile(@Req() req) {
        return req.user;
    }

    /**
     * POST /api/v1/auth/logout
     * Déconnexion
     */
    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Déconnexion',
        description: 'Invalide la session utilisateur'
    })
    @ApiResponse({
        status: 200,
        description: 'Déconnexion réussie',
        schema: {
            example: {
                message: 'Déconnexion réussie'
            }
        }
    })
    async logout(@Req() req) {
        return this.authService.logout(req.user.id);
    }
}