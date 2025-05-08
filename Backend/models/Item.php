<?php
/**
 * Classe Item - Gère les opérations sur les éléments (items) d'une roadmap
 * 
 * Cette classe encapsule toutes les opérations CRUD (Create, Read, Update, Delete)
 * sur les items d'une roadmap, ainsi que la gestion de leur ordre d'affichage.
 * Elle assure que chaque opération est sécurisée en vérifiant systématiquement
 * que l'utilisateur courant est bien propriétaire des éléments manipulés.
 */
class Item {
    /** @var PDO $db Instance de connexion à la base de données */
    private $db;
    
    /** @var int $user_id ID de l'utilisateur courant, utilisé pour sécuriser les requêtes */
    private $user_id;
    
    /**
     * Constructeur
     * 
     * Initialise une instance de la classe Item avec une connexion à la base de données
     * et l'ID de l'utilisateur actuel pour sécuriser toutes les opérations.
     * 
     * @param PDO $db Instance de connexion PDO à la base de données
     * @param int $user_id ID de l'utilisateur authentifié
     */
    public function __construct($db, $user_id) {
        $this->db = $db;
        $this->user_id = $user_id;
    }
    
    /**
     * Récupère un item spécifique par son ID
     * 
     * Vérifie que l'item appartient bien à l'utilisateur courant pour 
     * assurer la sécurité des données.
     * 
     * @param int $id ID de l'item à récupérer
     * @return array|false Tableau associatif contenant les données de l'item ou false si non trouvé
     */
    public function getById($id) {
        $stmt = $this->db->prepare("SELECT * FROM items WHERE id = :id AND user_id = :user_id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $this->user_id, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Récupère tous les items de l'utilisateur courant
     * 
     * Retourne tous les items appartenant à l'utilisateur, triés par leur ordre
     * d'affichage croissant.
     * 
     * @return array Liste de tous les items de l'utilisateur sous forme de tableaux associatifs
     */
    public function getAllByUser() {
        $stmt = $this->db->prepare("SELECT * FROM items WHERE user_id = :user_id ORDER BY `item_order` ASC");
        $stmt->bindParam(':user_id', $this->user_id, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Récupère tous les items d'une roadmap spécifique
     * 
     * Retourne les items appartenant à une roadmap donnée et à l'utilisateur courant,
     * triés par leur ordre d'affichage croissant.
     * 
     * @param int $roadmapId ID de la roadmap dont on veut récupérer les items
     * @return array Liste des items de la roadmap sous forme de tableaux associatifs
     */
    public function getAllByRoadmap($roadmapId) {
        $stmt = $this->db->prepare("SELECT * FROM items WHERE roadmap_id = :roadmap_id AND user_id = :user_id ORDER BY `item_order` ASC");
        $stmt->bindParam(':roadmap_id', $roadmapId, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $this->user_id, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Ajoute un nouvel item à une roadmap
     * 
     * Cette méthode calcule automatiquement le prochain ordre d'affichage en
     * récupérant l'ordre maximum actuel et en l'incrémentant de 1.
     * Le nouvel item est toujours ajouté en dernière position.
     * 
     * @param string $title Titre de l'item
     * @param string $description Description détaillée de l'item
     * @param int $roadmapId ID de la roadmap à laquelle rattacher l'item
     * @return int ID du nouvel item créé
     */
    public function add($title, $description, $roadmapId) {
        // Calculer le prochain ordre - trouve l'ordre maximum actuel et l'incrémente
        $order = 1; // Valeur par défaut si aucun item n'existe encore
        $stmt = $this->db->prepare("SELECT MAX(`item_order`) AS max_order FROM items WHERE roadmap_id = :roadmap_id AND user_id = :user_id");
        $stmt->bindParam(':roadmap_id', $roadmapId, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $this->user_id, PDO::PARAM_INT);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result && $result['max_order'] !== null) {
            $order = $result['max_order'] + 1;
        }
        
        // Insérer le nouvel item avec l'ordre calculé
        $stmt = $this->db->prepare("INSERT INTO items (title, description, `item_order`, user_id, roadmap_id) VALUES (:title, :description, :order, :user_id, :roadmap_id)");
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':order', $order, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $this->user_id, PDO::PARAM_INT);
        $stmt->bindParam(':roadmap_id', $roadmapId, PDO::PARAM_INT);
        $stmt->execute();
        
        return $this->db->lastInsertId();
    }
    
    /**
     * Met à jour les informations d'un item existant
     * 
     * Modifie le titre et la description d'un item, et met à jour sa date de modification.
     * Vérifie que l'item appartient bien à l'utilisateur courant.
     * 
     * @param int $id ID de l'item à mettre à jour
     * @param string $title Nouveau titre de l'item
     * @param string $description Nouvelle description de l'item
     * @return bool true si la mise à jour a réussi, false sinon
     */
    public function update($id, $title, $description) {
        $stmt = $this->db->prepare("UPDATE items SET title = :title, description = :description, modified_at = CURRENT_DATE() WHERE id = :id AND user_id = :user_id");
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $this->user_id, PDO::PARAM_INT);
        $stmt->execute();
        
        // Retourne true si au moins une ligne a été modifiée
        return $stmt->rowCount() > 0;
    }
    
    /**
     * Supprime un item
     * 
     * Supprime définitivement un item de la base de données.
     * Vérifie que l'item appartient bien à l'utilisateur courant.
     * Note: Cette méthode ne réorganise pas les ordres des autres items après suppression.
     * 
     * @param int $id ID de l'item à supprimer
     * @return bool true si la suppression a réussi, false sinon
     */
    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM items WHERE id = :id AND user_id = :user_id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $this->user_id, PDO::PARAM_INT);
        $stmt->execute();
        
        // Retourne true si au moins une ligne a été supprimée
        return $stmt->rowCount() > 0;
    }

    /**
     * Marque un item comme terminé ou non terminé
     * 
     * @param int $id ID de l'item à modifier
     * @param bool $isFinished Nouvel état de l'item
     * @return array Tableau associatif avec le statut de l'opération
     */
    public function setIsFinished($id) {
        $stmt = $this->db->prepare("UPDATE items SET isFinished = NOT isFinished WHERE id = :id AND user_id = :user_id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $this->user_id, PDO::PARAM_INT);
        $stmt->execute();

        $stmt = $this->db->prepare("SELECT isFinished FROM items WHERE id = :id AND user_id = :user_id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $this->user_id, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Vérifie si un item est terminé
     * 
     * Cette méthode récupère l'état de l'item (terminé ou non) en consultant
     * le champ isFinished dans la base de données.
     * 
     * @param int $id ID de l'item à vérifier
     * @return bool true si l'item est terminé, false sinon
     */
    public function isFinished($id) {
        $stmt = $this->db->prepare("SELECT isFinished FROM items WHERE id = :id AND user_id = :user_id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $this->user_id, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchColumn();
    }
    
    /**
     * Met à jour l'ordre d'affichage d'un item
     * 
     * Cette méthode permet de déplacer un item vers le haut ou vers le bas dans la liste
     * en échangeant sa position avec l'item adjacent. Elle vérifie d'abord:
     * - que l'item existe et appartient à l'utilisateur
     * - qu'il n'est pas déjà en première position (pour "up")
     * - qu'il n'est pas déjà en dernière position (pour "down")
     * 
     * Algorithme de fonctionnement:
     * 1. Récupération de l'item actuel et de son ordre d'affichage
     * 2. Vérification des limites (min/max) d'ordre dans la roadmap
     * 3. Calcul du nouvel ordre basé sur la direction demandée
     * 4. Identification de l'item qui occupe actuellement la position cible
     * 5. Échange des positions entre les deux items (permutation des valeurs de 'item_order')
     * 
     * Sécurité:
     * - Toutes les requêtes SQL filtrent par user_id pour empêcher la manipulation d'items d'autres utilisateurs
     * - Les transactions ne sont pas utilisées ici, mais pourraient être ajoutées pour garantir l'atomicité de l'échange
     * 
     * @param int $id ID de l'item dont l'ordre doit être modifié
     * @param string $direction Direction du déplacement ("up" pour monter, "down" pour descendre)
     * @return bool Succès de l'opération
     * @throws Exception Si l'item n'existe pas, n'appartient pas à l'utilisateur, ou ne peut pas être déplacé davantage
     */
    public function updateOrder($id, $direction) {
        // Vérifier que l'élément existe et appartient à l'utilisateur
        $stmt = $this->db->prepare("SELECT id, `item_order`, roadmap_id FROM items WHERE id = :id AND user_id = :user_id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $this->user_id, PDO::PARAM_INT);
        $stmt->execute();
        $currentItem = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$currentItem) {
            throw new Exception("Élément introuvable ou non autorisé");
        }

        $currentOrder = $currentItem['item_order'];
        $roadmapId = $currentItem['roadmap_id'];

        // Obtenir les limites d'ordre (min, max) pour les items de cette roadmap
        $stmtLimits = $this->db->prepare("SELECT MIN(`item_order`) as min_order, MAX(`item_order`) as max_order, COUNT(*) as count 
                                          FROM items WHERE roadmap_id = :roadmap_id AND user_id = :user_id");
        $stmtLimits->bindParam(':roadmap_id', $roadmapId, PDO::PARAM_INT);
        $stmtLimits->bindParam(':user_id', $this->user_id, PDO::PARAM_INT);
        $stmtLimits->execute();
        $limits = $stmtLimits->fetch(PDO::FETCH_ASSOC);
        
        // Vérifier si l'item est déjà en position extrême (première ou dernière)
        if (($direction === "up" && $currentOrder <= $limits['min_order']) || 
            ($direction === "down" && $currentOrder >= $limits['max_order'])) {
            throw new Exception($direction === "up" 
                ? "L'élément est déjà en première position"
                : "L'élément est déjà en dernière position");
        }

        // Calculer le nouvel ordre selon la direction (décrémentation pour "up", incrémentation pour "down")
        $newOrder = ($direction === "up") ? $currentOrder - 1 : $currentOrder + 1;

        // Trouver l'item qui a actuellement l'ordre que nous voulons attribuer à notre item
        // Cet item sera déplacé à la position de notre item actuel (échange de positions)
        $stmt = $this->db->prepare("SELECT id FROM items WHERE `item_order` = :newOrder AND roadmap_id = :roadmap_id AND user_id = :user_id");
        $stmt->bindParam(':newOrder', $newOrder, PDO::PARAM_INT);
        $stmt->bindParam(':roadmap_id', $roadmapId, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $this->user_id, PDO::PARAM_INT);
        $stmt->execute();
        $otherItem = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($otherItem) {
            // Échanger les ordres entre les deux items:
            // L'autre item prend l'ancienne position de notre item actuel
            $stmt = $this->db->prepare("UPDATE items SET `item_order` = :currentOrder WHERE id = :otherId AND user_id = :user_id");
            $stmt->bindParam(':currentOrder', $currentOrder, PDO::PARAM_INT);
            $stmt->bindParam(':otherId', $otherItem['id'], PDO::PARAM_INT);
            $stmt->bindParam(':user_id', $this->user_id, PDO::PARAM_INT);
            $stmt->execute();
        }

        // Mettre à jour l'ordre de l'item actuel vers sa nouvelle position
        $stmt = $this->db->prepare("UPDATE items SET `item_order` = :newOrder WHERE id = :id AND user_id = :user_id");
        $stmt->bindParam(':newOrder', $newOrder, PDO::PARAM_INT);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $this->user_id, PDO::PARAM_INT);
        
        return $stmt->execute();
    }

    
}