<?php
/**
 * login.php
 * ---------
 * 
 * API d'authentification pour connecter un utilisateur
 * 
 * Cette API vérifie les identifiants de l'utilisateur et crée une session si
 * les informations sont correctes. Elle utilise le hachage sécurisé des mots de passe
 * et génère un nouvel ID de session pour prévenir les attaques par fixation de session.
 * 
 * Méthode: POST
 * Paramètres (JSON):
 * - email: Adresse email de l'utilisateur (obligatoire)
 * - password: Mot de passe de l'utilisateur (obligatoire)
 * 
 * Réponses:
 * - 200: Authentification réussie, retourne les informations de l'utilisateur
 * - 400: Paramètres manquants ou invalides
 * - 401: Identifiants incorrects
 * - 500: Erreur serveur
 * 
 * @version 1.0
 */

// Inclusion du fichier de configuration centralisé pour sessions et CORS
require_once "../config/session_cors.php";
require_once "../config/DBConnexion.php";

// Nettoyer les anciennes données de session si elles existent
// Important pour la connexion afin d'éviter que d'anciennes données persistent
session_unset();

try {
    // Établir la connexion à la base de données via le singleton DBConnexion
    $db = DBConnexion::getInstance()->getConnection();
    
    // Récupérer et décoder les données JSON envoyées par le frontend
    $data = json_decode(file_get_contents("php://input"), true);

    // Validation des données de connexion
    if (!isset($data['email']) || !isset($data['password'])) {
        sendJsonResponse(false, "Paramètres invalides: email et mot de passe requis", [], 400);
    }

    // Extraction et nettoyage des données
    $email = htmlspecialchars($data['email']);
    $password = $data['password']; // Le mot de passe ne doit pas être échappé avant vérification

    // Recherche de l'utilisateur par email
    $stmt = $db->prepare("SELECT * FROM users WHERE email = :email");
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Vérification du mot de passe si l'utilisateur existe
    if ($user && password_verify($password, $user['password'])) {
        // Stockage des informations utilisateur dans la session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['logged_in_time'] = time();
        
        // Régénérer l'ID de session pour prévenir les fixations de session (sécurité)
        session_regenerate_id(true);
        
        // Log pour débogage (à supprimer en production)
        error_log("Login - Session ID après connexion: " . session_id());
        
        // Envoi de la réponse JSON avec les informations de l'utilisateur
        sendJsonResponse(true, "Connexion réussie", [
            "user" => [
                "id" => $user['id'],
                "username" => $user['username'],
                "email" => $user['email']
            ]
        ]);
    } else {
        // Si les identifiants sont incorrects, retourner une erreur 401
        sendJsonResponse(false, "Identifiants incorrects", [], 401);
    }
} catch (Exception $e) {
    // Gestion des différents types d'erreurs
    $message = $e->getMessage();
    $code = 500; // Code par défaut
    
    // Adapter le code HTTP en fonction du message d'erreur
    if (strpos($message, "requis") !== false) {
        $code = 400; // Requête incorrecte
    }
    
    // Envoi de la réponse d'erreur avec le code HTTP approprié
    sendJsonResponse(false, "Erreur : " . $message, [], $code);
}