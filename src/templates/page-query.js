import { graphql } from 'gatsby';
import Page from '../components/Page';

export default Page;

export const pageQuery = graphql`
  query ($id: String) {
    chicagoDocsPage(id: { eq: $id }) {
      id
      body
      slug
      path
      title
      description
    }
  }
`;
