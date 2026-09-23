import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Inter qua google_fonts. Khi không có mạng, google_fonts tự fallback về font hệ thống
/// (đặt `GoogleFonts.config.allowRuntimeFetching = false` nếu muốn cấm tải lúc chạy).
class BtaFonts {
  BtaFonts._();

  static TextTheme textTheme([TextTheme? base]) {
    try {
      return GoogleFonts.interTextTheme(base);
    } catch (_) {
      return base ?? const TextTheme();
    }
  }
}
