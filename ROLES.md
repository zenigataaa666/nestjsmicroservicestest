# Documentation des Rôles et Permissions

Ce document recense les rôles et permissions disponibles dans l'application.

## Rôles Système

| Rôle         | Description                                      | Permissions Clés (Exemples)           |
| :----------- | :----------------------------------------------- | :------------------------------------ |
| **admin**    | Administrateur avec accès complet au système.    | Toutes (`*.manage`, `*.create`, etc.) |
| **hr_manager**| Gestionnaire RH (Ressources Humaines).          | `employees.manage`, `users.read`      |
| **manager**  | Manager d'équipe ou de département.              | `employees.read` (scope limité)       |
| **user**     | Utilisateur standard (Employé self-service).     | `auth.profile`                        |

## Permissions

Les permissions suivent le format `ressource.action`.

### Ressources
- `employees`
- `departments`
- `users`
- `roles`

### Actions
- `create` : Créer une ressource
- `read`   : Lire/Voir une ressource
- `update` : Modifier une ressource
- `delete` : Supprimer une ressource
- `manage` : Accès complet (toutes actions) sur la ressource

### Liste Complète (Générée par Seeder)

#### Employees
- `employees.create`
- `employees.read`
- `employees.update`
- `employees.delete`
- `employees.manage`

#### Departments
- `departments.create`
- `departments.read`
- `departments.update`
- `departments.delete`
- `departments.manage`

#### Users
- `users.create`
- `users.read`
- `users.update`
- `users.delete`
- `users.manage`

#### Roles
- `roles.create`
- `roles.read`
- `roles.update`
- `roles.delete`
- `roles.manage`

## Note sur l'implémentation
Le rôle `admin` est automatiquement créé et mis à jour avec toutes les permissions lors du démarrage de l'application via le `RolesSeeder`.
Les autres rôles (`hr_manager`, `manager`) doivent être créés via l'interface d'administration ou l'API, et les permissions doivent leur être assignées manuellement.
