const { createFilePath } = require('gatsby-source-filesystem');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const mkdirp = require('mkdirp');
const { urlResolve } = require('gatsby-core-utils');

const withDefault = require('./utils/with-default');
const {
  appendIndexToMenu,
  appendToMenu,
  buildAST,
  deepCopy,
  itemInterface,
  menuInterface,
  flattenMenu,
  flattenTOC,
  getMenuItems,
  getSidebarMenu,
} = require('./utils/helpers');

const docTemplate = require.resolve('./src/templates/doc-query');
const pageTemplate = require.resolve('./src/templates/page-query');

const createContentDigest = (data) => (
  crypto
    .createHash('md5')
    .update(JSON.stringify(data))
    .digest('hex')
);

exports.sourceNodes = ({
  actions,
  getNodes,
  schema,
  createNodeId,
}, themeOptions) => {
  const { createTypes, createNode } = actions;
  const {
    assetsPath,
    basePath,
    basePathLabel,
    docsPath,
    pagesPath,
    mainMenu,
    allowDocsSearch,
    alwaysShowBreadcrumb,
    alwaysShowPostNav,
    alwaysShowSidebar,
    alwaysShowTOC,
    primaryResultsOnly,
    sidebarAllowMultipleOpen,
    sidebarAllowTOC,
    sidebarDepth,
    skipMDXConfig,
    toggleTheme,
  } = withDefault(themeOptions);

  createTypes([
    schema.buildObjectType({
      interfaces: ['Node'],
      name: 'ChicagoDocsPage',
      fields: {
        id: 'ID!',
        title: 'String',
        description: 'String',
        path: 'String',
        slug: 'String',
        body: {
          type: 'String!',
          resolve(source, args, context, info) {
            const type = info.schema.getType('Mdx');
            const mdxNode = context.nodeModel.getNodeById({
              id: source.parent,
            });
            const resolver = type.getFields()['body'].resolve;
            return resolver(mdxNode, {}, context, {
              fieldName: 'body',
            });
          },
        },
      },
    }),
    schema.buildObjectType({
      name: 'Menu',
      fields: {
        name: 'String',
        path: 'String',
      },
    }),
    schema.buildObjectType({
      interfaces: ['Node'],
      name: 'ChicagoDocsConfig',
      fields: {
        assetsPath: 'String',
        basePath: 'String',
        basePathLabel: 'String',
        docsPath: 'String',
        pagesPath: 'String',
        mainMenu: ['Menu'],
        allowDocsSearch: 'Boolean',
        alwaysShowBreadcrumb: 'Boolean',
        alwaysShowPostNav: 'Boolean',
        alwaysShowSidebar: 'Boolean',
        alwaysShowTOC: 'Boolean',
        primaryResultsOnly: 'Boolean',
        sidebarAllowTOC: 'Boolean',
        sidebarAllowMultipleOpen: 'Boolean',
        sidebarDepth: 'Boolean',
        skipMDXConfig: 'Boolean',
        toggleTheme: 'Boolean',
      },
    }),
    schema.buildObjectType({
      name: 'Paragraph',
      fields: {
        heading: 'String',
        content: 'String',
        id: 'Int!',
      },
    }),
    schema.buildObjectType({
      name: 'Heading',
      fields: {
        title: 'String',
        url: 'String',
        items: '[Heading]',
      },
    }),
    schema.buildObjectType({
      interfaces: ['Node'],
      name: 'Doc',
      fields: {
        id: 'ID!',
        title: 'String!',
        shortTitle: 'String',
        description: 'String',
        path: 'String',
        slug: 'String',
        showBreadcrumb: 'Boolean',
        showTOC: 'Boolean',
        showPostNav: 'Boolean',
        showSidebar: 'Boolean',
        excerpt: {
          type: 'String!',
          resolve: async (source, args, context, info) => {
            const type = info.schema.getType('Mdx');
            const mdxNode = context.nodeModel.getNodeById({
              id: source.parent,
            });
            const resolver = type.getFields()['excerpt'].resolve;
            const excerpt = await resolver(
              mdxNode,
              { pruneLength: 140 },
              context,
              { fieldName: 'excerpt' },
            );
            return excerpt;
          },
        },
        body: {
          type: 'String!',
          resolve(source, args, context, info) {
            const type = info.schema.getType('Mdx');
            const mdxNode = context.nodeModel.getNodeById({
              id: source.parent,
            });
            const resolver = type.getFields()['body'].resolve;
            return resolver(mdxNode, {}, context, {
              fieldName: 'body',
            });
          },
        },
        sections: { type: '[Paragraph]' },
        paragraphs: { type: '[String]' },
        headers: { type: '[String]' },
        headerFlatMap: {
          type: '[Heading]',
          resolve: async (source, args, context, info) => {
            const type = info.schema.getType('Mdx');
            const mdxNode = context.nodeModel.getNodeById({
              id: source.parent,
            });
            const resolver = type.getFields()['tableOfContents'].resolve;
            const tableOfContents = await resolver(mdxNode, {}, context, {
              fieldName: 'tableOfContents',
            });
            return flattenTOC(tableOfContents.items);
          },
        },
      },
    }),
  ]);

  const config = {
    assetsPath,
    basePath,
    basePathLabel,
    docsPath,
    pagesPath,
    mainMenu,
    allowDocsSearch,
    alwaysShowBreadcrumb,
    alwaysShowPostNav,
    alwaysShowSidebar,
    alwaysShowTOC,
    primaryResultsOnly,
    sidebarAllowMultipleOpen,
    sidebarAllowTOC,
    sidebarDepth,
    skipMDXConfig,
    toggleTheme,
  };

  createNode({
    ...config,
    id: createNodeId('ChicagoDocsConfig'),
    parent: null,
    children: [],
    internal: {
      type: 'ChicagoDocsConfig',
      contentDigest: createContentDigest(config),
      content: JSON.stringify(config),
      description: 'Chicago Docs theme options'
    }
  });
};

