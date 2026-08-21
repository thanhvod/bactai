import 'package:flutter/material.dart';
import 'package:flutter_ui/flutter_ui.dart';

/// View mode of [GFCalendarPanel] — week strip or full month grid.
enum GFCalendarViewMode { week, month }

/// Shared booking-style calendar panel: nav header (prev/next + range label +
/// month/week toggle) and an animated week strip / month grid below.
///
/// Used by the appointments screen and the staff work-schedule screen so both
/// stay pixel-identical. Days carrying data show a small dot via [hasMarker].
class GFCalendarPanel extends StatelessWidget {
  const GFCalendarPanel({
    super.key,
    required this.viewMode,
    required this.selectedDate,
    required this.weekStart,
    required this.onPrev,
    required this.onNext,
    required this.onSwitchMode,
    required this.onSelectDate,
    this.hasMarker,
    this.isLoading = false,
    this.monthLabel = 'Tháng',
    this.weekLabel = 'Tuần',
    this.dayLabels = const ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
  });

  final GFCalendarViewMode viewMode;
  final DateTime selectedDate;

  /// Monday of the visible week (week mode).
  final DateTime weekStart;

  final VoidCallback onPrev;
  final VoidCallback onNext;
  final ValueChanged<GFCalendarViewMode> onSwitchMode;
  final ValueChanged<DateTime> onSelectDate;

  /// Returns true when [day] has at least one item — renders the dot marker.
  final bool Function(DateTime day)? hasMarker;

  /// Shows a compact spinner instead of the strip/grid while reloading.
  final bool isLoading;

  final String monthLabel;
  final String weekLabel;

  /// Weekday captions, Monday first.
  final List<String> dayLabels;

  @override
  Widget build(BuildContext context) {
    final calendarKey = viewMode == GFCalendarViewMode.week
        ? ValueKey('w-${weekStart.toIso8601String()}')
        : ValueKey('m-${selectedDate.year}-${selectedDate.month}');

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        _CalendarNavHeader(
          viewMode: viewMode,
          selectedDate: selectedDate,
          weekStart: weekStart,
          onPrev: onPrev,
          onNext: onNext,
          onSwitchMode: onSwitchMode,
          monthLabel: monthLabel,
          weekLabel: weekLabel,
        ),
        AnimatedSwitcher(
          duration: const Duration(milliseconds: 200),
          switchInCurve: Curves.easeOut,
          switchOutCurve: Curves.easeIn,
          transitionBuilder: (child, animation) =>
              FadeTransition(opacity: animation, child: child),
          child: isLoading
              ? _CalendarPlaceholder(
                  key: const ValueKey('loading'),
                  viewMode: viewMode,
                )
              : viewMode == GFCalendarViewMode.week
                  ? GFWeekStrip(
                      key: calendarKey,
                      weekStart: weekStart,
                      selectedDate: selectedDate,
                      hasMarker: hasMarker,
                      onSelectDate: onSelectDate,
                      dayLabels: dayLabels,
                    )
                  : GFMonthGrid(
                      key: calendarKey,
                      month: selectedDate,
                      selectedDate: selectedDate,
                      hasMarker: hasMarker,
                      onSelectDate: onSelectDate,
                      dayLabels: dayLabels,
                    ),
        ),
        const SizedBox(height: 8),
      ],
    );
  }
}

// ─── Nav header ───────────────────────────────────────────────────────────────

class _CalendarNavHeader extends StatelessWidget {
  const _CalendarNavHeader({
    required this.viewMode,
    required this.selectedDate,
    required this.weekStart,
    required this.onPrev,
    required this.onNext,
    required this.onSwitchMode,
    required this.monthLabel,
    required this.weekLabel,
  });

