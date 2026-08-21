import 'package:flutter/material.dart';
import 'package:flutter_ui/flutter_ui.dart';

/// One entry in a [GFPageMenuButton] dropdown.
class GFPageMenuItem {
  const GFPageMenuItem({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;
}

/// Borderless "…" button for the page heading that opens a page-level
/// dropdown menu over a 50% dim overlay.
///
/// Shared pattern for secondary page actions (e.g. "Tài sản đã xóa" — every
/// feature has a deleted-items list). Screens only supply [items]:
///
/// ```dart
/// GFPageHeading(
///   title: ...,
///   action: Row(children: [
///     GFPageMenuButton(items: [
///       GFPageMenuItem(
///         icon: Icons.delete_outline_rounded,
///         label: l10n.assets_menu_deleted,
///         onTap: openDeletedAssets,
///       ),
///     ]),
///     const SizedBox(width: 8),
///     GFHeadingActionButton.add(onTap: onAdd),
///   ]),
/// )
/// ```
class GFPageMenuButton extends StatefulWidget {
  const GFPageMenuButton({super.key, required this.items});

  final List<GFPageMenuItem> items;

  @override
  State<GFPageMenuButton> createState() => _GFPageMenuButtonState();
}

class _GFPageMenuButtonState extends State<GFPageMenuButton> {
  final _overlayController = OverlayPortalController();
  double _menuTop = 0;

  void _open() {
    final box = context.findRenderObject() as RenderBox?;
    if (box == null) return;
    final origin = box.localToGlobal(Offset.zero);
    setState(() => _menuTop = origin.dy + box.size.height + 12);
    _overlayController.show();
  }

  void _close() {
    if (_overlayController.isShowing) _overlayController.hide();
  }

  @override
  Widget build(BuildContext context) {
    // Target the ROOT overlay: inside the tab shell the nearest overlay is
    // the branch navigator's (offset below the header and underneath the
    // floating bottom nav), which would misplace the menu and leave the nav
    // above the dim scrim.
    return OverlayPortal(
      controller: _overlayController,
      overlayLocation: OverlayChildLocation.rootOverlay,
      overlayChildBuilder: _buildMenu,
      child: GestureDetector(
        onTap: _open,
        behavior: HitTestBehavior.opaque,
        child: const SizedBox(
          width: 40,
          height: 40,
          child: Icon(Icons.more_horiz_rounded,
              size: 22, color: GFColors.textPrimary),
        ),
      ),
    );
  }

  Widget _buildMenu(BuildContext context) {
    return Stack(
      children: [
        // 50% dim overlay — tap to dismiss
        Positioned.fill(
          child: GestureDetector(
            onTap: _close,
            child: Container(color: Colors.black.withValues(alpha: 0.5)),
          ),
        ),
        Positioned(
          top: _menuTop,
          left: GFSpacing.base,
          right: GFSpacing.base,
          child: Material(
            color: GFColors.surface,
            borderRadius: BorderRadius.circular(20),
            clipBehavior: Clip.antiAlias,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                for (var i = 0; i < widget.items.length; i++) ...[
                  if (i > 0)
                    const Divider(height: 1, color: GFColors.border),
                  _MenuRow(
                    item: widget.items[i],
                    onTap: () {
                      _close();
                      widget.items[i].onTap();
                    },
                  ),
                ],
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _MenuRow extends StatelessWidget {
  const _MenuRow({required this.item, required this.onTap});

  final GFPageMenuItem item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
        child: Row(
          children: [
            Icon(item.icon, size: 22, color: GFColors.textSecondary),
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                item.label,
                style: GFTypography.body.copyWith(fontSize: 15),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
