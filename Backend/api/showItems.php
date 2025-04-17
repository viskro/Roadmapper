<?php
/**
 * showItems.php
 * ------------
 * 
 * API pour récupérer tous les items d'un utilisateur
 * 
 * Cette API permet à un utilisateur authentifié de récupérer tous ses items
 * quelle que soit la roadmap à laquelle ils appartiennent. Les items sont
 * triés par leur ordre d'affichage.
 * 
 * Méthode: GET
 * Paramètres: Aucun
 * 
 * Réponses:
 * - 200: Opération réussie, retourne la liste de tous les items
 * - 401: Utilisateur non authentifié
 * - 500: Erreur serveur
 * 
 * @version 1.0
 */

// Inclusion du fichier de configuration centralisé pour sessions et CORS
require_once "../config/session_cors.php";
require_once "../config/DBConnexion.php";
require_once "../models/Item.php";

try {
    // Vérifier si l'utilisateur est connecté
    // La fonction checkUserAuth lance une exception si l'utilisateur n'est pas connecté
    $user_id = checkUserAuth("ShowItems");

    // Établir la connexion à la base de données via le singleton DBConnexion
    $db = DBConnexion::getInstance()->getConnection();
    
    // Initialiser le modèle Item
    $itemModel = new Item($db, $user_id);
    
    // Récupérer tous les items de l'utilisateur
    $items = $itemModel->getAllByUser();

    // Envoi de la réponse JSON avec la liste des items
    sendJsonResponse(true, "Items récupérés avec succès", [
        "items" => $items
    ]);
    
} catch (Exception $e) {
    // Gestion des différents types d'erreurs
    $message = $e->getMessage();
    $code = 500; // Code par défaut
    
    // Adapter le code HTTP en fonction du message d'erreur
    if (strpos($message, "non connecté") !== false) {
        $code = 401; // Non autorisé
    }
    
    // Envoi de la réponse d'erreur avec le code HTTP approprié
    sendJsonResponse(false, "Erreur : " . $message, [], $code);
}