import 'package:flutter/material.dart';
import '../theme/glowfox_colors.dart';
import '../theme/glowfox_spacing.dart';
import '../theme/glowfox_radius.dart';
import '../theme/glowfox_typography.dart';

enum GFButtonVariant { primary, secondary, destructive, ghost, outline, link, dark }

enum GFButtonSize { sm, md, lg }

// IMPORT GUARD: Apps must use GFButton. If shadcn_flutter is ever added,
// the import stays in this file only — never in apps or flutter_component.
class GFButton extends StatelessWidget {
  const GFButton({
    super.key,
    required this.child,
    this.onPressed,
    this.variant = GFButtonVariant.primary,
    this.size = GFButtonSize.md,
    this.isLoading = false,
    this.enabled = true,
    this.fullWidth = false,
    this.icon,
    this.height,
  });

  final Widget child;
  final VoidCallback? onPressed;
  final GFButtonVariant variant;
  final GFButtonSize size;
  final bool isLoading;
  final bool enabled;
  final bool fullWidth;
  final Widget? icon;

  /// Ép chiều cao nút. Bỏ trống thì dùng chiều cao mặc định của Material
  /// (tối thiểu 36px + vùng chạm 48px) — chỉ set khi nút phải nằm gọn trong
  /// một dòng nội dung.
  final double? height;

  bool get _isEnabled => enabled && !isLoading && onPressed != null;

