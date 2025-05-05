using BaiTap.Service;
using DoAn_LapTrinhWeb.Common;
using DoAn_LapTrinhWeb.Common.Helpers;
using DoAn_LapTrinhWeb.Model;
using DoAn_LapTrinhWeb.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using System.Web;
using System.Web.Hosting;
using System.Web.Mvc;

namespace DoAn_LapTrinhWeb.Controllers
{
    public class CartController : Controller
    {
        private DbContext db = new DbContext(); // Khởi tạo DbContext để tương tác với cơ sở dữ liệu

        // Xem trước giỏ hàng (offcanvas) ở bất kỳ layout nào
        public PartialViewResult PreviewCart()
        {
            var cart = this.GetCart(); // Lấy thông tin giỏ hàng (danh sách sản phẩm và số lượng)
            ViewBag.Quans = cart.Item2; // Truyền danh sách số lượng sản phẩm vào ViewBag
            var listProduct = cart.Item1.ToList(); // Danh sách sản phẩm trong giỏ hàng
            return PartialView("PreviewCart", listProduct); // Trả về partial view PreviewCart.cshtml
        }

        // Xem giỏ hàng chi tiết
        public ActionResult ViewCart()
        {
            var cart = this.GetCart(); // Lấy thông tin giỏ hàng
            ViewBag.Quans = cart.Item2; // Truyền danh sách số lượng vào ViewBag
            double discount = 0d; // Biến lưu giá trị giảm giá
            var listProduct = cart.Item1.ToList(); // Danh sách sản phẩm trong giỏ hàng

            // Kiểm tra nếu có mã giảm giá trong Session
            if (Session["Discount"] != null && Session["Discountcode"] != null)
            {
                var code = Session["Discountcode"].ToString(); // Lấy mã giảm giá từ Session
                var discountupdatequan = db.Discounts.Where(d => d.discount_code == code).FirstOrDefault(); // Tìm mã giảm giá trong cơ sở dữ liệu

                // Kiểm tra tính hợp lệ của mã giảm giá
                if (discountupdatequan.quantity == 0 || discountupdatequan.discount_star >= DateTime.Now || discountupdatequan.discount_end <= DateTime.Now)
                {
                    Notification.setNotification3s("Mã giảm giá không thể sử dụng", "error"); // Thông báo lỗi nếu mã không hợp lệ
                    return View(listProduct); // Trả về view giỏ hàng
                }

                discount = Convert.ToDouble(Session["Discount"].ToString()); // Lấy giá trị giảm giá từ Session
                Session.Remove("Discount"); // Xóa Session giảm giá
                Session.Remove("Discountcode"); // Xóa Session mã giảm giá
                return View(listProduct); // Trả về view giỏ hàng
            }

            return View(listProduct); // Trả về view giỏ hàng nếu không có mã giảm giá
        }

