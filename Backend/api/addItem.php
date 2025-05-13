<?php
/**
 * addItem.php
 * -----------
 * 
 * API pour ajouter un nouvel item à une roadmap
 * 
 * Cette API permet à un utilisateur authentifié d'ajouter un nouvel item (étape)
 * à l'une de ses roadmaps. L'item sera ajouté en dernière position par défaut.
 * 
 * Méthode: POST
 * Paramètres (JSON):
 * - title: Titre de l'item (obligatoire)
 * - description: Description détaillée de l'item (obligatoire)
 * - roadmap_id: ID de la roadmap à laquelle ajouter l'item (obligatoire)
 * 
 * Réponses:
 * - 200: Opération réussie, retourne les détails de l'item créé
 * - 400: Paramètres manquants ou invalides
 * - 401: Utilisateur non authentifié
 * - 403: L'utilisateur n'est pas propriétaire de la roadmap
 * - 404: Roadmap non trouvée
 * - 500: Erreur serveur
 * 
 * @version 1.0
 */

// Inclusion des fichiers nécessaires
require_once "../config/session_cors.php";
require_once "../config/DBConnexion.php";
require_once "../models/Item.php";
require_once "../models/Roadmap.php";

try {
    // Vérifier si l'utilisateur est connecté
    // La fonction checkUserAuth lance une exception si l'utilisateur n'est pas connecté
    $user_id = checkUserAuth("AddItem");

    // Établir la connexion à la base de données via le singleton DBConnexion
    $db = DBConnexion::getInstance()->getConnection();
    
    // Initialiser les modèles nécessaires
    $itemModel = new Item($db, $user_id);
    $roadmapModel = new Roadmap($db, $user_id);

    // Récupérer et décoder les données JSON envoyées par le frontend
    $data = json_decode(file_get_contents("php://input"), true);

    // Validation des données reçues
    if (!isset($data['title']) || !isset($data['description']) || !isset($data['roadmap_id'])) {
        sendJsonResponse(false, "Paramètres invalides: 'title', 'description' et 'roadmap_id' sont requis", [], 400);
    }

    // Extraction et nettoyage des données validées
    // $title = htmlspecialchars($data['title']);
    // $description = htmlspecialchars($data['description']);
    // $roadmap_id = (int)$data['roadmap_id']; // Conversion explicite en entier pour sécurité

    $title = $data['title'];
    $description = $data['description'];
    $roadmap_id = (int)$data['roadmap_id']; 
    
    // Vérifier que la roadmap existe et appartient à l'utilisateur
    $roadmap = $roadmapModel->getById($roadmap_id);
    if (!$roadmap) {
        sendJsonResponse(false, "Roadmap non trouvée ou non autorisée", [], 404);
    }

    // Ajouter l'item à la roadmap en utilisant le modèle Item
    // La méthode add s'occupe de calculer le prochain ordre et de vérifier les autorisations
    $newItemId = $itemModel->add($title, $description, $roadmap_id);

    // Si l'ajout a réussi, récupérer l'item complet pour la réponse
    $newItem = $itemModel->getById($newItemId);

    // Envoi de la réponse JSON de succès avec les données de l'item créé
    sendJsonResponse(true, "Item ajouté avec succès", [
        "item" => $newItem
    ]);
    
} catch (Exception $e) {
    // Gestion des différents types d'erreurs
    $message = $e->getMessage();
    $code = 500; // Code par défaut
    
    // Adapter le code HTTP en fonction du message d'erreur
    if (strpos($message, "non connecté") !== false) {
        $code = 401; // Non autorisé
    } else if (strpos($message, "non autorisée") !== false) {
        $code = 403; // Interdit
    } else if (strpos($message, "non trouvée") !== false) {
        $code = 404; // Non trouvé
    } else if (strpos($message, "requis") !== false) {
        $code = 400; // Requête incorrecte
    }
    
    // Envoi de la réponse d'erreur avec le code HTTP approprié
    sendJsonResponse(false, "Erreur : " . $message, [], $code);
}