import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class DashboardService {
    private readonly logger = new Logger(DashboardService.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
    ) { }

    async getStats() {
        this.logger.log('Fetching dashboard stats...');

        const [totalUsers, activeUsers, inactiveUsers] = await Promise.all([
            this.userRepository.count(),
            this.userRepository.count({ where: { is_active: true } }),
            this.userRepository.count({ where: { is_active: false } }),
        ]);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const newUsersLast7Days = await this.userRepository.count({
            where: { created_at: MoreThanOrEqual(sevenDaysAgo) }
        });

        const totalRoles = await this.roleRepository.count();

        // Distribution des rôles (Optimized with QueryBuilder)
        const roleDistributionRaw = await this.roleRepository.createQueryBuilder('role')
            .leftJoin('role.users', 'user')
            .select('role.name', 'role_name')
            .addSelect('COUNT(user.id)', 'count')
            .groupBy('role.id')
            .addGroupBy('role.name')
            .getRawMany();

        const roleDistribution = roleDistributionRaw.map(r => ({
            role_name: r.role_name,
            count: parseInt(r.count, 10)
        }));

        // Activité récente (Fixing "order" error with QueryBuilder)
        const latestUsers = await this.userRepository.createQueryBuilder('user')
            .orderBy('user.created_at', 'DESC')
            .take(5)
            .getMany();

        const recentActivity = latestUsers.map(user => ({
            id: user.id,
            username: user.username,
            action: 'USER_CREATED',
            timestamp: user.created_at.toISOString()
        }));

        this.logger.log('Stats fetched successfully');

        return {
            total_users: totalUsers,
            active_users: activeUsers,
            inactive_users: inactiveUsers,
            new_users_last_7_days: newUsersLast7Days,
            total_roles: totalRoles,
            role_distribution: roleDistribution,
            recent_activity: recentActivity
        };
    }
}
