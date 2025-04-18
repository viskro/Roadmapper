<?php
/**
 * session_cors.php
 * ----------------
 * Fichier de configuration centralisé pour la gestion des sessions et des en-têtes CORS.
 * 
 * Ce fichier constitue une pierre angulaire de la sécurité de l'application en:
 * 1. Configurant correctement les sessions PHP pour garantir leur persistance
 * 2. Définissant les en-têtes CORS pour permettre la communication sécurisée entre frontend et backend
 * 3. Fournissant des fonctions utilitaires pour vérifier l'authentification et formater les réponses
 * 
 * Il doit être inclus au début de chaque API pour assurer une cohérence dans la gestion
 * des sessions et la sécurité des échanges cross-origin.
 */

//======================================================
// CONFIGURATION DES SESSIONS
//======================================================

/**
 * Configuration de la durée de vie des cookies et des sessions
 * 
 * Ces paramètres déterminent combien de temps un utilisateur reste connecté avant
 * que sa session n'expire automatiquement.
 * 
 * - session.cookie_lifetime: durée pendant laquelle le cookie de session reste valide dans le navigateur
 * - session.gc_maxlifetime: durée maximale d'inactivité avant que la session ne soit détruite
 * - session.cookie_samesite: protection contre les attaques CSRF (Cross-Site Request Forgery)
 *   'Lax' est un bon compromis entre sécurité et facilité d'utilisation (compatible avec la plupart des navigateurs)
 */
ini_set('session.cookie_lifetime', 60 * 60 * 24 * 7); // 7 jours en secondes
ini_set('session.gc_maxlifetime', 60 * 60 * 24 * 7);  
ini_set('session.cookie_samesite', 'Lax'); // Empêche l'envoi des cookies lors de requêtes cross-site malveillantes

/**
 * Configuration détaillée des paramètres de cookies de session
 * 
 * Ces paramètres définissent précisément le comportement du cookie de session, notamment:
 * - Sa portée dans le site (path)
 * - Son domaine d'application
 * - Ses caractéristiques de sécurité (secure, httponly, samesite)
 * - Sa durée de vie
 * 
 * AVERTISSEMENT SÉCURITÉ:
 * En production, definir 'secure' à true si HTTPS est disponible pour empêcher
 * l'interception du cookie sur des connexions non sécurisées.
 */
session_set_cookie_params([
    'path' => '/',                  // Le cookie est valide pour l'ensemble du site
    'domain' => 'localhost',        // Domaine auquel le cookie s'applique
    'secure' => false,              // En dev: false, en prod avec HTTPS: true
    'httponly' => true,             // Protection contre les attaques XSS - empêche l'accès au cookie via JavaScript
    'samesite' => 'Lax',            // Protection CSRF plus permissive que 'Strict' mais plus pratique
    'lifetime' => 60 * 60 * 24 * 7  // 7 jours en secondes
]);

/**
 * Démarrage ou reprise de la session existante
 * 
 * Cette fonction vérifie si une session existe déjà pour l'utilisateur
 * et la reprend, ou en crée une nouvelle si nécessaire.
 */
session_start();

//======================================================
// CONFIGURATION DES EN-TÊTES CORS
//======================================================

/**
 * En-têtes CORS communs à toutes les requêtes
 * 
 * Le CORS (Cross-Origin Resource Sharing) est un mécanisme de sécurité qui contrôle
 * quels domaines peuvent accéder aux ressources de votre API. Cette configuration est
 * essentielle pour les applications où le frontend et le backend sont sur des domaines différents.
 * 
 * IMPORTANT: En production, remplacer 'http://localhost:5173' par l'URL réelle du frontend
 * pour limiter l'accès à votre API uniquement aux domaines autorisés.
 */
header("Content-Type: application/json");                    // Toutes les réponses sont en JSON
header("Access-Control-Allow-Origin: http://localhost:5173"); // Seule cette origine peut accéder à l'API
header("Access-Control-Allow-Headers: Content-Type");         // Autorise l'en-tête Content-Type dans les requêtes
header("Access-Control-Allow-Credentials: true");             // Autorise l'envoi des cookies d'authentification

/**
 * Configuration des en-têtes CORS spécifiques selon la méthode HTTP
 * 
 * Cette section définit dynamiquement les méthodes HTTP autorisées en fonction
 * de la requête actuelle. Cela permet de limiter les méthodes accessibles pour
 * chaque endpoint de l'API, renforçant ainsi la sécurité.
 */
