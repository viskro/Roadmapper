<?php
/**
 * deleteItem.php
 * -------------
 * 
 * API pour supprimer un item d'une roadmap
 * 
 * Cette API permet à un utilisateur authentifié de supprimer un item spécifique
 * d'une roadmap. L'opération n'est autorisée que si l'utilisateur est propriétaire
 * de l'item.
 * 
 * Méthode: DELETE
 * Paramètres (JSON):
 * - id: ID de l'item à supprimer (obligatoire)
 * 
 * Réponses:
 * - 200: Opération réussie, l'item a été supprimé
 * - 400: Paramètre manquant (id)
 * - 401: Utilisateur non authentifié
 * - 403: L'utilisateur n'est pas autorisé à supprimer cet item
 * - 404: Item non trouvé
 * - 500: Erreur serveur
 * 
 * @version 1.0
 */

// Inclusion des fichiers nécessaires
require_once "../config/session_cors.php";
require_once "../config/DBConnexion.php";
require_once "../models/Item.php";

try {
    // Vérifier si l'utilisateur est connecté
    // La fonction checkUserAuth lance une exception si l'utilisateur n'est pas connecté
    $user_id = checkUserAuth("DeleteItem");

    // Établir la connexion à la base de données via le singleton DBConnexion
    $db = DBConnexion::getInstance()->getConnection();
    
    // Initialiser le modèle Item
    $itemModel = new Item($db, $user_id);

    // Récupérer et décoder les données JSON envoyées par le frontend
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Vérifier que l'ID de l'item est fourni
    if (!isset($data['id'])) {
        sendJsonResponse(false, "Paramètre manquant: l'ID de l'item est requis", [], 400);
    }

    // Extraire et convertir l'ID de l'item
    $id = (int)$data['id']; // Conversion explicite en entier pour sécurité
    
    // Vérifier que l'item existe et appartient à l'utilisateur
    $item = $itemModel->getById($id);
    if (!$item) {
        sendJsonResponse(false, "Item non trouvé ou vous n'êtes pas autorisé à le supprimer", [], 404);
    }
    
    // Supprimer l'item en utilisant la méthode du modèle
    // Cette méthode vérifie déjà que l'utilisateur est propriétaire de l'item
    $result = $itemModel->delete($id);
    
    if ($result) {
        // Si la suppression a réussi, envoyer une réponse de succès
        sendJsonResponse(true, "Item supprimé avec succès", ["id" => $id]);
    } else {
        // Si la suppression a échoué pour une raison inconnue
        sendJsonResponse(false, "Échec de la suppression de l'item pour une raison inconnue", [], 500);
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
    } else if (strpos($message, "manquant") !== false) {
        $code = 400; // Requête incorrecte
    }
    
    // Envoi de la réponse d'erreur avec le code HTTP approprié
    sendJsonResponse(false, "Erreur : " . $message, [], $code);
}