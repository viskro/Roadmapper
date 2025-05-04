import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiPost, API_ENDPOINTS } from "@/utils/apiUtils";
import { handleError, handleApiError } from "@/utils/errorUtils";

export function CreateRoadmap() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Langages");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    

    const categories = [
        "Langages", 
        "Frameworks", 
        "Bases de données", 
        "Outils", 
        "Cloud", 
        "DevOps", 
        "Mobile", 
        "IA & Machine Learning",
        "Autre"
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            if (!name || !category) {
                throw new Error("Veuillez remplir tous les champs obligatoires.");
            }

            const result = await apiPost(API_ENDPOINTS.ADD_ROADMAP, {
                name,
                description,
                category
            
            }as Record<string, unknown>);

            if (handleApiError(result, setError, "créer la roadmap")) {
                setSuccess("Roadmap créée avec succès !");
                await new Promise(resolve => setTimeout(resolve, 1000));
                window.location.reload();
            }

        } catch (error) {
            handleError(error, setError, "créer la roadmap");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container m-auto py-8">
            <Card className="max-w-lg mx-auto bg-background">
                <CardHeader>
                    <CardTitle className="text-2xl">Créer une nouvelle roadmap</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="p-4 mb-4 text-sm text-red-800 bg-red-100 rounded-lg">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-4 mb-4 text-sm text-green-800 bg-green-100 rounded-lg">
                            {success}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <Label htmlFor="name" className="mb-2">Nom de la roadmap *</Label>
                            <Input 
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="ex: JavaScript"
                                disabled={loading}
                                required
                            />
                        </div>
                        
                        <div>
                            <Label htmlFor="category" className="mb-2">Catégorie *</Label>
                            <Select 
                                value={category} 
                                onValueChange={setCategory}
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez une catégorie" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div>
                            <Label htmlFor="description" className="mb-2">Description</Label>
                            <Textarea 
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Décrivez cette roadmap..."
                                className="resize-none"
                                disabled={loading}
                                rows={4}
                            />
                        </div>
                        
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="mt-2"
                        >
                            {loading ? "Création en cours..." : "Créer la roadmap"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
} 