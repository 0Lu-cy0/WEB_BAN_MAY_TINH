using DoAn_LapTrinhWeb.Common;
using DoAn_LapTrinhWeb.Common.Helpers;
using DoAn_LapTrinhWeb.Model;
using DoAn_LapTrinhWeb.Models;
using Newtonsoft.Json;
using PagedList;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Helpers;
using System.Web.Hosting;
using System.Web.Mvc;
using System.Web.Security;

namespace DoAn_LapTrinhWeb.Controllers
{
    public class AccountController : Controller
    {
        private DbContext db = new DbContext();

        // View đăng nhập
        public ActionResult Login(string returnUrl)
        {
            if (String.IsNullOrEmpty(returnUrl) && Request.UrlReferrer != null && Request.UrlReferrer.ToString().Length > 0)
            {
                return RedirectToAction("Login", new { returnUrl = Request.UrlReferrer.ToString() });
            }
            if (User.Identity.IsAuthenticated)
            {
                return RedirectToAction("Index", "Home");
            }
            return View();
        }

        // Code xử lý đăng nhập
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Login(LoginViewModels model, string returnUrl)
        {
            try
            {
                model.Password = Crypto.Hash(model.Password);
                Account account = db.Accounts.FirstOrDefault(m => m.Email == model.Email && m.password == model.Password && m.status == "1");
                if (account != null)
                {
                    LoggedUserData userData = new LoggedUserData
                    {
                        UserId = account.account_id,
                        Name = account.Name,
                        Email = account.Email,
                        RoleCode = account.Role,
                        Avatar = account.Avatar
                    };
                    Notification.setNotification1_5s("Đăng nhập thành công", "success");
                    FormsAuthentication.SetAuthCookie(JsonConvert.SerializeObject(userData), false);
                    if (!String.IsNullOrEmpty(returnUrl))
                        return Redirect(returnUrl);
                    else
                        return RedirectToAction("Index", "Home");
                }
                Notification.setNotification3s("Email, mật khẩu không đúng, hoặc tài khoản bị vô hiệu hóa", "error");
                return View(model);
            }
            catch (Exception ex)
            {
                Notification.setNotification3s("Lỗi khi đăng nhập", "error");
                System.IO.File.WriteAllText(Server.MapPath("~/error.log"), ex.ToString());
                return View(model);
            }
        }

        // Đăng xuất tài khoản
        public ActionResult Logout(string returnUrl)
        {
            try
            {
                if (String.IsNullOrEmpty(returnUrl) && Request.UrlReferrer != null && Request.UrlReferrer.ToString().Length > 0)
                {
                    return RedirectToAction("Logout", new { returnUrl = Request.UrlReferrer.ToString() });
                }
                FormsAuthentication.SignOut();
                Notification.setNotification1_5s("Đăng xuất thành công", "success");
                if (!String.IsNullOrEmpty(returnUrl))
                    return Redirect(returnUrl);
                else
                    return RedirectToAction("Index", "Home");
            }
            catch (Exception ex)
            {
                Notification.setNotification3s("Lỗi khi đăng xuất", "error");
                System.IO.File.WriteAllText(Server.MapPath("~/error.log"), ex.ToString());
                return RedirectToAction("Index", "Home");
            }
        }

        // View đăng ký
        public ActionResult Register()
        {
            if (User.Identity.IsAuthenticated)
            {
                return RedirectToAction("Index", "Home");
            }
            ViewBag.Fail = string.Empty;
            return View();
        }

