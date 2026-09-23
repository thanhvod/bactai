import { graphql } from '@/gql';

export const SupplierOptionsQuery = graphql(`
  query DspSupplierOptions {
    supplierOptions(activeOnly: false) {
      id
      name
      status
      typeName
    }
  }
`);
