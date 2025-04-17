<?php
/**
 * Classe Roadmap - Gère les opérations sur les feuilles de route d'apprentissage
 * 
 * Cette classe encapsule toutes les opérations CRUD (Create, Read, Update, Delete)
 * sur les roadmaps d'un utilisateur. Elle permet de créer et gérer des parcours
 * d'apprentissage organisés par catégorie (langages, frameworks, etc.).
 * Chaque opération vérifie systématiquement que l'utilisateur est bien propriétaire
 * des roadmaps manipulées pour garantir la sécurité des données.
 */
class Roadmap {
    /** @var PDO $db Instance de connexion à la base de données */
    private $db;
    
    /** @var int $user_id ID de l'utilisateur courant, utilisé pour sécuriser les requêtes */
    private $user_id;
    
    /**
     * Constructeur
     * 
     * Initialise une instance de la classe Roadmap avec une connexion à la base de données
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
     * Récupère une roadmap par son ID
     * 
     * Effectue une recherche sécurisée pour récupérer une roadmap spécifique
     * en vérifiant qu'elle appartient bien à l'utilisateur courant.
     * 
     * @param int $id ID de la roadmap à récupérer
     * @return array|false Tableau associatif contenant les données de la roadmap ou false si non trouvée
     */
    public function getById($id) {
        $stmt = $this->db->prepare("SELECT * FROM roadmaps WHERE id = :id AND user_id = :user_id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $this->user_id, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Récupère une roadmap par son slug
     * 
     * Recherche une roadmap à partir de son identifiant URL (slug) en s'assurant
     * qu'elle appartient bien à l'utilisateur courant. Cette méthode est particulièrement
     * utile pour les URLs conviviales où le slug apparaît dans l'URL plutôt que l'ID.
     * 
     * @param string $slug Slug de la roadmap (identifiant URL-friendly)
     * @return array|false Tableau associatif contenant les données de la roadmap ou false si non trouvée
     */
    public function getBySlug($slug) {
        $stmt = $this->db->prepare("SELECT * FROM roadmaps WHERE slug = :slug AND user_id = :user_id");
        $stmt->bindParam(':slug', $slug);
        $stmt->bindParam(':user_id', $this->user_id, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Récupère toutes les roadmaps de l'utilisateur
     * 
     * Retourne toutes les roadmaps appartenant à l'utilisateur courant, triées par
     * catégorie puis par nom. Pour chaque roadmap, le nombre d'items associés est calculé
     * via une sous-requête, ce qui permet d'afficher des informations sur le contenu
     * de chaque roadmap sans requêtes supplémentaires.
     * 
     * @return array Liste de toutes les roadmaps de l'utilisateur avec leur nombre d'items
     */
    public function getAllByUser() {
        // La sous-requête calcule le nombre d'items pour chaque roadmap
        $stmt = $this->db->prepare("
            SELECT r.*, 
                   (SELECT COUNT(*) FROM items WHERE roadmap_id = r.id) as item_count
            FROM roadmaps r 
            WHERE r.user_id = :user_id 
            ORDER BY r.category, r.name
        ");
        $stmt->bindParam(':user_id', $this->user_id, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Récupère les roadmaps de l'utilisateur organisées par catégorie
     * 
     * Réorganise les roadmaps de l'utilisateur en les groupant par catégorie.
     * Cette méthode facilite l'affichage des roadmaps dans l'interface utilisateur
     * où elles sont généralement regroupées par catégorie.
     * 
     * @return array Tableau associatif où les clés sont les catégories et les valeurs sont des tableaux de roadmaps
     */
    public function getCategorizedRoadmaps() {
        // Récupérer toutes les roadmaps d'abord
        $roadmaps = $this->getAllByUser();
        $categorized = [];
        
        // Regrouper les roadmaps par catégorie
        foreach ($roadmaps as $roadmap) {
            $category = $roadmap['category'];
            if (!isset($categorized[$category])) {
                $categorized[$category] = [];
            }
            $categorized[$category][] = $roadmap;
        }
        
        return $categorized;
    }
    
    /**
     * Crée une nouvelle roadmap
     * 
     * Crée une nouvelle roadmap pour l'utilisateur courant avec les informations fournies.
     * Génère automatiquement un slug unique à partir du nom pour les URL conviviales.
     * Si un slug identique existe déjà pour cet utilisateur, un identifiant unique 
     * est ajouté pour garantir l'unicité du slug.
     * 
     * @param string $name Nom de la roadmap
     * @param string $category Catégorie de la roadmap (ex: Langages, Frameworks, etc.)
     * @param string $description Description détaillée de la roadmap (optionnel)
     * @return array Tableau associatif contenant les informations de la roadmap créée, y compris son ID et son slug
     */
    public function create($name, $category, $description = '') {
        // Créer un slug à partir du nom en remplaçant les caractères non alphanumériques par des tirets
        $slug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $name));
        
        // Vérifier si le slug existe déjà pour cet utilisateur
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM roadmaps WHERE slug = :slug AND user_id = :user_id");
        $stmt->bindParam(':slug', $slug);
        $stmt->bindParam(':user_id', $this->user_id, PDO::PARAM_INT);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Si le slug existe déjà, ajouter un identifiant unique
        if ($result['count'] > 0) {
            $slug .= '-' . uniqid();
        }
        
        // Insérer la nouvelle roadmap dans la base de données
        $stmt = $this->db->prepare("
            INSERT INTO roadmaps (name, description, category, slug, user_id, created_at) 
            VALUES (:name, :description, :category, :slug, :user_id, CURRENT_DATE())
        ");
        
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':category', $category);
        $stmt->bindParam(':slug', $slug);
        $stmt->bindParam(':user_id', $this->user_id, PDO::PARAM_INT);
        $stmt->execute();
        
        // Récupérer l'ID de la roadmap nouvellement créée
        $roadmap_id = $this->db->lastInsertId();
        
        // Retourner les informations de la roadmap créée
        return [
            "id" => $roadmap_id,
            "name" => $name,
            "description" => $description,
            "category" => $category,
            "slug" => $slug
        ];
    }
    
    /**
     * Met à jour une roadmap existante
     * 
     * Modifie les informations d'une roadmap existante, en vérifiant que 
     * l'utilisateur courant en est bien le propriétaire.
     * Note: Cette méthode ne modifie pas le slug, pour éviter de casser les liens existants.
     * 
     * @param int $id ID de la roadmap à mettre à jour
     * @param string $name Nouveau nom de la roadmap
     * @param string $category Nouvelle catégorie de la roadmap
     * @param string $description Nouvelle description de la roadmap (optionnel)
     * @return bool True si la mise à jour a réussi (au moins une ligne modifiée), false sinon
     */
    public function update($id, $name, $category, $description = '') {
        $stmt = $this->db->prepare("
            UPDATE roadmaps 
            SET name = :name, description = :description, category = :category 
            WHERE id = :id AND user_id = :user_id
        ");
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':category', $category);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $this->user_id, PDO::PARAM_INT);
        $stmt->execute();
        
        // Retourne true si au moins une ligne a été modifiée
        return $stmt->rowCount() > 0;
    }
    
    /**
     * Supprime une roadmap
     * 
     * Supprime définitivement une roadmap et tous ses items associés grâce à la
     * contrainte de clé étrangère ON DELETE CASCADE. Vérifie que l'utilisateur 
     * courant est bien le propriétaire de la roadmap.
     * 
     * @param int $id ID de la roadmap à supprimer
     * @return bool True si la suppression a réussi (au moins une ligne supprimée), false sinon
     */
    public function delete($id) {
        // Les items sont supprimés automatiquement grâce à la contrainte ON DELETE CASCADE
        $stmt = $this->db->prepare("DELETE FROM roadmaps WHERE id = :id AND user_id = :user_id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $this->user_id, PDO::PARAM_INT);
        $stmt->execute();
        
        // Retourne true si au moins une ligne a été supprimée
        return $stmt->rowCount() > 0;
    }
} 