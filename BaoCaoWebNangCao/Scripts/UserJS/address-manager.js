$(document).ready(function () {
    // Xử lý khi chọn địa chỉ từ danh sách
    $(".select-address").click(function () {
        var provinceId = $(this).data("province-id");
        var districtId = $(this).data("district-id");
        var wardId = $(this).data("ward-id");
        var username = $(this).data("username");
        var phone = $(this).data("phone");
        var content = $(this).data("content");

        // Cập nhật các ô input
        $("#user-name").val(username);
        $("#phone-number").val(phone);
        $("#content").val(content);

        // Cập nhật dropdown Tỉnh/Thành phố
        $("#province").val(provinceId).trigger("change");

        // Cập nhật dropdown Quận/Huyện (sau khi tỉnh được chọn)
        $.get("/Account/GetDistricts", { provinceId: provinceId }, function (data) {
            $("#district").empty().append('<option value="">Quận/ Huyện</option>');
            $.each(data, function (index, item) {
                $("#district").append('<option value="' + item.district_id + '">' + item.type + ' ' + item.district_name + '</option>');
            });
            $("#district").val(districtId).trigger("change");
        });

        // Cập nhật dropdown Phường/Xã (sau khi quận được chọn)
        $.get("/Account/GetWards", { districtId: districtId }, function (data) {
            $("#ward").empty().append('<option value="">Phường/ Xã</option>');
            $.each(data, function (index, item) {
                $("#ward").append('<option value="' + item.ward_id + '">' + item.type + ' ' + item.ward_name + '</option>');
            });
            $("#ward").val(wardId);
        });

        // Ẩn danh sách địa chỉ sau khi chọn
        $("#addressList").collapse("hide");
    });

    // Xử lý khi chọn tỉnh/thành phố, lấy danh sách quận/huyện
    $('#province').change(function () {
        $('#district').removeClass('cursor-disable');
        $('#district').removeAttr('disabled');
        $.get("/Account/GetDistrictsList", { province_id: $('#province').val() }, function (data) {
            $('#district').html("<option value>Quận/ Huyện</option>");
            $.each(data, function (index, row) {
                $('#district').append("<option value='" + row.district_id + "'>" + row.type + " " + row.district_name + "</option>");
            });
        });
    });

    // Khi chọn quận/huyện, lấy danh sách phường/xã
    $('#district').change(function () {
        $('#ward').removeClass('cursor-disable');
        $('#ward').removeAttr('disabled');
        $.get("/Account/GetWardsList", { district_id: $('#district').val() }, function (data) {
            $('#ward').html("<option value>Phường/ Xã</option>");
            $.each(data, function (index, row) {
                $('#ward').append("<option value='" + row.ward_id + "'>" + row.type + " " + row.ward_name + "</option>");
            });
        });
    });

    // Xử lý khi chọn tỉnh/thành phố (trong modal sửa), lấy danh sách quận/huyện
    $('#province_edit').change(function () {
        $('#district_edit').removeClass('cursor-disable');
        $('#district_edit').removeAttr('disabled');
        $.get("/Account/GetDistrictsList", { province_id: $('#province_edit').val() }, function (data) {
            $('#district_edit').html("<option value>Quận/ Huyện</option>");
            $.each(data, function (index, row) {
                $('#district_edit').append("<option value='" + row.district_id + "'>" + row.type + " " + row.district_name + "</option>");
            });
        });
    });

    // Khi chọn quận/huyện (trong modal sửa), lấy danh sách phường/xã
    $('#district_edit').change(function () {
        $('#ward_edit').removeClass('cursor-disable');
        $('#ward_edit').removeAttr('disabled');
        $.get("/Account/GetWardsList", { district_id: $('#district_edit').val() }, function (data) {
            $('#ward_edit').html("<option value>Phường/ Xã</option>");
            $.each(data, function (index, row) {
                $('#ward_edit').append("<option value='" + row.ward_id + "'>" + row.type + " " + row.ward_name + "</option>");
            });
        });
    });
});

