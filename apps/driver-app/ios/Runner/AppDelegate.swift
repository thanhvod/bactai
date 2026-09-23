import CoreLocation
import Flutter
import UIKit

@main
@objc class AppDelegate: FlutterAppDelegate, FlutterImplicitEngineDelegate {
  /// D-016: khi app bị tắt hẳn, iOS vẫn đánh thức app theo "thay đổi vị trí đáng kể" (~500m);
  /// Flutter main() chạy lại và GpsCubit.resume() tiếp tục ghi lộ trình chuyến đang chạy.
  private let significantLocation = SignificantLocationMonitor()

  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    if launchOptions?[.location] != nil {
      // Được đánh thức vì vị trí: bật lại theo dõi (engine Dart sẽ ghi tiếp).
      significantLocation.startIfEnabled()
    }
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  func didInitializeImplicitFlutterEngine(_ engineBridge: FlutterImplicitEngineBridge) {
    GeneratedPluginRegistrant.register(with: engineBridge.pluginRegistry)
    guard let registrar = engineBridge.pluginRegistry.registrar(forPlugin: "BtaSignificantLocation") else { return }
    let channel = FlutterMethodChannel(name: "vn.bta.driver/significant_location", binaryMessenger: registrar.messenger())
    channel.setMethodCallHandler { [weak self] call, result in
      switch call.method {
      case "start":
        self?.significantLocation.start()
        result(nil)
      case "stop":
        self?.significantLocation.stop()
        result(nil)
      default:
        result(FlutterMethodNotImplemented)
      }
    }
  }
}

/// Theo dõi thay đổi vị trí đáng kể — chỉ để iOS relaunch app khi đã bị tắt; điểm GPS do Dart (geolocator) ghi.
final class SignificantLocationMonitor: NSObject, CLLocationManagerDelegate {
  private let manager = CLLocationManager()
  private let key = "bta.gps.significantEnabled"

  override init() {
    super.init()
    manager.delegate = self
    manager.allowsBackgroundLocationUpdates = true
    manager.pausesLocationUpdatesAutomatically = false
    manager.showsBackgroundLocationIndicator = true
  }

  func start() {
    UserDefaults.standard.set(true, forKey: key)
    guard CLLocationManager.significantLocationChangeMonitoringAvailable() else { return }
    manager.startMonitoringSignificantLocationChanges()
  }

  func stop() {
    UserDefaults.standard.set(false, forKey: key)
    manager.stopMonitoringSignificantLocationChanges()
  }

  func startIfEnabled() {
    if UserDefaults.standard.bool(forKey: key) { start() }
  }

  func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {}
  func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {}
}
