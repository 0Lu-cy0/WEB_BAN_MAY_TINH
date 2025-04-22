// 1. Xử lý sự kiện click nút lưu để chỉnh sửa thông tin cá nhân
$('#save-form').click(function () {
    // Lấy giá trị họ tên từ input có ID là "Name"
    var _userName = $("#Name").val();
    // Lấy giá trị số điện thoại từ input có ID là "Phone"
    var _phoneNumber = $("#Phone").val();

    // Kiểm tra nếu họ tên trống
    if (_userName == "") {
        // Tạo thông báo Toast bằng SweetAlert2
        const Toast = Swal.mixin({
            toast: true, // Hiển thị dạng toast
            position: 'top-end', // Vị trí hiển thị (góc trên bên phải)
            showConfirmButton: false, // Không hiển thị nút xác nhận
            timer: 1500, // Thời gian hiển thị (1500ms)
            didOpen: (toast) => {
                // Dừng timer khi di chuột vào thông báo
                toast.addEventListener('mouseenter', Swal.stopTimer);
                // Tiếp tục timer khi di chuột ra ngoài
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });
        // Hiển thị thông báo lỗi
        Toast.fire({
            icon: 'error', // Biểu tượng lỗi
            title: 'Nhập họ tên' // Nội dung thông báo
        });
        return false; // Dừng hàm
    }

    // Kiểm tra nếu số điện thoại trống
    if (_phoneNumber == "") {
        // Tạo thông báo Toast bằng SweetAlert2
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
        // Hiển thị thông báo lỗi
        Toast.fire({
            icon: 'error',
            title: 'Nhập số điện thoại'
        });
        return false; // Dừng hàm
    }

    // Gửi yêu cầu AJAX để cập nhật thông tin cá nhân
    $.ajax({
        type: "Post", // Phương thức gửi là POST
        url: "/Account/UpdateProfile", // URL đích để gửi yêu cầu
        contentType: "application/json; charset=utf-8", // Định dạng dữ liệu gửi đi là JSON
        data: JSON.stringify({ userName: _userName, phoneNumber: _phoneNumber }), // Dữ liệu gửi đi (họ tên và số điện thoại)
        dataType: "json", // Kiểu dữ liệu trả về từ server là JSON
        success: function (result) {
            if (result == true) { // Nếu cập nhật thành công
                // Tạo thông báo Toast bằng SweetAlert2
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2500, // Thời gian hiển thị (2500ms)
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer);
                        toast.addEventListener('mouseleave', Swal.resumeTimer);
                    }
                });
                // Hiển thị thông báo thành công
                Toast.fire({
                    icon: 'success',
                    title: 'Cập nhật thông tin thành công'
                });
            } else { // Nếu cập nhật thất bại
                // Tạo thông báo Toast bằng SweetAlert2
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
                // Hiển thị thông báo lỗi
                Toast.fire({
                    icon: 'error',
                    title: 'Lỗi!'
                });
            }
        }
    });
});

// 2. Hàm xử lý cập nhật ảnh đại diện (avatar)
function uploadFile(event) {
    // Lấy input file có ID là "file-ip-1"
    var input = document.getElementById("file-ip-1");
    // Lấy file đầu tiên từ input file
    var file = input.files[0];

    // Kiểm tra nếu có file được chọn
    if (file != undefined) {
        // Tạo đối tượng FormData để gửi file
        formData = new FormData();

        // Kiểm tra nếu file là hình ảnh (dựa trên kiểu MIME)
        if (!!file.type.match(/image.*/)) {
            // Thêm file vào FormData với key là "image"
            formData.append("image", file);

            // Gửi yêu cầu AJAX để cập nhật avatar
            $.ajax({
                url: "Account/UpdateAvatar", // URL đích để gửi yêu cầu
                type: "POST", // Phương thức gửi là POST
                data: formData, // Dữ liệu gửi đi là FormData chứa file
                processData: false, // Không xử lý dữ liệu (yêu cầu khi gửi file)
                contentType: false, // Không đặt contentType (yêu cầu khi gửi file)
                success: function (result) {
                    // Tạo URL tạm thời để hiển thị ảnh vừa upload
                    var src = URL.createObjectURL(event.target.files[0]);
                    // Lấy thẻ img có ID là "file-ip-1-preview" để hiển thị ảnh
                    var preview = document.getElementById("file-ip-1-preview");
                    // Cập nhật src của thẻ img để hiển thị ảnh mới
                    preview.src = src;

                    // Tạo thông báo Toast bằng SweetAlert2
                    const Toast = Swal.mixin({
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 2000, // Thời gian hiển thị (2000ms)
                        didOpen: (toast) => {
                            toast.addEventListener('mouseenter', Swal.stopTimer);
                            toast.addEventListener('mouseleave', Swal.resumeTimer);
                        }
                    });
                    // Hiển thị thông báo thành công
                    Toast.fire({
                        icon: 'success',
                        title: 'Cập nhật Avatar thành công'
                    });
                }
            });
        } else { // Nếu file không phải là hình ảnh
            alert('Không phải là hình ảnh hợp lệ!');
        }
    } else { // Nếu không có file được chọn
        alert('Hãy chọn một file!');
    }
}