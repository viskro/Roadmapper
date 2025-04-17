/**
 * category.tsx
 * -----------
 * 
 * Composants pour afficher des catégories et items dans la barre latérale
 * 
 * Ce fichier contient deux composants principaux:
 * - Item: Affiche un élément individuel dans la barre latérale avec un badge optionnel
 * - Category: Créé un groupe pliable/dépliable d'items appartenant à une même catégorie
 * 
 * Ces composants sont utilisés ensemble pour créer une interface utilisateur 
 * hiérarchique et organisée dans la barre latérale de l'application.
 */

import * as React from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubItem } from "@/components/ui/sidebar";

/**
 * Interface définissant les propriétés du composant Item
 * 
 * @property title - Le texte à afficher pour l'item
 * @property href - L'URL de destination (pour la navigation)
 * @property badge - Texte optionnel à afficher dans un badge (ex: nombre d'items)
 * @property onClick - Gestionnaire d'événement optionnel pour le clic sur l'item
 */
export interface ItemProps {
    title: string;
    href: string;
    badge?: string;
    onClick?: (e: React.MouseEvent) => void;
}

/**
 * Composant Item - Élément cliquable dans la barre latérale
 * 
 * Ce composant représente un élément individuel dans la navigation, comme
 * une roadmap ou une autre destination. Il supporte l'affichage d'un badge
 * numérique (ex: pour indiquer le nombre d'éléments dans une roadmap).
 * 
 * @param props - Les propriétés du composant
 */
export function Item({ title, href, badge, onClick }: ItemProps) {
    return (
        <SidebarMenuSubItem className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent">
            <a
                href={href}
                onClick={onClick}
                className="flex-1 text-sm font-medium text-foreground"
            >
                {title}
            </a>
            {badge && (
                <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {badge}
                </span>
            )}
        </SidebarMenuSubItem>
    );
}

/**
 * Interface définissant les propriétés du composant Category
 * 
 * @property title - Le nom de la catégorie
 * @property children - Les éléments enfants (généralement des composants Item)
 * @property isOpen - État initial d'ouverture (déplié) de la catégorie
 */
export interface CategoryProps {
    title: string;
    children: React.ReactNode;
    isOpen?: boolean;
}

/**
 * Composant Category - Groupe pliable d'items
 * 
 * Ce composant crée une section pliable/dépliable contenant plusieurs items,
 * permettant d'organiser hiérarchiquement les éléments de navigation.
 * Utile pour regrouper les roadmaps par catégorie, par exemple.
 * 
 * @param props - Les propriétés du composant
 */
export function Category({ title, children, isOpen = false }: CategoryProps) {
    // État local pour suivre si la catégorie est dépliée ou non
    const [open, setOpen] = React.useState(isOpen);
    
    return (
        <Collapsible open={open} onOpenChange={setOpen} className="w-full">
            {/* En-tête cliquable de la catégorie */}
            <SidebarMenuItem className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent">
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="p-0 text-left hover:bg-transparent w-full flex justify-between">
                        <span className="font-medium text-foreground">{title}</span>
                        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </SidebarMenuButton>
                </CollapsibleTrigger>
            </SidebarMenuItem>
            
            {/* Contenu déplié/replié de la catégorie */}
            <CollapsibleContent>
                <SidebarMenuSub>
                    {children}
                </SidebarMenuSub>
            </CollapsibleContent>
        </Collapsible>
    );
} 