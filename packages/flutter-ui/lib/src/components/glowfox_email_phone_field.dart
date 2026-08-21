import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/glowfox_colors.dart';
import '../theme/glowfox_radius.dart';
import '../theme/glowfox_typography.dart';
import 'glowfox_bottom_modal.dart';

class _Country {
  const _Country({
    required this.code,
    required this.dialCode,
    required this.flag,
    required this.name,
  });
  final String code;
  final String dialCode;
  final String flag;
  final String name;
}

const List<_Country> _kCountries = [
  _Country(code: 'VN', dialCode: '84', flag: '🇻🇳', name: 'Việt Nam'),
  _Country(code: 'US', dialCode: '1',  flag: '🇺🇸', name: 'United States'),
  _Country(code: 'CN', dialCode: '86', flag: '🇨🇳', name: 'China'),
  _Country(code: 'SG', dialCode: '65', flag: '🇸🇬', name: 'Singapore'),
  _Country(code: 'TH', dialCode: '66', flag: '🇹🇭', name: 'Thailand'),
  _Country(code: 'ID', dialCode: '62', flag: '🇮🇩', name: 'Indonesia'),
  _Country(code: 'MY', dialCode: '60', flag: '🇲🇾', name: 'Malaysia'),
  _Country(code: 'JP', dialCode: '81', flag: '🇯🇵', name: 'Japan'),
  _Country(code: 'KR', dialCode: '82', flag: '🇰🇷', name: 'South Korea'),
];

/// Dual-mode input that accepts either an email address or a phone number.
///
/// Automatically switches to phone mode when the first character typed is a digit.
/// In phone mode a country-code prefix (flag + dial code) is shown and the
/// effective value emitted via [onChanged] is E.164-like: `+<dialCode><localDigits>`.
/// Clearing the field switches back to email mode.
class GFEmailPhoneField extends StatefulWidget {
  const GFEmailPhoneField({
    super.key,
    this.label,
    this.hint,
    this.focusNode,
    this.enabled = true,
    this.textInputAction,
    this.suffixIcon,
    this.onChanged,
    this.onSubmitted,
  });

  final String? label;
  final String? hint;
  final FocusNode? focusNode;
  final bool enabled;
  final TextInputAction? textInputAction;
  final Widget? suffixIcon;

  /// Called with the effective value on every change.
  /// Email mode: raw text. Phone mode: `+{dialCode}{digits}` (e.g. `+84909012174`).
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;

  @override
  State<GFEmailPhoneField> createState() => _GFEmailPhoneFieldState();
}

class _GFEmailPhoneFieldState extends State<GFEmailPhoneField> {
  final _ctrl = TextEditingController();
  late final FocusNode _focus;
  bool _ownsFocus = false;
  bool _isPhone = false;
  _Country _country = _kCountries[0];

  @override
  void initState() {
    super.initState();
    if (widget.focusNode != null) {
      _focus = widget.focusNode!;
    } else {
      _focus = FocusNode();
      _ownsFocus = true;
    }
  }

  @override
  void dispose() {
    if (_ownsFocus) _focus.dispose();
    _ctrl.dispose();
    super.dispose();
  }

  String get _effectiveValue =>
      _isPhone ? '+${_country.dialCode}${_ctrl.text}' : _ctrl.text;

  void _handleChange(String val) {
    if (!_isPhone) {
      if (val.isNotEmpty && RegExp(r'^[0-9]').hasMatch(val[0])) {
        final digits = val.substring(1).replaceAll(RegExp(r'\D'), '');
        _ctrl.value = TextEditingValue(
          text: digits,
          selection: TextSelection.collapsed(offset: digits.length),
        );
        setState(() => _isPhone = true);
        widget.onChanged?.call('+${_country.dialCode}$digits');
        return;
      }
      widget.onChanged?.call(val);
    } else {
      if (val.isEmpty) {
        setState(() => _isPhone = false);
        widget.onChanged?.call('');
      } else {
        widget.onChanged?.call('+${_country.dialCode}$val');
      }
    }
  }

