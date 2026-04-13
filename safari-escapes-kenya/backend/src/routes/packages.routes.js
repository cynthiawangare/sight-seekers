const router = require('express').Router();
const authenticate = require('../middleware/auth.middleware');
const requireAdmin = require('../middleware/admin.middleware');
const ctrl = require('../controllers/packages.controller');

router.get('/', ctrl.getAllPackages);
router.get('/:id', ctrl.getPackageById);
router.post('/', authenticate, requireAdmin, ctrl.createPackage);
router.put('/:id', authenticate, requireAdmin, ctrl.updatePackage);
router.delete('/:id', authenticate, requireAdmin, ctrl.deletePackage);

module.exports = router;
