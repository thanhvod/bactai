import 'package:flutter/material.dart';
import 'glowfox_colors.dart';
import 'glowfox_radius.dart';
import 'glowfox_typography.dart';

/// Builds the Flutter [ThemeData] for the GlowFox light theme.
///
/// shadcn_flutter: The ShadcnThemeData wrapping should be applied alongside
/// this ThemeData when the shadcn_flutter layer is fully integrated.
abstract final class GFThemeData {
  static ThemeData light() {
    final base = ThemeData(
      useMaterial3: true,
      colorScheme: const ColorScheme.light(
        primary: GFColors.primary,
        onPrimary: GFColors.textOnPrimary,
        primaryContainer: GFColors.primaryLight,
        surface: GFColors.surface,
        onSurface: GFColors.textPrimary,
        surfaceContainerHighest: GFColors.surfaceVariant,
        error: GFColors.error,
        onError: GFColors.white,
        outline: GFColors.border,
      ),
      scaffoldBackgroundColor: GFColors.background,
      fontFamily: 'Inter',
    );

    return base.copyWith(
      appBarTheme: AppBarTheme(
        backgroundColor: GFColors.surface,
        foregroundColor: GFColors.textPrimary,
        elevation: 0,
        scrolledUnderElevation: 0.5,
        titleTextStyle: GFTypography.h3,
      ),
      cardTheme: CardThemeData(
        color: GFColors.surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: GFRadius.lg,
          side: const BorderSide(color: GFColors.border),
        ),
        margin: EdgeInsets.zero,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: GFColors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        border: OutlineInputBorder(
          borderRadius: GFRadius.md,
          borderSide: const BorderSide(color: GFColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: GFRadius.md,
          borderSide: const BorderSide(color: GFColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: GFRadius.md,
          borderSide: const BorderSide(color: GFColors.primary, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: GFRadius.md,
          borderSide: const BorderSide(color: GFColors.error),
        ),
        hintStyle: GFTypography.body.copyWith(color: GFColors.textTertiary),
        labelStyle: GFTypography.label,
        // Flutter defaults both to 1 line, which ellipsizes longer messages
        // into unreadable text. InputDecoration inherits these unless a field
        // sets its own value, so this covers every input in the app.
        errorMaxLines: 3,
        helperMaxLines: 2,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: GFColors.primary,
          foregroundColor: GFColors.textOnPrimary,
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: GFRadius.md),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 11),
          textStyle: GFTypography.label,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: GFColors.textPrimary,
          side: const BorderSide(color: GFColors.border),
          shape: RoundedRectangleBorder(borderRadius: GFRadius.md),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 11),
          textStyle: GFTypography.label,
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: GFColors.primary,
          shape: RoundedRectangleBorder(borderRadius: GFRadius.md),
          textStyle: GFTypography.label,
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: GFColors.border,
        thickness: 1,
        space: 0,
      ),
      listTileTheme: const ListTileThemeData(
        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: GFColors.surface,
        selectedItemColor: GFColors.primary,
        unselectedItemColor: GFColors.textSecondary,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
    );
  }
}
