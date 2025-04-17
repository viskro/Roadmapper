<?php
/**
 * checkAuth.php
 * ------------
 * 
 * API pour vérifier l'état d'authentification de l'utilisateur
 * 
 * Cette API permet au frontend de vérifier si l'utilisateur est actuellement connecté
 * et de récupérer ses informations de base. Elle est généralement appelée au chargement
 * de l'application pour déterminer si l'utilisateur doit être redirigé vers la page de connexion
 * ou peut accéder aux fonctionnalités protégées.
 * 
 * Méthode: GET
 * Paramètres: Aucun
 * 
 * Réponses:
 * - 200 (success=true): Utilisateur connecté, retourne ses informations
 * - 200 (success=false): Utilisateur non connecté
 * 
 * @version 1.0
 */

// Inclusion du fichier de configuration centralisé pour sessions et CORS
require_once "../config/session_cors.php";

// Tentative de récupération de l'utilisateur connecté
try {
    // Si l'utilisateur est connecté, ses infos sont dans la session
    if (isset($_SESSION['user_id'])) {
        // Envoi d'une réponse avec les infos de l'utilisateur
        sendJsonResponse(true, "Utilisateur connecté", [
            "user" => [
                "id" => $_SESSION['user_id'],
                "username" => $_SESSION['username'] ?? "",
                "email" => $_SESSION['email'] ?? ""
            ]
        ]);
    } else {
        // Envoi d'une réponse indiquant que l'utilisateur n'est pas connecté
        // Remarque: on utilise le code HTTP 200 car ce n'est pas une erreur technique
        sendJsonResponse(false, "Utilisateur non connecté", [], 200);
    }
} catch (Exception $e) {
    // Gestion des erreurs inattendues lors de la vérification
    sendJsonResponse(false, "Erreur lors de la vérification de l'authentification: " . $e->getMessage(), [], 500);
}