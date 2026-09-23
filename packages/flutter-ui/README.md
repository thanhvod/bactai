# bta_flutter_ui

Design system BTA cho Flutter (App Tài xế, App Merchant). Nguồn token: `design/tokens/bta_tokens.dart` — chạy `python3 design/tools/gen_tokens.py` rồi copy lại `lib/src/tokens/bta_tokens.dart` khi `tokens.json` đổi.

- `BtaColors / BtaText / BtaSpace / BtaRadius / BtaSize`, `btaTheme()`, `BtaTone` + `BtaToneColors`.
- `BtaFonts.textTheme()` — Inter qua google_fonts (offline fallback system font).
- `lib/src/domain/status.dart` — enum + nhãn tiếng Việt + tone, **khớp `packages/shared/src/status.ts`** (sửa cùng lúc).
- Widgets: StatusBadge, MoneyText, TripCard, StopCard, PrimaryBottomAction, showReasonBottomSheet, showConfirmBottomSheet,
  BtaBanner/OfflineBanner, SyncStatusChip, MobileHeader, BtaBottomNav, ListRow, EmptyState, ErrorState, SkeletonBox/SkeletonCard,
  KpiTile, CodInput, PodCapture, DriverWallet, AttachmentTile, SectionCard.

```bash
flutter analyze && flutter test
```
