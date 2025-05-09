
exports.allowedTable = (req, res, next) => {
  const allowedTables = ['Publishers', 'Artists', 'Implementations', 'Expansions', 'Families', 'Categories', 'Designers',  'Mechanics'];
  if (!allowedTables.includes(req.params.table)) {
    return res.status(400).json({ error: 'Invalid table name' });
  }
  next();
};
