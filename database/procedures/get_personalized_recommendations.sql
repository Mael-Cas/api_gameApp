DELIMITER //

CREATE PROCEDURE get_personalized_recommendations(
    IN p_user_id INT,
    IN p_player_count INT
)
BEGIN
    -- Récupérer les jeux que l'utilisateur a aimé
    WITH user_liked_games AS (
        SELECT g.Id, g.name, g.minplayers, g.maxplayers, g.playingtime, g.minage,
               g.thumbnail, g.description, g.yearpublished, g.average,
               g.usersrated, g.rank, g.bayesaverage
        FROM Games g
        INNER JOIN possess p ON g.Id = p.Id
        WHERE p.user_id = p_user_id 
        AND p.liked = true
    ),
    -- Récupérer les jeux que l'utilisateur n'a pas aimé
    user_disliked_games AS (
        SELECT g.Id
        FROM Games g
        INNER JOIN possess p ON g.Id = p.Id
        WHERE p.user_id = p_user_id 
        AND p.liked = false
    ),
    -- Trouver les utilisateurs avec des goûts similaires
    similar_users AS (
        SELECT p2.user_id, COUNT(*) as common_likes
        FROM possess p1
        INNER JOIN possess p2 ON p1.Id = p2.Id
        WHERE p1.user_id = p_user_id 
        AND p1.liked = true
        AND p2.liked = true
        AND p2.user_id != p_user_id
        GROUP BY p2.user_id
        HAVING common_likes >= 2
    ),
    -- Récupérer les jeux recommandés basés sur les goûts similaires
    recommended_games AS (
        SELECT 
            g.*,
            COUNT(DISTINCT su.user_id) as similar_users_count,
            AVG(g.average) as avg_rating
        FROM Games g
        INNER JOIN possess p ON g.Id = p.Id
        INNER JOIN similar_users su ON p.user_id = su.user_id
        WHERE p.liked = true
        AND g.Id NOT IN (SELECT Id FROM user_liked_games)
        AND g.Id NOT IN (SELECT Id FROM user_disliked_games)
        AND p_player_count BETWEEN g.minplayers AND g.maxplayers
        GROUP BY g.Id
        HAVING similar_users_count >= 1
    )
    -- Sélectionner les jeux recommandés avec un score de pertinence
    SELECT 
        rg.*,
        (similar_users_count * 0.4 + (avg_rating / 10) * 0.6) as relevance_score
    FROM recommended_games rg
    ORDER BY relevance_score DESC
    LIMIT 20;
END //

DELIMITER ; 