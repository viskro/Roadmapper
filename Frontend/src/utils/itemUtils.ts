/**
 * Utilitaires pour la gestion des items et des roadmaps
 * 
 * Ce module centralise toutes les fonctions et types liés à la manipulation 
 * des items et des roadmaps dans l'application. Il offre:
 * - Des définitions de types claires pour garantir la cohérence des données
 * - Des fonctions de formatage pour la présentation des données
 * - Des fonctions d'appel API encapsulées pour interagir avec le backend
 * 
 * Ces utilitaires sont conçus pour être réutilisables dans différents composants
 * de l'application, facilitant ainsi la maintenance et réduisant la duplication de code.
 */

import { API_ENDPOINTS, apiGet, apiPut, ApiResponse } from "./apiUtils";

// Types
/**
 * Représente un élément (item) d'une roadmap
 * 
 * Un item est une étape individuelle dans un parcours d'apprentissage.
 * Il appartient à une roadmap spécifique et possède un ordre d'affichage.
 */
export interface Item {
    id: number;                // Identifiant unique de l'item
    title: string;             // Titre de l'item
    description: string;       // Description détaillée de l'item
    created_at: string;        // Date de création au format ISO ou format lisible
    item_order?: number;       // Position dans la liste des items (optionnel)
    roadmap_id: number;        // ID de la roadmap à laquelle appartient l'item
}

/**
 * Représente une feuille de route d'apprentissage
 * 
 * Une roadmap est une collection structurée d'items qui définissent
 * un parcours d'apprentissage pour un sujet spécifique.
 */
export interface Roadmap {
    id: number;                // Identifiant unique de la roadmap
    name: string;              // Nom de la roadmap
    description: string;       // Description détaillée du parcours d'apprentissage
    category: string;          // Catégorie (ex: "Langages", "Frameworks", etc.)
    slug: string;              // Identifiant URL-friendly pour les liens
}

/**
 * Formatte un item pour l'affichage
 * 
 * Cette fonction prend un objet Item et retourne une version modifiée avec
 * sa date de création formatée pour une meilleure lisibilité.
 * 
 * @param item L'item à formatter
 * @returns Une copie de l'item avec la date correctement formatée
 */
export const formatItem = (item: Item): Item => {
    return {
        ...item,
        created_at: item.created_at ? 
            new Date(item.created_at.trim()).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
            }) : 
            "Date non disponible",
    };
};

/**
 * Trie les items par ordre croissant
 * 
 * Cette fonction est essentielle pour garantir que les items s'affichent
 * dans le bon ordre dans l'interface utilisateur, suivant leur attribut item_order.
 * Elle crée une nouvelle copie du tableau, préservant ainsi l'immuabilité des données.
 * 
 * @param items Le tableau d'items à trier
 * @returns Un nouveau tableau d'items triés par ordre croissant
 */
export const sortItemsByOrder = (items: Item[]): Item[] => {
    return [...items].sort((a, b) => (a.item_order || 0) - (b.item_order || 0));
};

/**
 * Récupère les items d'une roadmap depuis l'API
 * 
 * Cette fonction effectue une requête au backend pour obtenir tous les items
 * associés à une roadmap spécifique, identifiée par son ID. Elle utilise les
 * utilitaires API centralisés pour la cohérence et la fiabilité.
 * 
 * @param roadmapId L'ID de la roadmap dont on veut récupérer les items
 * @returns Une promesse qui se résout avec la réponse API typée
 */
export const fetchRoadmapItemsApi = async (roadmapId: number): Promise<ApiResponse> => {
    return await apiGet(`${API_ENDPOINTS.GET_ROADMAP_ITEMS}?id=${roadmapId}`);
};

/**
 * Récupère une roadmap par son slug depuis l'API
 * 
 * Cette fonction est utilisée pour charger les détails d'une roadmap
 * et ses items associés en utilisant le slug (identifiant URL-friendly).
 * Elle est notamment utilisée lors de la navigation vers une roadmap spécifique.
 * 
 * @param slug Le slug URL-friendly de la roadmap
 * @returns Une promesse qui se résout avec la réponse API typée
 */
export const fetchRoadmapBySlugApi = async (slug: string): Promise<ApiResponse> => {
    return await apiGet(`${API_ENDPOINTS.GET_ROADMAP_ITEMS}?slug=${slug}`);
};

/**
 * Récupère la liste de toutes les roadmaps de l'utilisateur connecté
 * 
 * Cette fonction est utilisée pour charger la liste des roadmaps disponibles,
 * généralement pour le menu de navigation ou la page d'accueil.
 * Elle nécessite que l'utilisateur soit authentifié.
 * 
 * @returns Une promesse qui se résout avec la réponse API typée
 */
export const fetchUserRoadmapsApi = async (): Promise<ApiResponse> => {
    return await apiGet(API_ENDPOINTS.GET_USER_ROADMAPS);
};

/**
 * Met à jour l'ordre d'affichage d'un item
 * 
 * Cette fonction permet de déplacer un item vers le haut ou vers le bas
 * dans une roadmap en utilisant l'API updateItemOrder.
 * 
 * Utilisation: 
 * ```typescript
 * // Déplacer l'item avec ID 123 vers le haut
 * updateItemOrderApi(123, "up"); 
 * ```
 * 
 * Conforme aux principes RESTful, l'ID est ajouté dans l'URL.
 * 
 * @param id Identifiant de l'item à déplacer
 * @param direction Direction du déplacement ("up" pour monter, "down" pour descendre)
 * @returns Promesse contenant la réponse de l'API
 */
export const updateItemOrderApi = async (id: number, direction: "up" | "down"): Promise<ApiResponse> => {
    // L'ID est passé à la fois dans l'objet de données et sera extrait pour l'URL
    return await apiPut(API_ENDPOINTS.UPDATE_ITEM_ORDER, { id, direction } as Record<string, unknown>);
}; 