// Khởi tạo khi trang tải xong
$(document).ready(function () {
    // Gọi hàm hiển thị số sao đã chọn mặc định (5 sao)
    CRateSelected(5);
    // Khởi tạo biến cho trình soạn thảo văn bản Simditor
    var $preview, editor, mobileToolbar, toolbar;
    Simditor.locale = 'en-US'; // Đặt ngôn ngữ cho Simditor là tiếng Anh
    // Cấu hình thanh công cụ cho trình soạn thảo trên máy tính
    toolbar = ['title', 'bold', 'italic', 'underline', 'strikethrough', 'fontScale', 'color', '|', 'ol', 'ul', 'blockquote', '|', 'link', 'image', 'hr', '|', 'indent', 'outdent', 'alignment'];
    // Cấu hình thanh công cụ cho thiết bị di động
    mobileToolbar = ["bold", "underline", "strikethrough", "color", "ul", "ol"];
    // Kiểm tra nếu là thiết bị di động thì dùng thanh công cụ đơn giản
    if (mobilecheck()) {
        toolbar = mobileToolbar;
    }
    // Khởi tạo trình soạn thảo Simditor cho ô nhập bình luận
    editor = new Simditor({
        textarea: $('#comment__con'), // Ô nhập bình luận chính
        toolbar: toolbar, // Thanh công cụ
        pasteImage: true, // Cho phép dán hình ảnh
        defaultImage: '/Content/Images/favicon.png', // Hình ảnh mặc định
        upload: location.search === '?upload' ? { url: '/upload' } : false // Tùy chọn upload hình ảnh
    });
    $preview = $('#preview'); // Phần tử để xem trước nội dung
    if ($preview.length > 0) {
        // Cập nhật nội dung xem trước khi giá trị trong trình soạn thảo thay đổi
        return editor.on('valuechanged', function (e) {
            return $preview.html(editor.getValue());
        });
    }
});

// Hàm xử lý khi chuột rời khỏi sao đánh giá
function CRateOut(rating) {
    // Đặt lại tất cả sao từ 1 đến rating thành sao rỗng
    for (var i = 1; i <= rating; i++) {
        $("#rate" + i).attr('class', 'fa fa-star-o');
    }
}

// Hàm xử lý khi chuột di vào sao đánh giá
function CRateOver(rating) {
    // Tô sáng tất cả sao từ 1 đến rating
    for (var i = 1; i <= rating; i++) {
        $("#rate" + i).attr('class', 'fa fa-star');
    }
}

// Hàm xử lý khi click chọn sao đánh giá
function CRateClick(rating) {
    // Kích hoạt các phần tử giao diện liên quan
    $('.uploadimgcheck').removeAttr('disabled'); // Kích hoạt nút upload hình ảnh
    $('.write_content_fb').removeClass('cursor-disable'); // Bỏ vô hiệu hóa ô nhập nội dung
    $('#ConfirmAdd').removeAttr('disabled'); // Kích hoạt nút xác nhận
    $('#FBk_Content').removeAttr('disabled'); // Kích hoạt ô nhập nội dung
    $("#dcript_content_fb").css("color", "#666"); // Đổi màu chữ thông báo
    $("#dcript_content_fb").text("Nhập nội dung đánh giá"); // Cập nhật thông báo
    $("#lblRating").val(rating); // Lưu số sao đã chọn vào input ẩn
    // Tô sáng sao từ 1 đến rating
    for (var i = 1; i <= rating; i++) {
        $("#rate" + i).attr('class', 'fa fa-star');
    }
    // Đặt lại tất cả sao thành rỗng trước khi cập nhật
    for (var i = 1; i <= 5; i++) {
        $("#rate" + i).attr('class', 'fa fa-star-o');
    }
}

// Hàm hiển thị sao đã chọn trước đó
function CRateSelected() {
    var rating = $("#lblRating").val(); // Lấy số sao từ input ẩn
    // Tô sáng sao từ 1 đến rating
    for (var i = 1; i <= rating; i++) {
        $("#rate" + i).attr('class', 'fa fa-star');
    }
}

