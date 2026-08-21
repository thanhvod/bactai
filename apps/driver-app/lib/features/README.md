# Quy ước feature (clean architecture — 08-kien-truc.md mục 4)

Mỗi feature: data/ (GraphQL datasource + model) → domain/ (entity, use-case) → presentation/ (Bloc + UI).
UI dùng package flutter_ui + flutter_component (không tự chế component lẻ).
Offline: buffer trạng thái/GPS/ảnh POD khi mất mạng, đẩy bù khi có mạng.
