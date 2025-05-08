import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { API_ENDPOINTS, apiPut } from "@/utils/apiUtils";
import { handleError, handleApiError } from "@/utils/errorUtils";

interface IsFinishedProps {
    id: number;
    initialIsFinished: boolean;
    onItemModified?: (newFinishedState: boolean) => void;
}

// Interface pour les données retournées par l'API setIsFinished
interface SetIsFinishedResponse {
    isFinished: boolean;
}

export default function IsFinished({ id, initialIsFinished, onItemModified }: IsFinishedProps) {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isFinished, setIsFinished] = useState<boolean>(initialIsFinished);
    
    if (error) {
        console.log(error);
    }

    const handleToggleFinished = async () => {
        setLoading(true);
        setError(null);
        
        // Sauvegarde de l'état actuel avant l'appel API
        const currentState = isFinished;
        // Optimistic UI update - Mettre à jour l'UI immédiatement
        const expectedNewState = !currentState;
        setIsFinished(expectedNewState);
        
        try {
            // Ajout de log pour vérifier l'état actuel
            console.log("État actuel avant appel API:", currentState);
            
            const result = await apiPut<SetIsFinishedResponse>(
                API_ENDPOINTS.SET_IS_FINISHED, 
                {id, currentState} as Record<string, unknown>
            );

            console.log("Réponse API complète:", result);
            
            if (result.success && result.data) {
                const newFinishedState = result.data.isFinished;
                console.log("Nouvel état reçu de l'API:", newFinishedState);
                
                // Vérifier si l'état reçu correspond à l'état attendu
                if (newFinishedState !== expectedNewState) {
                    console.warn("L'état reçu de l'API ne correspond pas à l'état attendu!");
                }

                // Mettre à jour l'état local avec la réponse de l'API
                setIsFinished(newFinishedState);
                if (onItemModified) {
                    onItemModified(newFinishedState);
                }
            } else {
                console.log("Échec de l'appel API:", result.message);
                // En cas d'échec, on maintient l'état mis à jour localement
                if (onItemModified) {
                    onItemModified(expectedNewState);
                }
                handleApiError(result, setError, "modification du statut");
            }
        } catch (error) {
            console.error("Erreur lors de l'appel API:", error);
            // En cas d'erreur, on maintient l'état mis à jour localement
            if (onItemModified) {
                onItemModified(expectedNewState);
            }
            handleError(error, setError, "la modification du statut");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button 
            variant={isFinished ? "default" : "outline"}
            className={`${isFinished ? 'bg-green-600 hover:bg-green-700' : ''} transition-colors duration-200`}
            onClick={handleToggleFinished}
            disabled={loading}
            title={isFinished ? "Marquer comme non terminé" : "Marquer comme terminé"}
            
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Check className={`h-4 w-4 ${isFinished ? 'text-white' : ''}`} />
            )}
        </Button>
    );
}