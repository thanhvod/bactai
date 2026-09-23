/// Lõi kỹ thuật dùng chung cho app Flutter BTA: cấu hình API, phiên đăng nhập, REST/GraphQL client,
/// upload chứng từ, GPS batch, hàng đợi offline, theo dõi kết nối. Không phụ thuộc UI.
library;

export 'src/api_config.dart';
export 'src/api_error.dart';
export 'src/session_store.dart';
export 'src/driver_auth_api.dart';
export 'src/graphql_client_factory.dart';
export 'src/upload_api.dart';
export 'src/gps_api.dart';
export 'src/offline_queue.dart';
export 'src/connectivity_watcher.dart';
