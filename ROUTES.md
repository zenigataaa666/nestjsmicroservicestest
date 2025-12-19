# API Microservices Documentation

## Authenticaton (`/auth`)
| Méthode | Route              | Description                                      | Rôles Requis |
| :------ | :----------------- | :----------------------------------------------- | :----------- |
| POST    | `/api/v1/auth/login`      | Connexion utilisateur (email/password ou LDAP).  | Public       |
| GET     | `/api/v1/auth/profile`    | Récupère le profil de l'utilisateur connecté.    | Authentifié  |
| POST    | `/api/v1/auth/logout`     | Déconnexion.                                     | Authentifié  |
| POST    | `/api/v1/auth/refresh`    | Rafraîchissement du token d'accès.               | Authentifié  |

## Utilisateurs (`/users`)
| Méthode | Route              | Description                                      | Rôles Requis        |
| :------ | :----------------- | :----------------------------------------------- | :------------------ |
| GET     | `/api/v1/users`           | Liste les utilisateurs (pagination, recherche).  | admin, hr_manager   |
| POST    | `/api/v1/users`           | Créer un nouvel utilisateur.                     | admin, hr_manager   |
| GET     | `/api/v1/users/:id`       | Détails d'un utilisateur specifique.             | admin, hr_manager   |
| PUT     | `/api/v1/users/:id`       | Modifier un utilisateur.                         | admin               |
| DELETE  | `/api/v1/users/:id`       | Supprimer un utilisateur.                        | admin               |
| POST    | `/api/v1/users/:id/roles` | Assigner des rôles à un utilisateur.             | admin, super_admin  |

## Rôles & Permissions (`/roles`, `/permissions`)
| Méthode | Route                 | Description                                      | Rôles Requis        |
| :------ | :-------------------- | :----------------------------------------------- | :------------------ |
| GET     | `/api/v1/roles`              | Liste tous les rôles disponibles.                | admin, super_admin  |
| POST    | `/api/v1/roles`              | Créer un nouveau rôle.                           | admin, super_admin  |
| PUT     | `/api/v1/roles/:id/permissions`| Mettre à jour les permissions d'un rôle.       | admin, super_admin  |
| GET     | `/api/v1/permissions` | Récupère la liste de toutes les permissions. | admin |
| POST    | `/api/v1/permissions` | Créer une permission. | admin |
| PUT     | `/api/v1/permissions/:id` | Modifier une permission. | admin |
| DELETE  | `/api/v1/permissions/:id` | Supprimer une permission. | admin |

## Dashboard

| Method | Route | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/auth/dashboard/stats` | Récupère les statistiques globales (utilisateurs, rôles, activité). | `admin`, `manager`, `hr_manager` |

## Employés (`/employees`)
| Méthode | Route                 | Description                                      | Rôles Requis        |
| :------ | :-------------------- | :----------------------------------------------- | :------------------ |
| POST    | `/api/v1/employees`          | Créer un employé.                                | admin, hr_manager   |
| GET     | `/api/v1/employees`          | Liste les employés.                              | admin, hr_manager, manager |
| GET     | `/api/v1/employees/department/:departmentId` | Liste les employés d'un département. | admin, hr_manager |
| GET     | `/api/v1/employees/:id`      | Détails d'un employé.                            | admin, hr_manager, manager |
| PUT     | `/api/v1/employees/:id`      | Mettre à jour un employé.                        | admin, hr_manager   |
| DELETE  | `/api/v1/employees/:id`      | Supprimer un employé (soft delete).              | admin               |

## Départements (`/departments`)
| Méthode | Route                 | Description                                      | Rôles Requis        |
| :------ | :-------------------- | :----------------------------------------------- | :------------------ |
| POST    | `/api/v1/departments`        | Créer un département.                            | admin               |
| GET     | `/api/v1/departments`        | Liste les départements.                          | Authentifié         |
| GET     | `/api/v1/departments/:id`    | Détails d'un département.                        | Authentifié         |
| PUT     | `/api/v1/departments/:id`    | Mettre à jour un département.                    | admin               |
| DELETE  | `/api/v1/departments/:id`    | Supprimer un département.                        | admin               |
