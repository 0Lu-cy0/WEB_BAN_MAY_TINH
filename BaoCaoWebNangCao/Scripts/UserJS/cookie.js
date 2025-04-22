const Cookie = {
    // Hàm lấy giá trị của cookie dựa trên tên
    get: function (name) {
        // Thêm dấu "=" vào tên cookie để tìm kiếm chính xác
        name = name + "=";
        // Tách chuỗi cookie thành mảng các cookie riêng lẻ
        let ca = document.cookie.split(';');
        // Duyệt qua từng cookie trong mảng
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            // Loại bỏ khoảng trắng ở đầu chuỗi cookie
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            // Kiểm tra xem cookie có bắt đầu bằng tên cần tìm không
            if (c.indexOf(name) == 0) {
                // Trả về giá trị của cookie (bỏ phần tên và dấu "=")
                return c.substring(name.length, c.length);
            }
        }
        // Nếu không tìm thấy cookie, trả về null
        return null;
    },

    // Hàm thiết lập cookie với tên, giá trị và số ngày hết hạn
    set: function (cname, cvalue, exdays) {
        // Tạo đối tượng Date để tính thời gian hết hạn
        const d = new Date();
        // Thiết lập thời gian hết hạn (tính bằng mili-giây)
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        // Chuyển thời gian hết hạn sang định dạng UTC
        let expires = "expires=" + d.toUTCString();
        // Gán cookie vào document với tên, giá trị, thời gian hết hạn và đường dẫn
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    },

    // Hàm xóa cookie dựa trên tên
    remove: function (cname) {
        // Tạo đối tượng Date để thiết lập thời gian hết hạn trong quá khứ
        const d = new Date();
        // Đặt thời gian hết hạn về quá khứ (hủy cookie)
        d.setTime(d.getTime() - 100000);
        // Chuyển thời gian sang định dạng UTC
        let expires = "expires=" + d.toUTCString();
        // Gán cookie với giá trị rỗng và thời gian hết hạn trong quá khứ để xóa
        document.cookie = cname + "=;" + expires + ";path=/";
    },

    // Hàm đếm tổng giá trị của tất cả cookie (giả sử giá trị là số)
    countProduct: function () {
        let count = 0; // Biến lưu giá trị của cookie
        let d = 0; // Biến lưu tổng giá trị
        // Tách chuỗi cookie thành mảng
        let ca2 = document.cookie.split(';');
        // Duyệt qua từng cookie
        for (let i = 0; i < ca2.length; i++) {
            let c = ca2[i];
            // Sử dụng biểu thức chính quy để lấy giá trị sau dấu "="
            let reGex = /(?<==).*/g;
            // Lấy giá trị của cookie
            count = c.match(reGex);
            // Nếu giá trị tồn tại, cộng vào tổng
            if (count != null) {
                d = d + Number(count[0]);
            }
        }
        // Trả về tổng giá trị
        return d;
    },

    // Hàm đếm số lượng cookie có tiền tố cụ thể
    countWithPrefix: function (prefix) {
        let count = 0; // Biến đếm số cookie phù hợp
        // Tách chuỗi cookie thành mảng
        let ca = document.cookie.split(';');
        // Duyệt qua từng cookie
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            // Loại bỏ khoảng trắng ở đầu chuỗi
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            // Kiểm tra xem cookie có bắt đầu bằng tiền tố không
            if (c.indexOf(prefix) == 0) {
                count++; // Tăng biến đếm nếu tìm thấy
            }
        }
        // Trả về số lượng cookie có tiền tố
        return count;
    }
};