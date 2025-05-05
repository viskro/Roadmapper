import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { API_ENDPOINTS, apiPut } from "@/utils/apiUtils";
import { handleError, handleApiError } from "@/utils/errorUtils";

interface IsFinishedProps {
    id: number;
    initialIsFinished: boolean;
    onItemModified?: () => void;
}

export default function IsFinished({ id, initialIsFinished, onItemModified }: IsFinishedProps) {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isFinished, setIsFinished] = useState<boolean>(initialIsFinished);

    const handleToggleFinished = async () => {
        setLoading(true);
        setError(null);
        console.log(error);
        try {
            const result = await apiPut(API_ENDPOINTS.SET_IS_FINISHED, {id} as Record<string, unknown>);

            if (result.success) {
                setIsFinished(result.data.isFinished);
                if (onItemModified) {
                    onItemModified();
                }
            } else {
                handleApiError(result, setError, "modification du statut");
            }
        } catch (error) {
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