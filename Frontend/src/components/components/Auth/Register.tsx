import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link } from "react-router-dom";
import { apiPost, API_ENDPOINTS } from "@/utils/apiUtils";
import { handleError, handleApiError } from "@/utils/errorUtils";
import { useNavigate } from "react-router-dom";
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
        setLoading(true);

        if(!username.trim()) {
            setError("Le nom d'utilisateur est requis.");
            setLoading(false);
            return;
        }
        if(!email.trim()) {
            setError("L'email est requis.");
            setLoading(false);
            return;
        }
        if(!password.trim()) {
            setError("Le mot de passe est requis.");
            setLoading(false);
            return;
        }

        try {
            const result = await apiPost(API_ENDPOINTS.REGISTER, {
                username,
                email,
                password
            } as Record<string, unknown>)

            if (handleApiError(result, setError, "s'enregistrer")) {
                console.log("Inscription success");
                setSuccess(true);
                await new Promise(resolve => setTimeout(resolve, 1000));
                navigate("/login")
            }
        } catch (error) {
            handleError(error, setError, "s'enregistrer")
        } finally {
            setLoading(false)
            
        }
    };

    return (
        <Card className="w-96 bg-background text-foreground m-auto">
            <CardHeader>
                <CardTitle className="text-2xl text-center mb-4">Inscription</CardTitle>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="p-3 mb-3 text-sm text-red-800 bg-red-100 rounded-lg">
                    {error}
                </div>
                )
                }
                {success && (
                    <div className="p-3 mb-3 text-sm text-green-800 bg-green-100 rounded-lg">
                        Inscription réussie !
                    </div>
                )
                }
                <form onSubmit={handleRegister}>
                    <div className="flex flex-col gap-4">
                        <div>
                            <Label htmlFor="username" className="text-foreground mb-2">Nom d'utilisateur</Label>
                            <Input
                            type="text"
                            id="username"
                            placeholder="Nom d'utilisateur"
                            disabled={loading}
                            onChange={(e) => setUsername(e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="email" className="text-foreground mb-2">Email</Label>
                            <Input
                            type="email"
                            id="email"
                            placeholder="Email"
                            disabled={loading}
                            onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="password" className="text-foreground mb-2">Mot de passe</Label>
                            <Input type="password"
                            id="password"
                            placeholder="Mot de passe"
                            disabled={loading}
                            onChange={(e) => setPassword(e.target.value)} />
                        </div>

                        <Button type="submit" className="hover:cursor-pointer" disabled={loading}>
                            {loading ? "Inscription..." : "S'inscrire"}
                        </Button>
                        <span className="text-sm text-secondary-foreground">Vous avez déjà un ? <Link to={"/login"} className="text-secondary-foreground underline">Se connecter</Link></span>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}