  final GFCalendarViewMode viewMode;
  final DateTime selectedDate;
  final DateTime weekStart;
  final VoidCallback onPrev;
  final VoidCallback onNext;
  final ValueChanged<GFCalendarViewMode> onSwitchMode;
  final String monthLabel;
  final String weekLabel;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
          GFSpacing.base, GFSpacing.sm, GFSpacing.base, GFSpacing.sm),
      child: Row(
        children: [
          _NavButton(icon: Icons.chevron_left, onTap: onPrev),
          const SizedBox(width: 4),
          _NavButton(icon: Icons.chevron_right, onTap: onNext),
          const SizedBox(width: GFSpacing.md),
          Expanded(
            child: Text(_rangeLabel(), style: GFTypography.label),
          ),
          const SizedBox(width: GFSpacing.sm),
          GFSegmentedToggle<GFCalendarViewMode>(
            options: [
              GFToggleOption(
                  value: GFCalendarViewMode.month, label: monthLabel),
              GFToggleOption(value: GFCalendarViewMode.week, label: weekLabel),
            ],
            selected: viewMode,
            onChanged: onSwitchMode,
          ),
        ],
      ),
    );
  }

  String _rangeLabel() {
    String dd(int d) => d.toString().padLeft(2, '0');
    String mm(int m) => m.toString().padLeft(2, '0');

    if (viewMode == GFCalendarViewMode.week) {
      final start = weekStart;
      final end = start.add(const Duration(days: 6));
      final yy = (end.year % 100).toString().padLeft(2, '0');
      return '${dd(start.day)}/${mm(start.month)} - ${dd(end.day)}/${mm(end.month)}/$yy';
    }
    return '${mm(selectedDate.month)}/${selectedDate.year}';
  }
}

class _NavButton extends StatelessWidget {
  const _NavButton({required this.icon, required this.onTap});
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: const BorderRadius.all(Radius.circular(8)),
      child: Container(
        width: 32,
        height: 32,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          border: Border.all(color: GFColors.border),
          borderRadius: const BorderRadius.all(Radius.circular(8)),
          color: GFColors.surface,
        ),
        child: Icon(icon, size: 18, color: GFColors.textPrimary),
      ),
    );
  }
}

class _CalendarPlaceholder extends StatelessWidget {
  const _CalendarPlaceholder({super.key, required this.viewMode});
  final GFCalendarViewMode viewMode;

  @override
  Widget build(BuildContext context) {
    final height = viewMode == GFCalendarViewMode.week ? 72.0 : 290.0;
    return SizedBox(
      height: height,
      child: const Center(
        child: SizedBox(
          width: 20,
          height: 20,
          child: CircularProgressIndicator(
            strokeWidth: 2,
            color: GFColors.textTertiary,
          ),
        ),
      ),
    );
  }
}

// ─── Week strip ───────────────────────────────────────────────────────────────

class GFWeekStrip extends StatelessWidget {
  const GFWeekStrip({
    super.key,
    required this.weekStart,
    required this.selectedDate,
    required this.onSelectDate,
    this.hasMarker,
    this.dayLabels = const ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
  });

  final DateTime weekStart;
  final DateTime selectedDate;
  final ValueChanged<DateTime> onSelectDate;
  final bool Function(DateTime day)? hasMarker;
  final List<String> dayLabels;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(
          horizontal: GFSpacing.base, vertical: GFSpacing.sm),
      child: Row(
        children: List.generate(7, (i) {
          final day = weekStart.add(Duration(days: i));
          final isSelected = _isSameDay(day, selectedDate);
          final hasDot = hasMarker?.call(day) ?? false;
          return Expanded(
            child: _DayCell(
              label: dayLabels[i],
              day: day.day,
              isSelected: isSelected,
              hasDot: hasDot,
              onTap: () => onSelectDate(day),
            ),
          );
        }),
      ),
    );
  }

  bool _isSameDay(DateTime a, DateTime b) =>
      a.year == b.year && a.month == b.month && a.day == b.day;
}

class _DayCell extends StatelessWidget {
  const _DayCell({
    required this.label,
    required this.day,
    required this.isSelected,
    required this.hasDot,
    required this.onTap,
  });

