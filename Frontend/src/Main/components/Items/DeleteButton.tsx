import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { API_ENDPOINTS, apiDelete } from "@/utils/apiUtils";
import { handleError, handleApiError } from "@/utils/errorUtils";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"

interface DeleteButtonProps {
    id: number;
    onItemDeleted?: () => void;
}

export default function DeleteButton({ id, onItemDeleted }: DeleteButtonProps) {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        
        setLoading(true);
        setError(null);
        console.log(error);
        try {
            const result = await apiDelete(API_ENDPOINTS.DELETE_ITEM, { id } as Record<string, unknown>);

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
        <Dialog>
            <DialogTrigger asChild>
                <Button 
                    variant={"destructive"} 
                    className="bg-destructive text-destructive-foreground hover:cursor-pointer hover:text-destructive-foreground" 
                    disabled={loading}
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 />}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Supprimer cet item</DialogTitle>
                    <DialogDescription>
                        Êtes-vous sûr de vouloir supprimer cet item ? Cette action est irréversible.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2">
                    <Button
                    type="submit"
                    size="sm"
                    variant={"destructive"}
                    className="bg-destructive text-destructive-foreground hover:cursor-pointer hover:text-destructive-foreground"
                    onClick={handleDelete}
                    >
                        Supprimer
                    </Button>
                    <DialogClose asChild>
                        <Button
                        size="sm"
                        variant={"outline"}
                        className="bg-secondary text-secondary-foreground hover:cursor-pointer hover:text-secondary-foreground">
                            Annuler
                        </Button>
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    );
}