// 1. Thêm bình luận/Đánh giá
$('#create_submit_comment').click(function () {
    // Lấy dữ liệu từ form
    const com_content = $("#comment__con").val(); // Nội dung bình luận
    const proID = $("#product_id").val(); // ID sản phẩm
    const discID = $("#discount_id").val(); // ID giảm giá
    const genreID = $("#genre_id").val(); // ID danh mục
    const rateStar = $("#lblRating").val(); // Số sao đánh giá

    // Kiểm tra nếu nội dung bình luận trống
    if (com_content == "") {
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
            title: 'Nhập nội dung bình luận'
        });
        return false;
    }
    // Kiểm tra nội dung bình luận tối thiểu 20 ký tự
    else if (com_content.length < 20) {
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
            title: 'Nội dung bình luận tối thiểu 20 ký tự'
        });
        return false;
    }
    // Kiểm tra nội dung bình luận không quá 500 ký tự
    else if (com_content.length > 500) {
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
            title: 'Nội dung bình luận không quá 500 ký tự'
        });
        return false;
    }
    else {
        // Gửi yêu cầu AJAX để thêm bình luận
        $.ajax({
            type: "Post",
            url: "/Products/ProductComment", // Gửi đến action ProductComment trong controller Products
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({ productID: proID, discountID: discID, genreID: genreID, rateStar: rateStar, commentContent: com_content }),
            dataType: "json",
            success: function (result) {
                if (result == true) { // Nếu thêm thành công
                    setTimeout(function () {
                        window.location.reload(); // Tải lại trang để hiển thị bình luận mới
                    }, 1);
                    return;
                }
            },
            error: function () { // Nếu có lỗi (thường là chưa đăng nhập)
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
                    title: 'Chức năng yêu cầu đăng nhập?'
                });
            }
        });
    }
});

// 2. Phản hồi bình luận/feedback
var CreateReplyFeedback = function (id, acc_name) {
    // Thêm lời chào vào ô nhập phản hồi
    $('#reply_comment_con_' + id).text('<p style="font-weight:500;">Chào ' + acc_name + ',</p>');
    // Khởi tạo trình soạn thảo Simditor cho ô nhập phản hồi
    var $preview, editor, mobileToolbar, toolbar;
    Simditor.locale = 'en-US';
    toolbar = ['title', 'bold', 'italic', 'underline', 'strikethrough', 'fontScale', 'color', '|', 'ol', 'ul', 'blockquote', '|', 'link', 'image', 'hr', '|', 'indent', 'outdent', 'alignment'];
    mobileToolbar = ["bold", "underline", "strikethrough", "color", "ul", "ol"];
    if (mobilecheck()) {
        toolbar = mobileToolbar;
    }
    editor = new Simditor({
        textarea: $('#reply_comment_con_' + id), // Ô nhập phản hồi
        toolbar: toolbar,
        pasteImage: true,
        defaultImage: '/Content/Images/favicon.png',
        upload: location.search === '?upload' ? { url: '/upload' } : false
    });
    $preview = $('#preview');
    if ($preview.length > 0) {
        return editor.on('valuechanged', function (e) {
            return $preview.html(editor.getValue());
        });
    }
    let _id = id;
    $('#submit_reply_comm_' + _id).removeAttr('hidden'); // Hiển thị nút gửi phản hồi

    // Xử lý khi click nút gửi phản hồi
    $('#submit_reply_comm_' + _id).click(function () {
        var _reply_content = $('#reply_comment_con_' + _id).val(); // Lấy nội dung phản hồi
        // Kiểm tra nếu nội dung phản hồi trống
        if (_reply_content == "") {
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
                title: 'Vui lòng nhập nội dung bình luận!'
            });
        }
        // Kiểm tra nội dung phản hồi tối thiểu 20 ký tự
        else if (_reply_content.length < 20) {
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
                title: 'Nội dung tối thiểu 20 ký tự'
            });
            return false;
        }
        // Kiểm tra nội dung phản hồi không quá 500 ký tự
        else if (_reply_content.length > 500) {
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
                title: 'Nội dung bình luận không quá 500 ký tự'
            });
            return false;
        }
        else {
            // Gửi yêu cầu AJAX để lưu phản hồi
            $.ajax({
                type: "POST",
                url: '/Products/ReplyComment', // Gửi đến action ReplyComment
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify({ id: _id, reply_content: _reply_content }),
                dataType: "json",
                success: function (result) {
                    if (result == true) { // Nếu lưu thành công
                        setTimeout(function () {
                            window.location.reload(); // Tải lại trang để hiển thị phản hồi
                        }, 1);
                        return;
                    }
                    else { // Nếu lưu thất bại
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
                            title: 'Đã có lỗi xảy ra'
                        });
                        return false;
                    }
                },
                error: function () { // Nếu có lỗi AJAX
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
    });
};

