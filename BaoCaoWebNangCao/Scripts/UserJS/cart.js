/*
 * Định dạng giỏ hàng: product_{id}={quantity}
 * Ví dụ: product_1=2 (sản phẩm ID 1, số lượng 2)
 */

// Hàm tạo regex để định dạng giá tiền (thêm dấu chấm ngăn cách hàng nghìn)
function reGex() {
    return regex = /(\d)(?=(\d{3})+(?!\d))/g; // Regex để thêm dấu chấm vào số (ví dụ: 1000000 -> 1.000.000)
}

// Hàm cập nhật số lượng sản phẩm khi người dùng thay đổi giá trị trong ô input
function Update_quan_mouse_ev() {
    var id = $('.qty-input').data("id"); // Lấy ID sản phẩm từ thuộc tính data-id của ô input
    // Bỏ class no-pointer-events để nút tăng số lượng có thể hoạt động
    $(".btn-inc").removeClass('no-pointer-events');
    var quan = $('.qty-input').val(); // Lấy số lượng từ ô input
    if (quan != "") { // Nếu số lượng không rỗng
        Cookie.set("product_" + id, quan, 30); // Lưu số lượng vào cookie (hết hạn sau 30 ngày)
        updateOrderPrice(); // Cập nhật tổng giá đơn hàng
    }
}

// Gắn các sự kiện để cập nhật số lượng khi người dùng tương tác với ô input
$(".qty-input").mouseleave(function () { // Khi chuột rời khỏi ô input
    Update_quan_mouse_ev();
});
$(".qty-input").mouseover(function () { // Khi chuột di vào ô input
    Update_quan_mouse_ev();
});
$(".qty-input").change(function (ev) { // Khi giá trị ô input thay đổi
    Update_quan_mouse_ev();
});
$(".qty-input").mouseout(function (ev) { // Khi chuột rời khỏi ô input
    Update_quan_mouse_ev();
});

// Nút giảm số lượng sản phẩm
$(".btn-dec").click(function (ev) {
    $(".btn-inc").removeClass('no-pointer-events'); // Bỏ class vô hiệu hóa nút tăng số lượng
    var quanInput = $(ev.currentTarget).next(); // Lấy ô input số lượng (nằm ngay sau nút giảm)
    var id = quanInput.data("id"); // Lấy ID sản phẩm
    var price = quanInput.data("price"); // Lấy giá sản phẩm
    var quan = Number(quanInput.val()); // Lấy số lượng hiện tại
    if (quan > 1) { // Nếu số lượng lớn hơn 1
        quan = quan - 1; // Giảm số lượng đi 1
        Cookie.set("product_" + id, quan, 30); // Cập nhật số lượng vào cookie
        quanInput.val(quan); // Cập nhật số lượng trên giao diện
        updateOrderPrice(); // Cập nhật tổng giá đơn hàng
        var newTotal4 = 0;
        newTotal4 = quan * price; // Tính lại tổng giá của sản phẩm này
        newTotal4 += "";
        $('#total3-' + id).text(newTotal4.replace(regex, "$1.") + "₫"); // Cập nhật giá sản phẩm trên giao diện
    }
});