  @override
  Widget build(BuildContext context) {
    final content = isLoading
        ? SizedBox(
            width: 16,
            height: 16,
            child: CircularProgressIndicator(strokeWidth: 2, color: _foreground()),
          )
        : icon != null
            ? Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  icon!,
                  const SizedBox(width: GFSpacing.xs),
                  child,
                ],
              )
            : child;

    Widget widget = _buildVariant(context, content);
    if (height != null) {
      // shrinkWrap để Material không cộng thêm đệm vùng chạm quanh nút.
      widget = SizedBox(
        height: height,
        child: Theme(
          data: Theme.of(context).copyWith(
            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
          child: widget,
        ),
      );
    }
    return fullWidth ? SizedBox(width: double.infinity, child: widget) : widget;
  }

  Widget _buildVariant(BuildContext context, Widget content) {
    final padding = _padding();
    final textStyle = _textStyle();

    return switch (variant) {
      GFButtonVariant.primary => ElevatedButton(
          onPressed: _isEnabled ? onPressed : null,
          style: ElevatedButton.styleFrom(
            backgroundColor: GFColors.primary,
            foregroundColor: GFColors.textOnPrimary,
            // Disabled = chính màu primary làm mờ đi, KHÔNG đổi sang nền xám
            // nhạt: chữ/spinner đều màu trắng nên nền phải đủ đậm để đọc được.
            disabledBackgroundColor: isLoading
                ? GFColors.primary
                : GFColors.primary.withValues(alpha: 0.6),
            disabledForegroundColor: GFColors.textOnPrimary,
            elevation: 0,
            padding: padding,
            shape: RoundedRectangleBorder(borderRadius: GFRadius.md),
            textStyle: textStyle,
          ),
          child: content,
        ),
      GFButtonVariant.secondary => ElevatedButton(
          onPressed: _isEnabled ? onPressed : null,
          style: ElevatedButton.styleFrom(
            backgroundColor: GFColors.surfaceVariant,
            foregroundColor: GFColors.textPrimary,
            disabledBackgroundColor: isLoading ? GFColors.surfaceVariant : null,
            disabledForegroundColor: isLoading ? GFColors.textPrimary : null,
            elevation: 0,
            padding: padding,
            shape: RoundedRectangleBorder(borderRadius: GFRadius.md),
            textStyle: textStyle,
          ),
          child: content,
        ),
      GFButtonVariant.destructive => ElevatedButton(
          onPressed: _isEnabled ? onPressed : null,
          style: ElevatedButton.styleFrom(
            backgroundColor: GFColors.error,
            foregroundColor: GFColors.white,
            disabledBackgroundColor: isLoading ? GFColors.error : null,
            disabledForegroundColor: isLoading ? GFColors.white : null,
            elevation: 0,
            padding: padding,
            shape: RoundedRectangleBorder(borderRadius: GFRadius.md),
            textStyle: textStyle,
          ),
          child: content,
        ),
      GFButtonVariant.outline => OutlinedButton(
          onPressed: _isEnabled ? onPressed : null,
          style: OutlinedButton.styleFrom(
            side: const BorderSide(color: GFColors.border),
            disabledForegroundColor: isLoading ? GFColors.textPrimary : null,
            padding: padding,
            shape: RoundedRectangleBorder(borderRadius: GFRadius.md),
            textStyle: textStyle,
          ),
          child: content,
        ),
      GFButtonVariant.ghost => TextButton(
          onPressed: _isEnabled ? onPressed : null,
          style: TextButton.styleFrom(
            disabledForegroundColor: isLoading ? GFColors.textPrimary : null,
            padding: padding,
            shape: RoundedRectangleBorder(borderRadius: GFRadius.md),
            textStyle: textStyle,
          ),
          child: content,
        ),
      GFButtonVariant.link => TextButton(
          onPressed: _isEnabled ? onPressed : null,
          style: TextButton.styleFrom(
            foregroundColor: GFColors.primary,
            padding: EdgeInsets.zero,
            textStyle: textStyle.copyWith(
              decoration: TextDecoration.underline,
            ),
          ),
          child: content,
        ),
      GFButtonVariant.dark => ElevatedButton(
          onPressed: _isEnabled ? onPressed : null,
          style: ElevatedButton.styleFrom(
            backgroundColor: GFColors.charcoal,
            foregroundColor: GFColors.white,
            disabledBackgroundColor:
                isLoading ? GFColors.charcoal : const Color(0xFF444444),
            disabledForegroundColor: GFColors.white,
            elevation: 0,
            padding: padding,
            shape: RoundedRectangleBorder(borderRadius: GFRadius.lg),
            textStyle: textStyle,
          ),
          child: content,
        ),
    };
  }

  /// Màu chữ/icon của từng variant — dùng cho spinner lúc loading để nó luôn
  /// tương phản với nền, thay vì cố định màu trắng.
  Color _foreground() => switch (variant) {
        GFButtonVariant.primary => GFColors.textOnPrimary,
        GFButtonVariant.secondary => GFColors.textPrimary,
        GFButtonVariant.destructive => GFColors.white,
        GFButtonVariant.outline => GFColors.textPrimary,
        GFButtonVariant.ghost => GFColors.textPrimary,
        GFButtonVariant.link => GFColors.primary,
        GFButtonVariant.dark => GFColors.white,
      };

  EdgeInsetsGeometry _padding() {
    // Khi đã ép [height], đệm dọc mặc định sẽ đẩy nội dung tràn ra ngoài —
    // để chính chiều cao quyết định, chỉ giữ đệm ngang.
    final horizontal = switch (size) {
      GFButtonSize.sm => 12.0,
      GFButtonSize.md => 16.0,
      GFButtonSize.lg => 20.0,
    };
    if (height != null) {
      return EdgeInsets.symmetric(horizontal: horizontal);
    }
    final vertical = switch (size) {
      GFButtonSize.sm => 7.0,
      GFButtonSize.md => 10.0,
      GFButtonSize.lg => 13.0,
    };
    return EdgeInsets.symmetric(horizontal: horizontal, vertical: vertical);
  }

  TextStyle _textStyle() => switch (size) {
        GFButtonSize.sm => GFTypography.labelSm,
        GFButtonSize.md => GFTypography.label,
        GFButtonSize.lg => GFTypography.labelLg,
      };
}
