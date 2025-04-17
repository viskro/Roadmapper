<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PATCH");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

require_once "../config/DBConnexion.php";

try {
    // Connexion à la base de données
    $db = DBConnexion::getInstance()->getConnection();

    // Récupérer les données JSON envoyées par le frontend
    $data = json_decode(file_get_contents("php://input"), true);

    $id = $data['id'];
    $title = $data['title'];
    $description = $data['description'];
    $date = $data['date'];


    // Vérifier que les données nécessaires sont présentes
    if (!isset($id) || !isset($title) || !isset($description)) {
        throw new Exception("Les champs 'title' et 'description' sont requis.");
    }
    // Requête pour insérer un nouvel item
    $stmt = $db->prepare("UPDATE items SET title = :title, description = :description, modified_at = :date WHERE id = :id");
    $stmt->bindParam(':title', $title);
    $stmt->bindParam(':description', $description);
    $stmt->bindParam(':date', $date);
    $stmt->bindParam(':id', $id);
    $stmt->execute();

    // Envoi de la réponse JSON
    echo json_encode([
        "success" => true,
        "message" => "Item modifié avec succès"
    ]);
} catch (Exception $e) {
    // Gestion des erreurs
    echo json_encode([
        "success" => false,
        "message" => "Une erreur est survenue : " . $e->getMessage()
    ]);
}