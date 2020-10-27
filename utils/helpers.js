/* eslint-disable no-use-before-define */
const mdx = require('@mdx-js/mdx');
const grayMatter = require('gray-matter');

const {
  hasFragment,
  normalizePath,
} = require('./path-helpers');

function deepCopy(object) {
  if (typeof object !== 'object' || object == null) {
    return object;
  }

  const result = Array.isArray(object) ? [] : {};
  /* eslint-disable no-param-reassign */
  return Object.keys(object).reduce((map, key) => {
    const value = object[key];
    map[key] = deepCopy(value);
    return map;
  }, result);
  /* eslint-enable no-param-reassign */
}

function getSections(AST) {
  let nearestHeading = '';

  const format = (parts) => {
    const str = parts
      .map((part) => (
        part.children
          ? part.children.map((child) => child.value).join('')
          : part.value
      )).join('');
    return str.replace(/<[^>]*>/g, ''); // remove any html/jsx tags
  };

  const sections = AST.children.map((child) => {
    const isMajorHeading = child.type === 'heading' && child.depth === 2;
    const isParagraph = child.type === 'paragraph';
    const id = Math.floor(Math.random() * 100000);

    if (isMajorHeading) {
      nearestHeading = format(child.children);
      return null;
    }
    if (isParagraph) {
      return {
        heading: nearestHeading,
        content: format(child.children),
        id,
      };
    }

    return null;
  });

  return sections.filter((section) => section != null);
}

function buildAST(body, allowDocsSearch) {
  let paragraphs = [];
  let headers = [];
  let sections = [];
  if (allowDocsSearch) {
    const compiler = mdx.createMdxAstCompiler({ remarkPlugins: [] });
    const { content } = grayMatter(body);
    const AST = compiler.parse(content);
    sections = getSections(AST);
    paragraphs = sections.map((paragraph) => paragraph.content);
    headers = sections
      .map((paragraph) => paragraph.heading)
      .filter((heading, index, self) => (
        self.indexOf(heading) === index
      ));
  }

  return [paragraphs, headers, sections];
}

function flattenMenuItem({
  id,
  slug,
  path,
  name,
  items = [],
}) {
  return hasFragment(path) ? null : [{
    id,
    slug,
    path,
    name,
  }, ...flattenMenu(items)];
}

function flattenMenu(items = []) {
  return items.flatMap((item) => flattenMenuItem(item));
}

function flattenTOCItem({ url = '', title = '', items = [] }) {
  return [{ url, title }, ...flattenTOC(items)];
}

function flattenTOC(items = []) {
  return items.flatMap((item) => flattenTOCItem(item));
}

function itemInterface(item, parentPath) {
  const {
    name,
    isGroup,
    items,
  } = item;
  const slug = typeof item.slug === 'undefined' ? '' : item.slug;
  const path = isGroup ? normalizePath(`${parentPath}${slug}/`) : slug;

  return ({
    id: slug,
    name,
    slug,
    path,
    isGroup,
    useCustomList: items && items.length,
    items: items ? items.map((subItem) => itemInterface(subItem, path)) : [],
  });
}

function menuInterface(menu, basePath) {
  const {
    sidebarLabel,
    dropdownLabel,
    items,
  } = menu;
  const name = typeof menu.name === 'undefined' ? '' : menu.name;
  const slug = typeof menu.slug === 'undefined' ? '' : menu.slug;
  const path = normalizePath(`${basePath}/${slug}/`);

  return ({
    id: slug,
    name,
    slug,
    path,
    sidebarLabel: (sidebarLabel || sidebarLabel === '') ? sidebarLabel : name,
    dropdownLabel: (dropdownLabel || dropdownLabel === '') ? dropdownLabel : name,
    items: items ? items.map((subItem) => itemInterface(subItem, path)) : [],
  });
}

const getSlugs = (path) => path.slice(1, -1).split('/');

const groupSlug = (path) => getSlugs(path).slice(1).join('/');

