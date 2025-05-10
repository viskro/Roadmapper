import { useEffect, useState } from "react";
import { API_ENDPOINTS, apiGet } from "@/utils/apiUtils";
import { handleError, handleApiError } from "@/utils/errorUtils";
import { Loader2, PlusCircle } from "lucide-react"; // Import PlusCircle icon
import RoadmapCard from "./RoadmapCard";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Import Button

export default function Dashboard() {

    interface Roadmap {
        id: number;
        name: string;
        description: string;
        category: string;
        slug: string;
    }

    interface RoadmapsApiResponse {
        roadmaps: Roadmap[];
        categorized: Record<string, Roadmap[]>;
    }

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchRoadmaps = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await apiGet<RoadmapsApiResponse>(API_ENDPOINTS.GET_USER_ROADMAPS);

                if (handleApiError(result, setError, "récupération des roadmaps")) {
                    if (result.data && Array.isArray(result.data.roadmaps)) {
                        setRoadmaps(result.data.roadmaps);
                    } else {
                        // Handle case where data is valid but roadmaps array is missing or not an array
                        setRoadmaps([]);
                    }
                } else {
                     // If handleApiError returns false, it means there was an API error
                     // The error state is already set by handleApiError
                     setRoadmaps([]); // Clear roadmaps on API error
                }
            } catch (error) {
                handleError(error, setError, "la récupération des roadmaps");
                setRoadmaps([]); // Clear roadmaps on general error
            } finally {
                setLoading(false);
            }
        };

        fetchRoadmaps();

    }, []);

    const handleNavigateToRoadmap = (slug: string) => {
        return () => {
            navigate(`/roadmap/${slug}`);
        };
    };

    const handleCreateRoadmap = () => {
        navigate("/create-roadmap");
    };

    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8"> {/* Use container for max-width and center, add responsive padding */}
            <div className="flex justify-between items-center mb-8"> {/* Flex container for title and button */}
                 <h1 className="text-3xl font-bold">Dashboard</h1>
                 <Button onClick={handleCreateRoadmap} className="flex items-center hover:cursor-pointer">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Créer une roadmap
                 </Button>
            </div>


            {/* Loading state */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-16"> {/* Increased padding */}
                    <Loader2 className="h-10 w-10 animate-spin text-primary" /> {/* Larger icon, primary color */}
                    <p className="mt-4 text-lg text-muted-foreground">Chargement des roadmaps...</p> {/* Larger text */}
                </div>
            )}

            {/* Error state */}
            {error && (
                <Alert variant="destructive" className="mb-8"> {/* Increased bottom margin */}
                    <ExclamationTriangleIcon className="h-5 w-5" /> {/* Larger icon */}
                    <AlertTitle>Erreur de chargement</AlertTitle> {/* More specific title */}
                    <AlertDescription>
                        {error}
                    </AlertDescription>
                </Alert>
            )}

            {/* Empty state */}
            {!loading && !error && roadmaps.length === 0 && (
                 <Card className="w-full text-center py-16"> {/* Increased vertical padding */}
                    <CardContent className="flex flex-col items-center justify-center"> {/* Center content */}
                        <p className="text-xl font-semibold text-muted-foreground mb-6"> {/* Larger and bolder text */}
                            Aucune roadmap trouvée.
                        </p>
                         <Button onClick={handleCreateRoadmap} className="flex items-center">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Créer votre première roadmap
                         </Button>
                    </CardContent>
                 </Card>
            )}

            {/* Display roadmaps in a responsive grid */}
            {!loading && !error && roadmaps.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"> {/* Increased gap */}
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
            )}
        </div>
    );
}
