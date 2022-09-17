import {NgModule} from '@angular/core';
import {APOLLO_NAMED_OPTIONS} from 'apollo-angular';
import {ApolloClientOptions, DefaultOptions, InMemoryCache} from '@apollo/client/core';
import {HttpLink} from 'apollo-angular/http';

const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'cache-and-network',
  },
  query: {
    fetchPolicy: 'no-cache',
  },
};

export function createApollo(httpLink: HttpLink): Record<string, ApolloClientOptions<any>> {
  return {
    astroport_mainnet: {
      link: httpLink.create({uri: 'https://terra2-api.astroport.fi/graphql'}),
      cache: new InMemoryCache(),
      defaultOptions,
    },
    astroport_testnet: {
      link: httpLink.create({uri: 'https://terra2-develop-api.astroport.fi/graphql'}),
      cache: new InMemoryCache(),
      defaultOptions,
    },
  };
}

@NgModule({
  providers: [
    {
      provide: APOLLO_NAMED_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },
  ],
})
export class GraphQLModule {
}