        // Thanh toán giỏ hàng
        [Authorize] // Yêu cầu người dùng phải đăng nhập
        public ActionResult Checkout()
        {
            int userId = User.Identity.GetUserId(); // Lấy ID người dùng hiện tại
            var user = db.Accounts.SingleOrDefault(u => u.account_id == userId); // Lấy thông tin người dùng từ cơ sở dữ liệu
            var cart = this.GetCart(); // Lấy thông tin giỏ hàng
            ViewBag.Quans = cart.Item2; // Truyền danh sách số lượng vào ViewBag
            ViewBag.ListProduct = cart.Item1.ToList(); // Truyền danh sách sản phẩm vào ViewBag

            // Truyền các thông tin cần thiết cho view Checkout.cshtml
            ViewBag.CountAddress = db.AccountAddresses.Where(m => m.account_id == userId).Count(); // Đếm số địa chỉ của người dùng
            ViewBag.ListDistrict = db.Districts.OrderBy(m => m.district_name).ToList(); // Danh sách quận/huyện
            ViewBag.ListProvince = db.Provinces.OrderBy(m => m.province_name).ToList(); // Danh sách tỉnh/thành phố
            ViewBag.ListWard = db.Wards.ToList().OrderBy(m => m.ward_name).ToList(); // Danh sách phường/xã
            ViewBag.ListAddress = db.AccountAddresses.Where(m => m.account_id == userId).OrderByDescending(m => m.isDefault).ToList(); // Danh sách địa chỉ của người dùng
            ViewBag.MyAddress = db.AccountAddresses.FirstOrDefault(u => u.account_id == userId && u.isDefault == true); // Địa chỉ mặc định của người dùng

            // Nếu giỏ hàng trống, chuyển hướng về trang giỏ hàng
            if (cart.Item2.Count < 1)
            {
                return RedirectToAction(nameof(ViewCart));
            }

            var products = cart.Item1; // Danh sách sản phẩm trong giỏ hàng
            double total = 0d; // Tổng tiền
            double discount = 0d; // Giá trị giảm giá
            double productPrice = 0d; // Giá của từng sản phẩm

            // Tính tổng tiền đơn hàng
            for (int i = 0; i < products.Count; i++)
            {
                var item = products[i];
                productPrice = item.price; // Giá gốc của sản phẩm
                if (item.Discount != null)
                {
                    // Nếu sản phẩm có mã giảm giá hợp lệ
                    if (item.Discount.discount_star < DateTime.Now && item.Discount.discount_end > DateTime.Now)
                    {
                        productPrice = item.price - item.Discount.discount_price; // Giá sau giảm
                    }
                }
                total += productPrice * cart.Item2[i]; // Cộng dồn vào tổng tiền
            }

            // Áp dụng mã giảm giá (nếu có)
            if (Session["Discount"] != null)
            {
                discount = Convert.ToDouble(Session["Discount"].ToString()); // Lấy giá trị giảm giá từ Session
                total -= discount; // Giảm tổng tiền theo giá trị mã giảm giá
            }
            // Đảm bảo tổng tiền không nhỏ hơn 0
            total = Math.Max(0, total);
            ViewBag.Total = total; // Truyền tổng tiền vào ViewBag
            ViewBag.Discount = discount; // Truyền giá trị giảm giá vào ViewBag
            return View(user); // Trả về view Checkout.cshtml với thông tin người dùng
        }

        // Lưu đơn hàng
        [Authorize]
        [HttpPost]
        public async Task<ActionResult> SaveOrder(OrderAddress orderAdress, string note, string emailID, string orderID, string orderItem, string orderDiscount, string orderPrice, string orderTotal, string contentWard, string district, string province)
        {
            try
            {
                var culture = System.Globalization.CultureInfo.GetCultureInfo("vi-VN");
                double priceSum = 0;
                string productquancheck = "0";

                if (Session["Discount"] != null && Session["Discountcode"] != null)
                {
                    string check_discount = Session["Discountcode"].ToString();
                    var discountupdatequan = db.Discounts.Where(d => d.discount_code == check_discount).SingleOrDefault();
                    if (discountupdatequan.quantity == 0 || discountupdatequan.discount_star >= DateTime.Now || discountupdatequan.discount_end <= DateTime.Now)
                    {
                        Notification.setNotification3s("Mã giảm giá không thể sử dụng", "error");
                        return RedirectToAction("ViewCart", "Cart");
                    }
                    else
                    {
                        int newquantity = (discountupdatequan.quantity - 1);
                        discountupdatequan.quantity = newquantity;
                    }
                }

                orderAdress.timesEdit = 0;
                db.OrderAddresses.Add(orderAdress);
                var cart = this.GetCart();
                var listProduct = new List<Product>();

                var order = new Order()
                {
                    account_id = User.Identity.GetUserId(),
                    create_at = DateTime.Now,
                    create_by = User.Identity.GetUserId().ToString(),
                    status = "1",
                    order_note = Request.Form["OrderNote"].ToString(),
                    delivery_id = 1,
                    orderAddressId = orderAdress.orderAddressId,
                    order_date = DateTime.Now,
                    update_at = DateTime.Now,
                    payment_id = 1,
                    update_by = User.Identity.GetUserId().ToString(),
                    total = (float?)Convert.ToDouble(TempData["Total"] ?? 0) // Đảm bảo TempData["Total"] là double hợp lệ
                };

                for (int i = 0; i < cart.Item1.Count; i++)
                {
                    var item = cart.Item1[i];
                    var _price = item.price;
                    if (item.Discount != null)
                    {
                        if (item.Discount.discount_star < DateTime.Now && item.Discount.discount_end > DateTime.Now)
                        {
                            _price = item.price - item.Discount.discount_price;
                        }
                    }

                    order.Oder_Detail.Add(new Oder_Detail
                    {
                        create_at = DateTime.Now,
                        create_by = User.Identity.GetUserId().ToString(),
                        disscount_id = item.disscount_id,
                        genre_id = item.genre_id,
                        price = _price,
                        product_id = item.product_id,
                        quantity = cart.Item2[i],
                        status = "1",
                        update_at = DateTime.Now,
                        update_by = User.Identity.GetUserId().ToString(),
                        transection = "transection"
                    });

                    Response.Cookies["product_" + item.product_id].Expires = DateTime.Now.AddDays(-10);

                    var product = db.Products.SingleOrDefault(p => p.product_id == item.product_id);
                    productquancheck = product.quantity;
                    product.buyturn += cart.Item2[i];
                    product.quantity = (Convert.ToInt32(product.quantity ?? "0") - cart.Item2[i]).ToString();

                    listProduct.Add(product);
                    priceSum += (_price * cart.Item2[i]);
                    orderItem += "<tr style='margin'> <td align='left' width='75%' style=' padding: 6px 12px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;' >" +
                                product.product_name + "</td><td align='left' width='25%' style=' padding: 6px 12px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; ' >" + product.price.ToString("#,0₫", culture.NumberFormat) + "</td> </tr>";
                }

                if (productquancheck.Trim() != "0")
                {
                    db.Orders.Add(order);
                }
                else
                {
                    Notification.setNotification3s("Sản phẩm đã hết hàng", "error");
                    return RedirectToAction("ViewCart", "Cart");
                }

                db.Configuration.ValidateOnSaveEnabled = false;
                await db.SaveChangesAsync();
                Notification.setNotification3s("Đặt hàng thành công", "success");
                Session.Remove("Discount");
                Session.Remove("Discountcode");

                emailID = User.Identity.GetEmail();
                orderID = order.order_id.ToString();
                orderDiscount = string.Format(culture, "{0:#,0₫}", priceSum + 30000 - (order.total ?? 0));
                orderPrice = priceSum.ToString("#,0₫", culture.NumberFormat);
                orderTotal = order.total.HasValue ? order.total.Value.ToString("#,0₫", culture.NumberFormat) : "0₫";

                // SendVerificationLinkEmail(emailID, orderID, orderItem, orderDiscount, orderPrice, orderTotal, contentWard, district, province);

                Notification.setNotification3s("Đặt hàng thành công", "success");
                return RedirectToAction("TrackingOrder", "Account");
            }
            catch
            {
                Notification.setNotification3s("Lỗi! đặt hàng không thành công", "error");
                return RedirectToAction("Checkout", "Cart");
            }
        }

