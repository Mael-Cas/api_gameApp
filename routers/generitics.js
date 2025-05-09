const express = require('express');
const middleware = require('../middleware/allowedTable');
const controller = require('../controllers/generics');

const router = express.Router();

router.param('table', middleware.allowedTable);

// Routes
router.get('/:table', controller.getAll);
router.get('/:table/:id', controller.getById);
router.post('/:table', controller.create);
router.put('/:table/:id', controller.update);
router.delete('/:table/:id', controller.remove);

module.exports = router;
