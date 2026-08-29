import React from 'react';
import { Modal as MuiModal, ModalProps as MuiModalProps } from '@mui/material';

export type ModalProps = MuiModalProps;

export const Modal = React.forwardRef<any, ModalProps>((props, ref) => {
  return <MuiModal ref={ref} {...props} />;
});

Modal.displayName = 'Modal';

export default Modal;
