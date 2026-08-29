import React from 'react';
import { Autocomplete as MuiAutocomplete, AutocompleteProps as MuiAutocompleteProps } from '@mui/material';

export type AutocompleteProps<
  T,
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined,
  ChipComponent extends React.ElementType = React.ElementType
> = MuiAutocompleteProps<T, Multiple, DisableClearable, FreeSolo, ChipComponent>;

export const Autocomplete = React.forwardRef<any, any>((props, ref) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <MuiAutocomplete ref={ref} {...(props as any)} />;
});

Autocomplete.displayName = 'Autocomplete';

export default Autocomplete;
