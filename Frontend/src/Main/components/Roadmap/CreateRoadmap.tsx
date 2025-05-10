import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiPost, API_ENDPOINTS } from "@/utils/apiUtils";
import { handleError, handleApiError } from "@/utils/errorUtils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components
import { ExclamationTriangleIcon, CheckCircledIcon } from "@radix-ui/react-icons"; // Optional: Add icons for alerts
import { Loader2 } from "lucide-react"; // Import Loader2 icon
import { useNavigate } from "react-router-dom"; // Import useNavigate

export function CreateRoadmap() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Langages");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const navigate = useNavigate(); // Initialize useNavigate

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
                setError("Veuillez remplir tous les champs obligatoires."); // Use setError for validation messages
                setLoading(false);
                return; // Stop execution if validation fails
            }

            const result = await apiPost(API_ENDPOINTS.ADD_ROADMAP, {
                name,
                description,
                category

            } as Record<string, unknown>);

            if (handleApiError(result, setError, "créer la roadmap")) {
                setSuccess("Roadmap créée avec succès ! Redirection en cours...");
                // Redirect after a short delay to show success message
                setTimeout(() => {
                    // Consider navigating to the new roadmap or dashboard instead of reloading
                    // navigate(`/roadmap/${result.data.slug}`); // Assuming slug is returned
                    navigate("/dashboard"); // Or navigate to dashboard
                }, 1500); // Redirect after 1.5 seconds
            }

        } catch (error) {
            handleError(error, setError, "créer la roadmap");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen w-full p-4"> {/* Center content */}
            <Card className="w-full max-w-lg"> {/* Responsive card width */}
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Créer une nouvelle roadmap</CardTitle> {/* Center title */}
                </CardHeader>
                <CardContent>
                    {/* Use Alert for error messages */}
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <ExclamationTriangleIcon className="h-4 w-4" />
                            <AlertTitle>Erreur</AlertTitle>
                            <AlertDescription>
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}
                    {/* Use Alert for success messages */}
                    {success && (
                        <Alert variant="default" className="mb-4"> {/* Use default variant for success */}
                            <CheckCircledIcon className="h-4 w-4" />
                            <AlertTitle>Succès</AlertTitle>
                            <AlertDescription>
                                {success}
                            </AlertDescription>
                        </Alert>
                    )}
                    <form onSubmit={handleSubmit} className="grid gap-4"> {/* Use grid for form fields */}
                        <div className="grid gap-2"> {/* Use grid for label and input */}
                            <Label htmlFor="name">Nom de la roadmap *</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="ex: JavaScript"
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="category">Catégorie *</Label>
                            <Select
                                value={category}
                                onValueChange={setCategory}
                                disabled={loading}
                            >
                                <SelectTrigger id="category"> {/* Add id for accessibility */}
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

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
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
                            className="mt-2 w-full" // Make button full width
                        >
                            {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                "Créer la roadmap"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
