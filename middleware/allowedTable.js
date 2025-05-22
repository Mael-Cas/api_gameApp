exports.allowedTable = (req, res, next) => {
  console.log('Middleware allowedTable - URL:', req.url);
  console.log('Middleware allowedTable - Method:', req.method);
  console.log('Middleware allowedTable - Table:', req.params.table);
  
  const allowedTables = ['Publishers', 'Artists', 'Implementations', 'Expansions', 'Families', 'Categories', 'Designers',  'Mechanics'];
  if (!allowedTables.includes(req.params.table)) {
    console.log('Middleware allowedTable - Table non autorisée:', req.params.table);
    return res.status(400).json({ error: 'Invalid table name' });
  }
  next();
};
