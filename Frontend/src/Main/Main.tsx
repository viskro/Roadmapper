/**
 * Main.tsx
 * --------
 * 
 * Composant principal de l'application affichant une roadmap et ses items
 * 
 * Ce composant est le point central de l'application et gère:
 * - L'affichage des items d'une roadmap spécifique ou de la roadmap par défaut
 * - Le chargement des données depuis l'API
 * - La gestion de l'ordre des items (déplacement vers le haut/bas)
 * - La présentation des erreurs et états de chargement
 * 
 * Il contient également la logique pour déterminer quelle roadmap afficher
 * en fonction du slug dans l'URL ou des props passées au composant.
 */

import { AddButton } from "./components/Items/AddButton";
import { DeleteRoadmapButton } from "./components/Roadmap/DeleteRoadmapButton";
import { Header } from "./components/Header";
import { ItemCard } from "./components/Items/ItemCard";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
    Item, 
    Roadmap, 
    formatItem, 
    sortItemsByOrder, 
    fetchRoadmapBySlugApi, 
    fetchRoadmapItemsApi,
    fetchUserRoadmapsApi,
    updateItemOrderApi
} from "@/utils/itemUtils";
import { handleError, handleApiError } from "@/utils/errorUtils";
import { MoveDown } from "lucide-react";

/**
 * Interface définissant les propriétés du composant Main
 * 
 * @property roadmapSlug - Slug optionnel de la roadmap à afficher (peut être fourni via les props)
 */
interface MainProps {
    roadmapSlug?: string;
}

/**
 * Composant Main - Page principale affichant une roadmap et ses items
 * 
 * @param param0 - Destructuration des props (roadmapSlug renommé en propSlug)
 */
