import 'models.dart';

enum JobBucket { today, upcoming, running, done }

extension JobBucketApi on JobBucket {
  String get api => name.toUpperCase();
}

/// Nguồn dữ liệu chuyến được giao. Impl: GraphqlJobsRepository (API `driverJobs`, cache offline), MockJobsRepository (UI demo).
abstract class JobsRepository {
  /// `stale` = dữ liệu cache khi mất mạng.
  Future<({List<DriverTrip> items, bool stale})> jobs({JobBucket bucket = JobBucket.today, String? date});
  Future<({DriverTrip trip, bool stale})> trip(String id);
  Future<List<CalendarDay>> calendar(DateTime from, DateTime to);
  /// Tìm chuyến chứa điểm dừng (dùng cache/trip đã tải).
  Future<({DriverTrip trip, DriverStop stop, bool stale})> stop(String stopId);
  /// Ghi đè bản cache của chuyến (sau thao tác lạc quan offline).
  Future<void> cacheTrip(DriverTrip trip, Map<String, dynamic>? raw);
  /// Bỏ bản ghi đè cục bộ sau khi hàng đợi đồng bộ xong (dữ liệu server là nguồn sự thật).
  void clearOverlays();
}
