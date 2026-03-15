import { gql } from "@apollo/client";

export const FIRST_QUERY = gql`
  query FirstQuery {
    firstQuery {
      text
      id
    }
  }
`;
