import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { ApolloProvider } from '@apollo/client/react';
import { Toaster, TooltipProvider } from '@bta/shadcn';
import { apollo } from './lib/apollo';
import { AuthProvider } from './app/auth/AuthProvider';
import { router } from './app/router';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={apollo}>
      <AuthProvider>
        <TooltipProvider>
          <RouterProvider router={router} />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </ApolloProvider>
  </React.StrictMode>,
);