        // Code xử lý đăng ký
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Register(RegisterViewModels model, Account account)
        {
            try
            {
                string fail = "";
                string success = "";
                var checkemail = db.Accounts.Any(m => m.Email == model.Email);
                if (checkemail)
                {
                    fail = "Email đã được sử dụng";
                    ViewBag.Fail = fail;
                    return View();
                }
                account.Role = Const.ROLE_MEMBER_CODE;
                account.status = "1";
                account.Role = 1;
                account.Email = model.Email;
                account.create_by = model.Email;
                account.update_by = model.Email;
                account.Name = model.Name;
                account.Phone = model.PhoneNumber;
                account.update_at = DateTime.Now;
                account.Avatar = "/Content/Images/logo/icon.png";
                db.Configuration.ValidateOnSaveEnabled = false;
                account.password = Crypto.Hash(model.Password);
                account.create_at = DateTime.Now;
                db.Accounts.Add(account);
                db.SaveChanges();
                success = "<script>alert('Đăng ký thành công');</script>";
                ViewBag.Success = success;
                ViewBag.Fail = fail;
                return RedirectToAction("Login", "Account");
            }
            catch (Exception ex)
            {
                Notification.setNotification3s("Lỗi khi đăng ký", "error");
                System.IO.File.WriteAllText(Server.MapPath("~/error.log"), ex.ToString());
                return View();
            }
        }

        // View quên mật khẩu
        public ActionResult ForgotPassword()
        {
            if (User.Identity.IsAuthenticated)
            {
                return RedirectToAction("Index", "Home");
            }
            return View();
        }

        // Code xử lý quên mật khẩu
        [HttpPost]
        public ActionResult ForgotPassword(ForgotPasswordViewModels model)
        {
            try
            {
                Account account = db.Accounts.Where(m => m.Email == model.Email).FirstOrDefault();
                if (account != null)
                {
                    string resetCode = Guid.NewGuid().ToString();
                    SendVerificationLinkEmail(account.Email, resetCode);
                    account.Requestcode = resetCode;
                    db.Configuration.ValidateOnSaveEnabled = false;
                    db.SaveChanges();
                    Notification.setNotification5s("Đường dẫn reset password đã được gửi, vui lòng kiểm tra email", "success");
                }
                else
                {
                    Notification.setNotification1_5s("Email chưa tồn tại trong hệ thống", "error");
                }
                return View(model);
            }
            catch (Exception ex)
            {
                Notification.setNotification3s("Lỗi khi gửi yêu cầu reset mật khẩu", "error");
                System.IO.File.WriteAllText(Server.MapPath("~/error.log"), ex.ToString());
                return View(model);
            }
        }

        // View cập nhật mật khẩu
        public ActionResult Resetpassword(string id)
        {
            try
            {
                var user = db.Accounts.Where(a => a.Requestcode == id).FirstOrDefault();
                if (user != null && !User.Identity.IsAuthenticated)
                {
                    ResetPasswordViewModels model = new ResetPasswordViewModels();
                    model.ResetCode = id;
                    return View(model);
                }
                else
                {
                    return RedirectToAction("Index", "Home");
                }
            }
            catch (Exception ex)
            {
                Notification.setNotification3s("Lỗi khi tải trang reset mật khẩu", "error");
                System.IO.File.WriteAllText(Server.MapPath("~/error.log"), ex.ToString());
                return RedirectToAction("Index", "Home");
            }
        }

        // Code xử lý cập nhật mật khẩu
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult ResetPassword(ResetPasswordViewModels model)
        {
            try
            {
                var user = db.Accounts.Where(m => m.Requestcode == model.ResetCode).FirstOrDefault();
                if (user != null)
                {
                    user.password = Crypto.Hash(model.NewPassword);
                    user.Requestcode = "";
                    user.update_by = user.Email;
                    user.update_at = DateTime.Now;
                    user.status = "1";
                    db.Configuration.ValidateOnSaveEnabled = false;
                    db.SaveChanges();
                    Notification.setNotification1_5s("Cập nhật mật khẩu thành công", "success");
                    return RedirectToAction("Login");
                }
                Notification.setNotification3s("Mã reset không hợp lệ", "error");
                return View(model);
            }
            catch (Exception ex)
            {
                Notification.setNotification3s("Lỗi khi cập nhật mật khẩu", "error");
                System.IO.File.WriteAllText(Server.MapPath("~/error.log"), ex.ToString());
                return View(model);
            }
        }

