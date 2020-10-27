/* Includes options from `@kabartolo/gatsby-theme-chicago-docs` */
module.exports = (options) => {
  const defaultBoolean = (value, defaultValue) => {
    if (typeof value === 'undefined') {
      return defaultValue;
    }

    return value;
  }

  const assetsPath = options.assetsPath || 'src/assets';
  const basePath = options.basePath || '/';
  const docsPath = options.docsPath || 'src/docs';
  const pagesPath = options.pagesPath || 'src/mdxPages';
  const mainMenu = options.mainMenu || [];
  const sidebarDepth = options.sidebarDepth || 3;
  const sidebarMenus = options.sidebarMenus || [];
  const allowDocsSearch = defaultBoolean(options.allowDocsSearch, true);
  const alwaysShowBreadcrumb = defaultBoolean(options.alwaysShowBreadcrumb, true);
  const alwaysShowPostNav = defaultBoolean(options.alwaysShowPostNav, true);
  const alwaysShowSidebar = defaultBoolean(options.alwaysShowSidebar, true);
  const alwaysShowTOC = defaultBoolean(options.alwaysShowTOC, true);
  const primaryResultsOnly = defaultBoolean(options.primaryResultsOnly, false);
  const sidebarAllowMultipleOpen = defaultBoolean(options.sidebarAllowMultipleOpen, true);
  const sidebarAllowTOC = defaultBoolean(options.sidebarAllowTOC, true);
  const skipMDXConfig = defaultBoolean(options.skipMDXConfig, false);
  const toggleTheme = defaultBoolean(options.toggleTheme, true);

  return {
    assetsPath,
    basePath,
    docsPath,
    pagesPath,
    mainMenu,
    sidebarDepth,
    sidebarMenus,
    allowDocsSearch,
    alwaysShowBreadcrumb,
    alwaysShowPostNav,
    alwaysShowSidebar,
    alwaysShowTOC,
    primaryResultsOnly,
    sidebarAllowMultipleOpen,
    sidebarAllowTOC,
    skipMDXConfig,
    toggleTheme,
  };
};
