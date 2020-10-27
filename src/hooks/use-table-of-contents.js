import { graphql, useStaticQuery } from 'gatsby';

import { deepCopy, traverseTOC } from '../../utils/helpers';

function useTableOfContents({ depth = 6, docId = '', path = '' } = {}) {
  const { allDoc } = useStaticQuery(graphql`
    query {
      allDoc {
        nodes {
          id
          path
          parent {
            ... on Mdx {
              tableOfContents(maxDepth: 6)
            }
          }
          headerFlatMap {
            title
            url
          }
        }
      }
    }
  `);

  function getPartialTOC(
    tableOfContents,
    finalDepth,
  ) {
    const newTOC = deepCopy(tableOfContents);

    newTOC.items = traverseTOC(
      newTOC.items,
      finalDepth,

      /* eslint-disable no-param-reassign */
      (item, depthExceeded) => {
        if (depthExceeded) item.items = null;
      },
      /* eslint-enable no-param-reassign */
    );

    return newTOC;
  }

  let nodes = allDoc.nodes.filter((node) => (
    docId ? node.id === docId : node.path === path
  ));

  if (!nodes.length) nodes = allDoc.nodes;

  const result = nodes.map(({ id, headerFlatMap, parent }) => {
    const hasTOC = parent && parent.tableOfContents && parent.tableOfContents.items;
    const nested = hasTOC && getPartialTOC(parent.tableOfContents, depth);

    return {
      id,
      nested,
      flatMap: headerFlatMap,
    };
  });

  return result.length === 1 ? result[0] : result;
}

export { useTableOfContents };
