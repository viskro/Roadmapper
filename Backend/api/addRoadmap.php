<?php
/**
 * addRoadmap.php
 * -------------
 * 
 * API pour créer une nouvelle roadmap
 * 
 * Cette API permet à un utilisateur authentifié de créer une nouvelle roadmap
 * en spécifiant son nom, sa catégorie et une description optionnelle. Un slug
 * URL est automatiquement généré à partir du nom pour faciliter l'accès direct.
 * 
 * Méthode: POST
 * Paramètres (JSON):
 * - name: Nom de la roadmap (obligatoire)
 * - category: Catégorie de la roadmap (obligatoire)
 * - description: Description détaillée (optionnel)
 * 
 * Réponses:
 * - 200: Opération réussie, retourne les détails de la roadmap créée
 * - 400: Paramètres manquants ou invalides
 * - 401: Utilisateur non authentifié
 * - 409: Conflit (nom/slug déjà utilisé)
 * - 500: Erreur serveur
 * 
 * @version 1.0
 */

// Inclusion du fichier de configuration centralisé pour sessions et CORS
require_once "../config/session_cors.php";
require_once "../config/DBConnexion.php";
require_once "../models/Roadmap.php";

try {
    // Vérifier si l'utilisateur est connecté
    // La fonction checkUserAuth lance une exception si l'utilisateur n'est pas connecté
    $user_id = checkUserAuth("AddRoadmap");

    // Établir la connexion à la base de données via le singleton DBConnexion
    $db = DBConnexion::getInstance()->getConnection();
    
    // Initialiser le modèle Roadmap
    $roadmapModel = new Roadmap($db, $user_id);
    
    // Récupérer et décoder les données JSON envoyées par le frontend
    $data = json_decode(file_get_contents("php://input"), true);

    // Vérifier que les données nécessaires sont présentes
    if (!isset($data['name']) || !isset($data['category'])) {
        sendJsonResponse(false, "Paramètres invalides: 'name' et 'category' sont requis", [], 400);
    }

    // Nettoyer et préparer les données
    $name = htmlspecialchars($data['name']);
    $category = htmlspecialchars($data['category']);
    $description = isset($data['description']) ? htmlspecialchars($data['description']) : '';
    
    // Créer la roadmap en utilisant le modèle
    $roadmap_id = $roadmapModel->create($name, $category, $description);
    
    // Récupérer les détails complets de la roadmap créée
    $roadmap = $roadmapModel->getById($roadmap_id);

    // Envoi de la réponse JSON avec les données de la roadmap créée
    sendJsonResponse(true, "Roadmap créée avec succès", [
        "roadmap" => $roadmap
    ]);
    
} catch (Exception $e) {
    // Gestion des différents types d'erreurs
    $message = $e->getMessage();
    $code = 500; // Code par défaut
    
    // Adapter le code HTTP en fonction du message d'erreur
    if (strpos($message, "non connecté") !== false) {
        $code = 401; // Non autorisé
    } else if (strpos($message, "requis") !== false) {
        $code = 400; // Requête incorrecte
    } else if (strpos($message, "déjà utilisé") !== false) {
        $code = 409; // Conflit
    }
    
    // Envoi de la réponse d'erreur avec le code HTTP approprié
    sendJsonResponse(false, "Erreur : " . $message, [], $code);
} 