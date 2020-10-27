# Gatsby Theme Chicago Docs (Core)

> For full documentation and a demonstration of `@kabartolo/gatsby-theme-chicago-docs`, see the <a href="https://kabartolo.github.io/chicago-docs-demo/">Chicago Docs Demo</a>.

> This guide is for the **core** version of this theme.

The <a href="https://kabartolo.github.io/chicago-docs-demo/">Chicago Docs theme</a> for <a href="https://gatsbyjs.com">Gatsby</a> is a modern, professional docs site designed for open source projects. 

## Table of Contents

* [Installation](#installation)
* [Quick Config](#quick-config)
* [Menus](#menus)
* [Theme Options](#theme-options)
* [Creating Docs](#creating-docs)
* [Creating Pages](#creating-pages)

## Installation

### Start a new site

To install the **core starter** to start a docs site from scratch:

```
gatsby new your-site-name @kabartolo/gatsby-starter-chicago-docs-core
```

### Add to an existing site

To install the **core theme** so you can style your docs from scratch, run:

```
npm install @kabartolo/gatsby-theme-chicago-docs-core
```

## Quick Config

Customize your site details in the `gatsby-config.js` file for your site. This creates the site metadata and configures the manifest file using <a href="https://www.gatsbyjs.com/plugins/gatsby-plugin-manifest/">`gatsby-plugin-manifest`</a>. It also adds a favicon.

See <a href="https://kabartolo.github.io/chicago-docs-demo/docs/configuration/">Configuration</a> for a more in-depth guide on configuring your site (note that `githubUrl` and `siteLogo` in the main theme are not used by the core theme).

### Metadata

This table gives the name of each metadata field, its type, whether it is optional or required, the default value, and a description.

| Name | Type | Info | Default | Description |
| --- | --- | --- | --- | --- |
| `title` | string | optional |  `''` (empty string) | Used to set the meta title tag for your site. Also appears in the browser tab. |
| `description` | string | optional | `''` (empty string) | Used to set the meta description tag for your site. |
| `siteLanguage` | string | optional | `''` (empty string) | Used to set the meta language tag for your site. |
| `siteUrl` | string | optional | `''` (empty string) |  Used to set the canonical URL for your site. |

### Example

```js
module.exports = {
  siteMetadata: {
    title: 'The Full Title of Your Project',
    description: 'A brief description of your project and/or the site',
    siteLanguage: 'en',
    siteUrl: 'https://www.your-site.com',
  },
  plugins: [
    '@kabartolo/gatsby-theme-chicago-docs-core',
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'The Full Title of Your Project',
        short_name: 'Shorter Title',
        start_url: '/',
        background_color: '#fff',
        theme_color: '#eee',
        display: 'standalone',
        icon: 'src/assets/favicon.ico', // creates a favicon
      },
    },
  ],
}

```

## Menus

The main menu and the sidebar menus are defined in your site's `gatsby-config.js` file. For more information on creating these menus, see <a href="https://kabartolo.github.io/chicago-docs-demo/docs/configuration/menus">Configuration: Menus</a>.

This example shows how the main menu and sidebar menus are defined for the <a href="https://kabartolo.github.io/chicago-docs-demo/">demo</a> site. Note that if you omit the `items` list, all posts from the directory will be added automatically.

```js {6,16}num
module.exports = {
  plugins: [
    {
      resolve: '@kabartolo/gatsby-theme-chicago-docs-core',
      options: {
         mainMenu: [
          {
            name: 'Documentation',
            path: '/docs/',
          },
          {
            name: 'Tutorials',
            path: '/tutorials/',
          },
        ],
        sidebarMenus: [
          {
            name: 'Documentation',
            slug: 'docs',
            items: [
              {
                slug: 'quick-start',
              },
              {
                name: 'Configuration',
                slug: 'configuration',
                isGroup: true,
                items: [
                  {
                    slug: 'site-options'
                  },
                  {
                    slug: 'menus',
                  },
                  {
                    slug: 'search-config',
                  },
                ],
              },
              // code omitted for brevity            
            ],
          },
          {
            name: 'Tutorials',
            slug: 'tutorials',
            items: [
              {
                slug: 'tutorial1',
              },
            ],
          },
        ],
      },  
    },
  ],
}

```

## Theme Options

Several options are available to customize your site's directory structure and how the site behaves. See <a href="https://kabartolo.github.io/chicago-docs-demo/docs/configuration/site-options/#theme-options">Configuration: Theme Options</a> for more details. Note that `@kabartolo/gatsby-theme-chicago-docs` defines more options than the core theme. The core theme uses the options listed below.

### Options

This table gives the name of each theme option, its type, whether it is optional or required, the default value, and a description. These options (except `sidebarMenus`) can be fetched using the <a href="https://kabartolo.github.io/chicago-docs-demo/docs/components-and-hooks/#hooks">`useThemeOptions` hook</a>.

| Name | Type | Info | Default | Description |
| --- | --- | --- | --- | --- |
| `assetsPath` | string | optional | `src/assets` | Directory for all assets used in your site. |
| `basePath` | string | optional | `''` (empty string) | Base path of your docs site, such as `/docs`. |
| `docsPath` | string | optional | `src/docs` |  Directory for all MDX docs for your site (i.e., MDX files that should use the Doc page component). |
| `pagesPath` | string | optional | `'src/mdxPages'` |  Directory for your site's pages (i.e., MDX files that should use the Page page component). |
| `mainMenu` | array of objects | optional | `[]` | List of main menu items (see <a href="https://kabartolo.github.io/chicago-docs-demo/docs/configuration/menus/#main-menu">Configuration: Main Menu</a>). |
| `sidebarMenus` | array of objects | optional | `[]` | List of sidebar menus (the sidebar menu associated with a doc is stored in the doc's `pageContext` prop; also see <a href="https://kabartolo.github.io/chicago-docs-demo/docs/configuration/menus/#sidebar-menu">Configuration: Sidebar Menu</a>). |
| `allowDocsSearch` | boolean | optional | `true` |  Whether a search index is fully populated with MDX files from the `docsPath` folder. Set to `false` to use a different search strategy. |
| `alwaysShowBreadcrumb` | boolean | optional | `true` | Used as default value for the <a href="#frontmatter">`showBreadcrumb`</a> frontmatter field for an individual doc.|
| `alwaysShowPostNav` | boolean | optional | `true` | Used as default value for the <a href="#frontmatter">`showPostNav`</a> frontmatter field for an individual doc. |
| `alwaysShowSidebar` | boolean | optional | `true` | Used as default value for the <a href="#frontmatter">`showSidebar`</a> frontmatter field for an individual doc. |
| `alwaysShowTOC` | boolean | optional | `true` | Used as default value for the <a href="#frontmatter">`showTOC`</a> frontmatter field for an individual doc. |
| `skipMDXConfig` | boolean | optional | `false` | Whether to skip <a href="https://www.gatsbyjs.com/plugins/gatsby-plugin-mdx/">`gatsby-plugin-mdx`</a> configuration for the theme. |

### Example

This example shows the theme options (except <a href="#menus">menus</a>) and their default values:

```js
module.exports = {
  plugins: [
    {
      resolve: '@kabartolo/gatsby-theme-chicago-docs',
      options: {
        assetsPath: 'src/assets',
        basePath: '/',
        docsPath: 'src/docs',
        pagesPath: 'src/mdxPages',
        allowDocsSearch: true,
        alwaysShowBreadcrumb: true,
        alwaysShowPostNav: true,
        alwaysShowSidebar: true,
        alwaysShowTOC: true,
        skipMDXConfig: false,
      }
    }
  ]
}

```

## Creating Docs

Docs are MDX files that are displayed using the Doc page component. The <a href="https://kabartolo.github.io/chicago-docs-demo/docs/menus/#sidebar-menu">sidebar menu</a> helps define each doc's breadcrumb links and post navigation (links to previous and next docs). These are stored along with the sidebar menu in the doc's `pageContext` prop, which you can access from the Doc page component:

```js {6}
// src/components/Doc/index.js

import React from 'react';
import PropTypes from 'prop-types';

export default function Doc({ data, pageContext }) {
  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <pre>{JSON.stringify(pageContext, null, 2)}</pre>
    </div>
  );
}

Doc.propTypes = {
  data: PropTypes.instanceOf(Object).isRequired,
  pageContext: PropTypes.instanceOf(Object).isRequired,
};
```

### Frontmatter fields

This table gives the name of each frontmatter field, its type, whether it is optional or required, the default value, and a description.

See <a href="/docs/configuration/site-options/#frontmatter">Configuration: Frontmatter</a> for more details on the available frontmatter fields.

| Name | Type | Info | Default | Description |
| --- | --- | --- | --- | --- |
| `title` | string | optional | value of `shortTitle` or 'Untitled' | Title of the doc. Used in the meta title tag and appears in the browser tab. |
| `shortTitle` | string | optional | `''` (empty string) | Shorter title used in place of the `title` field in doc navigation (e.g., in the sidebar). |
| `description` | string | optional | `''` (empty string) | Description of the doc. Used in the search index and in the meta description tag for the page. |
| `showBreadcrumb` | boolean | optional | value of `alwaysShowBreadcrumb` | Can be used to determine whether the breadcrumb links should appear at the top of this doc. |
| `showPostNav` | boolean | optional | value of `alwaysShowPostNav` | Can be used to determine whether links to the previous and next docs should appear at the bottom of this doc. |
| `showSidebar` | boolean | optional | value of `alwaysShowSidebar` | Can be used to determine whether the sidebar should appear for this doc. |
| `showTOC` | boolean | optional | value of `alwaysShowTOC` | Can be used to determine whether the standalone table of contents (the TOC component) should appear for this doc. |

### Example

To create a doc, create an MDX file in `src/docs` (or the `docsPath` defined in the <a href="#theme-options">theme options</a>):

```js
---
title: Title for your doc
shortTitle: Alternate (shorter) title used in navigation
description: Brief description of the doc (used in metadata and search index)
showPostNav: false
showTOC: false
---

## The first header should be an h2

This post will not show previous/next navigation or a table of contents since
`showPostNav` and `showTOC` are set to `false`.

```

See <a href="https://kabartolo.github.io/chicago-docs-demo/docs/configuration/site-options/#frontmatter">Configuration: Frontmatter</a> for details on the available frontmatter fields. See <a href="https://kabartolo.github.io/chicago-docs-demo/docs/mdx-guide">Guide to MDX</a> for help writing MDX and Markdown.

## Creating Pages

Other pages can be created using React, regular JavaScript, or MDX. An MDX file in `src/mdxPages` (or the `pagesPath` <a href="#theme-options">theme option</a>) will be rendered using the Page component, which does **not** include layout features such as a sidebar menu or breadcrumb links.

To create a non-doc MDX page, create an MDX file in your specified `pagesPath` directory:

```js
---
title: Title for your page
description: Brief description of the page (used in metadata)
---

## The first header should be an h2


```
