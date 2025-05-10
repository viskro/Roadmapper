import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { API_ENDPOINTS, apiDelete } from "@/utils/apiUtils";
import { handleError, handleApiError } from "@/utils/errorUtils";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter, // Use DialogFooter for buttons
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useNavigate } from "react-router-dom";

interface DeleteButtonProps {
    id: number;
    onRoadmapDeleted?: () => void;
}

export function DeleteRoadmapButton({ id, onRoadmapDeleted }: DeleteButtonProps) {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const handleDelete = async () => {

        setLoading(true);
        setError(null);
        console.log(error); // Consider using a more robust logging mechanism

        try {
            const result = await apiDelete(API_ENDPOINTS.DELETE_ROADMAP, { id } as Record<string, unknown>);

            if (handleApiError(result, setError, "suppression d'une roadmap")) {
                console.log("Roadmap supprimée avec succès");

                // Si un callback est fourni, on l'appelle
                if (onRoadmapDeleted) {
                    onRoadmapDeleted();
                } else {
                    // Sinon on redirige vers le dashboard ou une page appropriée
                    navigate("/dashboard"); // Redirect to dashboard after deletion
                    // Avoid window.location.reload() for better user experience
                }
            }
        } catch (error) {
            handleError(error, setError, "la suppression d'un item"); // Error message seems to refer to item, should be roadmap
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="destructive" // Explicitly use variant prop
                    size="lg" // Explicitly use size prop
                    className="hover:cursor-pointer" // Use default shadcn/ui colors
                    disabled={loading}
                >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Supprimer la Roadmap"}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Supprimer cette roadmap</DialogTitle>
                    <DialogDescription>
                        Êtes-vous sûr de vouloir supprimer cette roadmap ? Cette action est irréversible.
                    </DialogDescription>
                </DialogHeader>
                {/* Use DialogFooter for action buttons */}
                <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                    <DialogClose asChild>
                        <Button
                            variant="outline" // Explicitly use variant prop
                            className="hover:cursor-pointer" // Use default shadcn/ui colors
                            disabled={loading} // Disable cancel button while loading
                        >
                            Annuler
                        </Button>
                    </DialogClose>
                    <Button
                        variant="destructive" // Explicitly use variant prop
                        className="hover:cursor-pointer" // Use default shadcn/ui colors
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Supprimer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
