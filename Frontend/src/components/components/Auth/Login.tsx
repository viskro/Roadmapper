import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

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
                
                // Attendre encore un peu avant de rediriger
                await new Promise(resolve => setTimeout(resolve, 500));
                
                console.log("Redirection vers la page d'accueil...");
                navigate("/", { replace: true });
            } else {
                console.log("Échec de connexion dans Login:", result.message);
                setError(result.message);
            }
        } catch (error) {
            console.error("Erreur lors de la connexion :", error);
            setError("Une erreur s'est produite lors de la connexion");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-96 bg-background text-foreground m-auto">
            <CardHeader>
                <CardTitle className="text-2xl text-center mb-4">Connexion</CardTitle>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="p-4 mb-4 text-sm text-red-800 bg-red-100 rounded-lg">
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="p-4 mb-4 text-sm text-green-800 bg-green-100 rounded-lg">
                        {successMessage}
                    </div>
                )}
                <form onSubmit={handleLogin}>
                    <div className="flex flex-col gap-4">
                        <div>
                            <Label htmlFor="email" className="text-foreground mb-2">Email</Label>
                            <Input 
                                type="email" 
                                id="email" 
                                placeholder="Email" 
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <Label htmlFor="password" className="text-foreground mb-2">Mot de passe</Label>
                            <Input 
                                type="password" 
                                id="password" 
                                placeholder="Mot de passe" 
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <Button 
                            type="submit" 
                            className="hover:cursor-pointer"
                            disabled={loading}
                        >
                            {loading ? "Connexion en cours..." : "Se connecter"}
                        </Button>
                        <span className="text-sm text-secondary-foreground">
                            Vous n'avez pas de compte ? <Link to={"/register"} className="text-secondary-foreground underline">S'inscrire</Link>
                        </span>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}