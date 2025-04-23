import { Button } from "@/components/ui/button"
import { SquarePen, Loader2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { API_ENDPOINTS, apiPut } from "@/utils/apiUtils"
import { handleError, handleApiError } from "@/utils/errorUtils"

interface UpdateButtonProps {
    id: number;
    title: string;
    description: string;
    onItemUpdated?: () => void;
}

export function UpdateButton(props: UpdateButtonProps) {
    const { id, title: initialTitle, description: initialDescription, onItemUpdated } = props;

    const [title, setTitle] = useState<string>(initialTitle);
    const [description, setDescription] = useState<string>(initialDescription);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState<boolean>(false);

    // Récupérer la date actuelle et la formater pour le format DATE de MySQL
    const date = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format YYYY-MM-DD HH:MM:SS

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!title.trim()) {
            setError("Le titre est requis");
            return;
        }
        
        setLoading(true);
        setError(null);

        try {
            const result = await apiPut(API_ENDPOINTS.UPDATE_ITEM, { 
                id,
                title, 
                description, 
                date 
            } as Record<string, unknown>);

            if (handleApiError(result, setError, "mise à jour d'un item")) {
                console.log("Item mis à jour avec succès");
                setOpen(false);
                
                // Si un callback est fourni, on l'appelle
                if (onItemUpdated) {
                    onItemUpdated();
                } else {
                    // Sinon on recharge la page (comportement par défaut)
                    window.location.reload();
                }
            }
        } catch (error) {
            handleError(error, setError, "la mise à jour d'un item");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button 
                    variant={"default"} 
                    className="bg-primary-foreground text-primary hover:cursor-pointer hover:text-primary-foreground"
                    disabled={loading}
                >
                    <SquarePen />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 bg-background text-foreground" side="left">
                {error && (
                    <div className="p-3 mb-3 text-sm text-red-800 bg-red-100 rounded-lg">
                        {error}
                    </div>
                )}
                <form method="POST" onSubmit={handleUpdate} className="flex flex-col gap-4">
                    <Label htmlFor="title" className="text-foreground">Nom de l'étape</Label>
                    <Input 
                        type="text" 
                        name="title" 
                        value={title} 
                        onChange={(e) => { setTitle(e.target.value) }} 
                        disabled={loading}
                        required
                    />

                    <Label htmlFor="description" className="text-foreground">Description de l'étape</Label>
                    <Textarea 
                        name="description" 
                        className="resize-none" 
                        rows={4} 
                        value={description} 
                        onChange={(e) => { setDescription(e.target.value) }} 
                        disabled={loading}
                    />

                    <Button 
                        type="submit" 
                        className="hover:cursor-pointer"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Mise à jour...
                            </>
                        ) : "Mettre à jour"}
                    </Button>
                </form>
            </PopoverContent>
        </Popover>
    )
}