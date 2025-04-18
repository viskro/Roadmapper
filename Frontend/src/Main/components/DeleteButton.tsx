import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { API_ENDPOINTS, apiPost } from "@/utils/apiUtils";
import { handleError, handleApiError } from "@/utils/errorUtils";

interface DeleteButtonProps {
    id: number;
    onItemDeleted?: () => void;
}

export default function DeleteButton({ id, onItemDeleted }: DeleteButtonProps) {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet item ? Cette action est irréversible.")) {
            return;
        }
        
        setLoading(true);
        setError(null);
        console.log(error);
        try {
            const result = await apiPost(API_ENDPOINTS.DELETE_ITEM, { id } as Record<string, unknown>);

            if (handleApiError(result, setError, "suppression d'un item")) {
                console.log("Item supprimé avec succès");
                
                // Si un callback est fourni, on l'appelle
                if (onItemDeleted) {
                    onItemDeleted();
                } else {
                    // Sinon on recharge la page (comportement par défaut)
                    window.location.reload();
                }
            }
        } catch (error) {
            handleError(error, setError, "la suppression d'un item");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button 
            variant={"destructive"} 
            className="bg-destructive text-destructive-foreground hover:cursor-pointer hover:text-destructive-foreground" 
            onClick={handleDelete}
            disabled={loading}
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 />}
        </Button>
    );
}