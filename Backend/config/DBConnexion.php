<?php
/**
 * DBConnexion.php
 * ---------------
 * 
 * Classe de connexion à la base de données implémentant le patron de conception Singleton.
 * 
 * Ce fichier gère la connexion à la base de données MySQL de manière optimisée et sécurisée.
 * L'utilisation du pattern Singleton garantit qu'une seule instance de connexion est
 * maintenue pendant toute la durée de vie de l'application, évitant ainsi les
 * problèmes de performance liés à l'ouverture multiple de connexions.
 * 
 * @author Axel Malotiaux
 * @version 1.0
 */

// Inclusion des constantes de configuration
require_once "config.php";

/**
 * Classe DBConnexion - Gestion de la connexion à la base de données
 * 
 * Cette classe implémente le pattern Singleton pour garantir qu'une seule
 * instance de connexion à la base de données existe dans l'application.
 * 
 * Avantages du pattern Singleton dans ce contexte:
 * - Optimisation des ressources: une seule connexion est maintenue
 * - Cohérence des données: toutes les opérations partagent la même connexion
 * - Simplicité d'utilisation: accès global à la connexion sans la passer en paramètre
 * 
 * Utilisation:
 * $db = DBConnexion::getInstance()->getConnection();
 */
class DBConnexion
{
  /**
   * @var DBConnexion|null $instance Instance unique de la classe
   */
  private static $instance = null;
  
  /**
   * @var PDO $conn Objet de connexion PDO à la base de données
   */
  private $conn;

  /**
   * @var string $host Hôte de la base de données (défini dans config.php)
   */
  private $host = HOST;
  
  /**
   * @var string $user Nom d'utilisateur de la base de données (défini dans config.php)
   */
  private $user = USERNAME;
  
  /**
   * @var string $password Mot de passe de la base de données (défini dans config.php)
   */
  private $password = PASSWORD;
  
  /**
   * @var string $name Nom de la base de données (défini dans config.php)
   */
  private $name = DATABASE;

  /**
   * Constructeur privé - Initialise la connexion à la base de données
   * 
   * Le constructeur est déclaré privé pour empêcher l'instanciation directe
   * de la classe, conformément au pattern Singleton. Il initialise une connexion
   * PDO avec des attributs sécurisés et optimisés.
   * 
   * @throws PDOException Si la connexion échoue
   */
  private function __construct()
  {
    try {
      // Création de la connexion PDO avec l'encodage UTF-8
      $this->conn = new PDO(
        "mysql:host={$this->host};dbname={$this->name};charset=utf8", 
        $this->user, 
        $this->password
      );
      
      // Configuration des attributs PDO pour une meilleure gestion des erreurs
      $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
      
      // Désactive l'émulation des requêtes préparées pour une meilleure sécurité
      $this->conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
      
      // Assure que les résultats sont retournés sous forme de tableau associatif par défaut
      $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
      // En production, il serait préférable de logger l'erreur plutôt que de l'afficher
      echo "Erreur de connexion à la base de données : " . $e->getMessage();
      // Relance l'exception pour permettre sa gestion par l'appelant
      throw $e;
    }
  }

  /**
   * Méthode d'accès à l'instance unique
   * 
   * Cette méthode statique est le point d'accès global à l'instance unique
   * de la classe. Si l'instance n'existe pas encore, elle la crée.
   * 
   * @return DBConnexion Instance unique de la classe DBConnexion
   */
  public static function getInstance()
  {
    if (!self::$instance) {
      self::$instance = new self();
    }
    return self::$instance;
  }

  /**
   * Récupère l'objet de connexion PDO
   * 
   * Cette méthode permet d'accéder à l'objet PDO pour effectuer
   * des opérations sur la base de données.
   * 
   * @return PDO Objet de connexion PDO actif
   */
  public function getConnection()
  {
    return $this->conn;
  }
}
