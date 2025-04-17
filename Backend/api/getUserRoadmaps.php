<?php
/**
 * getUserRoadmaps.php
 * ------------------
 * 
 * API pour récupérer toutes les roadmaps d'un utilisateur
 * 
 * Cette API permet à un utilisateur authentifié de récupérer toutes ses roadmaps
 * avec le nombre d'items associés à chacune d'elles. Les roadmaps sont également
 * organisées par catégorie pour faciliter l'affichage dans le frontend.
 * 
 * Méthode: GET
 * Paramètres: Aucun
 * 
 * Réponses:
 * - 200: Opération réussie, retourne les roadmaps organisées
 * - 401: Utilisateur non authentifié
 * - 500: Erreur serveur
 * 
 * @version 1.0
 */

// Inclusion du fichier de configuration centralisé pour sessions et CORS
require_once "../config/session_cors.php";
require_once "../config/DBConnexion.php";

try {
    // Vérifier si l'utilisateur est connecté
    // La fonction checkUserAuth lance une exception si l'utilisateur n'est pas connecté
    $user_id = checkUserAuth("GetUserRoadmaps");

    // Établir la connexion à la base de données via le singleton DBConnexion
    $db = DBConnexion::getInstance()->getConnection();

    // Récupérer toutes les roadmaps de l'utilisateur, groupées par catégorie
    $stmt = $db->prepare("
        SELECT r.*, 
               (SELECT COUNT(*) FROM items WHERE roadmap_id = r.id) as item_count
        FROM roadmaps r 
        WHERE r.user_id = :user_id 
        ORDER BY r.category, r.name
    ");
    
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    $roadmaps = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Organiser les roadmaps par catégorie pour faciliter l'affichage dans le frontend
    $categorizedRoadmaps = [];
    foreach ($roadmaps as $roadmap) {
        $category = $roadmap['category'];
        if (!isset($categorizedRoadmaps[$category])) {
            $categorizedRoadmaps[$category] = [];
        }
        $categorizedRoadmaps[$category][] = $roadmap;
    }

    // Envoi de la réponse JSON avec les données structurées
    sendJsonResponse(true, "Roadmaps récupérées avec succès", [
        "roadmaps" => $roadmaps,
        "categorized" => $categorizedRoadmaps
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