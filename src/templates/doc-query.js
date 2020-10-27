import { graphql } from 'gatsby';
import Doc from '../components/Doc';

export default Doc;

export const pageQuery = graphql`
  query ($id: String) {
    doc(id: { eq: $id }) {
      id
      body
      description
      path
      slug
      title
      showBreadcrumb
      showPostNav
      showSidebar
      showTOC
    }
  }
`;
