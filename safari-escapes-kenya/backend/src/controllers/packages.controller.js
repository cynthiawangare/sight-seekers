const PackageModel = require('../models/package.model');

exports.getAllPackages = async (req, res, next) => {
  try {
    const packages = await PackageModel.findAll(req.query);
    res.json({ packages });
  } catch (err) {
    next(err);
  }
};

exports.getPackageById = async (req, res, next) => {
  try {
    const pkg = await PackageModel.findById(req.params.id);
    if (!pkg) return res.status(404).json({ error: 'Package not found' });
    res.json({ package: pkg });
  } catch (err) {
    next(err);
  }
};

exports.createPackage = async (req, res, next) => {
  try {
    const pkg = await PackageModel.create(req.body);
    res.status(201).json({ package: pkg });
  } catch (err) {
    next(err);
  }
};

exports.updatePackage = async (req, res, next) => {
  try {
    const pkg = await PackageModel.update(req.params.id, req.body);
    if (!pkg) return res.status(404).json({ error: 'Package not found' });
    res.json({ package: pkg });
  } catch (err) {
    next(err);
  }
};

exports.deletePackage = async (req, res, next) => {
  try {
    await PackageModel.delete(req.params.id);
    res.json({ message: 'Package deleted' });
  } catch (err) {
    next(err);
  }
};
