import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { API_ENDPOINTS, apiPost } from "@/utils/apiUtils";
import { handleError, handleApiError } from "@/utils/errorUtils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"; // Optional: Add an icon for the alert
import { Loader2, Plus } from "lucide-react"; // Add Plus icon for the button

interface AddButtonProps {
    onItemAdded?: () => void;
    roadmapId: number;
}

export function AddButton({ onItemAdded, roadmapId }: AddButtonProps) {
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

        if (!title.trim()) {
            setError("Le titre est requis");
            setLoading(false);
            return;
        }

        if (!roadmapId) {
            setError("ID de roadmap manquant");
            setLoading(false);
            return;
        }

        try {
            const result = await apiPost(API_ENDPOINTS.ADD_ITEM, {
                title,
                description,
                roadmap_id: roadmapId
            } as Record<string, unknown>);

            if (handleApiError(result, setError, "ajout d'un item")) {
                console.log("Item ajouté avec succès");
                setTitle("");
                setDescription("");
                setOpen(false);

                // Appel du callback pour mettre à jour les données dans le composant parent
                if (onItemAdded) {
                    onItemAdded();
                }
            }
        } catch (error) {
            handleError(error, setError, "l'ajout d'un item");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="default"
                    size="lg"
                    className="w-40 hover:cursor-pointer" // Use default shadcn/ui colors
                    disabled={loading}
                >
                     {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Ajouter une étape
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 ml-32"> {/* Use default shadcn/ui colors */}
                {error && (
                    <Alert variant="destructive" className="mb-4"> {/* Use Alert for errors */}
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        <AlertTitle>Erreur</AlertTitle>
                        <AlertDescription>
                            {error}
                        </AlertDescription>
                    </Alert>
                )}
                <form method="POST" onSubmit={handleSubmit} className="grid gap-4"> {/* Use grid for better form layout */}
                    <div className="grid gap-2">
                        <Label htmlFor="title">Nom de l'étape</Label>
                        <Input
                            id="title"
                            type="text"
                            name="title"
                            value={title}
                            onChange={(e) => { setTitle(e.target.value) }}
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description de l'étape</Label>
                        <Textarea
                            id="description"
                            name="description"
                            className="resize-none"
                            rows={4}
                            value={description}
                            onChange={(e) => { setDescription(e.target.value) }}
                            disabled={loading}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="hover:cursor-pointer"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Ajouter"}
                    </Button>
                </form>
            </PopoverContent>
        </Popover>
    )
}
