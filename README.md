# Roadmapper

![Logo Roadmapper](https://via.placeholder.com/200x80?text=Roadmapper)

## 📝 Présentation

**Roadmapper** est une application web permettant de créer et organiser des parcours d'apprentissage personnalisés. Que vous souhaitiez apprendre un langage de programmation, maîtriser un framework ou explorer un nouveau domaine, cette application vous permet de structurer votre apprentissage en étapes claires et organisées.

L'application permet aux utilisateurs de :
- Créer des roadmaps personnalisées par catégorie (Langages, Frameworks, etc.)
- Ajouter des étapes d'apprentissage avec descriptions détaillées
- Réorganiser les étapes selon vos besoins (déplacer vers le haut/bas)
- Suivre votre progression à travers différents parcours d'apprentissage

## ✨ Fonctionnalités

### Gestion des utilisateurs
- Inscription et connexion sécurisées
- Session persistante avec vérification d'authentification
- Profil utilisateur avec accès à toutes ses roadmaps

### Gestion des roadmaps
- Création de nouvelles roadmaps avec nom, catégorie et description
- Organisation des roadmaps par catégories dans la barre latérale
- Compteur indiquant le nombre d'items dans chaque roadmap
- Recherche parmi vos roadmaps existantes

### Gestion des items (étapes)
- Ajout d'items avec titre et description détaillée
- Modification et suppression d'items
- Réorganisation des items avec des boutons haut/bas
- Affichage chronologique avec date de création

## 🏗️ Architecture technique

L'application est construite selon une architecture client-serveur classique :

### Frontend
- Interface utilisateur développée en React avec TypeScript
- Utilisation de React Router pour la navigation
- État global géré via React Context API
- Composants UI modulaires et réutilisables
- Communication avec le backend via API REST

### Backend
- API RESTful développée en PHP
- Architecture MVC pour une meilleure organisation du code
- Gestion de l'authentification via sessions PHP
- Modèles pour la manipulation des données (Roadmap, Item, User)
- Base de données MySQL pour le stockage persistant

## 🔧 Installation

### Prérequis
- PHP 7.4 ou supérieur
- MySQL 5.7 ou supérieur
- Node.js 14 ou supérieur
- npm ou yarn
- Serveur web (Apache, Nginx, etc.)

### Configuration de la base de données
1. Créez une base de données MySQL
2. Importez le schéma de base de données depuis `Backend/db.sql`
3. Configurez les paramètres de connexion dans `Backend/config/config.php`

### Installation du backend
1. Clonez ce dépôt : `git clone https://github.com/votre-utilisateur/roadmapper.git`
2. Placez le dossier `Backend` dans votre serveur web
3. Assurez-vous que les permissions sont correctement configurées

### Installation du frontend
1. Accédez au dossier Frontend : `cd Frontend`
2. Installez les dépendances : `npm install` ou `yarn install`
3. Configurez l'URL de l'API dans `src/utils/apiUtils.ts` si nécessaire
4. Lancez l'application en développement : `npm run dev` ou `yarn dev`
5. Pour la production, construisez l'application : `npm run build` ou `yarn build`

## 🚀 Utilisation

### Création d'un compte
1. Accédez à la page d'inscription
2. Remplissez le formulaire avec votre nom d'utilisateur, email et mot de passe
3. Connectez-vous avec vos identifiants

### Création d'une roadmap
1. Cliquez sur le bouton "+" dans la barre latérale
2. Renseignez le nom, la catégorie et la description de votre roadmap
3. Validez pour créer votre roadmap

### Ajout d'items à une roadmap
1. Accédez à votre roadmap depuis la barre latérale
2. Cliquez sur "Ajouter une étape"
3. Renseignez le titre et la description de l'étape
4. Réorganisez vos items avec les flèches haut/bas si nécessaire

## 📂 Structure du projet

```
roadmapper/
├── Backend/
│   ├── api/                  # Endpoints de l'API REST
│   ├── config/               # Configuration (BDD, sessions, CORS)
│   ├── models/               # Modèles de données
│   └── db.sql                # Schéma de la base de données
│
└── Frontend/
    ├── public/               # Ressources statiques
    └── src/
        ├── components/       # Composants UI réutilisables
        ├── context/          # Contextes React (Auth, etc.)
        ├── Main/             # Composants de la page principale
        └── utils/            # Utilitaires et fonctions d'aide
```

## 💻 Technologies utilisées

### Frontend
- **React** : Bibliothèque UI pour construire l'interface
- **TypeScript** : Typage statique pour une meilleure qualité de code
- **React Router** : Navigation entre les pages
- **Tailwind CSS** : Framework CSS pour le stylage
- **Lucide Icons** : Icônes modernes pour l'interface

### Backend
- **PHP** : Langage de programmation côté serveur
- **MySQL** : Système de gestion de base de données relationnelle
- **PDO** : Couche d'abstraction pour l'accès à la base de données

## 🔐 Sécurité

L'application implémente plusieurs mesures de sécurité :
- Hachage des mots de passe avec bcrypt
- Protection contre les injections SQL via PDO et requêtes préparées
- Validation des données côté serveur
- Régénération des ID de session pour prévenir les attaques par fixation de session
- Protection CORS configurée
- Nettoyage des données avec htmlspecialchars

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :
1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add some amazing feature'`)
4. Poussez vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus d'informations.

---

Développé avec ❤️ par [Votre Nom] 
