import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link } from "react-router-dom";

export function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost/projetWKS/Backend/api/register.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });
            const result = await response.json();
            if (result.success) {
                alert("Inscription réussie !");
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error("Erreur lors de l'inscription :", error);
        }
    };

    return (
        <Card className="w-96 bg-background text-foreground m-auto">
            <CardHeader>
                <CardTitle className="text-2xl text-center mb-4">Inscription</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleRegister}>
                    <div className="flex flex-col gap-4">
                        <div>
                            <Label htmlFor="username" className="text-foreground mb-2">Nom d'utilisateur</Label>
                            <Input type="text" id="username" placeholder="Nom d'utilisateur" onChange={(e) => setUsername(e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="email" className="text-foreground mb-2">Email</Label>
                            <Input type="email" id="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="password" className="text-foreground mb-2">Mot de passe</Label>
                            <Input type="password" id="password" placeholder="Mot de passe" onChange={(e) => setPassword(e.target.value)} />
                        </div>

                        <Button type="submit" className="hover:cursor-pointer">S'inscrire</Button>
                        <span className="text-sm text-accent">Vous avez déjà un ? <Link to={"/login"} className="text-accent-foreground">Se connecter</Link></span>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}