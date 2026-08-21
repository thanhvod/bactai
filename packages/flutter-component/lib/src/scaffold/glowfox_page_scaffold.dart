import 'package:flutter/material.dart';
import 'package:flutter_ui/flutter_ui.dart';

/// Standard page scaffold with optional header, title, and actions.
///
/// Usage:
/// ```dart
/// GFPageScaffold(
///   title: 'Khách hàng',
///   actions: [GFIconButton(icon: Icon(Icons.add), onPressed: ...)],
///   body: CustomerListView(),
/// )
/// ```
class GFPageScaffold extends StatelessWidget {
  const GFPageScaffold({
    super.key,
    required this.body,
    this.title,
    this.actions,
    this.leading,
    this.bottomBar,
    this.floatingActionButton,
    this.backgroundColor,
    this.resizeToAvoidBottomInset = true,
  });

  final Widget body;
  final String? title;
  final List<Widget>? actions;
  final Widget? leading;
  final Widget? bottomBar;
  final Widget? floatingActionButton;
  final Color? backgroundColor;
  final bool resizeToAvoidBottomInset;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundColor ?? GFColors.background,
      resizeToAvoidBottomInset: resizeToAvoidBottomInset,
      appBar: title != null || actions != null || leading != null
          ? AppBar(
              title: title != null ? Text(title!, style: GFTypography.h3) : null,
              actions: actions != null
                  ? [...actions!, const SizedBox(width: 8)]
                  : null,
              leading: leading,
              backgroundColor: GFColors.surface,
              elevation: 0,
              scrolledUnderElevation: 0.5,
            )
          : null,
      body: body,
      bottomNavigationBar: bottomBar,
      floatingActionButton: floatingActionButton,
    );
  }
}