exports.onCreateNode = ({
  actions,
  createNodeId,
  getNode,
  node,
}, themeOptions) => {
  const {
    createNodeField,
    createNode,
    createParentChildLink,
  } = actions;

  const {
    alwaysShowBreadcrumb,
    alwaysShowPostNav,
    alwaysShowSidebar,
    alwaysShowTOC,
    allowDocsSearch,
    basePath,
    docsPath,
    menus,
  } = withDefault(themeOptions);

  if (node.internal.type === 'Mdx') {
    const { frontmatter } = node;
    const parent = getNode(node.parent);

    if (
      parent.internal.type === 'File' &&
      parent.sourceInstanceName === 'pages'
    ) {
      const path = createFilePath({ node, getNode });
      const slug = parent.name;
      const id = createNodeId(`${node.id} >>> ChicagoDocsPage`);

      const pageData = {
        title: node.frontmatter.title,
        description: node.frontmatter.description,
        path,
        slug,
      };

      createNode({
        ...pageData,
        id,
        parent: node.id,
        children: [],
        internal: {
          type: 'ChicagoDocsPage',
          contentDigest: createContentDigest(pageData),
          content: JSON.stringify(pageData),
          description: 'MDX page from @kabartolo/gatsby-theme-chicago-docs',
        },
      });

      createParentChildLink({
        parent: parent,
        child: node,
      });
    } else if (
      parent.internal.type === 'File' &&
      parent.sourceInstanceName === 'docs'
    ) {

      let {
        showBreadcrumb,
        showPostNav,
        showSidebar,
        showTOC,
        title,
      } = node.frontmatter;
      const { shortTitle, description } = node.frontmatter;
      if (!title) title = shortTitle || 'Untitled';
      showBreadcrumb = (typeof showBreadcrumb === 'undefined') ? alwaysShowBreadcrumb : showBreadcrumb;
      showPostNav = (typeof showPostNav === 'undefined') ? alwaysShowPostNav : showPostNav;
      showSidebar = (typeof showSidebar === 'undefined') ? alwaysShowSidebar : showSidebar;
      showTOC = (typeof showTOC === 'undefined') ? alwaysShowTOC : showTOC;

      const filePath = createFilePath({ node, getNode, basePath: docsPath });
      const path = urlResolve(basePath, filePath);
      const slug = parent.name;
      const id = createNodeId(`${node.id} >>> Doc`);

      // AST used to build search index
      const [paragraphs, headers, sections] = buildAST(node.rawBody, allowDocsSearch);

      // Create Doc node
      const postData = {
        description,
        shortTitle,
        path,
        slug,
        title,
        showBreadcrumb,
        showPostNav,
        showSidebar,
        showTOC,
        headers,
        paragraphs,
        sections,
      };

      createNode({
        ...postData,
        id,
        parent: node.id,
        children: [],
        internal: {
          type: 'Doc',
          contentDigest: createContentDigest(postData),
          content: JSON.stringify(postData),
          description: 'Doc post from @kabartolo/gatsby-theme-chicago-docs',
        },
      });

      createParentChildLink({
        parent: parent,
        child: node,
      });
    }
  }
};

