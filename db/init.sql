-- Créer la procédure stockée pour les recommandations
DELIMITER //

CREATE PROCEDURE recommend_games_for_user(IN user_id INT)
BEGIN
    -- Récupérer les jeux que l'utilisateur a aimés
    WITH liked_games AS (
        SELECT g.Id, g.name, g.categories, g.mechanics
        FROM Games g
        INNER JOIN possess p ON g.Id = p.Id
        WHERE p.user_id = user_id AND p.liked = true
    ),
    -- Trouver des jeux similaires basés sur les catégories et mécaniques
    similar_games AS (
        SELECT 
            g.Id,
            g.name,
            g.description,
            g.thumbnail,
            g.minplayers,
            g.maxplayers,
            g.playingtime,
            g.minage,
            COUNT(DISTINCT lg.Id) as similarity_score
        FROM Games g
        CROSS JOIN liked_games lg
        WHERE g.Id != lg.Id
        AND (
            -- Même catégorie
            FIND_IN_SET(lg.categories, g.categories) > 0
            OR
            -- Même mécanique
            FIND_IN_SET(lg.mechanics, g.mechanics) > 0
        )
        -- Exclure les jeux déjà dans les favoris ou non-favoris
        AND NOT EXISTS (
            SELECT 1 FROM possess p 
            WHERE p.Id = g.Id 
            AND p.user_id = user_id 
            AND (p.favorite = true OR p.unfavorite = true)
        )
        GROUP BY g.Id
        ORDER BY similarity_score DESC
        LIMIT 10
    )
    SELECT * FROM similar_games;
END //

DELIMITER ; 