require('dotenv').config();
const jwt = require('jsonwebtoken');

exports.RouterAccess = (req, res, next) => {

    const token = req.header('Authorization')?.split(' ')[1]; // "Bearer <token>"

    if (!token) {
        return res.status(403).json({ message: 'Token manquant, accès refusé' });
    }

    // Vérifier la validité du token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token invalide, accès refusé' });
        }

        req.user = user; // Ajouter les informations utilisateur dans la requête (par exemple l'ID de l'utilisateur)
        next(); // Passer à la route suivante
    });

}


exports.authorizeRole = (requiredRole) => {
    return (req, res, next) => {
        if (req.user?.permission !== requiredRole) {
            return res.status(403).json({ message: 'Accès interdit, rôle insuffisant' });
        }
        next(); // Passer à la route suivante si l'utilisateur a le rôle requis
    };
};