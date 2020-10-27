const withDefault = require('./utils/with-default');

module.exports = (options) => {
  const {
    docsPath,
    assetsPath,
    pagesPath,
    skipMDXConfig,
  } = withDefault(options);

  return {
    plugins: [
      'gatsby-plugin-eslint',
      'gatsby-image',
      'gatsby-plugin-sharp',
      'gatsby-remark-images',
      {
        resolve: 'gatsby-transformer-sharp',
        options: {
          checkSupportedExtensions: false,
        },
      },
      {
        resolve: 'gatsby-source-filesystem',
        options: {
          name: 'docs',
          path: docsPath,
        }
      },
      {
        resolve: 'gatsby-source-filesystem',
        options: {
          name: 'assets',
          path: assetsPath,
        },
      },
      {
        resolve: 'gatsby-source-filesystem',
        options: {
          name: 'pages',
          path: pagesPath,
        },
      },
      !skipMDXConfig && {
        resolve: 'gatsby-plugin-mdx',
        options: {
          extensions: ['.mdx', '.md'],
          gatsbyRemarkPlugins: [
            {
              resolve: 'gatsby-remark-autolink-headers',
              options: {
                elements: ['h2', 'h3', 'h4', 'h5', 'h6'],
              },
            },
            {
              resolve: 'gatsby-remark-images',
              options: {
                maxWidth: 1200,
              },
            },
          ],
        },
      },
      !skipMDXConfig && {
        resolve: 'gatsby-transformer-remark',
        options: {
          plugins: ['gatsby-remark-autolink-headers'],
        },
      },
      {
        resolve: '@gatsby-contrib/gatsby-plugin-elasticlunr-search',
        options: {
          fields: [
            'title',
            'description',
            'headers',
            'paragraphs',
          ],
          resolvers: {
            Doc: {
              title: (node) => node.title,
              description: (node) => node.description,
              path: (node) => node.path,
              sections: (node) => node.sections,
              headers: (node) => node.headers,
              paragraphs: (node) => node.paragraphs,
            },
          },
        },
      },
    ].filter(Boolean),
  }
};
