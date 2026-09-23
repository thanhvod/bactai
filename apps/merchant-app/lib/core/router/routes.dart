/// Tên route khớp design/spec/routes.mobile.dart (BtaRoutes.ma_*).
class MerchantRoutes {
  MerchantRoutes._();

  static const login = 'MerchantLoginRoute';
  static const home = 'MerchantHomeRoute';
  static const notifications = 'MerchantNotificationsRoute';
  static const orderList = 'MerchantOrderListRoute';
  static const orderDetail = 'MerchantOrderDetailRoute';
  static const quickOrderCreate = 'MerchantQuickOrderCreateRoute';
  static const tripList = 'MerchantTripListRoute';
  static const tripDetail = 'MerchantTripDetailRoute';
  static const map = 'MerchantMapRoute';
  static const customerList = 'MerchantCustomerListRoute';
  static const customerDetail = 'MerchantCustomerDetailRoute';
  static const finance = 'MerchantFinanceRoute';
  static const cod = 'MerchantCodRoute';
  static const payrollApproval = 'MerchantPayrollApprovalRoute';
  static const reports = 'MerchantReportsRoute';
  static const profile = 'MerchantProfileRoute';
  static const chooseMerchant = 'MerchantChooseRoute';
  static const payrollDetail = 'MerchantPayrollDetailRoute';
  static const changePassword = 'MerchantChangePasswordRoute';

  static const pLogin = '/login';
  static const pHome = '/home';
  static const pNotifications = '/notifications';
  static const pOrders = '/orders';
  static const pOrderNew = '/orders/new';
  static const pTrips = '/trips';
  static const pMap = '/map';
  static const pCustomers = '/customers';
  static const pFinance = '/finance';
  static const pCod = '/finance/cod';
  static const pPayroll = '/payroll';
  static const pReports = '/reports';
  static const pProfile = '/profile';
  static const pChooseMerchant = '/choose-merchant';
  static const pChangePassword = '/change-password';
  static const pProfileChangePassword = '/profile/password';

  static String orderDetailPath(String id) => '/orders/$id';
  static String tripDetailPath(String id) => '/trips/$id';
  static String customerDetailPath(String id) => '/customers/$id';
  static String payrollDetailPath(String id) => '/payroll/$id';
}
