import { graphql, useStaticQuery } from 'gatsby';

function useDocData() {
  const { allDoc } = useStaticQuery(graphql`
    query {
      allDoc {
        nodes {
          id
          title
          shortTitle
          description
          path
          slug
          excerpt
          body
          showBreadcrumb
          showPostNav
          showSidebar
          showTOC
        }
      }
    }
  `);

  return allDoc.nodes;
}

export { useDocData };
