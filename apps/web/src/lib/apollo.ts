import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { auth } from './firebase';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_API_URL || 'http://localhost:2001/graphql',
});

const authLink = setContext(async (_op, { headers }) => {
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : null;
  return {
    headers: { ...headers, ...(token ? { authorization: `Bearer ${token}` } : {}) },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
  },
});
