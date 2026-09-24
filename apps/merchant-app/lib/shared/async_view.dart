import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';

import '../core/api/merchant_graphql_client.dart';

/// Tải dữ liệu 1 lần + kéo để làm mới; đủ trạng thái loading / error / empty (design/IMPLEMENTATION-GUIDE §6).
class AsyncView<T> extends StatefulWidget {
  const AsyncView({super.key, required this.load, required this.builder, this.isEmpty, this.emptyMessage = 'Chưa có dữ liệu', this.emptyIcon = Icons.inbox_outlined, this.skeletonCount = 4, this.refreshOn});

  final Future<T> Function() load;
  final Widget Function(BuildContext context, T data, Future<void> Function() reload) builder;
  final bool Function(T data)? isEmpty;
  final String emptyMessage;
  final IconData emptyIcon;
  final int skeletonCount;

  /// Tải lại khi listenable báo (vd. push tới lúc app mở).
  final Listenable? refreshOn;

  @override
  State<AsyncView<T>> createState() => AsyncViewState<T>();
}

class AsyncViewState<T> extends State<AsyncView<T>> {
  T? _data;
  Object? _error;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    widget.refreshOn?.addListener(_onRefresh);
    reload();
  }

  void _onRefresh() {
    if (mounted) reload();
  }

  @override
  void didUpdateWidget(covariant AsyncView<T> oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.refreshOn != widget.refreshOn) {
      oldWidget.refreshOn?.removeListener(_onRefresh);
      widget.refreshOn?.addListener(_onRefresh);
    }
  }

  @override
  void dispose() {
    widget.refreshOn?.removeListener(_onRefresh);
    super.dispose();
  }

  Future<void> reload() async {
    setState(() {
      _loading = _data == null;
      _error = null;
    });
    try {
      final d = await widget.load();
      if (!mounted) return;
      setState(() {
        _data = d;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return SkeletonList(count: widget.skeletonCount);
    if (_error != null && _data == null) return ErrorState(message: errorMessage(_error!), onRetry: reload);
    final data = _data as T;
    if (widget.isEmpty?.call(data) ?? false) {
      return RefreshIndicator(
        onRefresh: reload,
        child: ListView(children: [const SizedBox(height: 80), EmptyState(icon: widget.emptyIcon, message: widget.emptyMessage)]),
      );
    }
    return RefreshIndicator(onRefresh: reload, child: widget.builder(context, data, reload));
  }
}

class SkeletonList extends StatelessWidget {
  const SkeletonList({super.key, this.count = 4});
  final int count;
  @override
  Widget build(BuildContext context) => ListView.separated(
        padding: const EdgeInsets.all(BtaSpace.s4),
        itemCount: count,
        separatorBuilder: (_, _) => const SizedBox(height: BtaSpace.s3),
        itemBuilder: (_, _) => const SkeletonBox(height: 72, radius: BtaRadius.lg),
      );
}
