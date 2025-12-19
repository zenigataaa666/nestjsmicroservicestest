# API Microservices Documentation

## Authenticaton (`/auth`)
| Méthode | Route              | Description                                      | Rôles Requis |
| :------ | :----------------- | :----------------------------------------------- | :----------- |
| POST    | `/auth/login`      | Connexion utilisateur (email/password ou LDAP).  | Public       |
| GET     | `/auth/profile`    | Récupère le profil de l'utilisateur connecté.    | Authentifié  |
| POST    | `/auth/logout`     | Déconnexion.                                     | Authentifié  |
| POST    | `/auth/refresh`    | Rafraîchissement du token d'accès.               | Authentifié  |

## Utilisateurs (`/users`)
| Méthode | Route              | Description                                      | Rôles Requis        |
| :------ | :----------------- | :----------------------------------------------- | :------------------ |
| GET     | `/users`           | Liste les utilisateurs (pagination, recherche).  | admin, hr_manager   |
| POST    | `/users`           | Créer un nouvel utilisateur.                     | admin, hr_manager   |
| GET     | `/users/:id`       | Détails d'un utilisateur specifique.             | admin, hr_manager   |
| POST    | `/users/:id/roles` | Assigner des rôles à un utilisateur.             | admin, super_admin  |

## Rôles & Permissions (`/roles`)
| Méthode | Route                 | Description                                      | Rôles Requis        |
| :------ | :-------------------- | :----------------------------------------------- | :------------------ |
| GET     | `/roles`              | Liste tous les rôles disponibles.                | admin, super_admin  |
| POST    | `/roles`              | Créer un nouveau rôle.                           | admin, super_admin  |
| PUT     | `/roles/:id/permissions`| Mettre à jour les permissions d'un rôle.       | admin, super_admin  |
| GET     | `/api/v1/permissions` | Récupère la liste de toutes les permissions. | `admin`, `manager`, `hr_manager` |
| GET     | `/roles/permissions`  | Liste toutes les permissions système.            | admin, super_admin  |

## Dashboard
 
| Method | Route | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/auth/dashboard/stats` | Récupère les statistiques globales (utilisateurs, rôles, activité). | `admin`, `manager`, `hr_manager` |

## Employés (`/employees`)
| Méthode | Route                 | Description                                      | Rôles Requis        |
| :------ | :-------------------- | :----------------------------------------------- | :------------------ |
| POST    | `/employees`          | Créer un employé.                                | admin, hr_manager   |
| GET     | `/employees`          | Liste les employés.                              | admin, hr_manager, manager |
| GET     | `/employees/:id`      | Détails d'un employé.                            | admin, hr_manager, manager |
| PUT     | `/employees/:id`      | Mettre à jour un employé.                        | admin, hr_manager   |
| DELETE  | `/employees/:id`      | Supprimer un employé (soft delete).              | admin               |

## Départements (`/departments`)
| Méthode | Route                 | Description                                      | Rôles Requis        |
| :------ | :-------------------- | :----------------------------------------------- | :------------------ |
| POST    | `/departments`        | Créer un département.                            | admin               |
| GET     | `/departments`        | Liste les départements.                          | Authentifié         |
| GET     | `/departments/:id`    | Détails d'un département.                        | Authentifié         |
| PUT     | `/departments/:id`    | Mettre à jour un département.                    | admin               |
| DELETE  | `/departments/:id`    | Supprimer un département.                        | admin               |
