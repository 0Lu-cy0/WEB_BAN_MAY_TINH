// Khởi tạo khi trang tải xong
$(document).ready(function () {
    // Xóa các dropdown nice-select để tránh xung đột giao diện
    var myobj = $('.nice-select');
    myobj.remove();
});

// Xử lý tải danh sách quận/huyện và phường/xã khi chọn tỉnh/thành phố
$(document).ready(function () {
    // Khi chọn tỉnh/thành phố, tải danh sách quận/huyện
    $('#province').change(function () {
        // Bỏ class vô hiệu hóa và thuộc tính disabled của dropdown quận/huyện
        $('#district').removeClass('cursor-disable');
        $('#district').removeAttr('disabled');
        // Gửi yêu cầu AJAX để lấy danh sách quận/huyện
        $.get("/Account/GetDistrictsList", { province_id: $('#province').val() }, function (data) {
            // Xóa nội dung cũ và thêm option mặc định
            $('#district').html("<option value>Quận/ Huyện</option>");
            // Duyệt qua dữ liệu trả về và thêm từng quận/huyện vào dropdown
            $.each(data, function (index, row) {
                $('#district').append("<option value='" + row.district_id + "'>" + row.type + " " + row.district_name + "</option>");
            });
        });
    });

    // Khi chọn quận/huyện, tải danh sách phường/xã
    $('#district').change(function () {
        // Bỏ class vô hiệu hóa và thuộc tính disabled của dropdown phường/xã
        $('#ward').removeClass('cursor-disable');
        $('#ward').removeAttr('disabled');
        // Gửi yêu cầu AJAX để lấy danh sách phường/xã
        $.get("/Account/GetWardsList", { district_id: $('#district').val() }, function (data) {
            // Xóa nội dung cũ và thêm option mặc định
            $('#ward').html("<option value>Phường/ Xã</option>");
            // Duyệt qua dữ liệu trả về và thêm từng phường/xã vào dropdown
            $.each(data, function (index, row) {
                $('#ward').append("<option value='" + row.ward_id + "'>" + row.type + " " + row.ward_name + "</option>");
            });
        });
    });
});

// Hiển thị modal để thêm địa chỉ mới
var createmodaladd = $('#ModalOrderAddCreate'); // Khởi tạo modal thêm địa chỉ

$('#popupcreateaddress').click(function () {
    // Hiển thị modal khi click nút thêm địa chỉ
    createmodaladd.modal('show');
});

$('#closemodal3').click(function () {
    // Đóng modal khi click nút đóng
    createmodaladd.modal('hide');
});

// Hàm lưu địa chỉ mới vào database
var SaveAddressOrder = function () {
    // Lấy các giá trị từ form
    var username = $("#address_name").val(); // Họ tên
    var phonenumber = $("#address_phone").val(); // Số điện thoại
    var province = $("#province").val(); // ID tỉnh/thành phố
    var province_name = $("#province :selected").text(); // Tên tỉnh/thành phố
    var disctric = $("#district").val(); // ID quận/huyện
    var disctric_name = $("#district :selected").text(); // Tên quận/huyện
    var address = $("#address_content").val(); // Địa chỉ cụ thể
    var ward = $("#ward").val(); // ID phường/xã
    var ward_name = $("#ward :selected").text(); // Tên phường/xã

    // Kiểm tra nếu có trường nào trống
    if (username == "" || phonenumber == "" || province == "" || disctric == "" || ward == "" || address == "") {
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
            icon: 'warning',
            title: 'Nhập thông tin còn thiếu'
        });
        return false;
    }
    // Kiểm tra số điện thoại phải đúng 10 chữ số
    else if (phonenumber.length < 10 || phonenumber.length > 10) {
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
            icon: 'warning',
            title: 'Số điện thoại phải đúng 10 chữ số'
        });
        return false;
    }
    // Kiểm tra họ tên không quá 20 ký tự
    else if (username.length > 20) {
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
            icon: 'warning',
            title: 'Họ tên không quá 20 ký tự'
        });
        return false;
    }
    // Kiểm tra địa chỉ cụ thể không quá 50 ký tự
    else if (address.length > 50) {
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
            icon: 'warning',
            title: 'Địa chỉ cụ thể không quá 50 ký tự'
        });
        return false;
    }
    else {
        // Serialize form và gửi yêu cầu AJAX để lưu địa chỉ
        var data = $("#create_address__order").serialize();
        $.ajax({
            type: "POST",
            url: "/Account/AddressCreate", // Gửi đến action AddressCreate trong controller Account
            data: data,
            success: function (result) {
                // Ẩn modal sau khi lưu
                createmodaladd.modal('hide');
                if (result == true) { // Nếu lưu thành công
                    // Cập nhật thông tin địa chỉ vào giao diện
                    $(".order_address_name").attr("value", username); // Cập nhật họ tên
                    $(".order_address_phone").attr("value", phonenumber); // Cập nhật số điện thoại
                    $(".ck_address_province").attr("value", province_name); // Cập nhật tên tỉnh/thành phố
                    $(".ck_address_district").attr("value", disctric_name); // Cập nhật tên quận/huyện
                    $(".ck_address_ward").attr("value", ward_name); // Cập nhật tên phường/xã
                    $(".ck_address_content").attr("value", address); // Cập nhật địa chỉ cụ thể

                    // Kích hoạt nút đặt hàng
                    $(".btn_submit_order").attr("id", "submit_order");
                    $(".btn_submit_order").addClass("order_now");
                    $(".btn_submit_order").attr("type", "submit");
                    $(".message_order").text("(Đặt hàng để xác nhận thanh toán)"); // Cập nhật thông báo
                    $(".btn_submit_order").removeAttr("disabled"); // Bỏ thuộc tính vô hiệu hóa
                    $(".create_order_address").removeAttr("hidden"); // Hiển thị phần địa chỉ
                    $(".order_now").removeClass("btn_submit_order"); // Thay đổi class
                    $(".ck_notexist_address").remove(); // Xóa thông báo không có địa chỉ
                    // Hiển thị địa chỉ đầy đủ
                    $(".order_address").text(address + ", " + ward_name + ", " + disctric_name + ", " + province_name);

                    // Hiển thị thông báo thành công
                    const Toast = Swal.mixin({
                        toast: true,
                        position: 'top',
                        showConfirmButton: false,
                        timer: 2000,
                        didOpen: (toast) => {
                            toast.addEventListener('mouseenter', Swal.stopTimer);
                            toast.addEventListener('mouseleave', Swal.resumeTimer);
                        }
                    });
                    Toast.fire({
                        icon: 'success',
                        title: 'Thêm địa chỉ thành công'
                    });
                }
                else { // Nếu lưu thất bại
                    const Toast = Swal.mixin({
                        toast: true,
                        position: 'top',
                        showConfirmButton: false,
                        timer: 1000,
                        didOpen: (toast) => {
                            toast.addEventListener('mouseenter', Swal.stopTimer);
                            toast.addEventListener('mouseleave', Swal.resumeTimer);
                        }
                    });
                    Toast.fire({
                        icon: 'error',
                        title: 'Lỗi'
                    });
                }
            }
        });
    }
};

