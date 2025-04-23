<?php
/**
 * deleteItem.php
 * -------------
 * 
 * API pour supprimer une roadmap
 * 
 * Cette API permet à un utilisateur authentifié de supprimer une roadmap spécifique.
 * L'opération n'est autorisée que si l'utilisateur est propriétaire de la roadmap.
 * 
 * Méthode: DELETE
 * URL: deleteRoadmap.php/{id} où {id} est l'identifiant de la roadmap à supprimer
 * 
 * Réponses:
 * - 200: Opération réussie, la roadmap a étée supprimé
 * - 400: Identifiant invalide dans l'URL
 * - 401: Utilisateur non authentifié
 * - 403: L'utilisateur n'est pas autorisé à supprimer cette roadmap
 * - 404: Item non trouvé
 * - 500: Erreur serveur
 * 
 * @version 1.0
 */

// Inclusion des fichiers nécessaires
require_once "../config/session_cors.php";
require_once "../config/DBConnexion.php";
require_once "../models/Roadmap.php";

// Vérification du type de requête
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'OPTIONS') {
    sendJsonResponse(false, "Méthode HTTP non autorisée. Utilisez DELETE pour cette API.", [], 405);
}

try {
    // Vérifier si l'utilisateur est connecté
    // La fonction checkUserAuth lance une exception si l'utilisateur n'est pas connecté
    $user_id = checkUserAuth("DeleteRoadmap");

    // Établir la connexion à la base de données via le singleton DBConnexion
    $db = DBConnexion::getInstance()->getConnection();
    
    // Initialiser le modèle Item
    $roadmapModel = new Roadmap($db, $user_id);

    // Récupérer l'ID de la roadmap depuis l'URL
    // Format attendu: /api/deleteItem.php/123 où 123 est l'ID de la roadmap
    $url_path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $path_segments = explode('/', rtrim($url_path, '/'));
    $id = end($path_segments);
    
    // Vérifier que l'ID est un nombre valide
    if (!is_numeric($id)) {
        sendJsonResponse(false, "Identifiant de roadmap invalide dans l'URL", [], 400);
    }
    
    // Conversion explicite en entier pour sécurité
    $id = (int)$id;
    
    // Vérifier que la roadmap existe et appartient à l'utilisateur
    $item = $roadmapModel->getById($id);
    if (!$item) {
        sendJsonResponse(false, "Item non trouvé ou vous n'êtes pas autorisé à le supprimer", [], 404);
    }
    
    // Supprimer la roadmap en utilisant la méthode du modèle
    // Cette méthode vérifie déjà que l'utilisateur est propriétaire de la roadmap
    $result = $roadmapModel->delete($id);
    
    if ($result) {
        // Si la suppression a réussi, envoyer une réponse de succès
        sendJsonResponse(true, "Roadmap supprimée avec succès", ["id" => $id]);
    } else {
        // Si la suppression a échoué pour une raison inconnue
        sendJsonResponse(false, "Échec de la suppression de la roadmap pour une raison inconnue", [], 500);
    }
    
} catch (Exception $e) {
    // Gestion des différents types d'erreurs
    $message = $e->getMessage();
    $code = 500; // Code par défaut
    
    // Adapter le code HTTP en fonction du message d'erreur
    if (strpos($message, "non connecté") !== false) {
        $code = 401; // Non autorisé
    } else if (strpos($message, "pas autorisé") !== false) {
        $code = 403; // Interdit
    } else if (strpos($message, "non trouvé") !== false) {
        $code = 404; // Non trouvé
    } else if (strpos($message, "invalide") !== false) {
        $code = 400; // Requête incorrecte
    }
    
    // Envoi de la réponse d'erreur avec le code HTTP approprié
    sendJsonResponse(false, "Erreur : " . $message, [], $code);
}