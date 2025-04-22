(function ($) {
    "use strict";

    /*****************************
     * Biến chung
     *****************************/
    // Lưu trữ đối tượng window và body để sử dụng trong toàn bộ mã
    var $window = $(window),
        $body = $('body');

    /****************************
     * Menu cố định (Sticky Menu)
     *****************************/
    // Sự kiện khi cuộn trang, thêm hoặc xóa lớp 'sticky' cho header khi cuộn quá 100px
    $(window).on('scroll', function () {
        var scroll = $(window).scrollTop();
        if (scroll < 100) {
            $(".sticky-header").removeClass("sticky");
        } else {
            $(".sticky-header").addClass("sticky");
        }
    });

    // Tương tự cho thanh sticky riêng biệt
    $(window).on('scroll', function () {
        var scroll = $(window).scrollTop();
        if (scroll < 100) {
            $(".seperate-sticky-bar").removeClass("sticky");
        } else {
            $(".seperate-sticky-bar").addClass("sticky");
        }
    });

    /************************************************
     * Tìm kiếm dạng modal
     ***********************************************/
    // Khi nhấp vào liên kết có href="#search", mở modal tìm kiếm và focus vào ô input
    $('a[href="#search"]').on('click', function (event) {
        event.preventDefault();
        $('#search').addClass('open');
        $('#search > form > input[type="search"]').focus();
    });

    // Đóng modal tìm kiếm khi nhấp vào nút đóng
    $('#search, #search button.close').on('click', function (event) {
        if (event.target.className == 'close') {
            $(this).removeClass('open');
        }
    });

    /*****************************
     * Chức năng Offcanvas
     *****************************/
    // Tạo menu offcanvas (menu trượt từ bên cạnh)
    (function () {
        var $offCanvasToggle = $('.offcanvas-toggle'),
            $offCanvas = $('.offcanvas'),
            $offCanvasOverlay = $('.offcanvas-overlay'),
            $mobileMenuToggle = $('.mobile-menu-toggle');

        // Khi nhấp vào nút toggle, mở menu offcanvas và lớp overlay
        $offCanvasToggle.on('click', function (e) {
            e.preventDefault();
            var $this = $(this),
                $target = $this.attr('href');
            $body.addClass('offcanvas-open');
            $($target).addClass('offcanvas-open');
            $offCanvasOverlay.fadeIn();
            if ($this.parent().hasClass('mobile-menu-toggle')) {
                $this.addClass('close');
            }
        });

        // Đóng menu offcanvas khi nhấp vào nút đóng hoặc lớp overlay
        $('.offcanvas-close, .offcanvas-overlay').on('click', function (e) {
            e.preventDefault();
            $body.removeClass('offcanvas-open');
            $offCanvas.removeClass('offcanvas-open');
            $offCanvasOverlay.fadeOut();
            $mobileMenuToggle.find('a').removeClass('close');
        });
    })();

    /**************************
     * Menu Offcanvas: Nội dung menu
     **************************/
    // Hàm xử lý menu offcanvas cho thiết bị di động
    function mobileOffCanvasMenu() {
        var $offCanvasNav = $('.offcanvas-menu'),
            $offCanvasNavSubMenu = $offCanvasNav.find('.mobile-sub-menu');

        // Thêm nút toggle cho các menu con
        $offCanvasNavSubMenu.parent().prepend('<div class="offcanvas-menu-expand"></div>');

        // Xử lý sự kiện nhấp để mở/đóng menu con
        $offCanvasNav.on('click', 'li a, .offcanvas-menu-expand', function (e) {
            var $this = $(this);
            if ($this.attr('href') === '#' || $this.hasClass('offcanvas-menu-expand')) {
                e.preventDefault();
                if ($this.siblings('ul:visible').length) {
                    $this.parent('li').removeClass('active');
                    $this.siblings('ul').slideUp();
                    $this.parent('li').find('li').removeClass('active');
                    $this.parent('li').find('ul:visible').slideUp();
                } else {
                    $this.parent('li').addClass('active');
                    $this.closest('li').siblings('li').removeClass('active').find('li').removeClass('active');
                    $this.closest('li').siblings('li').find('ul:visible').slideUp();
                    $this.siblings('ul').slideDown();
                }
            }
        });
    }
    mobileOffCanvasMenu();

    /************************************************
     * Nice Select
     ***********************************************/
    // Áp dụng plugin Nice Select để tùy chỉnh giao diện thẻ select
    $('select').niceSelect();

    /*************************
     * Slider chính (Hero Slider)
     **************************/
    // Khởi tạo slider chính với Swiper
    var heroSlider = new Swiper('.hero-slider-active.swiper-container', {
        slidesPerView: 1,
        effect: "fade",
        speed: 1500,
        watchSlidesProgress: true,
        loop: true,
        autoplay: false,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });

    /****************************************
     * Slider sản phẩm - 4 cột, 2 hàng
     *****************************************/
    // Khởi tạo slider sản phẩm với 4 cột, 2 hàng
    var productSlider4grid2row = new Swiper('.product-default-slider-4grid-2row.swiper-container', {
        slidesPerView: 4,
        spaceBetween: 30,
        speed: 1500,
        slidesPerColumn: 2,
        slidesPerColumnFill: 'row',

        navigation: {
            nextEl: '.product-slider-default-2rows .swiper-button-next',
            prevEl: '.product-slider-default-2rows .swiper-button-prev',
        },

        breakpoints: {
            0: { slidesPerView: 1 },
            576: { slidesPerView: 2 },
            768: { slidesPerView: 2 },
            992: { slidesPerView: 3 },
            1200: { slidesPerView: 4 },
        }
    });

    /*********************************************
     * Slider sản phẩm - 4 cột, 1 hàng
     **********************************************/
    // Khởi tạo slider sản phẩm với 4 cột, 1 hàng
    var productSlider4grid1row = new Swiper('.product-default-slider-4grid-1row.swiper-container', {
        slidesPerView: 4,
        spaceBetween: 30,
        speed: 1500,

        navigation: {
            nextEl: '.product-slider-default-1row .swiper-button-next',
            prevEl: '.product-slider-default-1row .swiper-button-prev',
        },

        breakpoints: {
            0: { slidesPerView: 1 },
            576: { slidesPerView: 2 },
            768: { slidesPerView: 2 },
            992: { slidesPerView: 3 },
            1200: { slidesPerView: 4 },
        }
    });

    /*********************************************
     * Slider sản phẩm - 4 cột, 3 hàng
     **********************************************/
    // Khởi tạo slider sản phẩm với 4 cột, 3 hàng
    var productSliderListview4grid3row = new Swiper('.product-listview-slider-4grid-3rows.swiper-container', {
        slidesPerView: 4,
        spaceBetween: 30,
        speed: 1500,
        slidesPerColumn: 3,
        slidesPerColumnFill: 'row',

        navigation: {
            nextEl: '.product-list-slider-3rows .swiper-button-next',
            prevEl: '.product-list-slider-3rows .swiper-button-prev',
        },

        breakpoints: {
            0: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            768: { slidesPerView: 2 },
            992: { slidesPerView: 3 },
            1200: { slidesPerView: 4 },
        }
    });

    /*********************************************
     * Slider bài viết - 3 cột, 1 hàng
     **********************************************/
    // Khởi tạo slider bài viết với 3 cột
    var blogSlider = new Swiper('.blog-slider.swiper-container', {
        slidesPerView: 3,
        spaceBetween: 30,
        speed: 1500,

        navigation: {
            nextEl: '.blog-default-slider .swiper-button-next',
            prevEl: '.blog-default-slider .swiper-button-prev',
        },
        breakpoints: {
            0: { slidesPerView: 1 },
            576: { slidesPerView: 2 },
            768: { slidesPerView: 2 },
            992: { slidesPerView: 3 },
        }
    });

    /*********************************************
     * Slider logo công ty - 7 cột, 1 hàng
     **********************************************/
    // Khởi tạo slider logo công ty với 7 cột
    var companyLogoSlider = new Swiper('.company-logo-slider.swiper-container', {
        slidesPerView: 7,
        speed: 1500,

        navigation: {
            nextEl: '.company-logo-slider .swiper-button-next',
            prevEl: '.company-logo-slider .swiper-button-prev',
        },
        breakpoints: {
            0: { slidesPerView: 1 },
            480: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            992: { slidesPerView: 3 },
            1200: { slidesPerView: 7 },
        }
    });

    /********************************
     * Thư viện sản phẩm - Chế độ ngang
     **********************************/
    // Slider thumbnail ngang cho sản phẩm
    var galleryThumbsHorizontal = new Swiper('.product-image-thumb-horizontal.swiper-container', {
        loop: true,
        speed: 1000,
        spaceBetween: 25,
        slidesPerView: 4,
        freeMode: true,
        watchSlidesVisibility: true,
        watchSlidesProgress: true,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });

    // Slider ảnh lớn ngang liên kết với thumbnail
    var gallerylargeHorizonatal = new Swiper('.product-large-image-horaizontal.swiper-container', {
        slidesPerView: 1,
        speed: 1500,
        thumbs: {
            swiper: galleryThumbsHorizontal
        }
    });

    /********************************
     * Thư viện sản phẩm - Chế độ dọc
     **********************************/
    // Slider thumbnail dọc cho sản phẩm
    var galleryThumbsvartical = new Swiper('.product-image-thumb-vartical.swiper-container', {
        direction: 'vertical',
        centeredSlidesBounds: true,
        slidesPerView: 4,
        watchOverflow: true,
        watchSlidesVisibility: true,
        watchSlidesProgress: true,
        spaceBetween: 25,
        freeMode: true,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });

    // Slider ảnh lớn dọc liên kết với thumbnail
    var gallerylargeVartical = new Swiper('.product-large-image-vartical.swiper-container', {
        slidesPerView: 1,
        speed: 1500,
        thumbs: {
            swiper: galleryThumbsvartical
        }
    });

    /********************************
     * Thư viện sản phẩm - Slide đơn
     **********************************/
    // Slider ảnh sản phẩm dạng slide đơn
    var singleSlide = new Swiper('.product-image-single-slide.swiper-container', {
        loop: true,
        speed: 1000,
        spaceBetween: 25,
        slidesPerView: 4,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            0: { slidesPerView: 1 },
            576: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            992: { slidesPerView: 4 },
            1200: { slidesPerView: 4 },
        }
    });

    /******************************************************
     * Thư viện sản phẩm Quickview - Ngang
     ******************************************************/
    // Slider thumbnail cho quickview
    var modalGalleryThumbs = new Swiper('.modal-product-image-thumb', {
        spaceBetween: 10,
        slidesPerView: 4,
        freeMode: true,
        watchSlidesVisibility: true,
        watchSlidesProgress: true,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });

    // Slider ảnh lớn cho quickview
    var modalGalleryTop = new Swiper('.modal-product-image-large', {
        thumbs: {
            swiper: modalGalleryThumbs
        }
    });

    /********************************
     * Slider bài viết - Slide đơn
     *********************************/
    // Slider bài viết dạng slide đơn
    var blogListSLider = new Swiper('.blog-list-slider.swiper-container', {
        loop: true,
        speed: 1000,
        slidesPerView: 1,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });

    /********************************
     * Thư viện sản phẩm - Zoom ảnh
     **********************************/
    // Áp dụng hiệu ứng zoom cho ảnh sản phẩm
    $('.zoom-image-hover').zoom();

    /************************************************
     * Thanh trượt giá
     ***********************************************/
    // Khởi tạo thanh trượt giá với giá trị min/max và hiển thị giá trị
    $("#slider-range").slider({
        range: true,
        min: 0,
        max: 500,
        values: [75, 300],
        slide: function (event, ui) {
            $("#amount").val("$" + ui.values[0] + " - $" + ui.values[1]);
        }
    });
    $("#amount").val("$" + $("#slider-range").slider("values", 0) +
        " - $" + $("#slider-range").slider("values", 1));

    /************************************************
     * Hiệu ứng cuộn (Animate on Scroll)
     ***********************************************/
    // Khởi tạo AOS để tạo hiệu ứng khi cuộn
    AOS.init({
        duration: 1000,
        once: true,
        easing: 'ease',
    });
    window.addEventListener('load', AOS.refresh);

    /************************************************
     * Popup video
     ***********************************************/
    // Áp dụng plugin Venobox cho các nút phát video
    $('.video-play-btn').venobox();

    /************************************************
     * Nút cuộn lên đầu trang
     ***********************************************/
    // Áp dụng plugin materialScrollTop để tạo nút cuộn lên đầu
    $('body').materialScrollTop();

    //1. Thông báo (Notification)
    $(window).on('load', function () {
        // Lấy giá trị loại thông báo và nội dung từ input
        const msgType1_5s = $('input[name=msgType1_5s]').val();
        const msg1_5s = $('input[name=msg1_5s]').val();

        const msgType3s = $('input[name=msgType3s]').val();
        const msg3s = $('input[name=msg3s]').val();

        const msgType5s = $('input[name=msgType5s]').val();
        const msg5s = $('input[name=msg5s]').val();

        // Thông báo 1.5 giây
        if (msgType1_5s != '' && msg1_5s != '') {
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
            switch (msgType1_5s) {
                case 'success':
                    Toast.fire({ icon: 'success', title: msg1_5s });
                    break;
                case 'info':
                    Toast.fire({ icon: 'info', title: msg1_5s });
                    break;
                case 'warning':
                    Toast.fire({ icon: 'warning', title: msg1_5s });
                    break;
                case 'error':
                    Toast.fire({ icon: 'error', title: msg1_5s });
                    break;
            }
            return;
        }

        // Thông báo 3 giây
        if (msgType3s != '' && msg3s != '') {
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
            switch (msgType3s) {
                case 'success':
                    Toast.fire({ icon: 'success', title: msg3s });
                    break;
                case 'info':
                    Toast.fire({ icon: 'info', title: msg3s });
                    break;
                case 'warning':
                    Toast.fire({ icon: 'warning', title: msg3s });
                    break;
                case 'error':
                    Toast.fire({ icon: 'error', title: msg3s });
                    break;
            }
            return;
        }

        // Thông báo 5 giây
        if (msgType5s != '' && msg5s != '') {
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
            switch (msgType5s) {
                case 'success':
                    Toast.fire({ icon: 'success', title: msg5s });
                    break;
                case 'info':
                    Toast.fire({ icon: 'info', title: msg5s });
                    break;
                case 'warning':
                    Toast.fire({ icon: 'warning', title: msg5s });
                    break;
                case 'error':
                    Toast.fire({ icon: 'error', title: msg5s });
                    break;
            }
            return;
        }
    });

})(jQuery);

// Hàm thông báo khi chức năng chưa được phát triển
function FunctionMessage() {
    alert("Chức Năng Chưa Được Phát Triển");
    return false;
}