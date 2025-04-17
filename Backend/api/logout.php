<?php
/**
 * logout.php
 * ----------
 * 
 * API de déconnexion d'utilisateur
 * 
 * Cette API déconnecte l'utilisateur en détruisant la session courante et en 
 * supprimant le cookie de session. Elle ne nécessite pas de paramètres, mais 
 * vérifie si l'utilisateur est bien connecté avant de procéder à la déconnexion.
 * 
 * Méthode: POST
 * Paramètres: Aucun
 * 
 * Réponses:
 * - 200: Déconnexion réussie
 * - 401: Aucun utilisateur connecté
 * 
 * @version 1.0
 */

// Inclusion du fichier de configuration centralisé pour sessions et CORS
require_once "../config/session_cors.php";

// Journalisation des informations avant déconnexion
error_log("Logout - Session ID avant déconnexion: " . session_id());
error_log("Logout - Session Data avant déconnexion: " . print_r($_SESSION, true));

// Vérification qu'un utilisateur est bien connecté
if (!isset($_SESSION['user_id'])) {
    sendJsonResponse(false, "Aucun utilisateur connecté", [], 401);
}

// Effacer toutes les données de session
$_SESSION = array();

// Supprimer le cookie de session s'il existe
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Détruire la session
session_destroy();

// Journalisation après déconnexion
error_log("Logout - Session détruite");

// Envoyer la réponse de succès
sendJsonResponse(true, "Déconnexion réussie");