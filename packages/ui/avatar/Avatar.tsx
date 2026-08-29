import React from 'react';
import { Avatar as MuiAvatar, AvatarProps as MuiAvatarProps } from '@mui/material';

export type AvatarProps = MuiAvatarProps;

export const Avatar = React.forwardRef<any, AvatarProps>((props, ref) => {
  return <MuiAvatar ref={ref} {...props} />;
});

Avatar.displayName = 'Avatar';

export default Avatar;