        // Gửi Email quên mật khẩu
        [NonAction]
        public void SendVerificationLinkEmail(string emailID, string activationCode)
        {
            try
            {
                var verifyUrl = "/Account/ResetPassword/" + activationCode;
                var link = Request.Url.AbsoluteUri.Replace(Request.Url.PathAndQuery, verifyUrl);
                var fromEmail = new MailAddress(EmailConfig.emailID, EmailConfig.emailName);
                var toEmail = new MailAddress(emailID);
                var fromEmailPassword = EmailConfig.emailPassword;
                string body = System.IO.File.ReadAllText(HostingEnvironment.MapPath("~/EmailTemplate/") + "ResetPassword" + ".cshtml");
                string subject = "Cập nhật mật khẩu mới";
                body = body.Replace("{{viewBag.Confirmlink}}", link);
                var smtp = new SmtpClient
                {
                    Host = EmailConfig.emailHost,
                    Port = 587,
                    EnableSsl = true,
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    UseDefaultCredentials = false,
                    Credentials = new NetworkCredential(fromEmail.Address, fromEmailPassword)
                };

                using (var message = new MailMessage(fromEmail, toEmail)
                {
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                })
                    smtp.Send(message);
            }
            catch (Exception ex)
            {
                System.IO.File.WriteAllText(Server.MapPath("~/error.log"), ex.ToString());
            }
        }

        // View cập nhật thông tin cá nhân
        [Authorize]
        public ActionResult Editprofile()
        {
            try
            {
                var userId = User.Identity.GetUserId();
                var user = db.Accounts.Where(u => u.account_id == userId).FirstOrDefault();
                if (user != null)
                {
                    return View(user);
                }
                return View();
            }
            catch (Exception ex)
            {
                Notification.setNotification3s("Lỗi khi tải thông tin cá nhân", "error");
                System.IO.File.WriteAllText(Server.MapPath("~/error.log"), ex.ToString());
                return RedirectToAction("Index", "Home");
            }
        }

