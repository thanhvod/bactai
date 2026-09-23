import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/di/di.dart';
import '../../../../core/router/routes.dart';
import '../../domain/jobs_repository.dart';
import '../../domain/models.dart';
import '../cubit/jobs_cubit.dart';

/// DA-JOB-02 — lịch chuyến theo tháng: ngày có chuyến có chấm; chọn ngày → danh sách chuyến ngày đó.
class JobCalendarPage extends StatefulWidget {
  const JobCalendarPage({super.key});
  @override
  State<JobCalendarPage> createState() => _JobCalendarPageState();
}

String _iso(DateTime d) => '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

class _JobCalendarPageState extends State<JobCalendarPage> {
  final _repo = getIt<JobsRepository>();
  late DateTime _month = DateTime(DateTime.now().year, DateTime.now().month);
  late DateTime _selected = DateTime(DateTime.now().year, DateTime.now().month, DateTime.now().day);
  Map<String, CalendarDay> _days = {};
  bool _loading = true;
  String? _error;
  late final JobsCubit _dayJobs = JobsCubit(_repo);

  @override
  void initState() {
    super.initState();
    _loadMonth();
    _dayJobs.loadDate(_iso(_selected));
  }

  @override
  void dispose() {
    _dayJobs.close();
    super.dispose();
  }

  Future<void> _loadMonth() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final days = await _repo.calendar(_month, DateTime(_month.year, _month.month + 1, 0));
      if (mounted) setState(() => _days = {for (final d in days) _iso(d.date): d});
    } catch (e) {
      if (mounted) setState(() => _error = errorMessage(e));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _shift(int m) {
    setState(() => _month = DateTime(_month.year, _month.month + m));
    _loadMonth();
  }

  void _select(DateTime d) {
    setState(() => _selected = d);
    _dayJobs.loadDate(_iso(d));
  }

  @override
  Widget build(BuildContext context) {
    final first = DateTime(_month.year, _month.month);
    final daysInMonth = DateTime(_month.year, _month.month + 1, 0).day;
    final lead = first.weekday - 1; // Thứ 2 đầu tuần
    final today = DateTime.now();
    return Scaffold(
      appBar: MobileHeader(title: 'Lịch chuyến', onBack: () => context.pop()),
      body: BlocProvider.value(
        value: _dayJobs,
        child: ListView(
          padding: const EdgeInsets.all(BtaSpace.s4),
          children: [
            Row(children: [
              IconButton(tooltip: 'Tháng trước', onPressed: () => _shift(-1), icon: const Icon(Icons.chevron_left)),
              Expanded(child: Center(child: Text('Tháng ${_month.month}/${_month.year}', style: BtaText.headingSm))),
              IconButton(tooltip: 'Tháng sau', onPressed: () => _shift(1), icon: const Icon(Icons.chevron_right)),
            ]),
            if (_error != null) ErrorState(message: _error!, onRetry: _loadMonth),
            Row(children: [for (final w in const ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']) Expanded(child: Center(child: Text(w, style: BtaText.caption.copyWith(color: BtaColors.textMuted))))]),
            const SizedBox(height: BtaSpace.s1),
            GridView.count(
              crossAxisCount: 7,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              childAspectRatio: 1,
              children: [
                for (var i = 0; i < lead; i++) const SizedBox.shrink(),
                for (var d = 1; d <= daysInMonth; d++) _dayCell(DateTime(_month.year, _month.month, d), today),
              ],
            ),
            if (_loading) const LinearProgressIndicator(),
            const SizedBox(height: BtaSpace.s4),
            Text('Chuyến ngày ${BtaFormat.date(_selected)}', style: BtaText.headingSm),
            const SizedBox(height: BtaSpace.s2),
            BlocBuilder<JobsCubit, JobsState>(builder: (context, s) {
              if (s.loading) return const SkeletonCard();
              if (s.error != null) return ErrorState(message: s.error!, onRetry: () => _dayJobs.load());
              if (s.items.isEmpty) return const EmptyState(icon: Icons.event_busy_outlined, message: 'Không có chuyến trong ngày này.');
              return Column(children: [
                for (final t in s.items) ...[
                  TripCard(trip: t.toCard(), onTap: () => context.push(DriverRoutes.tripDetailPath(t.id))),
                  const SizedBox(height: BtaSpace.s2),
                ],
              ]);
            }),
          ],
        ),
      ),
    );
  }

  Widget _dayCell(DateTime d, DateTime today) {
    final info = _days[_iso(d)];
    final selected = _iso(d) == _iso(_selected);
    final isToday = _iso(d) == _iso(today);
    final running = info?.statuses.any((s) => tripRunningStatuses.contains(s)) ?? false;
    return InkWell(
      onTap: () => _select(d),
      borderRadius: BorderRadius.circular(BtaRadius.md),
      child: Container(
        margin: const EdgeInsets.all(2),
        decoration: BoxDecoration(
          color: selected ? BtaColors.primary : null,
          borderRadius: BorderRadius.circular(BtaRadius.md),
          border: isToday && !selected ? Border.all(color: BtaColors.primary) : null,
        ),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Text('${d.day}', style: BtaText.body.copyWith(color: selected ? Colors.white : BtaColors.text, fontWeight: isToday ? FontWeight.w600 : null)),
          if (info != null && info.tripCount > 0)
            Container(
              margin: const EdgeInsets.only(top: 2),
              width: 6,
              height: 6,
              decoration: BoxDecoration(shape: BoxShape.circle, color: selected ? Colors.white : (running ? BtaColors.accent : BtaColors.primary)),
            ),
        ]),
      ),
    );
  }
}
