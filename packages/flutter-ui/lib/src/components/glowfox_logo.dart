import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

/// GlowFox logomark — rendered from the official SVG asset.
class GFLogoMark extends StatelessWidget {
  const GFLogoMark({super.key, this.size = 28});

  final double size;

  @override
  Widget build(BuildContext context) {
    return SvgPicture.asset(
      'packages/flutter_ui/assets/icons/glowfox-logo.svg',
      width: size,
      height: size,
      fit: BoxFit.contain,
    );
  }
}

/// Horizontal lockup: logomark + wordmark.
class GFLogo extends StatelessWidget {
  const GFLogo({
    super.key,
    this.size = 28,
    this.textColor = const Color(0xFFFFFFFF),
    this.showText = true,
  });

  final double size;
  final Color textColor;
  final bool showText;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        if (showText) ...[
          SvgPicture.asset(
            'packages/flutter_ui/assets/icons/glowfox-wordmark.svg',
            height: size * 0.64,
            fit: BoxFit.contain,
            colorFilter: ColorFilter.mode(textColor, BlendMode.srcIn),
          ),
        ],
      ],
    );
  }
}
