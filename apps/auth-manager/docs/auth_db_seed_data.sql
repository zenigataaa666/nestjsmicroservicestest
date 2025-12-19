-- ============================================================================
-- Script d'insertion de données de test pour AuthManager
-- ============================================================================

USE auth_manager_db;

-- ==================== NETTOYAGE ====================
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE users_roles;
TRUNCATE TABLE roles_permissions;
TRUNCATE TABLE users;
TRUNCATE TABLE credentials;
TRUNCATE TABLE roles;
TRUNCATE TABLE permissions;
SET FOREIGN_KEY_CHECKS = 1;

-- ==================== PERMISSIONS ====================
-- Format: resource.action

INSERT INTO permissions (id, name, resource, action, description, created_at) VALUES
-- Employees
('perm-001', 'employees.read', 'employees', 'read', 'Lire les employés', NOW()),
('perm-002', 'employees.write', 'employees', 'write', 'Créer/Modifier les employés', NOW()),
('perm-003', 'employees.delete', 'employees', 'delete', 'Supprimer les employés', NOW()),

-- Departments
('perm-004', 'departments.read', 'departments', 'read', 'Lire les départements', NOW()),
('perm-005', 'departments.write', 'departments', 'write', 'Créer/Modifier les départements', NOW()),
('perm-006', 'departments.delete', 'departments', 'delete', 'Supprimer les départements', NOW()),

-- Events
('perm-007', 'events.read', 'events', 'read', 'Lire les événements', NOW()),
('perm-008', 'events.write', 'events', 'write', 'Créer/Modifier les événements', NOW()),
('perm-009', 'events.delete', 'events', 'delete', 'Supprimer les événements', NOW()),

-- Catalog
('perm-010', 'assets.read', 'assets', 'read', 'Lire le catalogue', NOW()),
('perm-011', 'assets.write', 'assets', 'write', 'Créer/Modifier le catalogue', NOW()),
('perm-012', 'assets.delete', 'assets', 'delete', 'Supprimer du catalogue', NOW()),

-- Users & Auth
('perm-013', 'users.read', 'users', 'read', 'Lire les utilisateurs', NOW()),
('perm-014', 'users.write', 'users', 'write', 'Créer/Modifier les utilisateurs', NOW()),
('perm-015', 'users.delete', 'users', 'delete', 'Supprimer les utilisateurs', NOW()),
('perm-016', 'roles.manage', 'roles', 'manage', 'Gérer les rôles et permissions', NOW());

-- ==================== RÔLES ====================

INSERT INTO roles (id, name, description, created_at) VALUES
('role-001', 'admin', 'Administrateur système - Accès complet', NOW()),
('role-002', 'hr_manager', 'Gestionnaire RH - Gestion des employés', NOW()),
('role-003', 'event_manager', 'Gestionnaire d\'événements', NOW()),
('role-004', 'catalog_manager', 'Gestionnaire de catalogue', NOW()),
('role-005', 'user', 'Utilisateur standard - Lecture seule', NOW());

-- ==================== ASSOCIATIONS RÔLES-PERMISSIONS ====================

-- Admin : Toutes les permissions
INSERT INTO roles_permissions (id, role_id, permission_id) VALUES
('rp-001', 'role-001', 'perm-001'),
('rp-002', 'role-001', 'perm-002'),
('rp-003', 'role-001', 'perm-003'),
('rp-004', 'role-001', 'perm-004'),
('rp-005', 'role-001', 'perm-005'),
('rp-006', 'role-001', 'perm-006'),
('rp-007', 'role-001', 'perm-007'),
('rp-008', 'role-001', 'perm-008'),
('rp-009', 'role-001', 'perm-009'),
('rp-010', 'role-001', 'perm-010'),
('rp-011', 'role-001', 'perm-011'),
('rp-012', 'role-001', 'perm-012'),
('rp-013', 'role-001', 'perm-013'),
('rp-014', 'role-001', 'perm-014'),
('rp-015', 'role-001', 'perm-015'),
('rp-016', 'role-001', 'perm-016');

-- HR Manager : Employés + Départements + Lecture Users
INSERT INTO roles_permissions (id, role_id, permission_id) VALUES
('rp-017', 'role-002', 'perm-001'),
('rp-018', 'role-002', 'perm-002'),
('rp-019', 'role-002', 'perm-004'),
('rp-020', 'role-002', 'perm-005'),
('rp-021', 'role-002', 'perm-013');

-- Event Manager : Événements complets
INSERT INTO roles_permissions (id, role_id, permission_id) VALUES
('rp-022', 'role-003', 'perm-007'),
('rp-023', 'role-003', 'perm-008'),
('rp-024', 'role-003', 'perm-009');

-- Catalog Manager : Catalogue complet
INSERT INTO roles_permissions (id, role_id, permission_id) VALUES
('rp-025', 'role-004', 'perm-010'),
('rp-026', 'role-004', 'perm-011'),
('rp-027', 'role-004', 'perm-012');

-- User : Lecture seule
INSERT INTO roles_permissions (id, role_id, permission_id) VALUES
('rp-028', 'role-005', 'perm-001'),
('rp-029', 'role-005', 'perm-004'),
('rp-030', 'role-005', 'perm-007'),
('rp-031', 'role-005', 'perm-010');

-- ==================== CREDENTIALS ====================
-- Mot de passe pour tous : Password123!
-- Hash bcrypt (10 rounds)