$request_method = $_SERVER['REQUEST_METHOD'];

// Configuration adaptée selon la méthode HTTP de la requête actuelle
if ($request_method === 'GET' || $request_method === 'OPTIONS') {
    header("Access-Control-Allow-Methods: GET, OPTIONS");
} 
// Configuration pour POST et OPTIONS
else if ($request_method === 'POST' || $request_method === 'OPTIONS') {
    header("Access-Control-Allow-Methods: POST, OPTIONS");
} 
// Configuration pour PATCH et OPTIONS
else if ($request_method === 'PATCH' || $request_method === 'OPTIONS') {
    header("Access-Control-Allow-Methods: PATCH, OPTIONS");
} 
// Configuration pour DELETE et OPTIONS
else if ($request_method === 'DELETE' || $request_method === 'OPTIONS') {
    header("Access-Control-Allow-Methods: DELETE, OPTIONS");
}
else if ($request_method === 'PUT' || $request_method === 'OPTIONS') {
    header("Access-Control-Allow-Methods: PUT, OPTIONS");
}

/**
 * Gestion des requêtes OPTIONS (pre-flight)
 * 
 * Les requêtes OPTIONS sont envoyées automatiquement par le navigateur avant certaines
 * requêtes cross-origin pour vérifier si le serveur autorise la requête réelle.
 * Cette section répond à ces requêtes avec un code 200 et arrête l'exécution du script,
 * car ces requêtes ne nécessitent pas de traitement supplémentaire.
 */
if ($request_method === 'OPTIONS') {
    http_response_code(200);  // Réponse positive aux vérifications pre-flight
    exit;  // Arrêt du script pour les requêtes OPTIONS
}

//======================================================
// FONCTIONS UTILITAIRES
//======================================================

/**
 * Vérifie si l'utilisateur est authentifié
 * 
 * Cette fonction est cruciale pour la sécurité de l'API. Elle vérifie la présence
 * d'un identifiant utilisateur dans la session, garantissant ainsi que seuls les
 * utilisateurs authentifiés peuvent accéder aux endpoints protégés.
 * 
 * Elle génère également des logs détaillés en cas d'échec d'authentification,
 * ce qui facilite le débogage des problèmes de session.
 * 
 * @param string $apiName Nom de l'API appelante pour les logs (facilite le débogage)
 * @return int L'ID de l'utilisateur authentifié
 * @throws Exception Si l'utilisateur n'est pas connecté (session invalide ou expirée)
 */
function checkUserAuth($apiName = '') {
    if (!isset($_SESSION['user_id'])) {
        // Enregistre des informations de débogage détaillées
        $session_cookie = isset($_COOKIE[session_name()]) ? $_COOKIE[session_name()] : "Non trouvé";
        error_log("$apiName - Utilisateur non connecté - Session cookie: $session_cookie");
        throw new Exception("Utilisateur non connecté");
    }
    
    return $_SESSION['user_id'];
}

/**
 * Envoie une réponse JSON standardisée
 * 
 * Cette fonction garantit que toutes les réponses de l'API suivent un format cohérent,
 * ce qui facilite leur traitement côté frontend. Elle prend en charge:
 * - L'indication de succès ou d'échec
 * - Un message explicatif
 * - Des données optionnelles
 * - Le code HTTP approprié
 * - L'ajout automatique de l'ID de session pour le débogage
 * 
 * IMPORTANT: Cette fonction termine l'exécution du script après l'envoi de la réponse,
 * ce qui évite tout traitement supplémentaire ou fuite de données.
 * 
 * @param bool $success Indicateur de réussite de l'opération
 * @param string $message Message explicatif pour l'utilisateur ou le développeur
 * @param array $data Données à inclure dans la réponse (tableau vide par défaut)
 * @param int $http_code Code HTTP de la réponse (200 par défaut)
 */
function sendJsonResponse($success = true, $message = '', $data = [], $http_code = 200) {
    // Définir le code HTTP de la réponse
    http_response_code($http_code);
    
    // Créer la structure standardisée de la réponse
    $response = [
        "success" => $success,
        "message" => $message
    ];
    
    // Ajouter les données uniquement si elles existent
    if (!empty($data)) {
        $response["data"] = $data;
    }
    
    // Ajouter l'ID de session pour faciliter le débogage
    $response["session_id"] = session_id();
    
    // Encoder en JSON et envoyer la réponse
    echo json_encode($response);
    exit; // Terminer immédiatement l'exécution du script pour éviter toute fuite de données
} 