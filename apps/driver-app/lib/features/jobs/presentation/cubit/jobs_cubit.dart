import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/jobs_repository.dart';
import '../../domain/models.dart';

class JobsState {
  const JobsState({this.bucket = JobBucket.today, this.loading = true, this.items = const [], this.error, this.stale = false, this.date});
  final JobBucket bucket;
  final bool loading;
  final List<DriverTrip> items;
  final String? error;
  final bool stale;
  final String? date;

  DriverTrip? get running => items.where((t) => tripRunningStatuses.contains(t.status)).firstOrNull;
  DriverTrip? get next => items.where((t) => t.status == TripStatus.SCHEDULED).firstOrNull;

  JobsState copyWith({JobBucket? bucket, bool? loading, List<DriverTrip>? items, String? error, bool clearError = false, bool? stale, String? date}) => JobsState(
        bucket: bucket ?? this.bucket,
        loading: loading ?? this.loading,
        items: items ?? this.items,
        error: clearError ? null : (error ?? this.error),
        stale: stale ?? this.stale,
        date: date ?? this.date,
      );
}

class JobsCubit extends Cubit<JobsState> {
  JobsCubit(this._repo, {JobBucket bucket = JobBucket.today}) : super(JobsState(bucket: bucket));
  final JobsRepository _repo;

  Future<void> load([JobBucket? bucket]) async {
    final b = bucket ?? state.bucket;
    emit(state.copyWith(bucket: b, loading: state.items.isEmpty || b != state.bucket, clearError: true));
    try {
      final r = await _repo.jobs(bucket: b, date: state.date);
      if (!isClosed) emit(state.copyWith(loading: false, items: r.items, stale: r.stale));
    } catch (e) {
      if (!isClosed) emit(state.copyWith(loading: false, error: _msg(e)));
    }
  }

  Future<void> loadDate(String date) async {
    emit(JobsState(bucket: state.bucket, date: date));
    await load();
  }
}

String _msg(Object e) => e.toString().replaceFirst(RegExp(r'^ApiException\([A-Z_]+\): '), '');
String errorMessage(Object e) => _msg(e);
