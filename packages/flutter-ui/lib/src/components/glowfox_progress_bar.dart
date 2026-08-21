import 'package:flutter/widgets.dart';

import '../theme/glowfox_colors.dart';

/// Thanh tiến độ đơn sắc: phần đã đạt màu đen, phần còn lại xám nhạt.
///
/// Tự vẽ thay vì dùng [LinearProgressIndicator] vì Material 3 còn thêm khe hở
/// và chấm chỉ báo ở cuối track, lấy màu theo colorScheme — không kiểm soát
/// được và lệch với style đen–trắng của GlowFox.
class GFProgressBar extends StatelessWidget {
  const GFProgressBar({
    super.key,
    required this.value,
    this.height = 6,
    this.color = GFColors.charcoal,
    this.backgroundColor = GFColors.surfaceVariant,
  });

  /// Tỉ lệ hoàn thành 0.0–1.0; giá trị ngoài khoảng sẽ được kẹp lại.
  final double value;
  final double height;
  final Color color;
  final Color backgroundColor;

  @override
  Widget build(BuildContext context) {
    final ratio = value.isNaN ? 0.0 : value.clamp(0.0, 1.0);

    return SizedBox(
      height: height,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(height / 2),
        child: Stack(
          fit: StackFit.expand,
          children: [
            ColoredBox(color: backgroundColor),
            FractionallySizedBox(
              alignment: Alignment.centerLeft,
              widthFactor: ratio,
              child: ColoredBox(color: color),
            ),
          ],
        ),
      ),
    );
  }
}
