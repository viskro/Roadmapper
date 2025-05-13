<?php
/**
 * updateItem.php
 * -------------
 * 
 * API pour mettre à jour un item existant
 * 
 * Cette API permet à un utilisateur authentifié de modifier le titre et la description
 * d'un item existant. L'utilisateur doit être propriétaire de l'item pour pouvoir le modifier.
 * 
 * Méthode: PUT
 * URL: updateItem.php/{id} où {id} est l'identifiant de l'item à modifier
 * Paramètres (JSON):
 * - title: Nouveau titre de l'item (obligatoire)
 * - description: Nouvelle description de l'item (obligatoire)
 * - date: Date de modification (optionnel, format YYYY-MM-DD HH:MM:SS)
 * 
 * Réponses:
 * - 200: Opération réussie, retourne les détails de l'item mis à jour
 * - 400: Paramètres manquants ou invalides
 * - 401: Utilisateur non authentifié
 * - 403: L'utilisateur n'est pas propriétaire de l'item
 * - 404: Item non trouvé
 * - 500: Erreur serveur
 * 
 * @version 1.1
 */

require_once "../config/session_cors.php";
require_once "../config/DBConnexion.php";
require_once "../models/Item.php";

// Vérification du type de requête
if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'OPTIONS') {
    sendJsonResponse(false, "Méthode HTTP non autorisée. Utilisez PUT pour cette API.", [], 405);
}

try {
    // Vérifier si l'utilisateur est connecté
    $user_id = checkUserAuth("UpdateItem");

    // Connexion à la base de données
    $db = DBConnexion::getInstance()->getConnection();

    // Initialiser le modèle Item
    $itemModel = new Item($db, $user_id);
    
    // Récupérer l'ID de l'item depuis l'URL
    // Format attendu: /api/updateItem.php/123 où 123 est l'ID de l'item
    $url_path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $path_segments = explode('/', rtrim($url_path, '/'));
    $id = end($path_segments);
    
    // Vérifier que l'ID est un nombre valide
    if (!is_numeric($id)) {
        sendJsonResponse(false, "Identifiant d'item invalide dans l'URL", [], 400);
    }
    
    // Conversion explicite en entier pour sécurité
    $id = (int)$id;
    
    // Récupérer les données JSON envoyées par le frontend
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);
    
    // Log pour débogage
    error_log("UpdateItem - Données reçues: " . print_r($data, true));

    // Validation des données
    if (!isset($data['title']) || !isset($data['description'])) {
        sendJsonResponse(false, "Paramètres invalides: 'title' et 'description' sont requis", [], 400);
    }

    // Extraction et nettoyage des données
    // $title = htmlspecialchars($data['title']);
    // $description = htmlspecialchars($data['description']);

    $title = $data['title'];
    $description = $data['description'];

    // Mise à jour de l'item
    $itemUpdated = $itemModel->update($id, $title, $description);

    // Envoi de la réponse JSON
    sendJsonResponse(true, "Item mis à jour avec succès", [
        "item" => $itemUpdated
    ]);
} catch (Exception $e) {
    // Gestion des erreurs
    $message = $e->getMessage();
    $code = 500; // Code par défaut

    // Adapter le code HTTP en fonction du message d'erreur
    if (strpos($message, "non connecté") !== false) {
        $code = 401; // Non autorisé
    } else if (strpos($message, "non autorisée") !== false) {
        $code = 403; // Interdit
    } else if (strpos($message, "introuvable") !== false) {
        $code = 404; // Non trouvé
    } else if (strpos($message, "requis") !== false) {
        $code = 400; // Requête incorrecte
    }
    
    sendJsonResponse(false, "Erreur : " . $message, [], $code);
}