import 'package:flutter/material.dart';
import 'package:flutter_ui/flutter_ui.dart';

/// Side-by-side before/after photo picker for treatment photos.
///
/// Shell only — wire [onPickBefore] and [onPickAfter] to
/// the actual image picker in the app layer.
class BeforeAfterPhotoPicker extends StatelessWidget {
  const BeforeAfterPhotoPicker({
    super.key,
    this.beforeImageUrl,
    this.afterImageUrl,
    this.onPickBefore,
    this.onPickAfter,
    this.isLoading = false,
  });

  final String? beforeImageUrl;
  final String? afterImageUrl;
  final VoidCallback? onPickBefore;
  final VoidCallback? onPickAfter;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _PhotoSlot(
            label: 'Trước',
            imageUrl: beforeImageUrl,
            onPick: onPickBefore,
            isLoading: isLoading,
          ),
        ),
        const SizedBox(width: GFSpacing.sm),
        Expanded(
          child: _PhotoSlot(
            label: 'Sau',
            imageUrl: afterImageUrl,
            onPick: onPickAfter,
            isLoading: isLoading,
          ),
        ),
      ],
    );
  }
}

class _PhotoSlot extends StatelessWidget {
  const _PhotoSlot({
    required this.label,
    this.imageUrl,
    this.onPick,
    required this.isLoading,
  });

  final String label;
  final String? imageUrl;
  final VoidCallback? onPick;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onPick,
      child: Container(
        height: 160,
        decoration: BoxDecoration(
          color: GFColors.surfaceVariant,
          borderRadius: GFRadius.lg,
          border: Border.all(color: GFColors.border),
        ),
        child: imageUrl != null
            ? ClipRRect(
                borderRadius: GFRadius.lg,
                child: Image.network(imageUrl!, fit: BoxFit.cover, width: double.infinity),
              )
            : Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.add_photo_alternate_outlined, color: GFColors.textTertiary, size: 32),
                  const SizedBox(height: GFSpacing.xs),
                  Text(label, style: GFTypography.label.copyWith(color: GFColors.textSecondary)),
                ],
              ),
      ),
    );
  }
}
