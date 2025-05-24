/**
 * Middleware de gestion des accès et des autorisations
 * Fournit la vérification du token JWT et la gestion des rôles pour les routes protégées
 */
require('dotenv').config();
const jwt = require('jsonwebtoken');

// Liste des routes publiques qui ne nécessitent pas d'authentification
const PUBLIC_ROUTES = [
    '/api/Users/login',
    '/api/Users/register',
    '/api/Games?',  // Uniquement pour les requêtes GET
];

/**
 * Middleware pour vérifier l'accès aux routes protégées via JWT.
 * Si la route est publique, passe au middleware suivant.
 * Si la route est protégée, vérifie le token JWT dans l'en-tête Authorization.
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
exports.RouterAccess = (req, res, next) => {
    const isPublicRoute = PUBLIC_ROUTES.some(route => req.originalUrl.startsWith(route));

    if (isPublicRoute) {
        return next();
    }

    const authHeader = req.header('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Token manquant, accès refusé' });
    }

    // Vérification du token JWT
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token invalide, accès refusé' });
        }

        req.user = user;
        next();
    });
}

/**
 * Middleware pour vérifier le rôle de l'utilisateur sur une route protégée.
 * @param {string} requiredRole - Le rôle requis pour accéder à la route
 * @returns {Function} Middleware Express
 */
exports.authorizeRole = (requiredRole) => {
    return (req, res, next) => {
        if (req.user?.permission !== requiredRole) {
            return res.status(403).json({ message: 'Accès interdit, rôle insuffisant' });
        }
        next();
    };
};