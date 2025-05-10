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

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"; // Use @ alias
import { Button } from "@/components/ui/button"; // Import Button for DirectionButton
import { ChevronDown, ChevronUp } from "lucide-react";
import DeleteButton from "./DeleteButton";
import { UpdateButton } from "./UpdateButton";
import IsFinished from "./isFinished";
import { useState, useEffect } from "react";


/**
 * Interface définissant les propriétés du composant ItemCard
 *
 * @property id - Identifiant unique de l'item
 * @property title - Titre de l'item
 * @property description - Description détaillée de l'item
 * @property date - Date de création formatée pour l'affichage
 * @property isFinished - Indique si l'item est terminé
 * @property updateOrder - Fonction pour modifier l'ordre de l'item
 * @property isFirst - Indique si l'item est le premier de la liste (désactive le bouton "monter")
 * @property isLast - Indique si l'item est le dernier de la liste (désactive le bouton "descendre")
 * @property onItemModified - Fonction appelée lorsque l'item est modifié
 */
interface ItemCardProps {
    id: number;
    title: string;
    description: string;
    date: string;
    isFinished: boolean;
    updateOrder: (id: number, direction: "up" | "down") => void;
    isFirst?: boolean;
    isLast?: boolean;
    onItemModified?: () => void;
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
    // Choisir l'icône en fonction de la direction
    const Icon = direction === "up" ? ChevronUp : ChevronDown;

    return (
        <Button
            variant="ghost" // Use ghost variant for a subtle button
            size="icon" // Use icon size for a small, square button
            onClick={() => !isDisabled && updateOrder(id, direction)}
            disabled={isDisabled}
            className="hover:bg-accent hover:text-accent-foreground" // Add hover effect
        >
            <Icon className="h-4 w-4" />
            <span className="sr-only">{`Move item ${direction}`}</span> {/* Add accessibility text */}
        </Button>
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
export function ItemCard({
    id,
    title,
    description,
    date,
    isFinished,
    updateOrder,
    isFirst = false,
    isLast = false,
    onItemModified
}: ItemCardProps) {
    // État local pour suivre le statut terminé/non terminé
    const [itemFinished, setItemFinished] = useState<boolean>(isFinished);

    useEffect(() => {
        setItemFinished(isFinished);
    }, [isFinished]);
    
    // Fonction de rappel pour mettre à jour l'état local
    const handleItemStatusChange = (newFinishedState: boolean) => {
        setItemFinished(newFinishedState);
        if (onItemModified) {
            onItemModified();
        }
    }

    return (
        <Card key={id} className={`w-full ${itemFinished ? 'border-primary' : ''}`}> {/* Use border to indicate finished state */}
            {/* En-tête de la carte avec le titre */}
            <CardHeader>
                <div className="flex justify-between items-center gap-4"> {/* Add gap */}
                    <h1 className="text-2xl font-semibold">{title}</h1> {/* Use a semantic heading and font-semibold */}
                    <IsFinished
                        id={id}
                        initialIsFinished={itemFinished}
                        onItemModified={handleItemStatusChange}
                    />
                </div>
            </CardHeader>

            {/* Contenu principal avec description et contrôles */}
            <CardContent>
                <div className="flex items-center justify-between gap-4"> {/* Add gap */}
                    {/* Description de l'item */}
                    <p className="text-muted-foreground">{description}</p> {/* Use muted-foreground for description */}

                    {/* Contrôles pour la manipulation de l'item */}
                    <div className="flex gap-4 items-center"> {/* Increase gap */}
                        {/* Boutons de déplacement (haut/bas) */}
                        <div className="flex flex-col items-center gap-1"> {/* Reduce gap between direction buttons */}
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
                <span className="text-sm text-muted-foreground">{date}</span> {/* Use muted-foreground and smaller text */}
            </CardFooter>
        </Card>
    );
}
