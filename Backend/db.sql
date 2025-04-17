CREATE TABLE `items` (
    `id` int NOT NULL AUTO_INCREMENT,
    `title` varchar(255) NOT NULL,
    `description` text NOT NULL,
    `created_at` date NOT NULL DEFAULT CURRENT_DATE(),
    `modified_at` date DEFAULT NULL,
    `item_order` int DEFAULT 1,
    `user_id` INT NOT NULL,
    `roadmap_id` INT NOT NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE `users` (
    `id` int NOT NULL AUTO_INCREMENT,
    `username` varchar(255) NOT NULL UNIQUE,
    `password` varchar(255) NOT NULL,
    `email` varchar(255) NOT NULL UNIQUE,
    `created_at` date NOT NULL DEFAULT CURRENT_DATE(),
    PRIMARY KEY (`id`)
);

/* Nouvelle table pour les roadmaps */
CREATE TABLE `roadmaps` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `description` text,
    `category` varchar(100) NOT NULL,
    `slug` varchar(100) NOT NULL,
    `created_at` date NOT NULL DEFAULT CURRENT_DATE(),
    `user_id` INT NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `user_roadmap_slug` (`user_id`, `slug`)
);

/* Contraintes de clé étrangère */
ALTER TABLE `items`
ADD CONSTRAINT `fk_items_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
ADD CONSTRAINT `fk_items_roadmap` FOREIGN KEY (`roadmap_id`) REFERENCES `roadmaps` (`id`) ON DELETE CASCADE;

ALTER TABLE `roadmaps`
ADD CONSTRAINT `fk_roadmaps_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

