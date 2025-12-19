# 🔐 Guide de Configuration AuthManager

## 📋 Architecture de la Base de Données

### Structure des Relations

```
credentials (1) ←──→ (N) users (N) ←──→ (N) roles (N) ←──→ (N) permissions
```

**Logique :**
- Un `credential` peut avoir plusieurs `users` (ex: un email LDAP peut être lié à plusieurs comptes)
- Un `user` a **1 seul** `credential` (relation ManyToOne)
- Un `user` peut avoir plusieurs `roles` (Many-to-Many)
- Un `role` peut avoir plusieurs `permissions` (Many-to-Many)

## 🚀 Installation et Configuration

### 1. Créer la Base de Données

```bash
# Se connecter à MySQL
mysql -u root -p

# Exécuter le script de création
source /chemin/vers/auth_manager_db.sql
```

### 2. Insérer les Données de Test

```bash
# Exécuter le script de seed
mysql -u root -p auth_manager_db < seed_data.sql
```

### 3. Configurer les Variables d'Environnement

```bash
# .env à la racine du monorepo

# AuthManager Database
AUTH_DB_HOST=localhost
AUTH_DB_PORT=3306
AUTH_DB_USERNAME=root
AUTH_DB_PASSWORD=votre_password
AUTH_DB_DATABASE=auth_manager_db

# JWT
JWT_SECRET=votre-secret-jwt-super-securise-256-bits-minimum
JWT_EXPIRATION=24h

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Ports
AUTH_PORT=3001
PORT=3000

# LDAP (optionnel)
LDAP_URL=ldap://votre-serveur-ldap:389
LDAP_BASE_DN=dc=example,dc=com
LDAP_BIND_DN=cn=admin,dc=example,dc=com
LDAP_BIND_PASSWORD=admin_password

# Environment
NODE_ENV=development
```

### 4. Installer les Dépendances

```bash
npm install bcrypt
npm install ldapauth-fork
npm install @nestjs/jwt
npm install @nestjs/passport passport passport-jwt
npm install @types/passport-jwt -D
```

### 5. Générer un Hash de Mot de Passe

```javascript
// generate-password.js
const bcrypt = require('bcrypt');

const password = 'Password123!';
bcrypt.hash(password, 10).then(hash => {
  console.log('Hash:', hash);
});

// Exécuter : node generate-password.js
```

## 🧪 Tests de l'Authentification

### Démarrer les Services

```bash
# Terminal 1 : Démarrer Redis
redis-server

# Terminal 2 : Démarrer AuthManager
npm run start:auth

# Terminal 3 : Démarrer API Gateway
npm run start:gateway
```

### Test 1 : Login Base de Données

```bash
# Login Admin
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Password123!",
    "base": "db"
  }'

# Réponse attendue :
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 86400,
  "user": {
    "id": "user-001",
    "email": "admin@example.com",
    "first_name": "Admin",
    "last_name": "System",
    "full_name": "Admin System",
    "roles": ["admin"],
    "permissions": [
      "employees.read",
      "employees.write",
      "employees.delete",
      "departments.read",
      ...
    ],
    "department": "IT"
  }
}
```

### Test 2 : Vérifier le Profil

```bash
# Remplacer YOUR_TOKEN par le token reçu
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Réponse : Même structure que dans le login
```

### Test 3 : Refresh Token

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Authorization: Bearer $TOKEN"

# Réponse :
{
  "access_token": "nouveau_token...",
  "token_type": "Bearer",
  "expires_in": 86400
}
```

### Test 4 : Logout

```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer $TOKEN"

# Réponse :
{
  "message": "Déconnexion réussie"
}
```

### Test 5 : Login LDAP (si configuré)

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "votre.username",
    "password": "votre_password_ldap",
    "base": "ldap"
  }'
```

## 👥 Comptes de Test Disponibles

| Email | Mot de Passe | Rôle | Permissions |
|-------|--------------|------|-------------|
| admin@example.com | Password123! | admin | Toutes |
| hr@example.com | Password123! | hr_manager | Employés, Départements |
| events@example.com | Password123! | event_manager | Événements |
| catalog@example.com | Password123! | catalog_manager | Catalogue |
| user@example.com | Password123! | user | Lecture seule |

## 🔍 Debugging

### Vérifier la Connexion Redis

```bash
redis-cli ping
# Doit retourner : PONG

# Surveiller les messages
redis-cli MONITOR
```

### Vérifier les Logs AuthManager

```bash
# Si PM2
pm2 logs auth-manager

# En développement
# Les logs apparaissent dans le terminal
```

### Vérifier la Base de Données

