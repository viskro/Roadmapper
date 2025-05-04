/**
 * AppSidebar.tsx
 * -------------
 * 
 * Composant de barre latérale principale de l'application
 * 
 * Ce composant affiche la barre latérale de navigation contenant:
 * - Le logo et titre de l'application
 * - La barre de recherche des roadmaps
 * - Les roadmaps de l'utilisateur, organisées par catégories
 * - Un bouton pour créer une nouvelle roadmap
 * - Un bouton de déconnexion
 * 
 * La barre latérale gère également le filtrage des roadmaps en fonction
 * de la recherche de l'utilisateur et la navigation entre les différentes vues.
 */

import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, LogOut, LayoutGrid, ChevronUp, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import * as React from "react";
import { 
    Sidebar, 
    SidebarContent, 
    SidebarFooter, 
    SidebarGroup, 
    SidebarGroupLabel, 
    SidebarHeader, 
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem
} from "@/components/ui/sidebar";
import { SearchForm } from "./search-form";
import { fetchUserRoadmapsApi } from "@/utils/itemUtils";
import { handleApiError, handleError } from "@/utils/errorUtils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

/**
 * Interface définissant la structure d'une roadmap
 * 
 * @property id - Identifiant unique de la roadmap
 * @property name - Nom de la roadmap
 * @property slug - Identifiant URL-friendly utilisé pour les liens
 * @property category - Catégorie de la roadmap (ex: "Langages", "Frameworks")
 * @property description - Description détaillée (peut être null)
 * @property item_count - Nombre d'items contenus dans la roadmap
 */
interface Roadmap {
    id: number;
    name: string;
    slug: string;
    category: string;
    description: string | null;
    item_count: number;
}

/**
 * Interface définissant un dictionnaire de roadmaps groupées par catégorie
 * 
 * Utilisé pour organiser les roadmaps par catégorie dans l'interface utilisateur.
 * Les clés correspondent aux noms des catégories, et les valeurs sont des tableaux
 * de roadmaps appartenant à chaque catégorie.
 */
interface CategorizedRoadmaps {
    [key: string]: Roadmap[];
}