  void _openCountryPicker() {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _CountryPickerSheet(
        selected: _country,
        onSelect: (c) {
          setState(() => _country = c);
          widget.onChanged?.call('+${c.dialCode}${_ctrl.text}');
        },
      ),
    ).then((_) {
      if (mounted) _focus.requestFocus();
    });
  }

  // Single TextField for both modes. Only InputDecoration changes — the widget
  // instance never unmounts, so keyboard and focus are never lost on mode switch.
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (widget.label != null) ...[
          Text(widget.label!, style: GFTypography.label),
          const SizedBox(height: 6),
        ],
        TextField(
          controller: _ctrl,
          focusNode: _focus,
          onChanged: _handleChange,
          onSubmitted: (_) => widget.onSubmitted?.call(_effectiveValue),
          enabled: widget.enabled,
          keyboardType:
              _isPhone ? TextInputType.phone : TextInputType.emailAddress,
          textInputAction: widget.textInputAction,
          inputFormatters:
              _isPhone ? [FilteringTextInputFormatter.digitsOnly] : null,
          style: GFTypography.body,
          decoration: InputDecoration(
            hintText: widget.hint,
            hintStyle:
                GFTypography.body.copyWith(color: GFColors.textTertiary),
            counterText: '',
            prefix: _isPhone ? _buildPhonePrefix() : null,
            suffixIcon: widget.suffixIcon,
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: GFColors.border, width: 1),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide:
                  const BorderSide(color: GFColors.charcoal, width: 1.5),
            ),
            disabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                  color: GFColors.border.withOpacity(0.5), width: 1),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPhonePrefix() {
    return GestureDetector(
      onTap: widget.enabled ? _openCountryPicker : null,
      behavior: HitTestBehavior.opaque,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(_country.flag, style: const TextStyle(fontSize: 16)),
          const SizedBox(width: 5),
          Text(
            '+${_country.dialCode}',
            style: GFTypography.body.copyWith(
              fontWeight: FontWeight.w500,
              color: GFColors.textPrimary,
            ),
          ),
          const SizedBox(width: 2),
          Icon(Icons.keyboard_arrow_down_rounded,
              size: 14, color: GFColors.textSecondary),
          const SizedBox(width: 10),
          Container(width: 1, height: 16, color: GFColors.border),
          const SizedBox(width: 2),
        ],
      ),
    );
  }
}



// ─── GFPhoneField ─────────────────────────────────────────────────────────────

/// Dedicated phone-number input that always shows a country-code prefix.
///
/// [controller] holds the local digits (without dial code).
/// [onChanged] emits the full E.164-like value: `+{dialCode}{digits}`.
/// Pre-fill by stripping the dial code before setting [controller.text].
class GFPhoneField extends StatefulWidget {
  const GFPhoneField({
    super.key,
    required this.controller,
    this.label,
    this.hint,
    this.focusNode,
    this.enabled = true,
    this.textInputAction,
    this.onChanged,
    this.onSubmitted,
    this.errorText,
  });

  final TextEditingController controller;
  final String? label;
  final String? hint;
  final FocusNode? focusNode;
  final bool enabled;
  final TextInputAction? textInputAction;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final String? errorText;

  @override
  State<GFPhoneField> createState() => _GFPhoneFieldState();
}

class _GFPhoneFieldState extends State<GFPhoneField> {
  late final FocusNode _focus;
  bool _ownsFocus = false;
  _Country _country = _kCountries[0];

  @override
  void initState() {
    super.initState();
    if (widget.focusNode != null) {
      _focus = widget.focusNode!;
    } else {
      _focus = FocusNode();
      _ownsFocus = true;
    }
  }

  @override
  void dispose() {
    if (_ownsFocus) _focus.dispose();
    super.dispose();
  }

