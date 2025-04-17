/**
 * Utilitaires pour la gestion des erreurs et des messages
 * 
 * Ce module fournit un ensemble de fonctions standardisées pour traiter les erreurs
 * de manière cohérente dans toute l'application. Il permet:
 * - De centraliser la logique de traitement des erreurs
 * - D'assurer un affichage uniforme des messages d'erreur à l'utilisateur
 * - De tracer les erreurs dans la console pour faciliter le débogage
 * - D'automatiser le nettoyage des messages d'erreur après un délai
 * 
 * L'utilisation de ces utilitaires contribue à une meilleure expérience utilisateur
 * en gérant les erreurs de manière prévisible et informative.
 */

/**
 * Gère les erreurs de manière uniforme
 * 
 * Cette fonction traite tout type d'erreur (exceptions JavaScript, erreurs réseau, etc.)
 * et assure un comportement cohérent:
 * 1. Enregistre l'erreur dans la console avec le contexte pour faciliter le débogage
 * 2. Extrait et affiche un message d'erreur adapté à l'utilisateur
 * 3. Programme l'effacement automatique du message après un délai
 * 
 * @param error L'erreur à gérer (peut être une Error, une chaîne, ou tout autre type)
 * @param setError Fonction de mise à jour d'état pour afficher le message d'erreur
 * @param context Description du contexte dans lequel l'erreur s'est produite
 */
export const handleError = (
    error: unknown, 
    setError: (message: string | null) => void, 
    context: string = "opération"
) => {
    // Enregistrement détaillé de l'erreur dans la console
    console.error(`Erreur lors de ${context}:`, error);
    
    // Adaptation du message selon le type d'erreur
    if (error instanceof Error) {
        // Si c'est une instance d'Error, utiliser son message
        setError(error.message);
    } else {
        // Pour les autres types d'erreurs, fournir un message générique contextualisé
        setError(`Erreur de connexion au serveur lors de ${context}`);
    }
    
    // Programmer l'effacement automatique du message
    clearErrorAfterDelay(setError);
};

/**
 * Efface le message d'erreur après un délai
 * 
 * Cette fonction améliore l'expérience utilisateur en supprimant automatiquement
 * les messages d'erreur après un certain temps, évitant ainsi qu'ils ne restent 
 * affichés indéfiniment. Cela est particulièrement utile pour:
 * - Les erreurs temporaires qui peuvent se résoudre d'elles-mêmes
 * - Les notifications brèves qui ne nécessitent pas d'action de l'utilisateur
 * - Éviter l'encombrement de l'interface avec des messages obsolètes
 * 
 * @param setError Fonction de mise à jour d'état pour effacer le message d'erreur
 * @param delay Délai en millisecondes avant d'effacer l'erreur (par défaut: 3000ms)
 */
export const clearErrorAfterDelay = (
    setError: (message: string | null) => void, 
    delay: number = 3000
) => {
    setTimeout(() => {
        setError(null);
    }, delay);
};

/**
 * Gère les erreurs API de manière uniforme
 * 
 * Cette fonction est spécialisée dans le traitement des réponses d'API qui suivent
 * la structure standardisée {success, message} utilisée par notre backend.
 * Elle permet de:
 * 1. Vérifier facilement si une opération API a réussi
 * 2. Afficher le message d'erreur retourné par le serveur
 * 3. Tracer les échecs d'API dans la console avec leur contexte
 * 4. Programmer l'effacement automatique des messages d'erreur
 * 
 * @param result Résultat de l'appel API avec structure {success, message}
 * @param setError Fonction de mise à jour d'état pour afficher le message d'erreur
 * @param context Description de l'opération API concernée
 * @returns true si l'opération a réussi (success=true), false sinon
 */
export const handleApiError = (
    result: { success: boolean; message: string; }, 
    setError: (message: string | null) => void, 
    context: string = "API"
): boolean => {
    // Si l'opération a échoué (success=false)
    if (!result.success) {
        // Enregistrer l'erreur avec son contexte
        console.error(`Erreur ${context}:`, result.message);
        
        // Afficher le message d'erreur retourné par l'API
        setError(result.message);
        
        // Programmer l'effacement automatique du message
        clearErrorAfterDelay(setError);
        
        return false;
    }
    
    // L'opération a réussi
    return true;
}; 