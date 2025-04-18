<?php

require_once "../config/session_cors.php";
require_once "../config/DBConnexion.php";
require_once "../models/Item.php";

try {

    $user_id = checkUserAuth("UpdateItem");
    // $user_id = 1; // Pour les tests, on simule un utilisateur connecté avec ID 1
    // Connexion à la base de données
    $db = DBConnexion::getInstance()->getConnection();

    $itemModel = new Item($db, $user_id);
    // Récupérer les données JSON envoyées par le frontend
    $data = json_decode(file_get_contents("php://input"), true);

    $id = $data['id'];
    $title = $data['title'];
    $description = $data['description'];

    if (!isset($id) || !isset($title) || !isset($description)) {
        throw new Exception("Les champs 'title' et 'description' sont requis.");
    }

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
    }
    
    sendJsonResponse(false, "Erreur : " . $message, [], $code);
}