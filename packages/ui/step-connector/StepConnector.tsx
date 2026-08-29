import React from 'react';
import { StepConnector as MuiStepConnector, StepConnectorProps as MuiStepConnectorProps } from '@mui/material';

export type StepConnectorProps = MuiStepConnectorProps;

export const StepConnector = React.forwardRef<any, StepConnectorProps>((props, ref) => {
  return <MuiStepConnector ref={ref} {...props} />;
});

StepConnector.displayName = 'StepConnector';

export default StepConnector;
