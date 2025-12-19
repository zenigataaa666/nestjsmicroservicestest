# 🏗️ IGPP Microservices Architecture

Ce projet est une architecture microservices robuste basée sur **NestJS**, utilisant **gRPC** pour la communication inter-services et une **API Gateway** comme point d'entrée unique.

## 🚀 Architecture Globale

Le projet est structuré en monorepo contenant trois applications principales :

1.  **API Gateway** (`apps/api-gateway`)
    *   Point d'entrée REST pour les clients (Frontend, Mobile).
    *   Gestion de l'authentification (JWT) et des autorisations (RBAC).
    *   Documentation Swagger centralisée.
    *   Redirection des requêtes vers les microservices via gRPC.

2.  **Auth Manager** (`apps/auth-manager`)
    *   Microservice gRPC.
    *   Gestion des utilisateurs, rôles et permissions.
    *   Génération et validation des tokens (Access & Refresh Tokens).
    *   Stockage : PostgreSQL (Users/Roles) + Redis (Refresh Tokens/Blacklist).

3.  **Manage Employees** (`apps/manage-employees`)
    *   Microservice gRPC.
    *   Gestion des employés et de l'organigramme (départements).
    *   Stockage : PostgreSQL.

---

## 🛠️ Prérequis

Assurez-vous d'avoir installé :
*   **Node.js** (v18+)
*   **Docker** & **Docker Compose** (pour la base de données et Redis)
*   **PostgreSQL** (si non dockerisé)
*   **Redis** (si non dockerisé)

---

## 📦 Installation

1.  Cloner le projet :
    ```bash
    git clone <votre-repo>
    cd nestjs-monorepo-microservices
    ```

2.  Installer les dépendances :
    ```bash
    npm install
    ```

3.  Configurer les variables d'environnement :
    *   Copier le fichier `.env.example` en `.env` (à créer si inexistant) et remplir les variables nécessaires (Database, Redis, JWT Secret, Ports gRPC).

---

## ▶️ Démarrage

### Mode Développement

Vous pouvez lancer tous les services en parallèle avec une seule commande :

```bash
npm run start:all
```

Ou lancer chaque service individuellement dans des terminaux séparés :

```bash
# Terminal 1 : Auth Service (gRPC)
npm run start:auth

# Terminal 2 : Employees Service (gRPC)
npm run start:employees

# Terminal 3 : API Gateway (HTTP Proxy)
npm run start:gateway
```

### Initialisation des Données (Seeding)

Pour initialiser la base de données avec les rôles (Admin, HR Manager) et un utilisateur administrateur par défaut :

```bash
npm run seed:auth
```

*   **Compte Admin par défaut** : défini dans `apps/auth-manager/src/database/seeders/credentials.seeder.ts` (vérifiez les logs lors du seed).

---

## 📚 Documentation API (Swagger)

Une fois l'API Gateway démarrée, la documentation interactive est accessible à l'adresse :

👉 **http://localhost:3000/api/docs**

Vous y trouverez tous les endpoints disponibles, les schémas DTO et pourrez tester les requêtes directement.

---

## 🔐 Gestion des Permissions (RBAC)

Le système utilise un contrôle d'accès basé sur les rôles (RBAC) :

*   **Admin (`admin`)** : Accès complet à toutes les ressources (Gestion Utilisateurs, Employés, Départements).
*   **RH Manager (`hr_manager`)** :
    *   *Employés* : Création, Lecture, Modification (Pas de suppression).
    *   *Départements* : Lecture, Modification (Pas de création ni suppression).
*   **User (`user`)** : Accès basique (lecture seule sur son propre profil).

L'authentification se fait via **Bearer Token (JWT)**. Le token contient les rôles de l'utilisateur, vérifiés par le `RolesGuard` de l'API Gateway.

---

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests E2E
npm run test:e2e
```

## 📝 Bonnes Pratiques

*   **Code Style** : Le projet suit les standards NestJS et utilise `eslint` + `prettier`.
*   **Communication** : Les DTOs de l'API Gateway utilisent le `camelCase` (standard JS/JSON), tandis que les communications internes gRPC et la base de données privilégient le `snake_case`. La conversion est gérée automatiquement.
*   **Sécurité** : `Helmet` et `CORS` sont activés sur la Gateway. Les mots de passe sont hashés avec `bcrypt`.

---

**Auteur** : Ron SAVAGE
