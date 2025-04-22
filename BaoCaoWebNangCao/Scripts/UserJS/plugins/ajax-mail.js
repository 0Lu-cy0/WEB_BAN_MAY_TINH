$(function () {
    // Lấy form liên hệ có ID là 'contact-form'
    var form = $('#contact-form');

    // Lấy div hiển thị thông báo có class 'form-messege'
    var formMessages = $('.form-messege');

    // Thiết lập sự kiện submit cho form liên hệ
    $(form).submit(function (e) {
        // Ngăn trình duyệt gửi form theo cách mặc định (tránh tải lại trang)
        e.preventDefault();

        // Chuyển dữ liệu form thành chuỗi (serialize) để gửi qua AJAX
        var formData = $(form).serialize();

        // Gửi form bằng AJAX
        $.ajax({
            type: 'POST', // Phương thức gửi là POST
            url: $(form).attr('action'), // URL đích được lấy từ thuộc tính 'action' của form
            data: formData // Dữ liệu gửi đi là dữ liệu form đã serialize
        })
            .done(function (response) {
                // Khi gửi thành công:
                // Đảm bảo div formMessages có class 'success' (bỏ class 'error')
                $(formMessages).removeClass('error');
                $(formMessages).addClass('success');

                // Hiển thị thông báo trả về từ server
                $(formMessages).text(response);

                // Xóa nội dung trong các input và textarea của form
                $('#contact-form input, #contact-form textarea').val('');
            })
            .fail(function (data) {
                // Khi gửi thất bại:
                // Đảm bảo div formMessages có class 'error' (bỏ class 'success')
                $(formMessages).removeClass('success');
                $(formMessages).addClass('error');

                // Hiển thị thông báo lỗi
                if (data.responseText !== '') {
                    // Nếu server trả về thông báo lỗi, hiển thị thông báo đó
                    $(formMessages).text(data.responseText);
                } else {
                    // Nếu không có thông báo lỗi cụ thể, hiển thị thông báo mặc định
                    $(formMessages).text('Ôi! Có lỗi xảy ra và tin nhắn của bạn không thể gửi được.');
                }
            });
    });
});