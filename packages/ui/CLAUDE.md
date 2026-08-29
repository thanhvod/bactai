# @bta/ui — Shared UI Component Library

Tất cả ~100 components MUI đã được wrap tại đây. **Apps phải import từ `@bta/ui`, KHÔNG import từ `@mui/material` trực tiếp.**

---

## Thêm component mới — 3 bước

### Bước 1: Tạo folder và file

```
packages/ui/<component-name>/
  <ComponentName>.tsx    # Implementation
  index.ts               # Export
```

**Ví dụ `packages/ui/date-picker/DatePicker.tsx`:**
```tsx
import React from 'react';
import { DatePicker as MuiDatePicker, DatePickerProps } from '@mui/x-date-pickers';
export { DatePickerProps };

export const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps<any>>(
  (props, ref) => {
    return <MuiDatePicker {...props} />;
  }
);
DatePicker.displayName = 'DatePicker';
```

**`packages/ui/date-picker/index.ts`:**
```ts
export * from './DatePicker';
```

### Bước 2: Export từ root index

Mở `packages/ui/index.ts` và thêm:
```ts
export * from './date-picker';
```

### Bước 3: Dùng trong app
```tsx
import { DatePicker } from '@bta/ui';
// hoặc direct import:
import { DatePicker } from '@bta/ui/date-picker';
```

---

## Tùy biến style mặc định

Sửa trực tiếp component trong folder của nó:
```tsx
// packages/ui/button/Button.tsx
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => (
    <MuiButton
      ref={ref}
      {...props}
      sx={{ borderRadius: 2, textTransform: 'none', ...props.sx }}
    />
  )
);
```

Thay đổi ở đây ảnh hưởng toàn hệ thống.

---

## Components hiện có (theo category)

**Layout:** `Box`, `Grid`, `Stack`, `Container`, `Paper`, `Divider`

**Inputs:** `Button`, `TextField`, `Select`, `Checkbox`, `Radio`, `RadioGroup`, `Switch`, `Autocomplete`, `Slider`, `Rating`, `NativeSelect`, `OutlinedInput`, `FormControl`, `FormControlLabel`, `FormGroup`, `InputLabel`, `InputAdornment`

**Data Display:** `Typography`, `Table`, `TableBody`, `TableCell`, `TableContainer`, `TableHead`, `TableRow`, `List`, `ListItem`, `ListItemButton`, `ListItemIcon`, `ListItemText`, `ListSubheader`, `Avatar`, `Chip`, `Badge`, `Tooltip`, `Link`

**Feedback:** `Alert`, `Dialog`, `DialogActions`, `DialogContent`, `DialogTitle`, `Snackbar`, `SnackbarContent`, `Skeleton`, `CircularProgress`, `LinearProgress`, `Backdrop`

**Navigation:** `Tabs`, `Tab`, `TabScrollButton`, `Stepper`, `Step`, `StepLabel`, `StepContent`, `StepButton`, `StepConnector`, `StepIcon`, `Breadcrumbs`, `Pagination`, `PaginationItem`, `BottomNavigation`, `BottomNavigationAction`

**Layout Utils:** `AppBar`, `Toolbar`, `Drawer`, `Modal`, `Popover`, `Popper`, `Menu`, `MenuItem`

**Surfaces:** `Accordion`, `AccordionActions`, `AccordionDetails`, `AccordionSummary`, `Card`, `CardActionArea`, `CardActions`, `CardContent`, `CardHeader`, `CardMedia`

**Misc:** `Fab`, `SpeedDial`, `SpeedDialAction`, `SpeedDialIcon`, `ToggleButton`, `ToggleButtonGroup`, `Collapse`, `Fade`, `Grow`, `Slide`, `Zoom`, `CssBaseline`, `MuiIcon`

**Hooks:** `useTheme` (từ `@bta/ui/hooks`)

---

## Check trước khi thêm

```bash
# Xem file index.ts để check component đã có chưa
grep "export \* from" packages/ui/index.ts | grep "component-name"
```

---

## Quy tắc

1. KHÔNG import `@mui/material` trực tiếp trong bất kỳ app nào
2. Component mới chưa có → tạo ở đây trước, rồi mới dùng
3. Style override → sửa tại component folder, không sửa trong app
4. Export rõ ràng qua `index.ts`
