<?php
/**
 * register.php
 * ------------
 * 
 * API d'inscription pour créer un nouveau compte utilisateur
 * 
 * Cette API valide les données d'inscription, vérifie l'unicité de l'email et du nom
 * d'utilisateur, puis crée un nouvel utilisateur dans la base de données. Elle connecte
 * automatiquement l'utilisateur après une inscription réussie.
 * 
 * Méthode: POST
 * Paramètres (JSON):
 * - username: Nom d'utilisateur (obligatoire, min 3 caractères)
 * - email: Adresse email valide (obligatoire)
 * - password: Mot de passe (obligatoire, min 6 caractères)
 * 
 * Réponses:
 * - 200: Inscription réussie, retourne les informations de l'utilisateur
 * - 400: Paramètres manquants ou invalides
 * - 409: Email ou nom d'utilisateur déjà utilisé
 * - 500: Erreur serveur
 * 
 * @version 1.0
 */

// Inclusion du fichier de configuration centralisé pour sessions et CORS
require_once "../config/session_cors.php";
require_once "../config/DBConnexion.php";

try {
    $db = DBConnexion::getInstance()->getConnection();
    $data = json_decode(file_get_contents("php://input"), true);

    // Vérification de la présence des données requises
    if (!isset($data['username'], $data['email'], $data['password'])) {
        sendJsonResponse(false, "Tous les champs sont requis.", [], 400);
    }

    // Validation des données
    if (strlen($data['username']) < 3) {
        sendJsonResponse(false, "Le nom d'utilisateur doit comporter au moins 3 caractères.", [], 400);
    }
    
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        sendJsonResponse(false, "Format d'email invalide.", [], 400);
    }
    
    if (strlen($data['password']) < 6) {
        sendJsonResponse(false, "Le mot de passe doit comporter au moins 6 caractères.", [], 400);
    }

    // Nettoyage et préparation des données
    $username = htmlspecialchars($data['username']);
    $email = htmlspecialchars($data['email']);
    $password = password_hash($data['password'], PASSWORD_BCRYPT);
    
    // Vérifier si l'email existe déjà
    $stmt = $db->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    if ($stmt->rowCount() > 0) {
        sendJsonResponse(false, "Cet email est déjà utilisé.", [], 409);
    }
    
    // Vérifier si le nom d'utilisateur existe déjà
    $stmt = $db->prepare("SELECT id FROM users WHERE username = :username");
    $stmt->bindParam(':username', $username);
    $stmt->execute();
    if ($stmt->rowCount() > 0) {
        sendJsonResponse(false, "Ce nom d'utilisateur est déjà utilisé.", [], 409);
    }

    // Insérer le nouvel utilisateur
    $stmt = $db->prepare("INSERT INTO users (username, email, password, created_at) VALUES (:username, :email, :password, CURRENT_DATE())");
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':password', $password);
    $stmt->execute();
    
    $user_id = $db->lastInsertId();
    
    // Connecter automatiquement l'utilisateur après l'inscription
    $_SESSION['user_id'] = $user_id;
    $_SESSION['username'] = $username;
    $_SESSION['email'] = $email;
    $_SESSION['logged_in_time'] = time();
    
    // Régénérer l'ID de session pour prévenir les fixations de session
    session_regenerate_id(true);

    // Journalisation pour débogage
    error_log("Inscription réussie - Session ID: " . session_id());
    
    // Envoi de la réponse JSON avec les informations de l'utilisateur
    sendJsonResponse(true, "Utilisateur inscrit avec succès.", [
        "user" => [
            "id" => $user_id,
            "username" => $username,
            "email" => $email
        ]
    ]);
} catch (Exception $e) {
    // Journalisation de l'erreur
    error_log("Erreur d'inscription: " . $e->getMessage());
    
    // Déterminer le code HTTP approprié
    $code = 500;
    $message = $e->getMessage();
    
    if (strpos($message, "déjà utilisé") !== false) {
        $code = 409; // Conflit
    } else if (strpos($message, "requis") !== false || strpos($message, "invalide") !== false) {
        $code = 400; // Requête incorrecte
    }
    
    // Envoi de la réponse d'erreur
    sendJsonResponse(false, $message, [], $code);
}