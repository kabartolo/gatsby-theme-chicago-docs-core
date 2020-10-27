function hasFragment(path) {
  return path.match('#');
}

function normalizePath(path) {
  return path.replace(/(\/)+/g, '/');
}

module.exports = {
  hasFragment,
  normalizePath,
};