INSERT INTO credentials (id, email, password, base, is_active, created_at, updated_at) VALUES
-- Admin
('cred-001', 'admin@example.com', '$2b$10$9XhYz4ZrZYq8xJvW8K8NxO0Q1XhYz4ZrZYq8xJvW8K8NxO0Q1XhYz.', 'db', 1, NOW(), NOW()),

-- HR Manager
('cred-002', 'hr@example.com', '$2b$10$9XhYz4ZrZYq8xJvW8K8NxO0Q1XhYz4ZrZYq8xJvW8K8NxO0Q1XhYz.', 'db', 1, NOW(), NOW()),

-- Event Manager
('cred-003', 'events@example.com', '$2b$10$9XhYz4ZrZYq8xJvW8K8NxO0Q1XhYz4ZrZYq8xJvW8K8NxO0Q1XhYz.', 'db', 1, NOW(), NOW()),

-- Catalog Manager
('cred-004', 'catalog@example.com', '$2b$10$9XhYz4ZrZYq8xJvW8K8NxO0Q1XhYz4ZrZYq8xJvW8K8NxO0Q1XhYz.', 'db', 1, NOW(), NOW()),

-- User Standard
('cred-005', 'user@example.com', '$2b$10$9XhYz4ZrZYq8xJvW8K8NxO0Q1XhYz4ZrZYq8xJvW8K8NxO0Q1XhYz.', 'db', 1, NOW(), NOW()),

-- Utilisateur LDAP (sans password)
('cred-006', 'ldap@example.com', NULL, 'ldap', 1, NOW(), NOW());

-- ==================== USERS ====================

INSERT INTO users (id, first_name, last_name, email, phone, department, is_active, credential_id, created_at, updated_at) VALUES
-- Admin
('user-001', 'Admin', 'System', 'admin@example.com', '+241 01 11 11 11', 'IT', 1, 'cred-001', NOW(), NOW()),

-- HR Manager
('user-002', 'Marie', 'Dupont', 'hr@example.com', '+241 01 22 22 22', 'Ressources Humaines', 1, 'cred-002', NOW(), NOW()),

-- Event Manager
('user-003', 'Pierre', 'Martin', 'events@example.com', '+241 01 33 33 33', 'Communication', 1, 'cred-003', NOW(), NOW()),

-- Catalog Manager
('user-004', 'Sophie', 'Bernard', 'catalog@example.com', '+241 01 44 44 44', 'Logistique', 1, 'cred-004', NOW(), NOW()),

-- User Standard
('user-005', 'Jean', 'Durand', 'user@example.com', '+241 01 55 55 55', 'Comptabilité', 1, 'cred-005', NOW(), NOW()),

-- LDAP User
('user-006', 'LDAP', 'User', 'ldap@example.com', NULL, 'IT', 1, 'cred-006', NOW(), NOW());

-- ==================== ASSOCIATIONS USERS-ROLES ====================

INSERT INTO users_roles (id, user_id, role_id) VALUES
-- Admin
('ur-001', 'user-001', 'role-001'),

-- HR Manager
('ur-002', 'user-002', 'role-002'),

-- Event Manager
('ur-003', 'user-003', 'role-003'),

-- Catalog Manager
('ur-004', 'user-004', 'role-004'),

-- User Standard
('ur-005', 'user-005', 'role-005'),

-- LDAP User (role user)
('ur-006', 'user-006', 'role-005');

-- ==================== VÉRIFICATION ====================

-- Vérifier les credentials
SELECT 
    c.email, 
    c.base, 
    c.is_active,
    COUNT(u.id) as nb_users
FROM credentials c
LEFT JOIN users u ON u.credential_id = c.id
GROUP BY c.id;

-- Vérifier les users avec leurs rôles
SELECT 
    u.first_name,
    u.last_name,
    u.email,
    GROUP_CONCAT(r.name SEPARATOR ', ') as roles
FROM users u
LEFT JOIN users_roles ur ON ur.user_id = u.id
LEFT JOIN roles r ON r.id = ur.role_id
GROUP BY u.id;

-- Vérifier les rôles avec leurs permissions
SELECT 
    r.name as role,
    COUNT(rp.permission_id) as nb_permissions,
    GROUP_CONCAT(p.name SEPARATOR ', ') as permissions
FROM roles r
LEFT JOIN roles_permissions rp ON rp.role_id = r.id
LEFT JOIN permissions p ON p.id = rp.permission_id
GROUP BY r.id;

-- ============================================================================
-- COMMANDES UTILES
-- ============================================================================

-- Générer un nouveau hash bcrypt pour un mot de passe
-- Utiliser ce code Node.js :
-- const bcrypt = require('bcrypt');
-- bcrypt.hash('VotreMotDePasse', 10).then(hash => console.log(hash));

-- Exemple de hash pour "Password123!" :
-- $2b$10$CwTycUXWue0Thq9StjUM0uJ8Z8W.rqL.S6f0SJlL.4IlKxK.QqFHW

-- Pour mettre à jour un mot de passe :
-- UPDATE credentials SET password = '$2b$10$...' WHERE email = 'user@example.com';

-- Pour désactiver un utilisateur :
-- UPDATE users SET is_active = 0 WHERE email = 'user@example.com';

-- Pour ajouter un rôle à un utilisateur :
-- INSERT INTO users_roles (id, user_id, role_id) 
-- VALUES (UUID(), 'user-id-here', 'role-id-here');