        // Gửi email xác nhận đơn hàng
        //[NonAction] // Không phải action, chỉ là phương thức hỗ trợ
        //public void SendVerificationLinkEmail(string emailID, string orderID, string orderItem, string orderDiscount, string orderPrice, string orderTotal, string contentWard, string district, string province)
        //{
        //    var fromEmail = new MailAddress(EmailConfig.emailID, EmailConfig.emailName); // Email gửi (cấu hình trong EmailConfig)
        //    var toEmail = new MailAddress(emailID); // Email người nhận
        //    var fromEmailPassword = EmailConfig.emailPassword; // Mật khẩu email gửi
        //    string body = System.IO.File.ReadAllText(HostingEnvironment.MapPath("~/EmailTemplate/") + "EmailOrders" + ".cshtml"); // Đọc template email từ file
        //    string subject = "Thông tin đơn hàng #" + orderID; // Tiêu đề email

        //    // Thay thế các placeholder trong template email
        //    body = body.Replace("{{order_id}}", orderID);
        //    body = body.Replace("{{order_item}}", orderItem);
        //    body = body.Replace("{{order_discount}}", orderDiscount);
        //    body = body.Replace("{{order_price}}", orderPrice);
        //    body = body.Replace("{{total}}", orderTotal);
        //    body = body.Replace("{{contet_ward}}", contentWard);
        //    body = body.Replace("{{district}}", district);
        //    body = body.Replace("{{province}}", province);

        //    // Cấu hình SMTP để gửi email
        //    var smtp = new SmtpClient
        //    {
        //        Host = EmailConfig.emailHost, // Máy chủ SMTP (ví dụ: smtp.gmail.com)
        //        Port = 587, // Cổng SMTP
        //        EnableSsl = true, // Bật SSL
        //        DeliveryMethod = SmtpDeliveryMethod.Network,
        //        UseDefaultCredentials = false,
        //        Credentials = new NetworkCredential(fromEmail.Address, fromEmailPassword)
        //    };