// 3. Phản hồi bình luận con
var createChildReply = function (id, reply_id, acc_name) {
    child_ide = id; // Lưu ID bình luận chính
    child_rep = reply_id; // Lưu ID phản hồi cha
    // Thêm tag người dùng vào ô nhập phản hồi con
    $('#childRepContent_' + child_rep).text('<p style="font-weight:500;">@' + acc_name + '</p>');
    $('#submit_child_reply_comm_' + child_rep).removeAttr('hidden'); // Hiển thị nút gửi phản hồi con
    // Khởi tạo trình soạn thảo Simditor cho ô nhập phản hồi con
    var $preview, editor, mobileToolbar, toolbar;
    Simditor.locale = 'en-US';
    toolbar = ['title', 'bold', 'italic', 'underline', 'strikethrough', 'fontScale', 'color', '|', 'ol', 'ul', 'blockquote', '|', 'link', 'image', 'hr', '|', 'indent', 'outdent', 'alignment'];
    mobileToolbar = ["bold", "underline", "strikethrough", "color", "ul", "ol"];
    if (mobilecheck()) {
        toolbar = mobileToolbar;
    }
    editor = new Simditor({
        textarea: $('#childRepContent_' + child_rep),
        toolbar: toolbar,
        pasteImage: true,
        defaultImage: '/Content/Images/favicon.png',
        upload: location.search === '?upload' ? { url: '/upload' } : false
    });
    $preview = $('#preview');
    if ($preview.length > 0) {
        return editor.on('valuechanged', function (e) {
            return $preview.html(editor.getValue());
        });
    }

    // Xử lý khi click nút gửi phản hồi con
    $('#submit_child_reply_comm_' + child_rep).click(function () {
        var _child_reply_content = $('#childRepContent_' + child_rep).val(); // Lấy nội dung phản hồi con
        // Kiểm tra nếu nội dung phản hồi con trống
        if (_child_reply_content == "") {
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
                title: 'Vui lòng nhập nội dung bình luận!'
            });
        }
        // Kiểm tra nội dung phản hồi con tối thiểu 20 ký tự
        else if (_child_reply_content.length < 20) {
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
                title: 'Nội dung bình luận tối thiểu 20 ký tự'
            });
            return false;
        }
        // Kiểm tra nội dung phản hồi con không quá 500 ký tự
        else if (_child_reply_content.length > 500) {
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
                title: 'Nội dung bình luận không quá 500 ký tự'
            });
            return false;
        }
        else {
            // Gửi yêu cầu AJAX để lưu phản hồi con
            $.ajax({
                type: "POST",
                url: '/Products/ReplyComment', // Gửi đến action ReplyComment
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify({ id: child_ide, reply_content: _child_reply_content }),
                dataType: "json",
                success: function (result) {
                    if (result == true) { // Nếu lưu thành công
                        setTimeout(function () {
                            window.location.reload(); // Tải lại trang để hiển thị phản hồi con
                        }, 1);
                    }
                    else { // Nếu lưu thất bại
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
                            title: 'Lỗi'
                        });
                    }
                },
                error: function () { // Nếu có lỗi AJAX
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
                        icon: 'danger',
                        title: 'Lỗi'
                    });
                }
            });
        }
    });
};