export default function Main({ roadmapSlug: propSlug }: MainProps = {}) {
    // Récupération de l'état d'authentification
    const { isAuthenticated } = useAuth();
    
    // Hooks de React Router pour la navigation et les paramètres d'URL
    const params = useParams<{ slug?: string }>();
    const navigate = useNavigate();
    const urlSlug = params.slug;
    
    // Déterminer le slug à utiliser (priorité: props > URL > null)
    const currentSlug = propSlug || urlSlug || null;
    
    // États du composant
    const [currentRoadmap, setCurrentRoadmap] = useState<Roadmap | null>(null);
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fonction pour récupérer les items d'une roadmap par son ID
     * 
     * Cette fonction fait un appel à l'API pour récupérer tous les items
     * associés à une roadmap spécifique, puis met à jour l'état local.
     * 
     * @param roadmapId - L'ID de la roadmap dont on veut récupérer les items
     */
    const fetchRoadmapItems = async (roadmapId: number) => {
        try {
            const result = await fetchRoadmapItemsApi(roadmapId);
            
            if (handleApiError(result, setError, "récupération des items")) {
                if (result.data && Array.isArray(result.data.items)) {
                    // Formatter les items pour l'affichage et les trier par ordre
                    const formattedItems = result.data.items.map(formatItem);
                    setItems(sortItemsByOrder(formattedItems));
                }
            }
        } catch (error) {
            handleError(error, setError, "la récupération des items");
        }
    };

    /**
     * Fonction pour récupérer une roadmap par son slug
     * 
     * Cette fonction est mémorisée avec useCallback pour éviter des re-rendus
     * inutiles et est utilisée lorsqu'un slug spécifique est fourni.
     */
    const fetchRoadmap = useCallback(async () => {
        // Ne rien faire si l'utilisateur n'est pas connecté ou si aucun slug n'est fourni
        if (!isAuthenticated || !currentSlug) {
            return;
        }

        try {
            setLoading(true);
            const result = await fetchRoadmapBySlugApi(currentSlug);
            
            if (handleApiError(result, setError, "récupération de la roadmap")) {
                if (result.data && result.data.roadmap) {
                    // Mettre à jour la roadmap courante
                    setCurrentRoadmap(result.data.roadmap as Roadmap);
                    
                    // Mettre à jour les items associés
                    if (Array.isArray(result.data.items)) {
                        const formattedItems = result.data.items.map(formatItem);
                        setItems(sortItemsByOrder(formattedItems));
                    }
                }
            }
        } catch (error) {
            handleError(error, setError, "la récupération de la roadmap");
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, currentSlug]);

    /**
     * Fonction pour récupérer la liste des roadmaps de l'utilisateur
     * 
     * Cette fonction est utilisée lorsqu'aucun slug spécifique n'est fourni,
     * elle charge la première roadmap de l'utilisateur comme roadmap par défaut.
     */
    const fetchUserRoadmaps = useCallback(async () => {
        // Ne rien faire si l'utilisateur n'est pas connecté ou si un slug est déjà fourni
        if (!isAuthenticated || currentSlug) {
            return;
        }
        
        try {
            setLoading(true);
            const result = await fetchUserRoadmapsApi();
            
            if (handleApiError(result, setError, "récupération des roadmaps")) {
                // Si l'utilisateur a des roadmaps, définir la première comme roadmap actuelle
                if (result.data && result.data.roadmaps && Array.isArray(result.data.roadmaps) && result.data.roadmaps.length > 0) {
                    const firstRoadmap = result.data.roadmaps[0] as Roadmap;
                    setCurrentRoadmap(firstRoadmap);
                    
                    // Récupérer les items de cette roadmap
                    await fetchRoadmapItems(firstRoadmap.id);
                } else {
                    // Aucune roadmap disponible, réinitialiser les items
                    setItems([]);
                }
            }
        } catch (error) {
            handleError(error, setError, "la récupération des roadmaps");
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, currentSlug]);

    /**
     * Effet pour charger les données appropriées au chargement
     * et lorsque l'authentification ou le slug changent
     */
    useEffect(() => {
        if (isAuthenticated) {
            // Si un slug est fourni, récupérer la roadmap correspondante
            if (currentSlug) {
                fetchRoadmap();
            } else {
                // Sinon, récupérer la liste des roadmaps et utiliser la première
                fetchUserRoadmaps();
            }
        }
    }, [isAuthenticated, currentSlug, fetchRoadmap, fetchUserRoadmaps]);

    /**
     * Fonction pour mettre à jour l'ordre d'un item (déplacer vers le haut/bas)
     * 
     * @param id - L'ID de l'item à déplacer
     * @param direction - La direction ("up" pour monter, "down" pour descendre)
     */
    const updateItemOrder = async (id: number, direction: "up" | "down") => {
        try {
            setError(null);
            const result = await updateItemOrderApi(id, direction);
            
            if (handleApiError(result, setError, "mise à jour de l'ordre")) {
                // Rafraîchir les items si la mise à jour a réussi
                if (currentRoadmap) {
                    await fetchRoadmapItems(currentRoadmap.id);
                }
            }
        } catch (error) {
            handleError(error, setError, "la mise à jour de l'ordre des items");
        }
    };

    /**
     * Fonction pour naviguer vers la page de création de roadmap
     */
    const handleCreateRoadmap = () => {
        navigate("/create-roadmap");
    };

    // Rendu du composant
    return (
        <main className="flex flex-col gap-4 p-4 w-full">
            {/* En-tête avec le titre de la roadmap ou "Tableau de bord" */}
            <Header title={currentRoadmap?.name + " 's Roadmap" || "Tableau de bord"} />
            
            {/* Bouton d'ajout d'item (affiché uniquement si une roadmap est sélectionnée) */}
            {currentRoadmap && (
                <div className="flex gap-4 items-center">
                    <AddButton 
                        onItemAdded={() => currentRoadmap && fetchRoadmapItems(currentRoadmap.id)} 
                        roadmapId={currentRoadmap.id}
                    />
                    <DeleteRoadmapButton id={currentRoadmap.id} />
                </div>
            )}
            
            {/* Affichage des messages d'erreur */}
            {error && (
                <div className="p-4 mb-4 text-sm text-red-800 bg-red-100 rounded-lg">
                    Erreur: {error}
                </div>
            )}
            
            {/* Message et bouton si aucune roadmap n'est disponible */}
            {!currentRoadmap && !loading && isAuthenticated && (
                <div className="p-4 text-center">
                    <p className="mb-4">Vous n'avez pas encore de roadmap ou aucune n'est sélectionnée.</p>
                    <Button 
                        onClick={handleCreateRoadmap}
                        className="hover:cursor-pointer"
                    >
                        Créer une roadmap
                    </Button>
                </div>
            )}
            
            {/* Liste des items ou messages appropriés selon l'état */}
            <div className="flex flex-col gap-4">
                {loading ? (
                    <p className="text-center py-4">Chargement...</p>
                ) : items.length === 0 && currentRoadmap ? (
                    <p className="text-center py-4">Aucun item à afficher dans cette roadmap</p>
                ) : (
                    items.map((item, index) => (
                        <div className="flex flex-col justify-center items-center" key={item.id}>
                            <ItemCard
                                id={item.id}
                                title={item.title}
                                description={item.description}
                                date={item.created_at}
                                updateOrder={updateItemOrder}
                                isFirst={index === 0}
                                isLast={index === items.length - 1}
                                isFinished={item.isFinished}
                            />
                            {index !== items.length - 1 && <MoveDown className="mt-4" />}
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}