        // Code xử lý cập nhật thông tin cá nhân
        [Authorize]
        public JsonResult UpdateProfile(string userName, string phoneNumber)
        {
            try
            {
                bool result = false;
                var userId = User.Identity.GetUserId();
                var account = db.Accounts.Where(m => m.account_id == userId).FirstOrDefault();
                if (account != null)
                {
                    account.account_id = userId;
                    account.Name = userName;
                    account.Phone = phoneNumber;
                    account.update_by = userId.ToString();
                    account.update_at = DateTime.Now;
                    db.Configuration.ValidateOnSaveEnabled = false;
                    db.SaveChanges();
                    result = true;
                    return Json(result, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(result, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                System.IO.File.WriteAllText(Server.MapPath("~/error.log"), ex.ToString());
                return Json(false, JsonRequestBehavior.AllowGet);
            }
        }

        // Cập nhật ảnh đại diện
        public JsonResult UpdateAvatar()
        {
            try
            {
                var userId = User.Identity.GetUserId();
                var account = db.Accounts.Where(m => m.account_id == userId).FirstOrDefault();
                HttpPostedFileBase file = Request.Files[0];
                if (file != null)
                {
                    var fileName = Path.GetFileNameWithoutExtension(file.FileName);
                    var extension = Path.GetExtension(file.FileName);
                    fileName = fileName + extension;
                    account.Avatar = "/Content/Images/" + fileName;
                    file.SaveAs(Path.Combine(Server.MapPath("~/Content/Images/"), fileName));
                    db.Configuration.ValidateOnSaveEnabled = false;
                    account.update_at = DateTime.Now;
                    db.SaveChanges();
                }
                return Json(true, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                System.IO.File.WriteAllText(Server.MapPath("~/error.log"), ex.ToString());
                return Json(false, JsonRequestBehavior.AllowGet);
            }
        }

        // View thay đổi mật khẩu
        public ActionResult ChangePassword()
        {
            if (!User.Identity.IsAuthenticated)
            {
                return RedirectToAction("Index", "Home");
            }
            return View();
        }

        // Code xử lý Thay đổi mật khẩu
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult ChangePassword(ChangePasswordViewModels model)
        {
            try
            {
                if (User.Identity.IsAuthenticated)
                {
                    int userID = User.Identity.GetUserId();
                    model.NewPassword = Crypto.Hash(model.NewPassword);
                    Account account = db.Accounts.FirstOrDefault(m => m.account_id == userID);
                    if (model.NewPassword == account.password)
                    {
                        Notification.setNotification3s("Mật khẩu mới và cũ không được trùng!", "error");
                        return View(model);
                    }
                    account.update_at = DateTime.Now;
                    account.update_by = User.Identity.GetEmail();
                    account.password = model.NewPassword;
                    db.Configuration.ValidateOnSaveEnabled = false;
                    db.Entry(account).State = EntityState.Modified;
                    db.SaveChanges();
                    Notification.setNotification3s("Đổi mật khẩu thành công", "success");
                    return RedirectToAction("ChangePassword", "Account");
                }
                return View(model);
            }
            catch (Exception ex)
            {
                Notification.setNotification3s("Lỗi khi đổi mật khẩu", "error");
                System.IO.File.WriteAllText(Server.MapPath("~/error.log"), ex.ToString());
                return View(model);
            }
        }

        // Quản lý sổ địa chỉ
        public ActionResult Address()
        {
            try
            {
                if (User.Identity.IsAuthenticated)
                {
                    int userID = User.Identity.GetUserId();
                    var address = db.AccountAddresses.Where(m => m.account_id == userID).ToList();
                    ViewBag.Check_address = db.AccountAddresses.Where(m => m.account_id == userID).Count();
                    ViewBag.ProvincesList = db.Provinces.OrderBy(m => m.province_name).ToList();
                    ViewBag.DistrictsList = db.Districts.OrderBy(m => m.type).ThenBy(m => m.district_name).ToList();
                    ViewBag.WardsList = db.Wards.OrderBy(m => m.type).ThenBy(m => m.ward_name).ToList();
                    return View(address);
                }
                return RedirectToAction("Index", "Home");
            }
            catch (Exception ex)
            {
                Notification.setNotification3s("Lỗi khi tải danh sách địa chỉ", "error");
                System.IO.File.WriteAllText(Server.MapPath("~/error.log"), ex.ToString());
                return RedirectToAction("Index", "Home");
            }
        }

        // Thêm mới địa chỉ 
        public ActionResult AddressCreate(AccountAddress address)
        {
            try
            {
                bool result = false;
                var userid = User.Identity.GetUserId();
                var checkdefault = db.AccountAddresses.Where(m => m.account_id == userid).ToList();
                var limit_address = db.AccountAddresses.Where(m => m.account_id == userid).ToList();
                if (limit_address.Count() == 4)
                {
                    Notification.setNotification3s("Đã đạt giới hạn 4 địa chỉ", "error");
                    return Json(result, JsonRequestBehavior.AllowGet);
                }
                foreach (var item in checkdefault)
                {
                    if (item.isDefault && address.isDefault)
                    {
                        item.isDefault = false;
                        db.SaveChanges();
                    }
                }
                address.account_id = userid;
                db.AccountAddresses.Add(address);
                db.SaveChanges();
                result = true;
                Notification.setNotification1_5s("Thêm địa chỉ thành công", "success");
                return Json(result, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                Notification.setNotification3s("Lỗi khi thêm địa chỉ", "error");
                System.IO.File.WriteAllText(Server.MapPath("~/error.log"), ex.ToString());
                return Json(false, JsonRequestBehavior.AllowGet);
            }
        }

        // Sửa địa chỉ
        [HttpPost]
        public JsonResult AddressEdit(int id, string username, string phonenumber, int province_id, int district_id, int ward_id, string address_content)
        {
            try
            {
                var address = db.AccountAddresses.FirstOrDefault(m => m.account_address_id == id);
                bool result;
                if (address != null)
                {
                    address.province_id = province_id;
                    address.accountUsername = username;
                    address.accountPhoneNumber = phonenumber;
                    address.district_id = district_id;
                    address.ward_id = ward_id;
                    address.content = address_content;
                    address.account_id = User.Identity.GetUserId();
                    db.SaveChanges();
                    result = true;
                    Notification.setNotification1_5s("Cập nhật địa chỉ thành công", "success");
                }
                else
                {
                    result = false;
                    Notification.setNotification3s("Không tìm thấy địa chỉ", "error");
                }
                return Json(result, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                Notification.setNotification3s("Lỗi khi cập nhật địa chỉ", "error");
                System.IO.File.WriteAllText(Server.MapPath("~/error.log"), ex.ToString());
                return Json(false, JsonRequestBehavior.AllowGet);
            }
        }

        // Thay đổi địa chỉ mặc định
        public JsonResult DefaultAddress(int id)
        {
            try
            {
                bool result = false;
                var userid = User.Identity.GetUserId();
                var address = db.AccountAddresses.FirstOrDefault(m => m.account_address_id == id);
                var checkdefault = db.AccountAddresses.ToList();
                if (User.Identity.IsAuthenticated && !address.isDefault)
                {
                    foreach (var item in checkdefault)
                    {
                        if (item.isDefault && item.account_id == userid)
                        {
                            item.isDefault = false;
                            db.SaveChanges();
                        }
                    }
                    address.isDefault = true;
                    db.SaveChanges();
                    result = true;
                    Notification.setNotification1_5s("Đặt địa chỉ mặc định thành công", "success");
                    return Json(result, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    Notification.setNotification3s("Không thể đặt địa chỉ mặc định", "error");
                    return Json(result, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                Notification.setNotification3s("Lỗi khi đặt địa chỉ mặc định", "error");
                System.IO.File.WriteAllText(Server.MapPath("~/error.log"), ex.ToString());
                return Json(false, JsonRequestBehavior.AllowGet);
            }
        }

        // Xóa địa chỉ
        [HttpPost]
        public JsonResult AddressDelete(int id)
        {
            try
            {
                var address = db.AccountAddresses.FirstOrDefault(m => m.account_address_id == id);
                bool result = false;
                if (address != null)
                {
                    db.AccountAddresses.Remove(address);
                    db.SaveChanges();
                    result = true;
                    Notification.setNotification1_5s("Xóa địa chỉ thành công", "success");
                }
                else
                {
                    Notification.setNotification3s("Không tìm thấy địa chỉ", "error");
                }
                return Json(result, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                Notification.setNotification3s("Lỗi khi xóa địa chỉ", "error");
                System.IO.File.WriteAllText(Server.MapPath("~/error.log"), ex.ToString());
                return Json(false, JsonRequestBehavior.AllowGet);
            }
        }

        // Lấy danh sách quận huyện
        public JsonResult GetDistrictsList(int province_id)
        {
            try
            {
                db.Configuration.ProxyCreationEnabled = false;
                List<Districts> districtslist = db.Districts.Where(m => m.province_id == province_id).OrderBy(m => m.type).ThenBy(m => m.district_name).ToList();
                return Json(districtslist, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                System.IO.File.WriteAllText(Server.MapPath("~/error.log"), ex.ToString());
                return Json(new List<Districts>(), JsonRequestBehavior.AllowGet);
            }
        }

        // Lấy danh sách phường xã
        public JsonResult GetWardsList(int district_id)
        {
            try
            {
                db.Configuration.ProxyCreationEnabled = false;
                List<Wards> wardslist = db.Wards.Where(m => m.district_id == district_id).OrderBy(m => m.type).ThenBy(m => m.ward_name).ToList();
                return Json(wardslist, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                System.IO.File.WriteAllText(Server.MapPath("~/error.log"), ex.ToString());
                return Json(new List<Wards>(), JsonRequestBehavior.AllowGet);
            }
        }

        // Lịch sử mua hàng
        public ActionResult TrackingOrder(int? page, string status = null, string orderId = null)
        {
            try
            {
                if (!User.Identity.IsAuthenticated)
                {
                    return RedirectToAction("Index", "Home");
                }
                var userId = User.Identity.GetUserId();
                if (userId == 0)
                {
                    Notification.setNotification3s("Không thể xác định người dùng", "error");
                    return RedirectToAction("Index", "Home");
                }
                return View("TrackingOrder", GetOrder(page, status, orderId));
            }
            catch (Exception ex)
            {
                Notification.setNotification3s("Đã xảy ra lỗi khi tải lịch sử mua hàng", "error");
                System.IO.File.WriteAllText(Server.MapPath("~/error.log"), ex.ToString());
                return RedirectToAction("Index", "Home");
            }
        }

        // Chi tiết đơn hàng đã mua
        public ActionResult TrackingOrderDetail(int id)
        {
            try
            {
                if (!User.Identity.IsAuthenticated)
                {
                    return RedirectToAction("Index", "Home");
                }
                var userId = User.Identity.GetUserId();
                var order = db.Orders.FirstOrDefault(o => o.order_id == id && o.account_id == userId);
                if (order == null)
                {
                    Notification.setNotification3s("Không tìm thấy đơn hàng", "error");
                    return RedirectToAction("TrackingOrder");
                }
                List<Oder_Detail> orderDetails = db.Oder_Detail.Where(m => m.order_id == id).ToList();
                ViewBag.Order = order;
                ViewBag.OrderID = id;
                return View(orderDetails);
            }
            catch (Exception ex)
            {
                Notification.setNotification3s("Lỗi khi tải chi tiết đơn hàng", "error");
                System.IO.File.WriteAllText(Server.MapPath("~/error.log"), ex.ToString());
                return RedirectToAction("TrackingOrder");
            }
        }

        // Hủy đơn hàng
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult CancelOrder(int id)
        {
            try
            {
                var userId = User.Identity.GetUserId();
                var order = db.Orders.FirstOrDefault(o => o.order_id == id && o.account_id == userId && o.status == "1");
                if (order == null)
                {
                    Notification.setNotification3s("Không tìm thấy đơn hàng hoặc không thể hủy", "error");
                    return RedirectToAction("TrackingOrder");
                }
                order.status = "0";
                order.update_at = DateTime.Now;
                order.update_by = User.Identity.GetEmail();
                db.SaveChanges();
                Notification.setNotification1_5s("Hủy đơn hàng thành công", "success");
                return RedirectToAction("TrackingOrder");
            }
            catch (Exception ex)
            {
                Notification.setNotification3s("Lỗi khi hủy đơn hàng", "error");
                System.IO.File.WriteAllText(Server.MapPath("~/error.log"), ex.ToString());
                return RedirectToAction("TrackingOrder");
            }
        }

        // Mua lại đơn hàng
        [HttpGet]
        public ActionResult ReOrder(int id)
        {
            try
            {
                var userId = User.Identity.GetUserId();
                var order = db.Orders.Include(o => o.Oder_Detail).FirstOrDefault(o => o.order_id == id && o.account_id == userId);
                if (order == null)
                {
                    Notification.setNotification3s("Không tìm thấy đơn hàng", "error");
                    return RedirectToAction("TrackingOrder");
                }

                int successCount = 0;
                foreach (var detail in order.Oder_Detail)
                {
                    var product = db.Products.SingleOrDefault(p => p.product_id == detail.product_id && p.status == "1");
                    if (product != null && Convert.ToInt32(product.quantity) >= detail.quantity)
                    {
                        AddToCart(detail.product_id, detail.quantity);
                        successCount++;
                    }
                }

                if (successCount == order.Oder_Detail.Count)
                {
                    Notification.setNotification1_5s("Đã thêm tất cả sản phẩm vào giỏ hàng", "success");
                }
                else if (successCount > 0)
                {
                    Notification.setNotification3s($"Đã thêm {successCount}/{order.Oder_Detail.Count} sản phẩm vào giỏ hàng. Một số sản phẩm không khả dụng.", "warning");
                }
                else
                {
                    Notification.setNotification3s("Không thể thêm sản phẩm nào vào giỏ hàng do hết hàng hoặc không khả dụng", "error");
                }
                return RedirectToAction("ViewCart", "Cart");
            }
            catch (Exception ex)
            {
                Notification.setNotification3s("Lỗi khi mua lại đơn hàng", "error");
                System.IO.File.WriteAllText(Server.MapPath("~/error.log"), ex.ToString());
                return RedirectToAction("TrackingOrder");
            }
        }

        // Lấy danh sách đơn hàng
        private IPagedList GetOrder(int? page, string status, string orderId)
        {
            try
            {
                var userId = User.Identity.GetUserId();
                if (userId == 0)
                {
                    return new List<Order>().ToPagedList(1, 10);
                }
                int pageSize = 10;
                int pageNumber = (page ?? 1);
                var orders = db.Orders.Include(o => o.Oder_Detail).Where(m => m.account_id == userId);

                if (!string.IsNullOrEmpty(status))
                {
                    orders = orders.Where(o => o.status == status);
                }

                if (!string.IsNullOrEmpty(orderId) && int.TryParse(orderId, out int id))
                {
                    orders = orders.Where(o => o.order_id == id);
                }

                var list = orders.OrderByDescending(m => m.order_id).ToPagedList(pageNumber, pageSize);
                return list;
            }
            catch (Exception ex)
            {
                System.IO.File.WriteAllText(Server.MapPath("~/error.log"), ex.ToString());
                return new List<Order>().ToPagedList(1, 10);
            }
        }

        // Thêm sản phẩm vào giỏ hàng
        private void AddToCart(int productId, int quantity)
        {
            try
            {
                var product = db.Products.SingleOrDefault(p => p.product_id == productId && p.status == "1");
                if (product == null || Convert.ToInt32(product.quantity) < quantity)
                {
                    Notification.setNotification3s($"Sản phẩm {product?.product_name ?? "này"} không khả dụng hoặc không đủ hàng", "error");
                    return;
                }

                string cookieName = $"product_{productId}";
                var cookie = Request.Cookies[cookieName];
                int currentQuantity = cookie != null && !string.IsNullOrEmpty(cookie.Value) ? Convert.ToInt32(cookie.Value) : 0;

                int newQuantity = currentQuantity + quantity;
                if (newQuantity > Convert.ToInt32(product.quantity))
                {
                    Notification.setNotification3s($"Số lượng yêu cầu vượt quá tồn kho của sản phẩm {product.product_name}", "error");
                    return;
                }

                HttpCookie productCookie = new HttpCookie(cookieName)
                {
                    Value = newQuantity.ToString(),
                    Expires = DateTime.Now.AddDays(10)
                };
                Response.Cookies.Add(productCookie);
            }
            catch (Exception ex)
            {
                Notification.setNotification3s("Lỗi khi thêm sản phẩm vào giỏ hàng", "error");
                System.IO.File.WriteAllText(Server.MapPath("~/error.log"), ex.ToString());
            }
        }

        // Thêm địa chỉ
        public ActionResult AddAddress()
        {
            try
            {
                if (User.Identity.IsAuthenticated)
                {
                    return View();
                }
                return RedirectToAction("Index", "Home");
            }
            catch (Exception ex)
            {
                Notification.setNotification3s("Lỗi khi tải trang thêm địa chỉ", "error");
                System.IO.File.WriteAllText(Server.MapPath("~/error.log"), ex.ToString());
                return RedirectToAction("Index", "Home");
            }
        }

        // Kiểm tra trạng thái đăng nhập
        public ActionResult UserLogged()
        {
            try
            {
                return Json(User.Identity.IsAuthenticated, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                System.IO.File.WriteAllText(Server.MapPath("~/error.log"), ex.ToString());
                return Json(false, JsonRequestBehavior.AllowGet);
            }
        }
    }
}