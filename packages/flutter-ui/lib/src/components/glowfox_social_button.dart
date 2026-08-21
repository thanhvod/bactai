import 'package:flutter/material.dart';

enum GFSocialPlatform { apple, google, facebook }

/// Full-width social auth button with brand icon + label.
///
/// Labels should come from the caller (i18n).
class GFSocialButton extends StatelessWidget {
  const GFSocialButton({
    super.key,
    required this.platform,
    required this.label,
    this.onPressed,
    this.isLoading = false,
  });

  final GFSocialPlatform platform;
  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 52,
      child: OutlinedButton(
        onPressed: isLoading ? null : onPressed,
        style: OutlinedButton.styleFrom(
          side: const BorderSide(color: Color(0xFFE5E5E5)),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          backgroundColor: Colors.white,
          foregroundColor: const Color(0xFF111111),
          padding: const EdgeInsets.symmetric(horizontal: 16),
        ),
        child: isLoading
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _BrandIcon(platform: platform),
                  const SizedBox(width: 10),
                  Text(
                    label,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                      color: Color(0xFF111111),
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}

class _BrandIcon extends StatelessWidget {
  const _BrandIcon({required this.platform});

  final GFSocialPlatform platform;

  @override
  Widget build(BuildContext context) {
    return switch (platform) {
      GFSocialPlatform.apple => const _AppleMark(),
      GFSocialPlatform.google => const _GoogleMark(),
      GFSocialPlatform.facebook => const _FacebookMark(),
    };
  }
}

/// Apple logo — uses the Apple private-use Unicode glyph (renders via SF Fonts on iOS/macOS).
class _AppleMark extends StatelessWidget {
  const _AppleMark();

  @override
  Widget build(BuildContext context) {
    return const Text(
      '', // Apple glyph — renders on Apple platforms; falls back to empty on others
      style: TextStyle(fontSize: 20, color: Color(0xFF111111), height: 1),
    );
  }
}

/// Google "G" — drawn with its four brand quadrant colours.
class _GoogleMark extends StatelessWidget {
  const _GoogleMark();

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: const Size(20, 20),
      painter: _GoogleGPainter(),
    );
  }
}

class _GoogleGPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final r = size.width / 2;
    final cx = r;
    final cy = r;

    // Quadrant arcs: red, yellow, green, blue
    const colors = [
      Color(0xFFEA4335), // red (top-right)
      Color(0xFFFBBC05), // yellow (bottom-left)
      Color(0xFF34A853), // green (bottom-right)
      Color(0xFF4285F4), // blue (top-left)
    ];
    const startAngles = [-0.15, 2.1, 3.7, 5.2]; // approximate quadrant starts (rad)
    const sweepAngles = [2.25, 1.6, 1.55, 1.5];

    for (var i = 0; i < 4; i++) {
      final paint = Paint()
        ..color = colors[i]
        ..style = PaintingStyle.stroke
        ..strokeWidth = size.width * 0.18;
      canvas.drawArc(
        Rect.fromCircle(center: Offset(cx, cy), radius: r * 0.72),
        startAngles[i],
        sweepAngles[i],
        false,
        paint,
      );
    }

    // Horizontal "G" bar (right side)
    final barPaint = Paint()
      ..color = const Color(0xFF4285F4)
      ..style = PaintingStyle.stroke
      ..strokeWidth = size.width * 0.18
      ..strokeCap = StrokeCap.round;
    canvas.drawLine(
      Offset(cx, cy),
      Offset(cx + r * 0.72, cy),
      barPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Facebook "f" mark.
class _FacebookMark extends StatelessWidget {
  const _FacebookMark();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 20,
      height: 20,
      decoration: const BoxDecoration(
        color: Color(0xFF1877F2),
        shape: BoxShape.circle,
      ),
      alignment: Alignment.center,
      child: const Text(
        'f',
        style: TextStyle(
          color: Colors.white,
          fontSize: 13,
          fontWeight: FontWeight.w800,
          height: 1,
        ),
      ),
    );
  }
}