// Nút tăng số lượng sản phẩm
$(".btn-inc").click(function (ev) {
    var quanInput = $(ev.currentTarget).prev(); // Lấy ô input số lượng (nằm ngay trước nút tăng)
    var maxquan = quanInput.data("quan"); // Lấy số lượng tối đa từ thuộc tính data-quan
    var id = quanInput.data("id"); // Lấy ID sản phẩm
    var price = quanInput.data("price"); // Lấy giá sản phẩm
    var quan = Number(quanInput.val()); // Lấy số lượng hiện tại
    if (quan < 1) { // Nếu số lượng nhỏ hơn 1
        quan = 1; // Đặt số lượng tối thiểu là 1
        Cookie.set("product_" + id, quan, 30); // Cập nhật vào cookie
        quanInput.val(quan); // Cập nhật trên giao diện
        updateOrderPrice(); // Cập nhật tổng giá
    }
    else if (quan >= maxquan) { // Nếu số lượng đạt giới hạn tối đa
        $(".btn-inc").addClass('no-pointer-events'); // Vô hiệu hóa nút tăng số lượng
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });
        Toast.fire({
            icon: 'error',
            title: 'Số lượng đã đạt giới hạn'
        });
    }
    else {
        quan = quan + 1; // Tăng số lượng lên 1
        Cookie.set("product_" + id, quan, 10); // Cập nhật vào cookie (hết hạn sau 10 ngày)
        quanInput.val(quan); // Cập nhật trên giao diện
        updateOrderPrice(); // Cập nhật tổng giá
        reGex();
        var newTotal2 = 0;
        newTotal2 = quan * price; // Tính lại tổng giá của sản phẩm này
        newTotal2 += "";
        $('#total3-' + id).text(newTotal2.replace(regex, "$1.") + "₫"); // Cập nhật giá sản phẩm trên giao diện
    }
});

// Nút xóa sản phẩm khỏi giỏ hàng
$(".js-delete").click(function (ev) {
    // Hiển thị modal xác nhận xóa
    Swal.fire({
        title: 'Xác nhận xóa?',
        text: "Xóa sản phẩm khỏi giỏ hàng",
        icon: 'warning',
        showCancelButton: true,
        cancelButtonColor: '#d33',
        confirmButtonColor: '#3085d6',
        cancelButtonText: 'Hủy',
        confirmButtonText: 'Xác nhận!',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) { // Nếu người dùng xác nhận xóa
            var id = $(ev.currentTarget).data("id"); // Lấy ID sản phẩm
            var item = $(ev.currentTarget).closest(".item"); // Lấy phần tử chứa sản phẩm
            item.remove(); // Xóa sản phẩm khỏi giao diện
            Cookie.remove("product_" + id); // Xóa sản phẩm khỏi cookie
            var productCount = Cookie.countWithPrefix("product"); // Đếm số sản phẩm còn lại trong giỏ hàng
            $("#cartCount").text(productCount); // Cập nhật số lượng trên giao diện
            $(".lblCartCount").text(productCount == 0 ? "0" : productCount); // Cập nhật số lượng giỏ hàng
            $('#emty-product').attr('class', productCount == 0 ? "d-block" : "d-none"); // Hiển thị/ẩn thông báo giỏ hàng rỗng
            updateOrderPrice(); // Cập nhật tổng giá
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer);
                    toast.addEventListener('mouseleave', Swal.resumeTimer);
                }
            });
            Toast.fire({
                icon: 'success',
                title: 'Xóa thành công'
            });
        }
    });
});

// Hàm cập nhật tổng giá đơn hàng
function updateOrderPrice() {
    $(".lblCartCount").text(Cookie.countProduct()); // Cập nhật số lượng sản phẩm trong giỏ hàng
    var quanInputs = $("input.qty-input"); // Lấy tất cả các ô input số lượng
    var newTotal = 0; // Tổng giá tạm tính
    var totalWithFee; // Tổng giá bao gồm phí vận chuyển
    quanInputs.each(function (i, e) { // Duyệt qua từng ô input số lượng
        var price = Number($(e).data('price')); // Lấy giá sản phẩm
        var quan = Number($(e).val()); // Lấy số lượng
        newTotal += price * quan; // Tính tổng giá tạm tính
    });
    var eleDiscount = $("#discount"); // Lấy phần tử hiển thị giảm giá
    var discount = 0; // Giá trị giảm giá
    if (eleDiscount.attr("data-price") == null) { // Nếu không có mã giảm giá
        totalWithFee = newTotal + 30000; // Tổng giá = tạm tính + 30,000 (phí vận chuyển)
    } else {
        discount = Number(eleDiscount.attr("data-price")); // Lấy giá trị giảm giá
        // Tính tổng giá sau khi áp dụng mã giảm giá
        let tempTotalWithFee = newTotal + 30000 - discount; // Tổng giá = tạm tính + phí vận chuyển - giảm giá
        // Đảm bảo tổng tiền không nhỏ hơn 0
        totalWithFee = Math.max(0, tempTotalWithFee); // Nếu âm hoặc 0, thì trả về 0
    }
    totalWithFee += "";
    newTotal += "";
    discount += "";
    reGex();
    $(".totalPrice").text(newTotal.replace(regex, "$1.") + "₫"); // Hiển thị tổng giá tạm tính
    $(".totalPriceWithFee").text(totalWithFee.replace(regex, "$1.") + "₫"); // Hiển thị tổng giá cuối cùng
    $("#discount").text(discount.replace(regex, "$1.") + "₫"); // Hiển thị giá trị giảm giá
}

