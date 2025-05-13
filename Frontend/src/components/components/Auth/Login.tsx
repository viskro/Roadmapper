import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components
import { ExclamationTriangleIcon, CheckCircledIcon } from "@radix-ui/react-icons"; // Optional: Add icons for alerts
import { Loader2 } from "lucide-react"; // Import Loader2 icon

export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const navigate = useNavigate();
    const { login, refreshAuth } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        // Basic validation
        if (!email.trim() || !password.trim()) {
            setError("Veuillez entrer votre email et mot de passe.");
            setLoading(false);
            return;
        }

        try {
            console.log("Tentative de connexion dans le composant Login...");
            const result = await login(email, password);

            if (result.success) {
                setSuccessMessage("Connexion réussie ! Redirection en cours...");
                console.log("Connexion réussie dans Login, rafraîchissement de l'authentification...");

                // Attendre avant de rafraîchir l'authentification
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Forcer un rafraîchissement de l'état d'authentification
                await refreshAuth();

                console.log("Redirection vers la page d'accueil...");
                navigate("/", { replace: true });
            } else {
                console.log("Échec de connexion dans Login:", result.message);
                setError(result.message || "Échec de la connexion. Veuillez vérifier vos identifiants."); // Use a default error message
            }
        } catch (error) {
            console.error("Erreur lors de la connexion :", error);
            setError("Une erreur s'est produite lors de la connexion.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen w-full p-4"> {/* Center card vertically and horizontally */}
            <Card className="w-full max-w-sm"> {/* Make card responsive, max-width 384px */}
                <CardHeader className="text-center"> {/* Center header content */}
                    <CardTitle className="text-2xl">Connexion</CardTitle>
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
                    {successMessage && (
                        <Alert variant="default" className="mb-4"> {/* Use default variant for success */}
                            <CheckCircledIcon className="h-4 w-4" />
                            <AlertTitle>Succès</AlertTitle>
                            <AlertDescription>
                                {successMessage}
                            </AlertDescription>
                        </Alert>
                    )}
                    <form onSubmit={handleLogin}>
                        <div className="grid gap-4"> {/* Use grid for form fields */}
                            <div className="grid gap-2"> {/* Use grid for label and input */}
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    type="email"
                                    id="email"
                                    placeholder="Email"
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    required // Add required attribute
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Mot de passe</Label>
                                <Input
                                    type="password"
                                    id="password"
                                    placeholder="Mot de passe"
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    required // Add required attribute
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full hover:cursor-pointer" // Make button full width
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    "Se connecter"
                                )}
                            </Button>
                            <div className="mt-4 text-center text-sm"> {/* Center and style register link */}
                                Vous n'avez pas de compte ?{" "}
                                <Link to="/register" className="underline">
                                    S'inscrire
                                </Link>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
