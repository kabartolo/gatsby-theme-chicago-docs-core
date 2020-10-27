import { graphql, useStaticQuery } from 'gatsby';

/* the sidebarMenus object is available from a doc's page context */
function useThemeOptions() {
  const { allChicagoDocsConfig } = useStaticQuery(graphql`
    query {
      allChicagoDocsConfig {
        nodes {
          assetsPath
          basePath
          docsPath
          mainMenu {
            name
            path
          }
          allowDocsSearch
          alwaysShowBreadcrumb
          alwaysShowPostNav
          alwaysShowSidebar
          alwaysShowTOC
          primaryResultsOnly
          sidebarAllowMultipleOpen
          sidebarAllowTOC
          skipMDXConfig
          toggleTheme
        }
      }
    }
  `);

  return allChicagoDocsConfig.nodes[0];
}

export { useThemeOptions };
