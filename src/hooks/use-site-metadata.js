import { graphql, useStaticQuery } from 'gatsby';

function useSiteMetadata() {
  const data = useStaticQuery(graphql`
    {
      site {
        siteMetadata {
          title
          description
          siteUrl
          siteLanguage
        }
      }
    }
  `);

  return data.site.siteMetadata;
}

export { useSiteMetadata };