  String get _effectiveValue => '+${_country.dialCode}${widget.controller.text}';

  void _openCountryPicker() {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _CountryPickerSheet(
        selected: _country,
        onSelect: (c) {
          setState(() => _country = c);
          widget.onChanged?.call('+${c.dialCode}${widget.controller.text}');
        },
      ),
    ).then((_) {
      if (mounted) _focus.requestFocus();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (widget.label != null) ...[
          Text(widget.label!, style: GFTypography.label),
          const SizedBox(height: 6),
        ],
        TextField(
          controller: widget.controller,
          focusNode: _focus,
          onChanged: (v) => widget.onChanged?.call('+${_country.dialCode}$v'),
          onSubmitted: (_) => widget.onSubmitted?.call(_effectiveValue),
          enabled: widget.enabled,
          keyboardType: TextInputType.phone,
          textInputAction: widget.textInputAction,
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          style: GFTypography.body,
          decoration: InputDecoration(
            hintText: widget.hint,
            hintStyle: GFTypography.body.copyWith(color: GFColors.textTertiary),
            counterText: '',
            errorText: widget.errorText,
            // prefixIcon (not prefix) so the dial code is always visible,
            // even before the field is focused. Zero-min constraints keep it
            // from forcing the default 48px icon box.
            prefixIcon: _buildPrefixIcon(),
            prefixIconConstraints:
                const BoxConstraints(minWidth: 0, minHeight: 0),
            filled: true,
            fillColor: GFColors.surface,
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: GFColors.border, width: 1),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: GFColors.charcoal, width: 1.5),
            ),
            disabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: GFColors.border.withOpacity(0.5), width: 1),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: GFColors.error, width: 1),
            ),
            focusedErrorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: GFColors.error, width: 1.5),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPrefixIcon() {
    return GestureDetector(
      onTap: widget.enabled ? _openCountryPicker : null,
      behavior: HitTestBehavior.opaque,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(width: 14),
          Text(_country.flag, style: const TextStyle(fontSize: 16)),
          const SizedBox(width: 5),
          Text(
            '+${_country.dialCode}',
            style: GFTypography.body.copyWith(
              fontWeight: FontWeight.w500,
              color: GFColors.textPrimary,
            ),
          ),
          const SizedBox(width: 2),
          Icon(Icons.keyboard_arrow_down_rounded, size: 14, color: GFColors.textSecondary),
          const SizedBox(width: 10),
          Container(width: 1, height: 16, color: GFColors.border),
          const SizedBox(width: 4),
        ],
      ),
    );
  }
}

// ─── Country picker sheet ──────────────────────────────────────────────────────

class _CountryPickerSheet extends StatelessWidget {
  const _CountryPickerSheet({
    required this.selected,
    required this.onSelect,
  });

  final _Country selected;
  final ValueChanged<_Country> onSelect;

  @override
  Widget build(BuildContext context) {
    return GFBottomModal(
      title: 'Chọn mã quốc gia',
      contentPadding: const EdgeInsets.symmetric(vertical: 4),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: _kCountries.map((c) {
          final isSelected = c.code == selected.code;
          return ListTile(
            leading: Text(c.flag, style: const TextStyle(fontSize: 22)),
            title: Text(
              c.name,
              style: GFTypography.body.copyWith(
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
              ),
            ),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  '+${c.dialCode}',
                  style: GFTypography.body.copyWith(
                    color: GFColors.textSecondary,
                  ),
                ),
                if (isSelected) ...[
                  const SizedBox(width: 8),
                  const Icon(Icons.check_rounded, size: 16, color: GFColors.primary),
                ],
              ],
            ),
            tileColor: isSelected ? GFColors.primaryLight : null,
            shape: const RoundedRectangleBorder(borderRadius: GFRadius.md),
            onTap: () {
              onSelect(c);
              Navigator.pop(context);
            },
          );
        }).toList(),
      ),
    );
  }
}
