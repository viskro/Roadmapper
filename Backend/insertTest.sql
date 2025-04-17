/* Insérer des roadmaps pour l'utilisateur ayant l'ID 1 */
INSERT INTO roadmaps (name, description, category, slug, user_id) VALUES
('JavaScript', 'Parcours d\'apprentissage JavaScript', 'Langages', 'javascript', 1),
('TypeScript', 'Parcours d\'apprentissage TypeScript', 'Langages', 'typescript', 1),
('React', 'Parcours d\'apprentissage React', 'Frameworks', 'react', 1),
('Node.js', 'Parcours d\'apprentissage Node.js', 'Frameworks', 'nodejs', 1),
('Python', 'Parcours d\'apprentissage Python', 'Langages', 'python', 1);

/* Insérer des items pour la roadmap JavaScript */
INSERT INTO items (title, description, created_at, item_order, user_id, roadmap_id) VALUES
('Syntaxe de base', 'Apprendre les fondamentaux du langage JavaScript', CURRENT_DATE(), 1, 1, 1),
('Fonctions et portée', 'Comprendre les fonctions et la portée des variables', CURRENT_DATE(), 2, 1, 1),
('DOM Manipulation', 'Manipuler le Document Object Model', CURRENT_DATE(), 3, 1, 1),
('Asynchrone et Promesses', 'Comprendre les opérations asynchrones et les promesses', CURRENT_DATE(), 4, 1, 1),
('ES6+ Features', 'Apprendre les fonctionnalités modernes de JavaScript', CURRENT_DATE(), 5, 1, 1);

/* Insérer des items pour la roadmap TypeScript */
INSERT INTO items (title, description, created_at, item_order, user_id, roadmap_id) VALUES
('Introduction à TypeScript', 'Comprendre les différences avec JavaScript', CURRENT_DATE(), 1, 1, 2),
('Types de base', 'Apprendre les types primitifs et personnalisés', CURRENT_DATE(), 2, 1, 2),
('Classes et Interfaces', 'Utiliser la programmation orientée objet', CURRENT_DATE(), 3, 1, 2),
('Génériques', 'Maîtriser les types génériques', CURRENT_DATE(), 4, 1, 2),
('Types avancés', 'Utiliser des types unions, intersections et utilitaires', CURRENT_DATE(), 5, 1, 2);