```sql
-- Lister tous les users avec leurs rôles
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    u.is_active,
    c.base as auth_type,
    GROUP_CONCAT(r.name) as roles
FROM users u
LEFT JOIN credentials c ON c.id = u.credential_id
LEFT JOIN users_roles ur ON ur.user_id = u.id
LEFT JOIN roles r ON r.id = ur.role_id
GROUP BY u.id;

-- Vérifier les permissions d'un rôle
SELECT 
    r.name as role,
    p.name as permission,
    p.resource,
    p.action
FROM roles r
JOIN roles_permissions rp ON rp.role_id = r.id
JOIN permissions p ON p.id = rp.permission_id
WHERE r.name = 'admin';
```

## 🛠️ Résolution de Problèmes

### Problème : "Identifiants invalides"

**Causes possibles :**
1. Mot de passe incorrect
2. Hash bcrypt invalide
3. Credential désactivé (is_active = 0)
4. User désactivé (is_active = 0)
5. Email incorrect

**Solution :**
```sql
-- Vérifier le credential
SELECT * FROM credentials WHERE email = 'admin@example.com';

-- Vérifier l'utilisateur
SELECT * FROM users WHERE email = 'admin@example.com';

-- Regénérer le hash
-- const bcrypt = require('bcrypt');
-- bcrypt.hash('Password123!', 10).then(console.log);

-- Mettre à jour
UPDATE credentials 
SET password = 'nouveau_hash_ici' 
WHERE email = 'admin@example.com';
```

### Problème : "Service d'authentification indisponible"

**Causes :**
- AuthManager n'est pas démarré
- Redis n'est pas démarré
- Problème de connexion Redis

**Solution :**
```bash
# Vérifier Redis
sudo systemctl status redis-server
redis-cli ping

# Vérifier AuthManager
pm2 status
# ou
ps aux | grep auth-manager

# Redémarrer
pm2 restart auth-manager
```

### Problème : "Token invalide ou expiré"

**Causes :**
- Token expiré (>24h)
- JWT_SECRET différent entre génération et validation
- Token malformé

**Solution :**
```bash
# Vérifier le JWT_SECRET dans .env
# Doit être identique partout

# Relancer l'authentification pour obtenir un nouveau token
```

### Problème : LDAP ne fonctionne pas

**Vérifier :**
```bash
# Tester la connexion LDAP
ldapsearch -x -H ldap://votre-serveur:389 \
  -D "cn=admin,dc=example,dc=com" \
  -w admin_password \
  -b "dc=example,dc=com" \
  "(mail=user@example.com)"
```

**Configuration courante Active Directory :**
```env
LDAP_URL=ldap://ad-server.company.com:389
LDAP_BASE_DN=dc=company,dc=com
LDAP_BIND_DN=cn=Service Account,ou=Users,dc=company,dc=com
LDAP_BIND_PASSWORD=service_password
```

## 📊 Monitoring Production

### Health Checks

```bash
# AuthManager
curl http://localhost:3001/health

# API Gateway
curl http://localhost:3000/health
```

### Logs avec PM2

```bash
# Tous les logs
pm2 logs

# Logs spécifiques
pm2 logs auth-manager --lines 100

# Logs d'erreur uniquement
pm2 logs auth-manager --err
```

### Métriques

```bash
# Stats PM2
pm2 describe auth-manager

# Monitoring temps réel
pm2 monit
```

## 🔐 Sécurité en Production

### 1. JWT Secret Fort

```bash
# Générer un secret sécurisé
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. HTTPS Obligatoire

```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Force HTTPS
    add_header Strict-Transport-Security "max-age=31536000" always;
}
```

### 3. Rate Limiting

Déjà configuré dans l'API Gateway (100 req/min)

### 4. Rotation des Tokens

```typescript
// Implémenter dans AuthService
// Invalider les tokens après X temps
// Utiliser Redis pour blacklist
```

### 5. Audit des Connexions

```sql
-- Ajouter une table d'audit
CREATE TABLE audit_logins (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  email VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  success BOOLEAN,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 📚 Ressources

- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [Passport JWT](http://www.passportjs.org/packages/passport-jwt/)
- [bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)
- [LDAP Auth Fork](https://github.com/vesse/node-ldapauth-fork)

## ✅ Checklist de Déploiement

- [ ] Base de données créée et configurée
- [ ] Variables d'environnement configurées
- [ ] JWT_SECRET sécurisé (64+ caractères)
- [ ] Redis installé et démarré
- [ ] AuthManager démarré et fonctionnel
- [ ] API Gateway démarrée et fonctionnelle
- [ ] Tests d'authentification passés
- [ ] HTTPS configuré (production)
- [ ] Rate limiting activé
- [ ] Logs et monitoring en place
- [ ] Backup de la base de données configuré