import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom";

export function Header(props:{ title: string }) {

    const { title } = props
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate()
    const handleLogin = () => {
        navigate("/login");
    };

    const handleLogout = async () => {
        try {
            const response = await fetch("http://localhost/projetWKS/Backend/api/logout.php", {
                credentials: "include",
                method: "POST",
            });
            const result = await response.json();
            if (result.success) {
                alert("Déconnexion réussie !");
                window.location.reload();
            }
        } catch (error) {
            console.error("Erreur lors de la déconnexion :", error);
        }
    };

    return (
        <header className="mb-5">
            <div className="flex items-center justify-center gap-4 w-full p-4">
                <h1 className="text-3xl font-bold">{title}'s Roadmap</h1>
                {isAuthenticated ? (
                <Button onClick={handleLogout} >
                    Déconnexion
                </Button>
            ) : (
                <Button onClick={handleLogin} className="text-blue-500 underline">
                    Connexion
                </Button>
            )}
            </div>
        </header>
    )
}