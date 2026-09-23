/// Tên route khớp design/spec/routes.mobile.dart (BtaRoutes.da_*). Path là quy ước nội bộ app.
class DriverRoutes {
  DriverRoutes._();

  static const splash = 'DriverSplashRoute';
  static const login = 'DriverLoginRoute';
  static const forgotPassword = 'DriverForgotPasswordRoute';
  static const home = 'DriverHomeRoute';
  static const jobList = 'DriverJobListRoute';
  static const jobCalendar = 'DriverJobCalendarRoute';
  static const tripDetail = 'DriverTripDetailRoute';
  static const stopList = 'DriverStopListRoute';
  static const stopDetail = 'DriverStopDetailRoute';
  static const statusUpdate = 'DriverStatusUpdateRoute';
  static const pauseTrip = 'DriverPauseTripRoute';
  static const podCapture = 'DriverPodCaptureRoute';
  static const codInput = 'DriverCodInputRoute';
  static const incidentReport = 'DriverIncidentReportRoute';
  static const attachmentUpload = 'DriverAttachmentUploadRoute';
  static const gpsPermission = 'DriverGpsPermissionRoute';
  static const sync = 'DriverSyncRoute';
  static const notifications = 'DriverNotificationsRoute';
  static const money = 'DriverMoneyRoute';
  static const history = 'DriverHistoryRoute';
  static const profile = 'DriverProfileRoute';

  static const pSplash = '/splash';
  static const pLogin = '/login';
  static const pForgotPassword = '/forgot-password';
  static const pHome = '/home';
  static const pJobs = '/jobs';
  static const pJobCalendar = '/jobs/calendar';
  static const pNotifications = '/notifications';
  static const pProfile = '/profile';
  static const pSync = '/sync';
  static const pMoney = '/money';
  static const pHistory = '/history';
  static const pGps = '/gps';
  static const pAttachmentUpload = '/attachments/upload';

  static String tripDetailPath(String tripId) => '/trips/$tripId';
  static String stopListPath(String tripId) => '/trips/$tripId/stops';
  static String statusUpdatePath(String tripId) => '/trips/$tripId/status';
  static String pauseTripPath(String tripId) => '/trips/$tripId/pause';
  static String incidentReportPath(String tripId) => '/trips/$tripId/incident';
  static String stopDetailPath(String stopId) => '/stops/$stopId';
  static String podCapturePath(String stopId) => '/stops/$stopId/pod';
  static String codInputPath(String stopId) => '/stops/$stopId/cod';
  static String attachmentUploadPath(String entityType, String entityId, [String? label]) =>
      Uri(path: pAttachmentUpload, queryParameters: {'entityType': entityType, 'entityId': entityId, 'label': ?label}).toString();
}