// Hàm lưu địa chỉ mới
function SaveAddress() {
    var username = $("#address_name").val();
    var phonenumber = $("#address_phone").val();
    var province = $("#province").val();
    var disctric = $("#district").val();
    var address = $("#address_content").val();
    var ward = $("#ward").val();

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
    } else if (phonenumber.length < 10 || phonenumber.length > 10) {
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
    } else if (username.length > 20) {
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
    } else if (address.length > 50) {
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
    } else {
        var data = $("#create_address").serialize();
        $.ajax({
            type: "POST",
            url: "/Account/AddressCreate",
            data: data,
            success: function (result) {
                createmodal.modal('hide');
                if (result == true) {
                    setTimeout(function () {
                        window.location.reload();
                    }, 1);
                } else {
                    const Toast = Swal.mixin({
                        toast: true,
                        position: 'top-end',
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
}

// Hàm xử lý sửa địa chỉ
function handleEditAddress() {
    var _province_id = $('#province_edit').val();
    var _username = $('#address_name_edit').val();
    var _district_id = $('#district_edit').val();
    var _ward_id = $('#ward_edit').val();
    var _address_content = $('#address_content_edit').val();
    var _phonenumber = $('#address_phone_edit').val();

    if (_province_id == "" || _username == "" || _district_id == "" || _ward_id == "" || _address_content == "" || _phonenumber == "") {
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
            icon: 'warning',
            title: 'Hãy nhập đầy đủ thông tin'
        });
        return false;
    } else if (_address_content.length > 50) {
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
            icon: 'warning',
            title: 'Địa chỉ cụ thể không quá 50 ký tự'
        });
        $('#confirmeditBtn').attr('disabled');
        return false;
    } else if (_phonenumber.length < 10 || _phonenumber.length > 10) {
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
            icon: 'warning',
            title: 'Số điện thoại phải đúng 10 chữ số'
        });
        return false;
    } else if (_username.length > 20) {
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
            icon: 'warning',
            title: 'Họ tên không quá 20 ký tự'
        });
        return false;
    } else {
        $.ajax({
            type: "post",
            url: '/Account/AddressEdit',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({ id: ide, username: _username, province_id: _province_id, district_id: _district_id, ward_id: _ward_id, address_content: _address_content, phonenumber: _phonenumber }),
            dataType: "json",
            success: function (result) {
                if (result == true) {
                    editModal.modal('hide');
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
                        title: 'Cập nhật thành công'
                    });
                    setTimeout(function () {
                        window.location.reload();
                    }, 1);
                } else {
                    editModal.modal('hide');
                    const Toast = Swal.mixin({
                        toast: true,
                        position: 'top',
                        showConfirmButton: false,
                        timer: 2500,
                        didOpen: (toast) => {
                            toast.addEventListener('mouseenter', Swal.stopTimer);
                            toast.addEventListener('mouseleave', Swal.resumeTimer);
                        }
                    });
                    Toast.fire({
                        icon: 'error',
                        title: 'Lỗi! không tìm thấy ID'
                    });
                    return false;
                }
            },
            error: function () {
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top',
                    showConfirmButton: false,
                    timer: 2500,
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer);
                        toast.addEventListener('mouseleave', Swal.resumeTimer);
                    }
                });
                Toast.fire({
                    icon: 'warning',
                    title: 'Sửa thất bại'
                });
            }
        });
    }
}

// Hàm xử lý đổi địa chỉ mặc định
function handleDefaultAddress() {
    $.ajax({
        type: "POST",
        url: '/Account/DefaultAddress',
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({ id: defaultID }),
        dataType: "json",
        success: function (result) {
            if (result == true) {
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
                    icon: 'success',
                    title: 'Cập nhật địa chỉ mặc định thành công'
                });
                defaultmodal.modal('hide');
                setTimeout(function () {
                    window.location.reload();
                }, 1);
            } else {
                defaultmodal.modal('hide');
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
                    title: 'Địa chỉ đang là mặc định!'
                });
            }
        },
        error: function () {
            const Toast = Swal.mixin({
                toast: true,
                position: 'top',
                showConfirmButton: false,
                timer: 2500,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer);
                    toast.addEventListener('mouseleave', Swal.resumeTimer);
                }
            });
            Toast.fire({
                icon: 'error',
                title: '!Lỗi'
            });
        }
    });
}

// Hàm xử lý xóa địa chỉ
function handleDeleteAddress() {
    delmodal.modal('hide');
    $.ajax({
        type: "POST",
        url: '/Account/AddressDelete',
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({ id: idde }),
        dataType: "json",
        success: function (result) {
            if (result == true) {
                $("#item_" + idde).remove();
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
                    title: 'Xóa thành công'
                });
                setTimeout(function () {
                    window.location.reload();
                }, 1);
            }
        },
        error: function () {
            const Toast = Swal.mixin({
                toast: true,
                position: 'top',
                showConfirmButton: false,
                timer: 2500,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer);
                    toast.addEventListener('mouseleave', Swal.resumeTimer);
                }
            });
            Toast.fire({
                icon: 'error',
                title: '!Lỗi'
            });
        }
    });
}