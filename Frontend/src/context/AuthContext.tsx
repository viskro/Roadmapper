import React, { createContext, useContext, useState, useEffect } from "react";
import { API_ENDPOINTS, apiGet, apiPost, ApiResponse } from "@/utils/apiUtils";
import { handleError } from "@/utils/errorUtils";

// Type pour les informations utilisateur
interface User {
    id: number;
    username: string;
    email: string;
}

// Type pour la réponse d'authentification
interface AuthResponse extends ApiResponse {
    data?: {
        user?: User;
    }
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (email: string, password: string) => Promise<AuthResponse>;
    logout: () => Promise<AuthResponse>;
    checkingAuth: boolean;
    refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
    
    // Nous supprimons la variable sessionId qui n'est pas réellement utilisée pour la logique d'authentification
    // Elle est seulement utilisée pour les logs, ce qui peut être fait directement

    // Vérifie si l'utilisateur est connecté au chargement de l'application
    const checkAuth = async () => {
        try {
            setCheckingAuth(true);
            console.log("Vérification de l'authentification...");
            
            const result = await apiGet<{ user?: User }>(API_ENDPOINTS.CHECK_AUTH);
            console.log("Résultat de checkAuth:", result);
            
            setIsAuthenticated(result.success);
            
            if (result.success && result.data?.user) {
                // Si l'utilisateur est authentifié, récupérer ses informations
                console.log("Utilisateur authentifié:", result.data.user);
                setUser(result.data.user);
            } else {
                console.log("Utilisateur non authentifié");
                setUser(null);
            }
        } catch (error) {
            handleError(error, () => {}, "la vérification de l'authentification");
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setCheckingAuth(false);
        }
    };
    
    // Fonction pour forcer un rafraîchissement de l'état d'authentification
    const refreshAuth = async () => {
        // Ajouter un délai de 500ms pour laisser le temps au serveur de mettre à jour la session
        console.log("Attente de 500ms avant rafraîchissement de l'état d'authentification...");
        await new Promise(resolve => setTimeout(resolve, 500));
        await checkAuth();
    };
    
    useEffect(() => {
        checkAuth();
        // Vérifier l'authentification toutes les 5 minutes pour maintenir la session active
        const intervalId = setInterval(checkAuth, 5 * 60 * 1000);
        return () => clearInterval(intervalId);
    }, []);

    const login = async (email: string, password: string): Promise<AuthResponse> => {
        try {
            console.log("Tentative de connexion pour:", email);
            
            const result = await apiPost<{ user?: User }>(API_ENDPOINTS.LOGIN, { 
                email, 
                password 
            } as Record<string, unknown>);
            console.log("Résultat de login:", result);
            
            if (result.success && result.data?.user) {
                console.log("Connexion réussie, informations utilisateur:", result.data.user);
                setIsAuthenticated(true);
                setUser(result.data.user);
            } else {
                console.log("Échec de connexion:", result.message);
            }
            
            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erreur de connexion au serveur";
            console.error("Erreur lors de la connexion :", error);
            return { 
                success: false, 
                message: errorMessage 
            };
        }
    };

    const logout = async (): Promise<AuthResponse> => {
        try {
            console.log("Tentative de déconnexion...");
            
            const result = await apiPost(API_ENDPOINTS.LOGOUT, {} as Record<string, unknown>);
            console.log("Résultat de logout:", result);
            
            if (result.success) {
                console.log("Déconnexion réussie");
                setIsAuthenticated(false);
                setUser(null);
            } else {
                console.log("Échec de déconnexion:", result.message);
            }
            
            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erreur de déconnexion";
            console.error("Erreur lors de la déconnexion :", error);
            return { 
                success: false, 
                message: errorMessage 
            };
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, checkingAuth, refreshAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth doit être utilisé dans un AuthProvider");
    }
    return context;
};