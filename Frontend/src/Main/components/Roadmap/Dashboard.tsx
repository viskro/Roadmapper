import { useEffect, useState } from "react";
import { API_ENDPOINTS, apiGet } from "@/utils/apiUtils";
import { handleError, handleApiError } from "@/utils/errorUtils";
import { Loader2 } from "lucide-react";
import RoadmapCard from "./RoadmapCard";
import { useNavigate } from "react-router-dom";


export default function Dashboard() {

    interface Roadmap {
        id: number;
        name: string;
        description: string;
        category: string;
        slug: string;
    }

    // Interface pour typer la réponse de l'API
    interface RoadmapsApiResponse {
        roadmaps: Roadmap[];
        categorized: Record<string, Roadmap[]>;
    }

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);

    

    useEffect(() => {
        const fetchRoadmaps = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await apiGet<RoadmapsApiResponse>(API_ENDPOINTS.GET_USER_ROADMAPS);
    
                if (handleApiError(result, setError, "récupération des roadmaps")) {
                    // Vérification que result.data et result.data.roadmaps existent
                    if (result.data && Array.isArray(result.data.roadmaps)) {
                        setRoadmaps(result.data.roadmaps);
                    } else {
                        setError("Format de données invalide reçu du serveur");
                    }
                }
            } catch (error) {
                handleError(error, setError, "la récupération des roadmaps");
            } finally {
                setLoading(false);
            }
        };

        fetchRoadmaps();

    }, [setRoadmaps, setLoading, setError]);

    const navigate = useNavigate();

    // Fonction pour gérer la navigation vers une roadmap
    const handleNavigateToRoadmap = (slug: string) => {
        return () => {
            navigate(`/roadmap/${slug}`);
        };
    };

    return (
        <div className="p-4 w-full">
            <h1 className="text-3xl font-bold text-center mb-10 mt-10">Dashboard</h1>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {error && <p className="text-red-500">{error}</p>}
            {roadmaps.length === 0 && !loading && <p>Aucune roadmap trouvée.</p>}
            <div className="grid grid-cols-4 gap-4">
                {roadmaps.map((roadmap) => (
                    <RoadmapCard 
                        key={roadmap.id}
                        name={roadmap.name} 
                        description={roadmap.description} 
                        slug={roadmap.slug}
                        onClick={handleNavigateToRoadmap(roadmap.slug)}
                    />
                ))}
            </div>
        </div>
    );
}