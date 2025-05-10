import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link } from "react-router-dom";
import { apiPost, API_ENDPOINTS } from "@/utils/apiUtils";
import { handleError, handleApiError } from "@/utils/errorUtils";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components
import { ExclamationTriangleIcon, CheckCircledIcon } from "@radix-ui/react-icons"; // Optional: Add icons for alerts
import { Loader2 } from "lucide-react"; // Import Loader2 icon

export function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);

    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(false); // Reset success state on new attempt
        setLoading(true);

        if (!username.trim()) {
            setError("Le nom d'utilisateur est requis.");
            setLoading(false);
            return;
        }
        if (!email.trim()) {
            setError("L'email est requis.");
            setLoading(false);
            return;
        }
        if (!password.trim()) {
            setError("Le mot de passe est requis.");
            setLoading(false);
            return;
        }

        try {
            const result = await apiPost(API_ENDPOINTS.REGISTER, {
                username,
                email,
                password
            } as Record<string, unknown>);

            if (handleApiError(result, setError, "s'enregistrer")) {
                console.log("Inscription success");
                setSuccess(true);
                // Optionally clear form fields on success
                setUsername("");
                setEmail("");
                setPassword("");
                // Redirect after a short delay to show success message
                setTimeout(() => {
                    navigate("/login");
                }, 1500); // Redirect after 1.5 seconds
            }
        } catch (error) {
            handleError(error, setError, "l'ajout d'un item"); // Error message seems incorrect, should be "l'inscription"
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen w-full p-4"> {/* Center card vertically and horizontally */}
            <Card className="w-full max-w-sm"> {/* Make card responsive, max-width 384px */}
                <CardHeader className="text-center"> {/* Center header content */}
                    <CardTitle className="text-2xl">Inscription</CardTitle>
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
                                Inscription réussie ! Redirection vers la page de connexion...
                            </AlertDescription>
                        </Alert>
                    )}
                    <form onSubmit={handleRegister}>
                        <div className="grid gap-4"> {/* Use grid for form fields */}
                            <div className="grid gap-2"> {/* Use grid for label and input */}
                                <Label htmlFor="username">Nom d'utilisateur</Label>
                                <Input
                                    type="text"
                                    id="username"
                                    placeholder="Nom d'utilisateur"
                                    disabled={loading}
                                    value={username} // Bind value to state
                                    onChange={(e) => setUsername(e.target.value)}
                                    required // Add required attribute
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    type="email"
                                    id="email"
                                    placeholder="Email"
                                    disabled={loading}
                                    value={email} // Bind value to state
                                    onChange={(e) => setEmail(e.target.value)}
                                    required // Add required attribute
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Mot de passe</Label>
                                <Input
                                    type="password"
                                    id="password"
                                    placeholder="Mot de passe"
                                    disabled={loading}
                                    value={password} // Bind value to state
                                    onChange={(e) => setPassword(e.target.value)}
                                    required // Add required attribute
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}> {/* Make button full width */}
                                {loading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    "S'inscrire"
                                )}
                            </Button>
                            <div className="mt-4 text-center text-sm"> {/* Center and style login link */}
                                Vous avez déjà un compte ?{" "}
                                <Link to="/login" className="underline">
                                    Se connecter
                                </Link>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
