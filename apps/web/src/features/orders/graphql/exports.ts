import { graphql } from '@/gql';

export const ExportFileMutation = graphql(`
  mutation OrdExportFile($input: ExportFileInput!) {
    exportFile(input: $input) {
      url
      fileName
      rowCount
    }
  }
`);
