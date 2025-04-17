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
define('HOST', '51.91.12.160:9212');

/**
 * Nom d'utilisateur pour la connexion à la base de données
 * 
 * Cet utilisateur devrait avoir uniquement les privilèges nécessaires
 * au fonctionnement de l'application (principe du moindre privilège)
 */
define('USERNAME', 'malotiaux_axel');

/**
 * Mot de passe pour la connexion à la base de données
 * 
 * ATTENTION: En production, ce mot de passe ne devrait jamais être écrit en dur
 * dans le code source mais plutôt récupéré depuis les variables d'environnement
 */
define('PASSWORD', 'KAduK38cIErG3mUC');

/**
 * Nom de la base de données
 * 
 * Spécifie la base de données à utiliser sur le serveur MySQL
 */
define('DATABASE', 'tests');

/**
 * Configuration supplémentaire recommandée:
 * 
 * Ces constantes supplémentaires pourraient être utiles dans le développement futur:
 * 
 * // Charset à utiliser pour la connexion
 * define('CHARSET', 'utf8mb4');
 * 
 * // Si l'application est en mode production ou développement
 * define('ENV', 'development'); // ou 'production'
 * 
 * // Préfixe des tables (utile pour les installations multi-sites)
 * define('TABLE_PREFIX', 'app_');
 */