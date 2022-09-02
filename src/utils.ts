import {
  ApolloClient,
  InMemoryCache,
  gql,
} from '@apollo/client'

import { EXPLORE_PUBLICATIONS, } from "./gqlQueries";

const APIURL = 'https://api-mumbai.lens.dev/';

const apolloClient= new ApolloClient({
  uri: APIURL,
  cache: new InMemoryCache(),
})

export const explorePublications = async (explorePublicationQueryRequest: any) => {
   const response = await apolloClient.query({
    query: gql(EXPLORE_PUBLICATIONS),
    variables: {
      request: explorePublicationQueryRequest
    },
  });

  const publications = response.data.explorePublications.items;
  console.log('Lens Publication Data', publications);

  publications.forEach((publication: any) => {
    switch (publication.__typename) {
      case "Mirror":
        break;
      case "Post":
        console.log(
          publication.metadata.content,
          publication.metadata.media.length
        );
        break;
      case "Comment":
        console.log(
          publication.mainPost.metadata.content,
          publication.mainPost.metadata.media.length
        );
        break;
    };
    console.log(publication.__typename);
  });
}