        //    // Gửi email
        //    using (var message = new MailMessage(fromEmail, toEmail)
        //    {
        //        Subject = subject,
        //        Body = body,
        //        IsBodyHtml = true // Nội dung email là HTML
        //    })
        //        smtp.Send(message);
        //}

        // Áp dụng mã giảm giá
        public ActionResult UseDiscountCode(string code)
        {
            var discount = db.Discounts.SingleOrDefault(d => d.discount_code == code); // Tìm mã giảm giá theo code
            if (discount != null)
            {
                // Kiểm tra tính hợp lệ của mã giảm giá
                if (discount.discount_star < DateTime.Now && discount.discount_end > DateTime.Now && discount.quantity != 0)
                {
                    Session["Discountcode"] = discount.discount_code; // Lưu mã giảm giá vào Session
                    Session["Discount"] = discount.discount_price; // Lưu giá trị giảm giá vào Session
                    return Json(new { success = true, discountPrice = discount.discount_price }, JsonRequestBehavior.AllowGet); // Trả về JSON thành công
                }
            }
            return Json(new { success = false, discountPrice = 0 }, JsonRequestBehavior.AllowGet); // Trả về JSON thất bại nếu mã không hợp lệ
        }

        // Lấy thông tin giỏ hàng từ cookies
        private Tuple<List<Product>, List<int>> GetCart()
        {
            // Lấy tất cả cookies liên quan đến giỏ hàng (có tiền tố "product_")
            var cart = Request.Cookies.AllKeys.Where(c => c.IndexOf("product_") == 0);
            var productIds = new List<int>(); // Danh sách ID sản phẩm
            var quantities = new List<int>(); // Danh sách số lượng
            var errorProduct = new List<string>(); // Danh sách sản phẩm lỗi
            var cValue = ""; // Giá trị cookie

            // Lấy ID sản phẩm và số lượng từ cookies
            foreach (var item in cart)
            {
                var tempArr = item.Split('_'); // Tách cookie name thành [prefix, productId]
                if (tempArr.Length != 2)
                {
                    errorProduct.Add(item); // Nếu cookie không đúng định dạng, đánh dấu là lỗi
                    continue;
                }
                cValue = Request.Cookies[item].Value; // Lấy số lượng từ cookie
                productIds.Add(Convert.ToInt32(tempArr[1])); // Thêm ID sản phẩm
                quantities.Add(Convert.ToInt32(String.IsNullOrEmpty(cValue) ? "0" : cValue)); // Thêm số lượng
                if (cValue == "0")
                {
                    Response.Cookies["product_" + tempArr[1]].Expires = DateTime.Now; // Xóa cookie nếu số lượng bằng 0
                }
            }

            // Lấy danh sách sản phẩm từ cơ sở dữ liệu
            var listProduct = new List<Product>();
            foreach (var id in productIds)
            {
                var product = db.Products.SingleOrDefault(p => p.status == "1" && p.product_id == id); // Tìm sản phẩm theo ID và trạng thái
                if (product != null)
                {
                    listProduct.Add(product); // Thêm sản phẩm vào danh sách
                }
                else
                {
                    // Nếu sản phẩm không tồn tại hoặc không hợp lệ
                    errorProduct.Add("product-" + id); // Đánh dấu là lỗi
                    quantities.RemoveAt(productIds.IndexOf(id)); // Xóa số lượng tương ứng
                }
            }

            // Xóa các sản phẩm lỗi khỏi giỏ hàng (cookies)
            foreach (var err in errorProduct)
            {
                Response.Cookies[err].Expires = DateTime.Now.AddDays(-1);
            }

            return new Tuple<List<Product>, List<int>>(listProduct, quantities); // Trả về danh sách sản phẩm và số lượng
        }
        [Authorize]
        [HttpPost]
        public async Task<ActionResult> SaveOrderAndPay(OrderAddress orderAddress, string OrderNote)
        {
            try
            {
                var culture = System.Globalization.CultureInfo.GetCultureInfo("vi-VN");
                double priceSum = 0;
                string productquancheck = "0";

                if (!orderAddress.province_id.HasValue || !orderAddress.district_id.HasValue ||
                    !orderAddress.ward_id.HasValue || string.IsNullOrEmpty(orderAddress.orderUsername) ||
                    string.IsNullOrEmpty(orderAddress.orderPhonenumber) || string.IsNullOrEmpty(orderAddress.content))
                {
                    return Json(new { success = false, message = "Nhập thông tin còn thiếu" });
                }

                double discount = 0;
                if (Session["Discount"] != null && Session["Discountcode"] != null)
                {
                    string check_discount = Session["Discountcode"].ToString();
                    var discountupdatequan = db.Discounts.FirstOrDefault(d => d.discount_code == check_discount);
                    if (discountupdatequan == null || discountupdatequan.quantity == 0 ||
                        discountupdatequan.discount_star >= DateTime.Now || discountupdatequan.discount_end <= DateTime.Now)
                    {
                        return Json(new { success = false, message = "Mã giảm giá không thể sử dụng" });
                    }
                    discount = Convert.ToDouble(Session["Discount"].ToString());
                    discountupdatequan.quantity--;
                }

                orderAddress.timesEdit = 0;
                db.OrderAddresses.Add(orderAddress);
                var cart = this.GetCart();
                var listProduct = cart.Item1.ToList();

                var order = new Order
                {
                    account_id = User.Identity.GetUserId(),
                    create_at = DateTime.Now,
                    create_by = User.Identity.GetUserId().ToString(),
                    status = "1",
                    order_note = OrderNote,
                    delivery_id = 1,
                    orderAddressId = orderAddress.orderAddressId,
                    order_date = DateTime.Now,
                    update_at = DateTime.Now,
                    payment_id = 2,
                    update_by = User.Identity.GetUserId().ToString(),
                    total = (float?)Convert.ToDouble(TempData["Total"] ?? 0)
                };

                if (order.total <= 0)
                {
                    return Json(new { success = false, message = "Tổng tiền đơn hàng không hợp lệ" });
                }

                for (int i = 0; i < cart.Item1.Count; i++)
                {
                    var item = cart.Item1[i];
                    var _price = item.price;
                    if (item.Discount != null && item.Discount.discount_star < DateTime.Now && item.Discount.discount_end > DateTime.Now)
                    {
                        _price = item.price - item.Discount.discount_price;
                    }

                    order.Oder_Detail.Add(new Oder_Detail
                    {
                        create_at = DateTime.Now,
                        create_by = User.Identity.GetUserId().ToString(),
                        disscount_id = item.disscount_id,
                        genre_id = item.genre_id,
                        price = _price,
                        product_id = item.product_id,
                        quantity = cart.Item2[i],
                        status = "1",
                        update_at = DateTime.Now,
                        update_by = User.Identity.GetUserId().ToString(),
                        transection = "momo"
                    });

                    var product = db.Products.FirstOrDefault(p => p.product_id == item.product_id);
                    productquancheck = product.quantity;
                    product.buyturn += cart.Item2[i];
                    product.quantity = (Convert.ToInt32(product.quantity ?? "0") - cart.Item2[i]).ToString();

                    priceSum += (_price * cart.Item2[i]);
                    Response.Cookies["product_" + item.product_id].Expires = DateTime.Now.AddDays(-10);
                }

                if (productquancheck.Trim() == "0")
                {
                    return Json(new { success = false, message = "Sản phẩm đã hết hàng" });
                }

                db.Orders.Add(order);
                db.Configuration.ValidateOnSaveEnabled = false;
                await db.SaveChangesAsync();

                var orderInfoModel = new OrderInfoModel
                {
                    OrderId = order.order_id.ToString(),
                    FullName = orderAddress.orderUsername,
                    Amount = order.total.HasValue ? (long)order.total.Value : 0L,
                    OrderInfo = $"Thanh toán đơn hàng #{order.order_id} qua MoMo"
                };

                System.Diagnostics.Debug.WriteLine($"OrderInfoModel: {JsonConvert.SerializeObject(orderInfoModel)}");

                Session.Remove("Discount");
                Session.Remove("Discountcode");

                var momoResponse = await new MomoService().CreatePaymentAsync(orderInfoModel);
                if (momoResponse.ErrorCode == 0 && !string.IsNullOrEmpty(momoResponse.PayUrl))
                {
                    return Json(new { success = true, redirectUrl = momoResponse.PayUrl });
                }

                return Json(new { success = false, message = $"Lỗi MoMo: {momoResponse.Message}" });
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Lỗi trong SaveOrderAndPay: {ex.Message}");
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }
    }
}