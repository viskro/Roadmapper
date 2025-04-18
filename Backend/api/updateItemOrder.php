<?php
/**
 * updateItemOrder.php
 * ------------------
 * 
 * API pour modifier l'ordre d'affichage d'un item dans une roadmap
 * 
 * Cette API permet de déplacer un item vers le haut ou vers le bas dans sa roadmap,
 * modifiant ainsi son ordre d'affichage par rapport aux autres items.
 * Elle nécessite que l'utilisateur soit authentifié et qu'il soit propriétaire de l'item.
 * 
 * Méthode: PATCH
 * Paramètres (JSON):
 * - id: ID de l'item à déplacer
 * - direction: Direction du déplacement ("up" pour monter, "down" pour descendre)
 * 
 * Réponses:
 * - 200: Opération réussie
 * - 400: Paramètres manquants ou invalides
 * - 401: Utilisateur non authentifié
 * - 403: L'utilisateur n'est pas propriétaire de l'item
 * - 404: Item non trouvé
 * - 409: Impossible de déplacer l'item (déjà en première/dernière position)
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
   $user_id = checkUserAuth("UpdateItemOrder");
    // $user_id = 1; // Pour les tests, on simule un utilisateur connecté avec ID 1
    // Établir la connexion à la base de données via le singleton DBConnexion
    $db = DBConnexion::getInstance()->getConnection();
    
    // Initialiser le modèle Item avec la connexion et l'ID de l'utilisateur
    // Le modèle Item s'assurera que l'utilisateur ne peut modifier que ses propres items
    $itemModel = new Item($db, $user_id);
    
    // Récupérer et décoder les données JSON envoyées par le frontend
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Validation des données reçues
    if (!is_array($data) || !isset($data['id']) || !isset($data['direction'])) {
        sendJsonResponse(false, "Paramètres invalides: l'ID de l'item et la direction sont requis", [], 400);
    }

    // Extraction des données validées
    $id = (int)$data['id']; // Conversion explicite en entier pour sécurité
    $direction = $data['direction'];
    
    // Vérification supplémentaire de la validité de la direction
    if (!in_array($direction, ["up", "down"])) {
        sendJsonResponse(false, "Direction invalide: seules les valeurs 'up' et 'down' sont acceptées", [], 400);
    }
    
    // Appel à la méthode du modèle pour mettre à jour l'ordre
    // Cette méthode effectue les vérifications nécessaires (propriété, limites, etc.)
    $result = $itemModel->updateOrder($id, $direction);
    
    // Si la mise à jour a réussi, envoyer une réponse de succès
    sendJsonResponse(true, "Item déplacé avec succès", ["id" => $id, "direction" => $direction]);
    
} catch (Exception $e) {
    // Gestion des différents types d'erreurs
    $message = $e->getMessage();
    $code = 500; // Code par défaut
    
    // Adapter le code HTTP en fonction du message d'erreur
    if (strpos($message, "non connecté") !== false) {
        $code = 401; // Non autorisé
    } else if (strpos($message, "non autorisé") !== false) {
        $code = 403; // Interdit
    } else if (strpos($message, "introuvable") !== false) {
        $code = 404; // Non trouvé
    } else if (strpos($message, "déjà en première position") !== false || 
               strpos($message, "déjà en dernière position") !== false) {
        $code = 409; // Conflit
    }
    
    // Envoi de la réponse d'erreur avec le code HTTP approprié
    sendJsonResponse(false, "Erreur : " . $message, [], $code);
}