/**
 * ItemCard.tsx
 * -----------
 * 
 * Composant d'affichage d'un item dans une roadmap
 * 
 * Ce fichier contient les composants nécessaires pour afficher un item dans une roadmap:
 * - DirectionButton: Bouton pour déplacer un item vers le haut ou le bas
 * - ItemCard: Carte affichant les détails d'un item avec les contrôles pour le modifier
 *
 * Ces composants sont au cœur de l'interface utilisateur permettant de visualiser
 * et de réorganiser les éléments d'une roadmap.
 */

import { Card, CardContent, CardFooter, CardHeader } from "../../components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import DeleteButton from "./DeleteButton"
import { UpdateButton } from "./UpdateButton";

/**
 * Interface définissant les propriétés du composant ItemCard
 * 
 * @property id - Identifiant unique de l'item
 * @property title - Titre de l'item
 * @property description - Description détaillée de l'item
 * @property date - Date de création formatée pour l'affichage
 * @property updateOrder - Fonction pour modifier l'ordre de l'item
 * @property isFirst - Indique si l'item est le premier de la liste (désactive le bouton "monter")
 * @property isLast - Indique si l'item est le dernier de la liste (désactive le bouton "descendre")
 */
interface ItemCardProps { 
    id: number; 
    title: string; 
    description: string; 
    date: string; 
    updateOrder: (id: number, direction: "up" | "down") => void;
    isFirst?: boolean;
    isLast?: boolean;
}

/**
 * Interface définissant les propriétés du composant DirectionButton
 * 
 * @property direction - Direction du bouton ("up" pour monter, "down" pour descendre)
 * @property id - Identifiant de l'item à déplacer
 * @property isDisabled - Indique si le bouton doit être désactivé
 * @property updateOrder - Fonction appelée lors du clic sur le bouton
 */
interface DirectionButtonProps {
    direction: "up" | "down";
    id: number;
    isDisabled: boolean;
    updateOrder: (id: number, direction: "up" | "down") => void;
}

/**
 * Composant DirectionButton - Bouton pour déplacer un item vers le haut ou le bas
 * 
 * Ce composant affiche une flèche permettant de modifier l'ordre d'un item.
 * Il est automatiquement désactivé si l'item est déjà en première ou dernière position.
 * 
 * @param props - Les propriétés du composant
 */
const DirectionButton = ({ direction, id, isDisabled, updateOrder }: DirectionButtonProps) => {
    // Classes CSS pour les différents états du bouton
    const baseClassName = "flex flex-col items-center gap-2 transition-all duration-200 ease-in-out";
    const activeClassName = "hover:cursor-pointer hover:scale-125";
    const disabledClassName = "opacity-30 cursor-not-allowed";
    
    // Choisir l'icône en fonction de la direction
    const Icon = direction === "up" ? ChevronUp : ChevronDown;
    
    return (
        <div
            className={`${baseClassName} ${isDisabled ? disabledClassName : activeClassName}`}
            onClick={() => !isDisabled && updateOrder(id, direction)}
        >
            <Icon />
        </div>
    );
};

/**
 * Composant ItemCard - Carte affichant un item avec ses contrôles
 * 
 * Ce composant est responsable de l'affichage d'un item individuel dans une roadmap.
 * Il inclut:
 * - Le titre et la description de l'item
 * - Des boutons pour déplacer l'item vers le haut ou le bas
 * - Des boutons pour modifier ou supprimer l'item
 * - La date de création de l'item
 * 
 * @param props - Les propriétés du composant
 */
export function ItemCard({ id, title, description, date, updateOrder, isFirst = false, isLast = false }: ItemCardProps) {
    return (
        <div className="w-full">
            <Card key={id} className="w-full bg-secondary text-secondary-foreground">
                {/* En-tête de la carte avec le titre */}
                <CardHeader className="flex items-center justify-between">
                    <h1 className="text-xl">{title}</h1>
                </CardHeader>
                
                {/* Contenu principal avec description et contrôles */}
                <CardContent>
                    <div className="flex items-center justify-between">
                        {/* Description de l'item */}
                        <p className="max-w-[90%]">{description}</p>
                        
                        {/* Contrôles pour la manipulation de l'item */}
                        <div className="flex gap-5 items-center">
                            {/* Boutons de déplacement (haut/bas) */}
                            <div className="flex flex-col items-center">
                                <DirectionButton 
                                    direction="up" 
                                    id={id} 
                                    isDisabled={isFirst} 
                                    updateOrder={updateOrder} 
                                />
                                <DirectionButton 
                                    direction="down" 
                                    id={id} 
                                    isDisabled={isLast} 
                                    updateOrder={updateOrder} 
                                />
                            </div>
                            
                            {/* Boutons de suppression et modification */}
                            <div className="flex flex-col items-center gap-2">
                                <DeleteButton id={id} />
                                <UpdateButton id={id} title={title} description={description} />
                            </div>
                        </div>
                    </div>
                </CardContent>

                {/* Pied de carte avec la date de création */}
                <CardFooter>
                    <span className="opacity-50">{date}</span>
                </CardFooter>
            </Card>
        </div>
    );
}