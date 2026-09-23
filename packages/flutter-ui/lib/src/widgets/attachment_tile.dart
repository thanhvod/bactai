import 'package:flutter/material.dart';
import '../format.dart';
import '../tokens/bta_tokens.dart';

/// Dòng chứng từ đính kèm: tên, loại, thời điểm, trạng thái.
class AttachmentTile extends StatelessWidget {
  const AttachmentTile({super.key, required this.fileName, this.categoryLabel, this.uploadedAt, this.thumbnailUrl, this.onTap, this.pending = false});
  final String fileName;
  final String? categoryLabel;
  final DateTime? uploadedAt;
  final String? thumbnailUrl;
  final VoidCallback? onTap;
  final bool pending;

  @override
  Widget build(BuildContext context) {
    final isImage = RegExp(r'\.(jpe?g|png|webp|heic)$', caseSensitive: false).hasMatch(fileName) || thumbnailUrl != null;
    return ListTile(
      onTap: onTap,
      minTileHeight: 56,
      leading: SizedBox(
        width: 44,
        height: 44,
        child: ClipRRect(
          borderRadius: BorderRadius.circular(BtaRadius.sm),
          child: thumbnailUrl != null
              ? Image.network(thumbnailUrl!, fit: BoxFit.cover, errorBuilder: (_, _, _) => const ColoredBox(color: BtaColors.surfaceMuted))
              : ColoredBox(color: BtaColors.surfaceMuted, child: Icon(isImage ? Icons.image_outlined : Icons.description_outlined, color: BtaColors.textMuted)),
        ),
      ),
      title: Text(fileName, style: BtaText.body, maxLines: 1, overflow: TextOverflow.ellipsis),
      subtitle: Text([if (categoryLabel != null) categoryLabel, if (uploadedAt != null) BtaFormat.dateTime(uploadedAt)].join(' · '), style: BtaText.caption.copyWith(color: BtaColors.textSubtle)),
      trailing: pending ? const Icon(Icons.schedule, color: BtaColors.warning) : const Icon(Icons.chevron_right, color: BtaColors.textSubtle),
    );
  }
}
