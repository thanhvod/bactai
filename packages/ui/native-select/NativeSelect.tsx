import React from 'react';
import { NativeSelect as MuiNativeSelect, NativeSelectProps as MuiNativeSelectProps } from '@mui/material';

export type NativeSelectProps = MuiNativeSelectProps;

export const NativeSelect = React.forwardRef<any, NativeSelectProps>((props, ref) => {
  return <MuiNativeSelect ref={ref} {...props} />;
});

NativeSelect.displayName = 'NativeSelect';

export default NativeSelect;
