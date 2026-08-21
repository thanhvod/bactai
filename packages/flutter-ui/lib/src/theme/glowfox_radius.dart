import 'package:flutter/material.dart';

/// Border radius tokens.
abstract final class GFRadius {
  static const BorderRadius none = BorderRadius.zero;
  static const BorderRadius xs = BorderRadius.all(Radius.circular(4));
  static const BorderRadius sm = BorderRadius.all(Radius.circular(6));
  static const BorderRadius md = BorderRadius.all(Radius.circular(8));
  static const BorderRadius lg = BorderRadius.all(Radius.circular(12));
  static const BorderRadius xl = BorderRadius.all(Radius.circular(16));
  static const BorderRadius xl2 = BorderRadius.all(Radius.circular(20));
  static const BorderRadius xl3 = BorderRadius.all(Radius.circular(32));
  static const BorderRadius full = BorderRadius.all(Radius.circular(9999));

  // Shorthand radius values
  static const double xsValue = 4;
  static const double smValue = 6;
  static const double mdValue = 8;
  static const double lgValue = 12;
  static const double xlValue = 16;
  static const double xl3Value = 32;
  static const double fullValue = 9999;
}
