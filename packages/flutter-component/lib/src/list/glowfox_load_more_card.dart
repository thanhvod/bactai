import 'package:flutter/material.dart';
import 'package:flutter_ui/flutter_ui.dart';

/// Bordered "load more" button shown at the bottom of a paginated list.
///
/// Displays a chevron + label with the current/total page count, e.g.
/// "Tải thêm (2/3)". Shows a spinner while [isLoading], and swaps the label
/// for [retryLabel] when [error] is set so the same tap retries the fetch.
///
/// ```dart
/// GFLoadMoreCard(
///   currentPage: state.filter.page,
///   totalPages: state.totalPages,
///   isLoading: state.isLoadingMore,
///   error: state.loadMoreError,
///   label: l10n.common_load_more,   // "Tải thêm"
///   retryLabel: l10n.common_retry,  // "Thử lại"
///   onTap: controller.loadMore,
/// )
/// ```
class GFLoadMoreCard extends StatelessWidget {
  const GFLoadMoreCard({
    super.key,
    required this.currentPage,
    required this.totalPages,
    required this.isLoading,
    required this.onTap,
    required this.label,
    required this.retryLabel,
    this.error,
  });

  final int currentPage;
  final int totalPages;
  final bool isLoading;
  final VoidCallback onTap;

  /// Base label, e.g. "Tải thêm". Page count is appended automatically.
  final String label;

  /// Label shown in place of [label] while [error] is set.
  final String retryLabel;

  final String? error;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: isLoading ? null : onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
        decoration: BoxDecoration(
          color: GFColors.surface,
          border: Border.all(color: const Color(0xFFE8E8E8)),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (isLoading)
              const SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(
                    strokeWidth: 2, color: GFColors.textSecondary),
              )
            else
              const Icon(Icons.expand_more_rounded,
                  size: 18, color: GFColors.textSecondary),
            const SizedBox(width: 8),
            Text(
              error != null ? retryLabel : '$label ($currentPage/$totalPages)',
              style: GFTypography.bodySm.copyWith(
                color: GFColors.textPrimary,
                fontWeight: FontWeight.w500,
                fontSize: 13,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
