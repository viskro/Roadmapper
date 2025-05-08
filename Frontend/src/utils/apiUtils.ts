/**
 * apiUtils.ts
 * -----------
 * 
 * Module d'utilitaires pour les appels API
 * 
 * Ce module centralise la configuration et l'exécution des appels API dans l'application,
 * facilitant la maintenance et la cohérence des communications avec le backend.
 * Il fournit:
 * - Des constantes pour les URL de l'API
 * - Des méthodes génériques pour effectuer des requêtes HTTP
 * - Une gestion standardisée des erreurs et de l'authentification
 */

// Configuration de base de l'API
const API_BASE_URL = "http://localhost:80/projetWKS/Backend/api";

// Points d'entrée de l'API
export const API_ENDPOINTS = {
    // Authentication
    CHECK_AUTH: `${API_BASE_URL}/checkAuth.php`,
    LOGIN: `${API_BASE_URL}/login.php`,
    LOGOUT: `${API_BASE_URL}/logout.php`,
    REGISTER: `${API_BASE_URL}/register.php`,
    
    // Items
    GET_ITEMS: `${API_BASE_URL}/showItems.php`,
    ADD_ITEM: `${API_BASE_URL}/addItem.php`,
    UPDATE_ITEM: `${API_BASE_URL}/updateItem.php`,
    DELETE_ITEM: `${API_BASE_URL}/deleteItem.php`,
    UPDATE_ITEM_ORDER: `${API_BASE_URL}/updateItemOrder.php`,
    IS_FINISHED: `${API_BASE_URL}/isFinished.php`,
    SET_IS_FINISHED: `${API_BASE_URL}/setIsFinished.php`,
    
    // Roadmaps
    GET_USER_ROADMAPS: `${API_BASE_URL}/getUserRoadmaps.php`,
    GET_ROADMAP_ITEMS: `${API_BASE_URL}/getRoadmapItems.php`,
    ADD_ROADMAP: `${API_BASE_URL}/addRoadmap.php`,
    DELETE_ROADMAP: `${API_BASE_URL}/deleteRoadmap.php`
};

// Options de base pour fetch avec credentials
const BASE_FETCH_OPTIONS = {
    credentials: "include" as RequestCredentials
};

/**
 * Type pour les réponses API standardisées
 * 
 * @template T Type des données retournées par l'API, par défaut Record<string, unknown>
 */
export interface ApiResponse<T = Record<string, unknown>> {
    success: boolean;
    message: string;
    data?: T;
}

/**
 * Effectue un appel API GET générique
 * 
 * @template T Type des données attendues dans la réponse
 * @param url L'URL de l'API à appeler
 * @returns Promesse contenant la réponse API typée
 */
export async function apiGet<T = Record<string, unknown>>(url: string): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(url, {
            ...BASE_FETCH_OPTIONS,
            method: "GET"
        });
        
        return await response.json();
    } catch (error) {
        console.error(`Erreur lors de l'appel GET à ${url}:`, error);
        return {
            success: false,
            message: "Erreur de connexion au serveur"
        };
    }
}

/**
 * Effectue un appel API POST générique avec des données JSON
 * 
 * @template T Type des données attendues dans la réponse
 * @param url L'URL de l'API à appeler
 * @param data Les données à envoyer (seront converties en JSON)
 * @returns Promesse contenant la réponse API typée
 */
export async function apiPost<T = Record<string, unknown>>(
    url: string, 
    data: Record<string, unknown>
): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(url, {
            ...BASE_FETCH_OPTIONS,
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        
        return await response.json();
    } catch (error) {
        console.error(`Erreur lors de l'appel POST à ${url}:`, error);
        return {
            success: false,
            message: "Erreur de connexion au serveur"
        };
    }
}

/**
 * Effectue un appel API PATCH générique avec des données JSON
 * 
 * @template T Type des données attendues dans la réponse
 * @param url L'URL de l'API à appeler
 * @param data Les données à envoyer (seront converties en JSON)
 * @returns Promesse contenant la réponse API typée
 */
export async function apiPatch<T = Record<string, unknown>>(
    url: string, 
    data: Record<string, unknown>
): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(url, {
            ...BASE_FETCH_OPTIONS,
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        
        return await response.json();
    } catch (error) {
        console.error(`Erreur lors de l'appel PATCH à ${url}:`, error);
        return {
            success: false,
            message: "Erreur de connexion au serveur"
        };
    }
}

/**
 * Effectue un appel API DELETE pour supprimer une ressource
 * 
 * Conforme aux principes RESTful, cette fonction place l'identifiant dans l'URL
 * plutôt que dans le corps de la requête pour les opérations de suppression.
 * 
 * @template T Type des données attendues dans la réponse
 * @param url L'URL de base de l'API (sans l'ID)
 * @param data Les données contenant l'ID de la ressource à supprimer
 * @returns Promesse contenant la réponse API typée
 */
export async function apiDelete<T = Record<string, unknown>>(
    url: string, 
    data: Record<string, unknown>
): Promise<ApiResponse<T>> {
    try {
        // Extraire l'ID des données pour l'ajouter à l'URL
        const id = data.id;
        if (!id) {
            throw new Error("L'identifiant 'id' est requis pour une requête DELETE");
        }
        
        // Construire l'URL complète avec l'ID
        const fullUrl = `${url}/${id}`;

        const response = await fetch(fullUrl, {
            ...BASE_FETCH_OPTIONS,
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
            // Plus besoin d'inclure un corps de requête
        });
        
        return await response.json();
    } catch (error) {
        console.error(`Erreur lors de l'appel DELETE à ${url}:`, error);
        return {
            success: false,
            message: "Erreur de connexion au serveur"
        };
    }
}

/**
 * Effectue un appel API PUT générique avec des données JSON
 * 
 * @template T Type des données attendues dans la réponse
 * @param url L'URL de l'API à appeler
 * @param data Les données à envoyer
 * @returns Promesse contenant la réponse API typée
 */
export async function apiPut<T = Record<string, unknown>>(
    url: string, 
    data: Record<string, unknown>
): Promise<ApiResponse<T>> {
    try {
        const id = data.id;
        if (!id) {
            throw new Error("L'identifiant 'id' est requis pour une requête PUT");
        }

        const fullUrl = `${url}/${id}`;
        const response = await fetch(fullUrl, {
            ...BASE_FETCH_OPTIONS,
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        
        return await response.json();
    } catch (error) {
        console.error(`Erreur lors de l'appel PUT à ${url}:`, error);
        return {
            success: false,
            message: "Erreur de connexion au serveur"
        };
    } 
}