/**
 * Composant AppSidebar - Barre latérale principale de l'application
 * 
 * @param props - Propriétés héritées du composant Sidebar
 */
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    // Hooks pour la navigation et l'authentification
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuth();
    
    // États du composant
    const [searchQuery, setSearchQuery] = React.useState<string>("");
    const [userRoadmaps, setUserRoadmaps] = React.useState<Roadmap[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string | null>(null);

    /**
     * Dériver categorizedRoadmaps de userRoadmaps
     * Utilise useMemo pour calculer la structure organisée par catégorie
     * uniquement lorsque userRoadmaps change
     */
    const categorizedRoadmaps = React.useMemo(() => {
        const result: CategorizedRoadmaps = {};
        
        userRoadmaps.forEach((roadmap) => {
            const category = roadmap.category;
            if (!result[category]) {
                result[category] = [];
            }
            result[category].push(roadmap);
        });
        
        return result;
    }, [userRoadmaps]);

    /**
     * Effet pour charger les roadmaps de l'utilisateur au chargement
     * et lorsque l'état d'authentification change
     */
    React.useEffect(() => {
        if (isAuthenticated) {
            const fetchRoadmaps = async () => {
                setLoading(true);
                setError(null);
                
                try {
                    // Appel à l'API pour récupérer les roadmaps
                    const result = await fetchUserRoadmapsApi();
                    
                    if (handleApiError(result, setError, "récupération des roadmaps")) {
                        if (result.data && result.data.roadmaps) {
                            // Mise à jour des états avec les données reçues
                            setUserRoadmaps(Array.isArray(result.data.roadmaps) ? result.data.roadmaps : []);
                        }
                    }
                } catch (error) {
                    handleError(error, setError, "la récupération des roadmaps");
                } finally {
                    setLoading(false);
                }
            };
            
            fetchRoadmaps();
        }
    }, [isAuthenticated]);

    /**
     * Fonction pour naviguer vers une URL spécifique
     * 
     * @param url - L'URL de destination
     * @returns Fonction de gestionnaire d'événement pour le clic
     */
    const handleNavigate = (url: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        if (url && url !== "#") {
            navigate(url);
        }
    };

    /**
     * Fonction pour gérer la déconnexion de l'utilisateur
     */
    const handleLogout = async () => {
        const result = await logout();
        if (result.success) {
            navigate("/login");
        }
    };

    /**
     * Calcul des roadmaps filtrées en fonction de la recherche
     * 
     * Utilise useMemo pour optimiser les performances en ne recalculant
     * la liste filtrée que lorsque les roadmaps ou la recherche changent.
     */
    const filteredRoadmaps = React.useMemo(() => {
        const result: CategorizedRoadmaps = {};
        
        if (searchQuery.trim()) {
            // Si une recherche est active, filtrer les roadmaps qui correspondent
            const lowerQuery = searchQuery.toLowerCase();
            
            Object.entries(categorizedRoadmaps).forEach(([category, roadmaps]) => {
                const filtered = roadmaps.filter(roadmap => 
                    roadmap.name.toLowerCase().includes(lowerQuery) || 
                    (roadmap.description && roadmap.description.toLowerCase().includes(lowerQuery))
                );
                
                if (filtered.length > 0) {
                    result[category] = filtered;
                }
            });
        } else {
            // Sinon, utiliser toutes les roadmaps
            return { ...categorizedRoadmaps };
        }
        
        return result;
    }, [categorizedRoadmaps, searchQuery]);

    /**
     * Fonction pour naviguer vers la page de création de roadmap
     */
    const handleCreateRoadmap = () => {
        navigate("/create-roadmap");
    };

    const [open, setOpen] = React.useState(false);

    // Rendu du composant
    return (
        <Sidebar className="flex flex-col justify-between z-50 select-none" {...props}>
            {/* En-tête de la barre latérale avec logo et recherche */}
            <SidebarHeader className="p-4">
                <Link to="/dashboard" className="mx-auto">
                    <h1 className="text-3xl text-foreground font-bold">Roadmapper</h1>
                </Link>
                <SearchForm onChange={(e) => setSearchQuery(e.target.value)} />
            </SidebarHeader>
            
            {/* Contenu principal de la barre latérale */}
            <SidebarContent className="flex-grow p-4">
                {/* Titre et bouton d'ajout */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-foreground">Mes roadmaps</h2>
                    <Button 
                        variant="outline" 
                        onClick={handleCreateRoadmap} 
                        className="p-0 w-9 h-9 text-foreground hover:cursor-pointer"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Ajouter une roadmap</span>
                    </Button>
                </div>
                    <SidebarMenu>
                        <SidebarMenuSub>
                            <SidebarMenuSubButton asChild>
                                <Button variant={"ghost"} onClick={handleNavigate("/dashboard")} className="hover:cursor-pointer">
                                    <LayoutGrid className="w-[30px] h-[30px]"/>
                                    <h2 className="text-[16px] text-foreground">Dashboard</h2>
                                </Button>
                            </SidebarMenuSubButton>
                        </SidebarMenuSub>
                    </SidebarMenu>


                {/* Indicateurs d'état (chargement, erreur, vide) */}
                {loading && <p className="text-sm text-muted-foreground">Chargement...</p>}
                {error && <p className="text-sm text-red-500">{error}</p>}
                
                {/* Ajouter un indicateur du nombre total de roadmaps pour utiliser userRoadmaps */}
                {!loading && !error && (
                    <p className="text-sm text-muted-foreground mb-2">
                        Total : {userRoadmaps.length} roadmap(s)
                    </p>
                )}
                
                {!loading && Object.keys(filteredRoadmaps).length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        {searchQuery ? "Aucun résultat pour cette recherche" : "Aucune roadmap"}
                    </p>
                )}



                <SidebarGroup>
                    <SidebarGroupLabel>Roadmaps</SidebarGroupLabel>
                    <SidebarMenu>
                        {Object.entries(filteredRoadmaps).map(([category, roadmaps]) => (
                            <Collapsible open={open} onOpenChange={setOpen} key={category} className="group/collapsible">
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton className="flex justify-between hover:cursor-pointer">
                                            <span>{category}</span>
                                            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {roadmaps.map((roadmap) => (
                                                <SidebarMenuSubItem key={roadmap.name}>
                                                    <SidebarMenuButton asChild>
                                                        <a href="" onClick={handleNavigate(`/roadmap/${roadmap.slug}`)} className="flex items-center justify-between w-full">
                                                            <span>{roadmap.name}</span>
                                                        </a>
                                                    </SidebarMenuButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
             
            {/* Pied de page avec bouton de déconnexion (visible uniquement si connecté) */}
            {isAuthenticated && (
                <SidebarFooter className="p-4">
                    <Button variant="outline" className="w-full" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Se déconnecter
                    </Button>
                </SidebarFooter>
            )}
        </Sidebar>
    );
}