exports.onCreateWebpackConfig = ({ stage, actions, getConfig }) => {
  const config = getConfig();

  config.node = {
      fs: 'empty',
  };

  if (stage === 'build-javascript') {
    const miniCssExtractPlugin = config.plugins.find(
      (plugin) => plugin.constructor.name === 'MiniCssExtractPlugin'
    );

    if (miniCssExtractPlugin) {
      miniCssExtractPlugin.options.ignoreOrder = true;
    }
    actions.replaceWebpackConfig(config);
  }
};

exports.createPages = async ({ graphql, actions }, themeOptions) => {
  const { createPage } = actions;
  const { basePath, sidebarMenus: menus } = withDefault(themeOptions);

  const pageQuery = await graphql(`
    query {
      allChicagoDocsPage {
        edges {
          node {
            id
            path
            title
            slug
          }
        }
      }
    }
  `);

  if (pageQuery.errors) {
    throw pageQuery.errors;
  }

  const docsQuery = await graphql(`
    query {
      allDoc {
        edges {
          node {
            id
            path
            title
            shortTitle
            slug
            parent {
              ... on Mdx {
                tableOfContents(maxDepth: 2)
              }
            }
          }
        }
      }
    }
  `);

  if (docsQuery.errors) {
    throw docsQuery.errors;
  }

  const docs = docsQuery.data.allDoc.edges;
  const pages = pageQuery.data.allChicagoDocsPage.edges;

 /*** Create pages ***/
  pages.forEach(({ node }) => {
    createPage({
      path: node.path,
      component: pageTemplate,
      context: {
        id: node.id,
      },
    });
  });

  /*** Create docs ***/
  // Create sidebar menus
  const sidebarMenus = menus.map((menu) => menuInterface(menu, basePath));

  sidebarMenus.forEach((sidebarMenu) => {
    if (!sidebarMenu.items.length) {
      sidebarMenu.items = getMenuItems(sidebarMenu, docs);
    }
  });

  docs.forEach(({ node }) => {
    let menu = getSidebarMenu(sidebarMenus, node.path);

    if (menu && menu.items) {
      // Creates any missing groups
      if (node.slug === 'index') {
        menu.items = appendIndexToMenu(
          menu.items,
          node.shortTitle || node.title,
          node.path,
        );
      // Adds the post to the menu
      } else {
        menu.items = appendToMenu(
          menu.items,
          node.id,
          node.slug,
          node.shortTitle || node.title,
          node.title,
          node.path,
        );
      }
    }
  });

  // Create docs pages
  docs.forEach(({ node }) => {
    let previous;
    let next;
    let breadcrumb;
    const menu = getSidebarMenu(sidebarMenus, node.path);

    if (menu) {
      const flatMenu = flattenMenu([menu]).filter((item) => item != null);
      let index = flatMenu.findIndex((item) => item.path === node.path);

      if (index !== -1) {
        breadcrumb = node.path
          .slice(1, -1)
          .split('/')
          .map((slug) => {
            const menuItem = flatMenu.find((item) => item.slug === slug);
            return menuItem 
            ? {
                path: menuItem.path,
                name: menuItem.name,
              }
            : null;
          }).filter((item) => item != null);

          const prevPath = (index === 0) ? null : flatMenu[index - 1].path;
          const nextPath = (index === (flatMenu.length - 1)) ? null : flatMenu[index + 1].path;
          previous = prevPath && docs.find((doc) => doc.node.path === prevPath);
          next = nextPath && docs.find((doc) => doc.node.path === nextPath);
        }
    }

    createPage({
      path: node.path,
      component: docTemplate,
      context: {
        id: node.id,
        menu,
        breadcrumb,
        previous: previous && {
          path: previous.node.path,
          label: previous.node.shortTitle || previous.node.title,
        },
        next: next && {
          path: next.node.path,
          label: next.node.shortTitle || next.node.title,
        },
      },
    });
  });
}

exports.onPreBootstrap = ({ store, reporter }, themeOptions) => {
  const { program } = store.getState();
  const { docsPath, assetsPath, pagesPath } = withDefault(themeOptions);
  const dirs = [
    path.join(program.directory, docsPath),
    path.join(program.directory, assetsPath),
    path.join(program.directory, pagesPath),
  ]

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      reporter.log(`Creating the ${dir} directory`);
      mkdirp.sync(dir);
    }
  });
}
