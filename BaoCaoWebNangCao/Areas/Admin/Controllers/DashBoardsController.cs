using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Data.Entity;
using DoAn_LapTrinhWeb.Model;

namespace DoAn_LapTrinhWeb.Areas.Admin.Controllers
{
    public class DashBoardsController : BaseController
    {
        private readonly DbContext db = new DbContext();

        // GET: Admin/DashBoards
        public ActionResult Index()
        {
            // Lấy tháng và năm hiện tại, tháng trước
            var currentMonth = DateTime.Now.Month;
            var currentYear = DateTime.Now.Year;
            var lastMonth = DateTime.Now.AddMonths(-1).Month;
            var lastMonthYear = DateTime.Now.AddMonths(-1).Year;

            // Các trạng thái hợp lệ
            var validStatuses = new[] { "1", "2", "3" };

            // 1. Lấy đơn hàng trong tháng hiện tại và tháng trước, chỉ tính trạng thái 1, 2, 3
            var orders = db.Orders
                .Where(o => validStatuses.Contains(o.status) &&
                            (o.order_date.HasValue &&
                             (o.order_date.Value.Month == currentMonth && o.order_date.Value.Year == currentYear ||
                              o.order_date.Value.Month == lastMonth && o.order_date.Value.Year == lastMonthYear)))
                .ToList();

            // 2. Lấy chi tiết đơn hàng trong tháng hiện tại (bao gồm Product), chỉ tính đơn hàng có trạng thái 1, 2, 3
            var orderDetails = db.Oder_Detail
                .Include(od => od.Product)
                .Where(od => db.Orders.Any(o => o.order_id == od.order_id &&
                                                validStatuses.Contains(o.status) &&
                                                o.order_date.HasValue &&
                                                o.order_date.Value.Month == currentMonth &&
                                                o.order_date.Value.Year == currentYear))
                .ToList();

            // 3. Lấy 3 chi tiết đơn hàng mới nhất (cho phần "Sản phẩm bán ra gần đây")
            var listOrderDetail = db.Oder_Detail
                .Include(od => od.Product)
                .OrderByDescending(m => m.create_at)
                .Take(3)
                .ToList();

            // 4. Lấy 7 đơn hàng mới nhất (cho phần "Đơn đặt hàng")
            var listOrder = db.Orders
                .Include(o => o.OrderAddress)
                .OrderByDescending(o => o.order_date ?? DateTime.MinValue)
                .Take(7)
                .ToList();

            // 5. Tính toán các giá trị thống kê
            // Tổng doanh thu tháng hiện tại (chỉ trạng thái 1, 2, 3)
            double totalPriceOrderThisMonth = orders
                .Where(o => o.order_date.HasValue &&
                            o.order_date.Value.Month == currentMonth &&
                            o.order_date.Value.Year == currentYear)
                .Sum(o => (double)(o.total ?? 0));

            // Tổng doanh thu tháng trước (chỉ trạng thái 1, 2, 3)
            double totalPriceOrderLastMonth = orders
                .Where(o => o.order_date.HasValue &&
                            o.order_date.Value.Month == lastMonth &&
                            o.order_date.Value.Year == lastMonthYear)
                .Sum(o => (double)(o.total ?? 0));

            // Phần trăm tăng/giảm doanh thu
            double percentPriceOrder = totalPriceOrderLastMonth != 0
                ? (totalPriceOrderThisMonth - totalPriceOrderLastMonth) / totalPriceOrderLastMonth
                : 0;

            // Tổng số đơn hàng tháng hiện tại (chỉ trạng thái 1, 2, 3)
            double totalOrderThisMonth = orders
                .Count(o => o.order_date.HasValue &&
                            o.order_date.Value.Month == currentMonth &&
                            o.order_date.Value.Year == currentYear);

            // Tổng số đơn hàng tháng trước (chỉ trạng thái 1, 2, 3)
            double totalOrderLastMonth = orders
                .Count(o => o.order_date.HasValue &&
                            o.order_date.Value.Month == lastMonth &&
                            o.order_date.Value.Year == lastMonthYear);

            // Phần trăm tăng/giảm số đơn hàng
            double percentOrder = totalOrderLastMonth != 0
                ? (totalOrderThisMonth - totalOrderLastMonth) / totalOrderLastMonth
                : 0;

            // Tính doanh thu Laptop và Phụ kiện (dựa trên chi tiết đơn hàng, chỉ trạng thái 1, 2, 3)
            double totalLaptop = orderDetails
                .Where(od => od.Product != null && od.Product.type == 1)
                .Sum(od => od.price * od.quantity);

            double totalAccessory = orderDetails
                .Where(od => od.Product != null && od.Product.type == 2)
                .Sum(od => od.price * od.quantity);

            // 6. Truyền dữ liệu vào ViewBag
            ViewBag.Order = orders;
            ViewBag.OrderDetail = orderDetails;
            ViewBag.ListOrderDetail = listOrderDetail;
            ViewBag.ListOrder = listOrder;
            ViewBag.TotalPriceOrderThisMonth = totalPriceOrderThisMonth;
            ViewBag.PercentPriceOrder = percentPriceOrder;
            ViewBag.TotalOrderThisMonth = totalOrderThisMonth;
            ViewBag.TotalOrderLastMonth = totalOrderLastMonth;
            ViewBag.PercentOrder = percentOrder;
            ViewBag.TotalLaptop = totalLaptop;
            ViewBag.TotalAccessory = totalAccessory;

            return View();
        }
    }
}