import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { API_ENDPOINTS, apiPost } from "@/utils/apiUtils";
import { handleError, handleApiError } from "@/utils/errorUtils";

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
                <Button variant={"default"} size={"lg"} className="w-40 bg-primary text-primary-foreground hover:cursor-pointer">
                    Ajouter une étape
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 ml-32 bg-background text-foreground">
                {error && (
                    <div className="p-3 mb-3 text-sm text-red-800 bg-red-100 rounded-lg">
                        {error}
                    </div>
                )}
                <form method="POST" onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Label htmlFor="title" className="text-foreground">Nom de l'étape</Label>
                    <Input 
                        type="text" 
                        name="title" 
                        value={title}
                        onChange={(e) => {setTitle(e.target.value)}}
                        disabled={loading}
                        required
                    />

                    <Label htmlFor="description" className="text-foreground">Description de l'étape</Label>
                    <Textarea 
                        name="description" 
                        className="resize-none" 
                        rows={4} 
                        value={description}
                        onChange={(e) => {setDescription(e.target.value)}}
                        disabled={loading}
                    />

                    <Button 
                        type="submit" 
                        className="hover:cursor-pointer"
                        disabled={loading}
                    >
                        {loading ? "Ajout en cours..." : "Ajouter"}
                    </Button>
                </form>
            </PopoverContent>
        </Popover>
    )
}