  final String label;
  final int day;
  final bool isSelected;
  final bool hasDot;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Text(
            label,
            style: GFTypography.caption.copyWith(
              color: isSelected ? GFColors.textPrimary : GFColors.textTertiary,
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
            ),
          ),
          const SizedBox(height: 4),
          AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: isSelected ? GFColors.charcoal : Colors.transparent,
              borderRadius: const BorderRadius.all(Radius.circular(17)),
            ),
            alignment: Alignment.center,
            child: Text(
              '$day',
              style: GFTypography.label.copyWith(
                color: isSelected ? GFColors.white : GFColors.textPrimary,
                fontSize: 14,
              ),
            ),
          ),
          const SizedBox(height: 4),
          if (hasDot)
            Container(
              width: 4,
              height: 4,
              decoration: BoxDecoration(
                color: isSelected ? GFColors.textTertiary : GFColors.primary,
                shape: BoxShape.circle,
              ),
            )
          else
            const SizedBox(height: 4),
        ],
      ),
    );
  }
}

// ─── Month grid ───────────────────────────────────────────────────────────────

class GFMonthGrid extends StatelessWidget {
  const GFMonthGrid({
    super.key,
    required this.month,
    required this.selectedDate,
    required this.onSelectDate,
    this.hasMarker,
    this.dayLabels = const ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
  });

  final DateTime month;
  final DateTime selectedDate;
  final ValueChanged<DateTime> onSelectDate;
  final bool Function(DateTime day)? hasMarker;
  final List<String> dayLabels;

  @override
  Widget build(BuildContext context) {
    final firstDay = DateTime(month.year, month.month, 1);
    final offset = (firstDay.weekday - 1) % 7;
    final daysInMonth = DateTime(month.year, month.month + 1, 0).day;
    final rows = ((offset + daysInMonth) / 7).ceil();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: GFSpacing.base),
      child: Column(
        children: [
          // Day labels — fixed height, no extra padding
          SizedBox(
            height: 24,
            child: Row(
              children: dayLabels
                  .map((l) => Expanded(
                        child: Center(
                          child: Text(
                            l,
                            style: GFTypography.caption
                                .copyWith(color: GFColors.textTertiary),
                          ),
                        ),
                      ))
                  .toList(),
            ),
          ),
          // Explicit rows — exact height control, no GridView aspect-ratio quirks
          ...List.generate(rows, (r) {
            return Row(
              children: List.generate(7, (c) {
                final i = r * 7 + c;
                final dayIndex = i - offset + 1;
                final day = DateTime(month.year, month.month, dayIndex);
                final isSelected = _isSameDay(day, selectedDate);
                final isCurrentMonth = day.month == month.month;
                final hasDot = hasMarker?.call(day) ?? false;

                return Expanded(
                  child: GestureDetector(
                    onTap: () => onSelectDate(day),
                    child: SizedBox(
                      height: 42,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          AnimatedContainer(
                            duration: const Duration(milliseconds: 150),
                            width: 30,
                            height: 30,
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? GFColors.charcoal
                                  : Colors.transparent,
                              borderRadius:
                                  const BorderRadius.all(Radius.circular(15)),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              '${day.day}',
                              style: GFTypography.bodySm.copyWith(
                                color: isSelected
                                    ? GFColors.white
                                    : isCurrentMonth
                                        ? GFColors.textPrimary
                                        : GFColors.textTertiary,
                                fontWeight: isSelected
                                    ? FontWeight.w600
                                    : FontWeight.w400,
                              ),
                            ),
                          ),
                          const SizedBox(height: 2),
                          // Always reserve dot slot so all cells have identical height
                          Container(
                            width: 4,
                            height: 4,
                            decoration: BoxDecoration(
                              color: hasDot
                                  ? (isSelected
                                      ? GFColors.white
                                      : GFColors.primary)
                                  : Colors.transparent,
                              shape: BoxShape.circle,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }),
            );
          }),
          const SizedBox(height: 6),
        ],
      ),
    );
  }

  bool _isSameDay(DateTime a, DateTime b) =>
      a.year == b.year && a.month == b.month && a.day == b.day;
}
