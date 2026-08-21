import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_ui/flutter_ui.dart';
import 'glowfox_empty_state.dart';
import 'glowfox_error_state.dart';
import 'glowfox_skeleton_list.dart';

/// Handles loading / error / empty / data states for a Riverpod AsyncValue.
///
/// Usage:
/// ```dart
/// GFAsyncView(
///   state: ref.watch(customerListProvider),
///   onRetry: () => ref.invalidate(customerListProvider),
///   isEmpty: (data) => data.isEmpty,
///   emptyTitle: 'Chưa có khách hàng',
///   builder: (data) => CustomerListView(customers: data),
/// )
/// ```
class GFAsyncView<T> extends StatelessWidget {
  const GFAsyncView({
    super.key,
    required this.state,
    required this.builder,
    this.onRetry,
    this.loadingWidget,
    this.isEmpty,
    this.emptyTitle,
    this.emptyDescription,
    this.emptyIcon,
    this.emptyAction,
    this.emptyWidget,
    this.errorMessage,
  });

  final AsyncValue<T> state;
  final Widget Function(T data) builder;
  final VoidCallback? onRetry;
  final Widget? loadingWidget;

  final bool Function(T data)? isEmpty;
  final String? emptyTitle;
  final String? emptyDescription;
  final Widget? emptyIcon;
  final Widget? emptyAction;

  /// If provided, replaces the default [GFEmptyState] widget entirely.
  final Widget? emptyWidget;

  final String? errorMessage;

  @override
  Widget build(BuildContext context) {
    return state.when(
      loading: () => loadingWidget ?? const GFSkeletonList(),
      error: (error, _) => GFErrorState(
        message: errorMessage,
        onRetry: onRetry,
      ),
      data: (data) {
        if (isEmpty != null && isEmpty!(data)) {
          if (emptyWidget != null) return emptyWidget!;
          return GFEmptyState(
            title: emptyTitle ?? 'Không có dữ liệu',
            description: emptyDescription,
            icon: emptyIcon,
            action: emptyAction,
          );
        }
        return builder(data);
      },
    );
  }
}
