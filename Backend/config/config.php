<?php
/**
 * config.php
 * ----------
 * 
 * Fichier de configuration des paramètres de connexion à la base de données.
 * 
 * Ce fichier centralise les constantes nécessaires à la connexion à la base de données,
 * facilitant ainsi la configuration de l'application dans différents environnements
 * (développement, test, production).
 * 
 * IMPORTANT - SÉCURITÉ:
 * Dans un environnement de production:
 * 1. Ce fichier ne devrait PAS être versionné dans un dépôt Git public
 * 2. Les identifiants de connexion devraient être stockés dans des variables d'environnement
 * 3. Utiliser un fichier .env avec une bibliothèque comme vlucas/phpdotenv serait préférable
 * 4. Les droits d'accès à ce fichier devraient être restreints au minimum nécessaire
 * 
 * @author Axel Malotiaux
 * @version 1.0
 */

/**
 * Hôte de la base de données
 * 
 * Format: 'serveur:port' ou simplement 'serveur' si le port est standard (3306)
 * En production, utiliser plutôt: getenv('DB_HOST') ?? 'valeur_par_défaut'
 */
define('HOST', '127.0.0.1');

/**
 * Nom d'utilisateur pour la connexion à la base de données
 * 
 * Cet utilisateur devrait avoir uniquement les privilèges nécessaires
 * au fonctionnement de l'application (principe du moindre privilège)
 */
define('USERNAME', 'root');

/**
 * Mot de passe pour la connexion à la base de données
 * 
 * ATTENTION: En production, ce mot de passe ne devrait jamais être écrit en dur
 * dans le code source mais plutôt récupéré depuis les variables d'environnement
 */
define('PASSWORD', '');

/**
 * Nom de la base de données
 * 
 * Spécifie la base de données à utiliser sur le serveur MySQL
 */
define('DATABASE', 'dbname');