// Đổi địa chỉ nhận hàng
var change_od_add = $("#ckchangeaddress"); // Khởi tạo modal đổi địa chỉ

$('#op_ckchangeaddress').click(function () {
    // Hiển thị modal khi click nút đổi địa chỉ
    change_od_add.modal('show');
});

$('.close_modal').click(function () {
    // Đóng modal khi click nút đóng
    change_od_add.modal('hide');
});

// Hàm xác nhận đổi địa chỉ nhận hàng
var Change_order_address_confirm = function () {
    // Serialize form và gửi yêu cầu AJAX để đổi địa chỉ
    var data = $("#change_order__address").serialize();
    $.ajax({
        type: "POST",
        url: "/Cart/ChangeAdressOrder", // Gửi đến action ChangeAdressOrder trong controller Cart
        data: data,
        success: function (result) {
            // Ẩn modal
            change_od_add.modal('hide');
            if (result == true) { // Nếu đổi địa chỉ thành công
                var _username_order, _phonenumber_order, _address_content_order;
                // Lấy thông tin địa chỉ được chọn từ radio button
                $('input[name="account_address_id"]:radio:checked').each(function () {
                    _username_order = $(this).parent().find('.get_acc_username').text(); // Họ tên
                    _phonenumber_order = $(this).parent().find('.get_acc_phone_num').text(); // Số điện thoại
                    _address = $(this).parent().find('.get_address').text(); // Địa chỉ đầy đủ
                    _address_province = $(this).parent().find('.get_address_province').text(); // Tên tỉnh/thành phố
                    _address_district = $(this).parent().find('.get_address_district').text(); // Tên quận/huyện
                    _address_ward = $(this).parent().find('.get_address_ward').text(); // Tên phường/xã
                    _address_content = $(this).parent().find('.get_address_content').text(); // Địa chỉ cụ thể
                });

                // Cập nhật giao diện với địa chỉ mới
                $(".ck_address").text(_address); // Hiển thị địa chỉ đầy đủ
                $(".ck_username").val(_username_order); // Cập nhật họ tên
                $(".ck_phone_num").val(_phonenumber_order); // Cập nhật số điện thoại
                $(".ck_address_province").val(_address_province); // Cập nhật tên tỉnh/thành phố
                $(".ck_address_district").val(_address_district); // Cập nhật tên quận/huyện
                $(".ck_address_ward").val(_address_ward); // Cập nhật tên phường/xã
                $(".ck_address_content").val(_address_content); // Cập nhật địa chỉ cụ thể

                // Hiển thị thông báo thành công
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top',
                    showConfirmButton: false,
                    timer: 2000,
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer);
                        toast.addEventListener('mouseleave', Swal.resumeTimer);
                    }
                });
                Toast.fire({
                    icon: 'success',
                    title: 'Cập nhật địa chỉ thành công'
                });
            }
            else { // Nếu đổi địa chỉ thất bại
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top',
                    showConfirmButton: false,
                    timer: 1000,
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer);
                        toast.addEventListener('mouseleave', Swal.resumeTimer);
                    }
                });
                Toast.fire({
                    icon: 'error',
                    title: 'Lỗi'
                });
            }
        }
    });
};