/* Gets the first level of menu items; appendToMenu takes care of the rest */
function getMenuItems(menu, docs) {
  const inMenuBaseDirectory = ({ node }) => node.path === normalizePath(`${menu.path}${node.slug}/`);
  const isGroupIndex = ({ node }) => {
    const [menuSlug, ...slugs] = getSlugs(node.path);
    const isGroupPath = menuSlug === menu.slug && slugs.length === 1;
    return isGroupPath && node.slug === 'index';
  };

  const baseItems = docs.filter(inMenuBaseDirectory).map(({ node }) => ({
    name: node.shortTitle || node.title,
    slug: node.slug,
    isGroup: false,
  }));
  const groups = docs.filter(isGroupIndex).map(({ node }) => ({
    name: node.shortTitle || node.title,
    slug: groupSlug(node.path),
    isGroup: true,
  }));
  const menuItems = baseItems.concat(groups);
  return menuItems.map((item) => itemInterface(item, menu.path));
}

function getSidebarMenu(menus, postPath) {
  const sidebarMenu = menus.filter((menu) => (
    menu.path !== '/'
  )).find((menu) => (
    menu.path && !!postPath.match(menu.path)
  ));

  return sidebarMenu || menus.find((menu) => menu.path === '/');
}

function getGroupMenu(sidebarItems, postPath, postSlug = '') {
  let groupMenu;
  let menuItem;
  for (let i = 0; i < sidebarItems.length; i += 1) {
    menuItem = sidebarItems[i];
    if (menuItem.isGroup) {
      const path = normalizePath(`${menuItem.path}${postSlug}/`);
      groupMenu = postPath === path ? menuItem : getGroupMenu(menuItem.items, postPath, postSlug);
      if (groupMenu) break;
    }
  }

  return groupMenu;
}

function findPost(posts, slug) {
  return posts.find((post) => post.slug === slug);
}

function appendIndexToMenu(
  sidebarItems,
  postName,
  postPath,
) {
  const newItems = deepCopy(sidebarItems);
  const groupMenu = getGroupMenu(newItems, postPath);
  if (groupMenu && !groupMenu.name) {
    groupMenu.name = postName;
  }

  // Create any missing nested groups
  if (!groupMenu) {
    const [menuPath, firstSlug, ...slugs] = getSlugs(postPath);
    let currentPath = normalizePath(`/${menuPath}/${firstSlug}/`);

    // At least the first group is in the menu at this point
    let currentGroup = getGroupMenu(newItems, currentPath);

    slugs.forEach((slug, index) => {
      const isLastSlug = index === slugs.length - 1;
      const newPath = `${currentPath}${slug}/`;
      const existingGroup = getGroupMenu(newItems, newPath);
      const newGroup = existingGroup || itemInterface({
        name: isLastSlug ? postName : slug,
        slug,
        isGroup: true,
      }, currentPath);
      if (!existingGroup) currentGroup.items.push(newGroup);
      currentPath = newPath;
      currentGroup = newGroup;
    });
  }

  return newItems;
}

function appendToMenu(
  sidebarItems,
  postId,
  postSlug,
  postName,
  postPath,
) {
  const newItems = deepCopy(sidebarItems);
  const groupMenu = getGroupMenu(newItems, postPath, postSlug);
  let post = groupMenu ? findPost(groupMenu.items, postSlug) : findPost(newItems, postSlug);

  if (!post && groupMenu && !groupMenu.useCustomList) {
    post = itemInterface(postSlug, groupMenu.path);
    groupMenu.items.push(post);
  }

  if (post) {
    post.id = postId;
    post.slug = postSlug;
    post.name = post.name || postName;
    post.path = postPath;
  }

  return newItems;
}

function traverseTOC(
  items,
  finalDepth,
  handler = (subItems) => subItems,
  currentDepth = 2,
) {
  const depthExceeded = currentDepth >= finalDepth;

  items.forEach((item) => {
    handler(item, depthExceeded);
    if (item.items && !depthExceeded) {
      traverseTOC(
        item.items,
        finalDepth,
        handler,
        currentDepth + 1,
      );
    }
  });

  return items;
}

module.exports = {
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
  traverseTOC,
};
