import { graphql } from '@/gql';

/** WM-SHELL-04 Import · WM-SHELL-05 Export/print (module P6). */
export const IoImportJobFields = graphql(`
  fragment IoImportJobFields on ImportJobView {
    id
    entityType
    fileName
    status
    totalRows
    validRows
    warningRows
    errorRows
    createdCount
    skippedCount
    unmappedColumns
    fields {
      key
      label
      required
      sourceColumn
    }
    rows {
      line
      values
      errors
      warnings
      createdCode
    }
  }
`);

export const IoStartImportMutation = graphql(`
  mutation IoStartImport($input: StartImportInput!) {
    startImport(input: $input) {
      ...IoImportJobFields
    }
  }
`);

export const IoImportPreviewQuery = graphql(`
  query IoImportPreview($id: ID!, $filter: ImportPreviewFilter) {
    importPreview(id: $id, filter: $filter) {
      ...IoImportJobFields
    }
  }
`);

export const IoCommitImportMutation = graphql(`
  mutation IoCommitImport($id: ID!, $skipErrors: Boolean) {
    commitImport(id: $id, skipErrors: $skipErrors) {
      ...IoImportJobFields
    }
  }
`);

export const IoCancelImportMutation = graphql(`
  mutation IoCancelImport($id: ID!) {
    cancelImport(id: $id) {
      id
      status
    }
  }
`);

export const IoImportTemplateQuery = graphql(`
  query IoImportTemplate($entityType: String!) {
    importTemplate(entityType: $entityType) {
      url
      fileName
    }
  }
`);

export const IoExportFileMutation = graphql(`
  mutation IoExportFile($input: ExportFileInput!) {
    exportFile(input: $input) {
      template
      fileName
      url
      rowCount
    }
  }
`);

export const IoRenderDocumentMutation = graphql(`
  mutation IoRenderDocument($input: RenderDocumentInput!) {
    renderDocument(input: $input) {
      template
      fileName
      url
      html
      attachmentId
    }
  }
`);
