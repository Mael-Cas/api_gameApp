const mysql = require('mysql2/promise');

const testProcedure = async () => {
    const connection = await mysql.createConnection({
        host: '192.168.1.51',
        user: 'root',
        password: '1234',
        database: 'bdd_game',
        port: 443
    });

    try {
        console.log('Connexion à la base de données établie');

        // Afficher les colonnes de la table Games
        const [columns] = await connection.query('DESCRIBE Games');
        console.log('Colonnes de Games:', columns.map(col => col.Field));

        // Toujours supprimer et recréer la procédure stockée
        await connection.query('DROP PROCEDURE IF EXISTS get_personalized_recommendations');
        await connection.query(`
CREATE PROCEDURE get_personalized_recommendations(
    IN p_user_id INT,
    IN p_player_count INT
)
BEGIN
    -- Compter le nombre de swipes de l'utilisateur
    SELECT COUNT(*) INTO @user_swipe_count
    FROM possess
    WHERE user_id = p_user_id;

    -- Log des paramètres
    SET @debug_info = CONCAT('Paramètres reçus - user_id: ', p_user_id, ', player_count: ', p_player_count, ', swipes: ', @user_swipe_count);

    WITH user_liked_games AS (
        SELECT g.Id, g.name, g.minplayers, g.maxplayers, g.playingtime, g.minplayingtime, g.maxplayingtime, g.minage,
               g.thumbnail, g.description, g.yearpublished, g.average_ranking, g.users_rated, g.game_rank, g.bayes_average
        FROM Games g
        INNER JOIN possess p ON g.Id = p.Id
        WHERE p.user_id = p_user_id 
        AND p.liked = true
    ),
    user_disliked_games AS (
        SELECT g.Id
        FROM Games g
        INNER JOIN possess p ON g.Id = p.Id
        WHERE p.user_id = p_user_id 
        AND p.liked = false
    ),
    similar_users AS (
        SELECT p2.user_id, COUNT(*) as common_likes
        FROM possess p1
        INNER JOIN possess p2 ON p1.Id = p2.Id
        WHERE p1.user_id = p_user_id 
        AND p1.liked = true
        AND p2.liked = true
        AND p2.user_id != p_user_id
        GROUP BY p2.user_id
        HAVING common_likes >= 1
    ),
    popular_games AS (
        SELECT 
            g.Id, g.name, g.minplayers, g.maxplayers, g.playingtime, g.minplayingtime, g.maxplayingtime, g.minage,
            g.thumbnail, g.description, g.yearpublished, g.average_ranking, g.users_rated, g.game_rank, g.bayes_average,
            g.users_rated * g.average_ranking as popularity_score
        FROM Games g
        WHERE p_player_count BETWEEN g.minplayers AND g.maxplayers
        AND g.users_rated > 100
        ORDER BY popularity_score DESC
        LIMIT 100
    ),
    recommended_games AS (
        SELECT 
            g.Id, g.name, g.minplayers, g.maxplayers, g.playingtime, g.minplayingtime, g.maxplayingtime, g.minage,
            g.thumbnail, g.description, g.yearpublished, g.average_ranking, g.users_rated, g.game_rank, g.bayes_average,
            COUNT(DISTINCT su.user_id) as similar_users_count,
            AVG(g.average_ranking) as avg_rating,
            g.users_rated * g.average_ranking as popularity_score
        FROM Games g
        LEFT JOIN possess p ON g.Id = p.Id AND p.user_id = p_user_id
        LEFT JOIN similar_users su ON p.user_id = su.user_id
        WHERE (p.Id IS NULL OR p.Id NOT IN (SELECT Id FROM user_disliked_games))
        AND p_player_count BETWEEN g.minplayers AND g.maxplayers
        GROUP BY g.Id
    )
    SELECT 
        rg.*,
        CASE 
            WHEN @user_swipe_count < 5 THEN
                -- Pour les nouveaux utilisateurs, se baser principalement sur la popularité
                (COALESCE(rg.popularity_score, 0) / 1000000) * 0.8 + (COALESCE(rg.average_ranking, 0) / 10) * 0.2
            WHEN similar_users_count > 0 THEN
                -- Pour les utilisateurs avec des swipes, mélanger similarité et popularité
                (similar_users_count * 0.4 + (COALESCE(rg.average_ranking, 0) / 10) * 0.4 + (COALESCE(rg.popularity_score, 0) / 1000000) * 0.2)
            ELSE
                -- Fallback sur la popularité et le rating moyen
                (COALESCE(rg.popularity_score, 0) / 1000000) * 0.6 + (COALESCE(rg.average_ranking, 0) / 10) * 0.4
        END as relevance_score
    FROM recommended_games rg
    ORDER BY relevance_score DESC
    LIMIT 3;
END
        `);
        console.log('Procédure stockée créée avec succès');

        // Tester la procédure avec un utilisateur existant
        const [testResult] = await connection.query(
            'CALL get_personalized_recommendations(?, ?)',
            [1, 6]
        );

        console.log('Test de la procédure réussi');
        console.log('Nombre de recommandations:', testResult[0].length);
        if (testResult[0].length > 0) {
            console.log('Première recommandation:', testResult[0][0]);
        } else {
            console.log('Aucune recommandation trouvée');
        }

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await connection.end();
    }
};

testProcedure(); 