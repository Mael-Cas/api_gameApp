# La Boîte à Jeux - Backend

API REST pour l'application La Boîte à Jeux, développée avec Node.js et Express.

## 📁 Structure du Projet

```
backend/
├── controllers/          # Contrôleurs de l'API
│   ├── games.controller.js
│   └── ...
├── middleware/          # Middleware Express
│   ├── acessManager.js
│   └── ...
├── routers/            # Routes de l'API
│   ├── games.routes.js
│   └── ...
├── database/           # Scripts et schémas de base de données
│   └── schema.sql
├── .env               # Variables d'environnement
├── .gitignore
├── app.js            # Point d'entrée de l'application
├── db.js             # Configuration de la base de données
├── package.json      # Dépendances et scripts
└── README.md         # Ce fichier
```

## 🚀 Prérequis

- Node.js (version 14 ou supérieure)
- npm ou yarn
- MySQL (version 8.0 ou supérieure)
- Un client MySQL (MySQL Workbench, phpMyAdmin, etc.)

## 💻 Installation

1. **Installer Node.js**
   - Téléchargez et installez Node.js depuis [nodejs.org](https://nodejs.org/)
   - Vérifiez l'installation :
     ```bash
     node --version
     npm --version
     ```

2. **Installer MySQL**
   - Téléchargez et installez MySQL depuis [mysql.com](https://www.mysql.com/downloads/)
   - Vérifiez l'installation :
     ```bash
     mysql --version
     ```

3. **Cloner le projet**
   ```bash
   git clone https://github.com/votre-username/api_gameApp.git
   cd api_gameApp
   ```

4. **Installer les dépendances**
   ```bash
   npm install
   # ou
   yarn install
   ```

5. **Configuration de la base de données**
   - Créez une base de données MySQL :
     ```sql
     CREATE DATABASE la_boite_a_jeux;
     ```
   - Importez le schéma :
     ```bash
     mysql -u votre_utilisateur -p la_boite_a_jeux < database/schema.sql
     ```

6. **Configuration des variables d'environnement**
   - Copiez le fichier `.env.example` en `.env`
   - Modifiez les variables selon votre configuration :
     ```
     DB_HOST=localhost
     DB_PORT=3306
     DB_USER=votre_utilisateur
     DB_PASSWORD=votre_mot_de_passe
     DB_NAME=la_boite_a_jeux
     PORT=3000
     JWT_SECRET=votre_secret_jwt
     ```

## 🚀 Lancement du Serveur

1. **Mode développement**
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

2. **Mode production**
   ```bash
   npm start
   # ou
   yarn start
   ```

Le serveur sera accessible à l'adresse `http://localhost:3000`

## 📚 Documentation de l'API

### Endpoints Principaux

#### Jeux
- `GET /games` - Liste tous les jeux (paginé)
- `GET /games/:id` - Récupère un jeu par son ID
- `POST /games` - Crée un nouveau jeu
- `PUT /games/:id` - Met à jour un jeu
- `DELETE /games/:id` - Supprime un jeu
- `GET /games/search` - Recherche des jeux par nom
- `POST /games/filter` - Filtre les jeux selon différents critères

#### Utilisateurs
- `POST /users/register` - Inscription d'un nouvel utilisateur
- `POST /users/login` - Connexion d'un utilisateur
- `GET /users/profile` - Récupère le profil de l'utilisateur connecté

## 🔧 Configuration

### Variables d'Environnement

| Variable | Description | Valeur par défaut |
|----------|-------------|------------------|
| DB_HOST | Hôte de la base de données | localhost |
| DB_PORT | Port de la base de données | 3306 |
| DB_USER | Utilisateur MySQL | root |
| DB_PASSWORD | Mot de passe MySQL | |
| DB_NAME | Nom de la base de données | la_boite_a_jeux |
| PORT | Port du serveur | 3000 |
| JWT_SECRET | Clé secrète pour JWT | |

### Base de Données

Le schéma de la base de données est défini dans `database/schema.sql`. Il inclut :
- Tables principales (Games, Users, etc.)
- Tables de relations avec contraintes ON DELETE CASCADE
- Index et clés étrangères

## 🛠 Développement

### Commandes Utiles

```bash
# Démarrer en mode développement avec nodemon
npm run dev

# Démarrer en mode production
npm start

# Lancer les tests
npm test

# Linter le code
npm run lint
```

### Débogage

- Utilisez `console.log()` pour le débogage
- Les logs sont affichés dans la console
- Les erreurs sont loggées avec stack trace

## 📦 Déploiement

### Préparation

1. **Build de l'application**
   ```bash
   npm run build
   ```

2. **Vérification des variables d'environnement**
   - Assurez-vous que toutes les variables sont configurées
   - Vérifiez les accès à la base de données

### Déploiement sur un Serveur

1. **Installation des dépendances de production**
   ```bash
   npm install --production
   ```

2. **Démarrage du serveur**
   ```bash
   npm start
   ```

### Utilisation de PM2 (recommandé)

```bash
# Installation de PM2
npm install -g pm2

# Démarrage de l'application
pm2 start app.js --name "la-boite-a-jeux"

# Surveillance
pm2 monit

# Logs
pm2 logs
```

## 🔒 Sécurité

- Utilisation de JWT pour l'authentification
- Validation des entrées utilisateur
- Protection contre les injections SQL
- Gestion des CORS
- Rate limiting

## 🤝 Contribution

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Auteurs

- Laura Donato
- Maël Castellan
- Adem Mamouni
- Rémi Desjardins

## 📞 Support

Pour toute question ou problème, veuillez ouvrir une issue sur GitHub. 