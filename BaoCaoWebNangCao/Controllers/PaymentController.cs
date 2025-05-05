using BaiTap.Service;
using DoAn_LapTrinhWeb.Common.Helpers;
using DoAn_LapTrinhWeb.Model;
using DoAn_LapTrinhWeb.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace DoAn_LapTrinhWeb.Controllers
{
    public class PaymentController : Controller
    {
        private readonly IMomoService _momoService;
        private readonly DbContext _db;

        // Constructor không tham số
        public PaymentController()
        {
            _momoService = new MomoService(); // Khởi tạo thủ công
            _db = new DbContext();
        }

        public PaymentController(IMomoService momoService)
        {
            _momoService = momoService;
            _db = new DbContext();
        }

        [HttpGet]
        public async Task<ActionResult> CreatePaymentUrl(OrderInfoModel model)
        {
            try
            {
                if (model == null || string.IsNullOrEmpty(model.OrderId) || model.Amount <= 0)
                {
                    Notification.setNotification3s("Thông tin đơn hàng không hợp lệ", "error");
                    return RedirectToAction("Checkout", "Cart");
                }

                System.Diagnostics.Debug.WriteLine($"OrderInfoModel: {JsonConvert.SerializeObject(model)}");

                var response = await _momoService.CreatePaymentAsync(model);
                System.Diagnostics.Debug.WriteLine($"Phản hồi MoMo: {JsonConvert.SerializeObject(response)}");

                if (response.ErrorCode == 0)
                {
                    if (!string.IsNullOrEmpty(response.PayUrl))
                    {
                        return Redirect(response.PayUrl);
                    }
                    if (!string.IsNullOrEmpty(response.QrCodeUrl))
                    {
                        ViewBag.QrCodeUrl = response.QrCodeUrl;
                        ViewBag.OrderId = response.OrderId;
                        ViewBag.RequestId = response.RequestId;
                        return View("DisplayQrCode");
                    }
                    Notification.setNotification3s("Không nhận được URL thanh toán từ MoMo", "error");
                    return RedirectToAction("Checkout", "Cart");
                }

                Notification.setNotification3s($"Lỗi thanh toán: {response.Message}", "error");
                return RedirectToAction("Checkout", "Cart");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Lỗi trong CreatePaymentUrl: {ex.Message}\nStackTrace: {ex.StackTrace}");
                Notification.setNotification3s("Lỗi hệ thống. Vui lòng thử lại sau.", "error");
                return RedirectToAction("Checkout", "Cart");
            }
        }

        [HttpGet]
        public ActionResult Return()
        {
            try
            {
                Response.AddHeader("ngrok-skip-browser-warning", "true");
                System.Diagnostics.Debug.WriteLine("Bắt đầu xử lý Return");
                System.IO.File.WriteAllText("C:\\Logs\\MoMoReturn.txt", Request.RawUrl + "\n" + Request.QueryString.ToString());

                var response = _momoService.PaymentExecuteAsync(Request);
                System.Diagnostics.Debug.WriteLine($"MoMo Return: {JsonConvert.SerializeObject(response)}");

                if (string.IsNullOrEmpty(response.OrderId) || response.ErrorCode < 0)
                {
                    System.Diagnostics.Debug.WriteLine("Return: Dữ liệu trả về không hợp lệ");
                    Notification.setNotification3s("Dữ liệu trả về không hợp lệ", "error");
                    return RedirectToAction("Checkout", "Cart");
                }

                var orderIdParts = response.OrderId.Split('_');
                if (orderIdParts.Length != 2 || !int.TryParse(orderIdParts[0], out var actualOrderId))
                {
                    System.Diagnostics.Debug.WriteLine($"Return: ID đơn hàng không hợp lệ, OrderId: {response.OrderId}");
                    Notification.setNotification3s("ID đơn hàng không hợp lệ", "error");
                    return RedirectToAction("Checkout", "Cart");
                }

                var order = _db.Orders.FirstOrDefault(o => o.order_id == actualOrderId);
                if (order == null)
                {
                    System.Diagnostics.Debug.WriteLine($"Return: Không tìm thấy đơn hàng, OrderId: {actualOrderId}");
                    Notification.setNotification3s("Không tìm thấy đơn hàng", "error");
                    return RedirectToAction("Checkout", "Cart");
                }

                var parameters = new Dictionary<string, string>
        {
            {"partnerCode", ConfigurationManager.AppSettings["MomoPartnerCode"]},
            {"accessKey", _momoService.AccessKey},
            {"requestId", orderIdParts[1]},
            {"amount", response.Amount.ToString()},
            {"orderId", response.OrderId},
            {"orderInfo", response.OrderInfo ?? ""},
            {"orderType", response.OrderType ?? "momo_wallet"},
            {"transId", response.TransId ?? ""},
            {"resultCode", response.ErrorCode.ToString()},
            {"message", response.Message ?? ""},
            {"payType", response.PayType ?? "web"},
            {"responseTime", response.ResponseTime.ToString()},
            {"extraData", response.ExtraData ?? ""}
        };

                if (!_momoService.VerifySignature(parameters, response.Signature))
                {
                    System.Diagnostics.Debug.WriteLine("Return: Chữ ký không hợp lệ");
                    Notification.setNotification3s("Chữ ký không hợp lệ", "error");
                    return RedirectToAction("Checkout", "Cart");
                }

                long orderTotal = (long)Math.Round(order.total ?? 0.0f);
                if (response.Amount != orderTotal)
                {
                    System.Diagnostics.Debug.WriteLine($"Return: Số tiền không khớp, MoMo: {response.Amount}, Order: {orderTotal}");
                    Notification.setNotification3s("Số tiền không khớp", "error");
                    return RedirectToAction("Checkout", "Cart");
                }

                if (response.ErrorCode == 0)
                {
                    if (order.status != "1")
                    {
                        order.status = "1";
                        order.update_at = DateTime.Now;
                        order.update_by = User.Identity?.IsAuthenticated == true ? User.Identity.GetUserId().ToString() : "MoMoReturn";
                        _db.SaveChanges();
                    }
                    Notification.setNotification3s("Thanh toán thành công", "success");
                    if (User.Identity?.IsAuthenticated != true)
                    {
                        return RedirectToAction("Login", "Account");
                    }
                    return RedirectToAction("TrackingOrder", "Account");
                }
                else
                {
                    if (order.status != "0")
                    {
                        order.status = "0";
                        order.update_at = DateTime.Now;
                        order.update_by = User.Identity?.IsAuthenticated == true ? User.Identity.GetUserId().ToString() : "MoMoReturn";
                        _db.SaveChanges();
                    }
                    Notification.setNotification3s($"Thanh toán thất bại: {response.Message}", "error");
                    return RedirectToAction("Checkout", "Cart");
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Lỗi trong Return: {ex.Message}\nStackTrace: {ex.StackTrace}");
                System.IO.File.WriteAllText("C:\\Logs\\MoMoReturnError.txt", ex.ToString());
                Notification.setNotification3s("Lỗi xử lý thanh toán. Vui lòng thử lại.", "error");
                return RedirectToAction("Checkout", "Cart");
            }
        }

        // Trong action Notify
        [HttpPost]
        public ActionResult Notify()
        {
            try
            {
                System.Diagnostics.Debug.WriteLine("Bắt đầu xử lý Notify");
                System.IO.File.WriteAllText("C:\\Logs\\MoMoNotify.txt", Request.RawUrl + "\n" + Request.Form.ToString());

                var response = _momoService.PaymentExecuteAsync(Request);
                System.Diagnostics.Debug.WriteLine($"MoMo Notify: {JsonConvert.SerializeObject(response)}");

                if (string.IsNullOrEmpty(response.OrderId) || response.ErrorCode < 0)
                {
                    System.Diagnostics.Debug.WriteLine("Notify: Dữ liệu trả về không hợp lệ");
                    return Content("ERROR");
                }

                var orderIdParts = response.OrderId.Split('_');
                if (orderIdParts.Length != 2 || !int.TryParse(orderIdParts[0], out var actualOrderId))
                {
                    System.Diagnostics.Debug.WriteLine($"Notify: ID đơn hàng không hợp lệ, OrderId: {response.OrderId}");
                    return Content("ERROR");
                }

                var order = _db.Orders.FirstOrDefault(o => o.order_id == actualOrderId);
                if (order == null)
                {
                    System.Diagnostics.Debug.WriteLine($"Notify: Không tìm thấy đơn hàng, OrderId: {actualOrderId}");
                    return Content("ERROR");
                }

                var parameters = new Dictionary<string, string>
        {
            {"partnerCode", ConfigurationManager.AppSettings["MomoPartnerCode"]},
            {"accessKey", _momoService.AccessKey},
            {"requestId", orderIdParts[1]},
            {"amount", response.Amount.ToString()},
            {"orderId", response.OrderId},
            {"orderInfo", response.OrderInfo ?? ""},
            {"orderType", response.OrderType ?? "momo_wallet"},
            {"transId", response.TransId ?? ""},
            {"resultCode", response.ErrorCode.ToString()},
            {"message", response.Message ?? ""},
            {"payType", response.PayType ?? "web"},
            {"responseTime", response.ResponseTime.ToString()},
            {"extraData", response.ExtraData ?? ""}
        };

                if (!_momoService.VerifySignature(parameters, response.Signature))
                {
                    System.Diagnostics.Debug.WriteLine("Notify: Chữ ký không hợp lệ");
                    return Content("ERROR");
                }

                long orderTotal = (long)Math.Round(order.total ?? 0.0f);
                if (response.Amount != orderTotal)
                {
                    System.Diagnostics.Debug.WriteLine($"Notify: Số tiền không khớp, MoMo: {response.Amount}, Order: {orderTotal}");
                    return Content("ERROR");
                }

                if (response.ErrorCode == 0)
                {
                    if (order.status != "1")
                    {
                        order.status = "1";
                        order.update_at = DateTime.Now;
                        order.update_by = "MoMoNotify";
                        _db.SaveChanges();
                    }
                    return Content("OK");
                }
                else
                {
                    if (order.status != "0")
                    {
                        order.status = "0";
                        order.update_at = DateTime.Now;
                        order.update_by = "MoMoNotify";
                        _db.SaveChanges();
                    }
                    return Content("OK");
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Lỗi trong Notify: {ex.Message}\nStackTrace: {ex.StackTrace}");
                System.IO.File.WriteAllText("C:\\Logs\\MoMoNotifyError.txt", ex.ToString());
                return Content("ERROR");
            }
        }
    }
}