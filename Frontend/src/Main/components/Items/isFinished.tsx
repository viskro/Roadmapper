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
        // Optimistic UI update - Mettre à jour l'UI immédiatement
        const expectedNewState = !isFinished;
        setIsFinished(expectedNewState);
        
        try {
            
            const result = await apiPut<SetIsFinishedResponse>(
                API_ENDPOINTS.SET_IS_FINISHED, 
                {id, isFinished} as Record<string, unknown>
            );
            
            if (result.success && result.data) {
                setIsFinished(result.data.isFinished);
                if (onItemModified) {
                    onItemModified(result.data.isFinished);
                }
            } else {
                setIsFinished(!expectedNewState); // Revert on failure
            handleApiError(result, setError, "modification du statut");
            }
        } catch (error) {
            setIsFinished(!expectedNewState); // Revert on error
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