// Nút thanh toán
$(".js-checkout").click(function (ev) {
    ev.preventDefault(); // Ngăn hành vi mặc định của nút
    var count_product = Cookie.countWithPrefix("product"); // Đếm số sản phẩm trong giỏ hàng
    $.get("/Account/UserLogged", {}, // Kiểm tra người dùng đã đăng nhập chưa
        function (isLogged, textStatus, jqXHR) {
            if (!isLogged) { // Nếu chưa đăng nhập
                Swal.fire({
                    title: 'Yêu cầu đăng nhập?',
                    text: "Vui lòng đăng nhập để thực hiện được chức năng này",
                    icon: 'error',
                    showCancelButton: true,
                    cancelButtonColor: '#d33',
                    confirmButtonColor: '#3085d6',
                    cancelButtonText: 'Hủy',
                    confirmButtonText: 'Đăng nhập',
                    reverseButtons: true
                }).then((result) => {
                    if (result.isConfirmed) { // Nếu người dùng chọn đăng nhập
                        location.href = 'login'; // Chuyển hướng đến trang đăng nhập
                    }
                });
                return;
            }
            else if (count_product == 0) { // Nếu giỏ hàng rỗng
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top',
                    showConfirmButton: false,
                    timer: 1500,
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer);
                        toast.addEventListener('mouseleave', Swal.resumeTimer);
                    }
                });
                Toast.fire({
                    icon: 'error',
                    title: 'Giỏ hàng chưa có sản phẩm!'
                });
            }
            else { // Nếu đã đăng nhập và giỏ hàng có sản phẩm
                location.href = ev.currentTarget.href; // Chuyển hướng đến trang thanh toán
            }
        },
        "json"
    );
});

// Nút áp dụng mã giảm giá
$(".btn-submitcoupon").click(function (ev) {
    var input = $(ev.currentTarget).prev(); // Lấy ô input mã giảm giá
    var _code = input.val().trim(); // Lấy mã giảm giá và loại bỏ khoảng trắng
    if (_code.length) { // Nếu mã giảm giá không rỗng
        $.getJSON("/cart/UseDiscountCode", { code: _code }, // Gửi yêu cầu kiểm tra mã giảm giá
            function (data, textStatus, jqXHR) {
                if (data.success) { // Nếu mã giảm giá hợp lệ
                    $("#discount").attr("data-price", data.discountPrice); // Lưu giá trị giảm giá
                    $("#discount").attr("class", 'text-success'); // Thay đổi giao diện
                    updateOrderPrice(); // Cập nhật tổng giá
                    const Toast = Swal.mixin({
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 2500,
                        didOpen: (toast) => {
                            toast.addEventListener('mouseenter', Swal.stopTimer);
                            toast.addEventListener('mouseleave', Swal.resumeTimer);
                        }
                    });
                    Toast.fire({
                        icon: 'success',
                        title: 'Mã giảm giá đã được áp dụng thành công!'
                    });
                } else { // Nếu mã giảm giá không hợp lệ
                    const Toast = Swal.mixin({
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 2500,
                        didOpen: (toast) => {
                            toast.addEventListener('mouseenter', Swal.stopTimer);
                            toast.addEventListener('mouseleave', Swal.resumeTimer);
                        }
                    });
                    Toast.fire({
                        icon: 'error',
                        title: 'Lỗi! Vui lòng kiểm tra lại'
                    });
                }
            }
        );
    }
});