<?php
/**
 * getRoadmapItems.php
 * ------------------
 * 
 * API pour récupérer une roadmap et tous ses items
 * 
 * Cette API permet à un utilisateur authentifié de récupérer les détails d'une roadmap
 * spécifique (identifiée par son ID ou son slug) ainsi que tous les items qui y sont associés.
 * Les items sont retournés triés par leur ordre d'affichage.
 * 
 * Méthode: GET
 * Paramètres (URL):
 * - id: ID de la roadmap à récupérer (optionnel si slug est fourni)
 * - slug: Slug URL de la roadmap à récupérer (optionnel si id est fourni)
 * 
 * Au moins un des paramètres (id ou slug) doit être fourni.
 * 
 * Réponses:
 * - 200: Opération réussie, retourne la roadmap et ses items
 * - 400: Paramètres manquants (ni id ni slug fourni)
 * - 401: Utilisateur non authentifié
 * - 404: Roadmap non trouvée ou non accessible par l'utilisateur
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
    $user_id = checkUserAuth("GetRoadmapItems");

    // Vérifier si l'id ou le slug de la roadmap est fourni
    if (!isset($_GET['id']) && !isset($_GET['slug'])) {
        sendJsonResponse(false, "Paramètre manquant: un identifiant (id ou slug) de roadmap est requis", [], 400);
    }

    // Établir la connexion à la base de données via le singleton DBConnexion
    $db = DBConnexion::getInstance()->getConnection();
    
    // Initialiser les modèles nécessaires
    $roadmapModel = new Roadmap($db, $user_id);
    $itemModel = new Item($db, $user_id);
    
    // Récupérer la roadmap par ID ou par slug
    $roadmap = null;
    if (isset($_GET['id'])) {
        $roadmap_id = (int)$_GET['id']; // Conversion explicite en entier pour sécurité
        $roadmap = $roadmapModel->getById($roadmap_id);
    } else {
        $roadmap_slug = htmlspecialchars($_GET['slug']); // Nettoyer le slug
        $roadmap = $roadmapModel->getBySlug($roadmap_slug);
    }

    // Vérifier si la roadmap existe et appartient à l'utilisateur
    if (!$roadmap) {
        sendJsonResponse(false, "Roadmap non trouvée ou non accessible", [], 404);
    }

    // Récupérer tous les items de la roadmap
    $items = $itemModel->getAllByRoadmap($roadmap['id']);

    // Envoi de la réponse JSON avec les données de la roadmap et ses items
    sendJsonResponse(true, "Données récupérées avec succès", [
        "roadmap" => $roadmap,
        "items" => $items
    ]);
    
} catch (Exception $e) {
    // Gestion des différents types d'erreurs
    $message = $e->getMessage();
    $code = 500; // Code par défaut
    
    // Adapter le code HTTP en fonction du message d'erreur
    if (strpos($message, "non connecté") !== false) {
        $code = 401; // Non autorisé
    } else if (strpos($message, "manquant") !== false) {
        $code = 400; // Requête incorrecte
    } else if (strpos($message, "non trouvée") !== false || 
               strpos($message, "non accessible") !== false) {
        $code = 404; // Non trouvé
    }
    
    // Envoi de la réponse d'erreur avec le code HTTP approprié
    sendJsonResponse(false, "Erreur : " . $message, [], $code);
} 