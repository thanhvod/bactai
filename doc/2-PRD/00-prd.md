# PRD — Product Requirements

> Nguồn: phân tích từ bộ BRD tại `doc/1-BRD`.
> Mục tiêu: chuyển yêu cầu business thành đặc tả sản phẩm có thể dùng cho thiết kế UI/UX, backlog, API contract, data model chi tiết và test case.

## Danh sách tài liệu

| File | Nội dung | Trạng thái |
|---|---|---|
| [01-danh-sach-man-hinh.md](01-danh-sach-man-hinh.md) | Liệt kê toàn bộ màn hình theo platform: Web Merchant, App Tài xế, App Merchant, Web Khách hàng; mô tả nội dung, chức năng và liên kết giữa màn hình | Draft từ BRD |
| [02-implementation-breakdown.md](02-implementation-breakdown.md) | Master backlog triển khai toàn bộ sản phẩm cho Claude Code: backend/API/database, Web Merchant, App Tài xế, App Merchant, Web Khách hàng, phase, dependency, user story, acceptance criteria, thứ tự trước/sau và kế hoạch chạy song song | Draft chi tiết từ toàn bộ `doc` |
| [03-detailed-task-specs.md](03-detailed-task-specs.md) | Task spec chi tiết theo từng phase/platform: mô tả màn hình, user story, chức năng, backend/API/data, acceptance testing và dependency để giao Claude Code implement | Draft chi tiết |
| [04-handoff-readiness-review.md](04-handoff-readiness-review.md) | Review mức sẵn sàng để giao Claude Design và Claude Code; liệt kê phần đã đủ, phần còn thiếu, checklist trước handoff | Draft review |
| [05-route-map.md](05-route-map.md) | Route map và navigation hierarchy cho Web Merchant, Driver App, App Merchant, Web Khách hàng | Draft handoff |
| [06-ui-flow-specs.md](06-ui-flow-specs.md) | UI flow specs cho các luồng nghiệp vụ lớn: order, dispatch, driver POD/COD, finance, payroll, booking | Draft handoff |
| [07-api-contract-map.md](07-api-contract-map.md) | API contract map cấp cao: GraphQL operations, REST upload/GPS, error codes | Draft handoff |
| [08-permission-matrix.md](08-permission-matrix.md) | Permission matrix theo role/action và sensitive action list | Draft handoff |
| [09-parallel-execution-plan.md](09-parallel-execution-plan.md) | Parallel execution và ownership plan: schema owner, module paths, merge order, conflict mitigation | Draft handoff |

## Quy ước

- BRD (`doc/1-BRD`) giữ vai trò ghi nhận business, quyết định, scope và nghiệp vụ.
- PRD (`doc/2-PRD`) giữ vai trò đặc tả sản phẩm: màn hình, flow, user story, acceptance criteria, route map, priority.
- Technical design để ở `doc/3-TECHNICAL`.
- UI/design chi tiết để ở `doc/4-DESIGN`.

## Hướng phát triển PRD tiếp theo

- Chốt các open decisions ở phase P0 trước khi code các phần liên quan.
- Khi implementation bắt đầu, cập nhật PRD nếu business rule thay đổi.
- Khi API schema thật được generate, đối chiếu lại với `07-api-contract-map.md`.
- Khi có Figma/UI artifact, map frame name về screen ID trong `01-danh-sach-man-hinh.md`.
- Khi seed data được implement, đối chiếu với `doc/3-TECHNICAL/SEED-SCENARIOS.md`.
