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

import { Link, useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, LayoutGrid, ChevronUp, ChevronDown, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import * as React from "react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem
} from "@/components/ui/sidebar";
import { fetchUserRoadmapsApi } from "@/utils/itemUtils";
import { handleApiError, handleError } from "@/utils/errorUtils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FooterSidebar } from "./FooterSidebar";

interface Roadmap {
    id: number;
    name: string;
    slug: string;
    category: string;
    description: string | null;
    item_count: number;
}

interface CategorizedRoadmaps {
    [key: string]: Roadmap[];
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const navigate = useNavigate();
    const location = useLocation(); // Get current location for active state
    const { isAuthenticated, logout, user } = useAuth();

    const [searchQuery, setSearchQuery] = React.useState<string>("");
    const [userRoadmaps, setUserRoadmaps] = React.useState<Roadmap[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string | null>(null);

    const [openCategories, setOpenCategories] = React.useState<Record<string, boolean>>({});

    const categorizedRoadmaps = React.useMemo(() => {
        const result: CategorizedRoadmaps = {};

        userRoadmaps.forEach((roadmap) => {
            const category = roadmap.category || 'Sans catégorie';
            if (!result[category]) {
                result[category] = [];
            }
            result[category].push(roadmap);
        });

        return Object.fromEntries(Object.entries(result).sort(([a], [b]) => a.localeCompare(b)));

    }, [userRoadmaps]);

    React.useEffect(() => {
        const initialOpenState: Record<string, boolean> = {};
        Object.keys(categorizedRoadmaps).forEach(category => {
            // Keep category open if any roadmap within it matches the current path
            const shouldKeepOpen = categorizedRoadmaps[category].some(roadmap =>
                location.pathname === `/roadmap/${roadmap.slug}`
            );
            initialOpenState[category] = shouldKeepOpen || true; // Default to open, but keep open if active
        });
        setOpenCategories(initialOpenState);
    }, [categorizedRoadmaps, location.pathname]); // Re-evaluate when categorizedRoadmaps or location changes


    React.useEffect(() => {
        if (isAuthenticated) {
            const fetchRoadmaps = async () => {
                setLoading(true);
                setError(null);
                try {
                    const result = await fetchUserRoadmapsApi();
                    if (handleApiError(result, setError, "récupération des roadmaps")) {
                        if (result.data && result.data.roadmaps) {
                            setUserRoadmaps(Array.isArray(result.data.roadmaps) ? result.data.roadmaps : []);
                        } else {
                             setUserRoadmaps([]);
                        }
                    } else {
                         setUserRoadmaps([]);
                    }
                } catch (error) {
                    handleError(error, setError, "la récupération des roadmaps");
                    setUserRoadmaps([]);
                } finally {
                    setLoading(false);
                }
            };
            fetchRoadmaps();
        } else {
             setUserRoadmaps([]);
             setOpenCategories({});
        }
    }, [isAuthenticated]);

    const handleNavigate = (url: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        if (url && url !== "#") {
            navigate(url);
        }
    };

    const handleLogout = async () => {
        const result = await logout();
        if (result.success) {
            navigate("/login");
        } else {
             console.error("Logout failed:", result.message);
             setError(result.message || "Échec de la déconnexion.");
        }
    };

    const filteredRoadmaps = React.useMemo(() => {
        const result: CategorizedRoadmaps = {};
        const lowerQuery = searchQuery.trim().toLowerCase();

        if (lowerQuery) {
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
            return { ...categorizedRoadmaps };
        }
        return result;
    }, [categorizedRoadmaps, searchQuery]);

    const handleCreateRoadmap = () => {
        navigate("/create-roadmap");
    };

    const handleToggleCategory = (category: string) => {
        setOpenCategories(prevState => ({
            ...prevState,
            [category]: !prevState[category]
        }));
    };

    // Determine if a roadmap item is currently active
    const isRoadmapActive = (slug: string) => location.pathname === `/roadmap/${slug}`;
    // Determine if the dashboard link is active
    const isDashboardActive = location.pathname === "/dashboard";
    // Determine if the create roadmap link is active
    const isCreateRoadmapActive = location.pathname === "/create-roadmap";


    return (
        <Sidebar className="flex flex-col justify-between border-r bg-card text-card-foreground w-64 shadow-lg" {...props}> {/* Use bg-card and shadow */}
            <SidebarHeader className="p-4 border-b border-border"> {/* Use border-border */}
                <Link to="/dashboard" className="flex items-center gap-3 mb-4"> {/* Increased gap */}
                    {/* Enhanced Logo/Title Area */}

                    <h1 className="text-2xl font-bold text-foreground">Roadmapper</h1> {/* Use text-foreground */}
                </Link>
                 {/* Search Input with subtle styling */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /> {/* Centered icon */}
                    <Input
                        type="text"
                        placeholder="Rechercher roadmaps..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-3 py-2 rounded-md bg-background border border-input text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary" // Refined input styles
                    />
                </div>
            </SidebarHeader>

            <ScrollArea className="flex-grow"> {/* Apply ScrollArea directly */}
                <SidebarContent className="p-4">
                     {/* Dashboard Link */}
                     <SidebarMenu className="mb-4">
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                variant="default"
                                onClick={handleNavigate("/dashboard")}
                                className={`w-full justify-start font-medium hover:cursor-pointer ${isDashboardActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`} // Active state styling
                            >
                                <LayoutGrid className="mr-3 h-5 w-5" /> {/* Slightly larger icon */}
                                Dashboard
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                     </SidebarMenu>


                    {/* "Mes roadmaps" section header */}
                    <div className="flex items-center justify-between mb-3 mt-6"> {/* Adjusted margins */}
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Mes roadmaps</h2> {/* Styled section title */}
                         <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCreateRoadmap}
                            className={`h-7 w-7 hover:cursor-pointer ${isCreateRoadmapActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`} // Active state styling
                        >
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">Créer une nouvelle roadmap</span>
                        </Button>
                    </div>

                    {/* Indicateurs d'état (chargement, erreur, vide) */}
                    {loading && <p className="text-xs text-muted-foreground text-center py-2">Chargement...</p>}
                    {error && <p className="text-xs text-red-500 text-center py-2">{error}</p>}

                    {/* Display total count only when not loading and no error */}
                    {!loading && !error && (
                        <p className="text-xs text-muted-foreground mb-4 text-center">
                            Total : {userRoadmaps.length} roadmap(s)
                        </p>
                    )}

                    {/* Display message when no roadmaps found after filtering */}
                    {!loading && Object.keys(filteredRoadmaps).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            {searchQuery ? "Aucun résultat pour cette recherche" : "Aucune roadmap"}
                        </p>
                    )}

                    {/* Roadmaps grouped by category */}
                    <SidebarGroup>
                        <SidebarMenu>
                            {Object.entries(filteredRoadmaps).map(([category, roadmaps]) => (
                                <Collapsible
                                    key={category}
                                    open={openCategories[category] ?? true}
                                    onOpenChange={() => handleToggleCategory(category)}
                                    className="group/collapsible"
                                >
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton className="flex justify-between items-center w-full font-medium text-foreground hover:bg-accent hover:text-accent-foreground"> {/* Styled category header */}
                                                <span>{category}</span>
                                                {openCategories[category] ? <ChevronUp className="h-4 w-4 transition-transform duration-200 group-data-[state=closed]/collapsible:rotate-180" /> : <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=closed]/collapsible:rotate-180" />} {/* Added rotation animation */}
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="CollapsibleContent data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down"> {/* Added animation classes */}
                                            <SidebarMenuSub>
                                                {roadmaps.map((roadmap) => (
                                                    <SidebarMenuSubItem key={roadmap.slug}>
                                                        <SidebarMenuButton asChild>
                                                            <Link
                                                                to={`/roadmap/${roadmap.slug}`}
                                                                className={`flex items-center justify-between w-full text-sm pl-6 pr-2 py-1.5 rounded-md transition-colors duration-200 ${isRoadmapActive(roadmap.slug) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`} // Enhanced active and hover states
                                                            >
                                                                <span>{roadmap.name}</span>
                                                                {/* Optional: Display item count */}
                                                                {/* <span className="text-xs opacity-70">{roadmap.item_count}</span> */}
                                                            </Link>
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
            </ScrollArea>


            {/* Pied de page avec bouton de déconnexion (visible uniquement si connecté) */}
            
                <SidebarFooter className="p-4 border-t border-border"> {/* Use border-border */}
                    {/* <Button variant="outline" className="w-full" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Se déconnecter
                    </Button> */}
                    {user && <FooterSidebar user={user} onLogout={handleLogout}/>}
                </SidebarFooter>
            
        </Sidebar>
    );
}
