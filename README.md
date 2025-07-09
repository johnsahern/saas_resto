# Table - Application de Gestion de Restaurant

Une application web moderne pour la gestion de restaurants avec authentification différenciée pour les propriétaires et les managers.

## Fonctionnalités

- Authentification différenciée (propriétaires et managers)
- Sélection de restaurant pour les propriétaires
- Connexion par code pour les managers
- Gestion des restaurants et des managers
- Interface utilisateur moderne et réactive

## Prérequis

- Node.js (v16 ou supérieur)
- PostgreSQL (v12 ou supérieur)
- npm ou yarn

## Installation

1. Cloner le dépôt :
   ```bash
   git clone https://github.com/votre-username/table.git
   cd table
   ```

2. Installer les dépendances du frontend :
   ```bash
   npm install
   ```

3. Installer les dépendances du backend :
   ```bash
   cd backend
   npm install
   ```

4. Configurer la base de données :
   - Créer une base de données PostgreSQL nommée `table_db`
   - Copier le fichier `.env.example` en `.env` et configurer les variables

5. Initialiser la base de données :
   ```bash
   cd backend
   npm run setup
   ```

## Démarrage

1. Démarrer le backend :
   ```bash
   cd backend
   npm run dev
   ```

2. Dans un autre terminal, démarrer le frontend :
   ```bash
   cd ..
   npm run dev
   ```

3. Accéder à l'application :
   - Frontend : http://localhost:5173
   - Backend : http://localhost:3000

## Comptes de test

### Propriétaire
- Email : owner@example.com
- Mot de passe : password123

### Managers
- Email : manager@bistrot-parisien.com
- Mot de passe : manager123

- Email : manager@trattoria.com
- Mot de passe : manager123

Les codes des restaurants sont générés automatiquement lors de l'initialisation de la base de données.

## Structure du projet

```
table/
├── src/                # Frontend React
│   ├── components/     # Composants React
│   ├── pages/         # Pages de l'application
│   ├── hooks/         # Hooks personnalisés
│   └── utils/         # Utilitaires
├── backend/           # Backend Express
│   ├── src/          # Code source
│   │   ├── config/   # Configuration
│   │   ├── routes/   # Routes API
│   │   ├── controllers/ # Contrôleurs
│   │   └── middleware/ # Middleware
│   └── scripts/      # Scripts de migration et seed
└── README.md
```

## Technologies utilisées

### Frontend
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Router
- Vite

### Backend
- Node.js
- Express
- TypeScript
- PostgreSQL
- JWT
- bcrypt

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.
