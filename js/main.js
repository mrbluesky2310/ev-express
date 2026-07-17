(function ($) {


    function setTheme(theme) {
        $('html').attr('data-theme', theme);
        var btn = $('#darkModeToggle');
        var icon = btn.find('i');
        if (theme === 'dark') {
            btn.attr('aria-pressed', 'true');
            icon.removeClass('bi-sun').addClass('bi-moon-stars-fill');
        } else {
            btn.attr('aria-pressed', 'false');
            icon.removeClass('bi-moon-stars-fill').addClass('bi-sun');
        }
    }

    function loadTheme() {
        var saved = 'light';
        try { saved = localStorage.getItem('theme') || 'light'; } catch(e) {}
        setTheme(saved);
    }

    function toggleTheme() {
        var current = $('html').attr('data-theme') === 'dark' ? 'dark' : 'light';
        var next = current === 'dark' ? 'light' : 'dark';
        setTheme(next);
        try { localStorage.setItem('theme', next); } catch(e) {}
    }

    loadTheme();
    $(document).on('click', '#darkModeToggle', toggleTheme);



    setTimeout(function () {
        $('#spinner').removeClass('show');
    }, 1);



    new WOW().init();



    $(window).scroll(function () {
        if ($(this).scrollTop() > 45) {
            $('.nav-bar').addClass('sticky-top shadow-sm');
        } else {
            $('.nav-bar').removeClass('sticky-top shadow-sm');
        }
    });



    $('.header-carousel').owlCarousel({
        items: 1,
        autoplay: true,
        autoplayTimeout: 5000,
        smartSpeed: 2000,
        dots: false,
        loop: true,
        nav: true,
        navText: ['<i class="bi bi-arrow-left"></i>', '<i class="bi bi-arrow-right"></i>']
    });



    if ($('.counter').length) {
        $('.counter').counterUp({ delay: 10, time: 2000 });
    }



    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });

    $('.back-to-top').click(function () {
        $('html, body').animate({ scrollTop: 0 }, 1500, 'easeInOutExpo');
        return false;
    });



    function filterProducts(cat) {
        $('.product-item').each(function () {
            if (cat === 'all' || $(this).data('category') === cat) {
                $(this).show(300);
            } else {
                $(this).hide(300);
            }
        });
    }

    $(document).on('click', '.filter-btn', function () {
        $('.filter-btn').removeClass('active');
        $(this).addClass('active');
        filterProducts($(this).data('category'));
    });

    $(document).on('click', '.filter-cat', function (e) {
        e.preventDefault();
        var cat = $(this).data('cat');
        filterProducts(cat);
        $('.filter-btn').removeClass('active');
        $('.filter-btn[data-category="' + cat + '"]').addClass('active');
    });



    function getCart() {
        try { return JSON.parse(localStorage.getItem('cart')) || []; } catch(e) { return []; }
    }

    function saveCart(items) {
        try { localStorage.setItem('cart', JSON.stringify(items)); } catch(e) {}
    }

    function addItem(product) {
        var cart = getCart();
        var existing = null;
        for (var i = 0; i < cart.length; i++) {
            if (cart[i].id === product.id) { existing = cart[i]; break; }
        }
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
        }
        saveCart(cart);
        updateCartCount();
    }

    function removeItem(id) {
        var cart = getCart().filter(function(p) { return p.id !== id; });
        saveCart(cart);
        updateCartCount();
    }

    function changeQty(id, qty) {
        if (qty < 1) { removeItem(id); return; }
        var cart = getCart();
        for (var i = 0; i < cart.length; i++) {
            if (cart[i].id === id) { cart[i].quantity = qty; break; }
        }
        saveCart(cart);
    }

    function getSubtotal(item) {
        return item.price * item.quantity;
    }

    function updateCartCount() {
        var total = getCart().reduce(function(sum, p) { return sum + p.quantity; }, 0);
        $('#cartCount').text(total);
    }

    updateCartCount();



    function addReservation(product) {
        var list = [];
        try { list = JSON.parse(localStorage.getItem('reservations')) || []; } catch(e) {}
        list.push({ id: product.id, name: product.name, price: product.price, date: new Date().toISOString() });
        try { localStorage.setItem('reservations', JSON.stringify(list)); } catch(e) {}
    }



    $(document).on('click', '.btn-add-cart', function () {
        var btn = $(this);
        addItem({ id: btn.data('id'), name: btn.data('name'), price: parseFloat(btn.data('price')) });
        var original = btn.text();
        btn.text('Added!');
        setTimeout(function() { btn.text(original); }, 1200);
    });

    $(document).on('click', '.btn-reserve', function () {
        var btn = $(this);
        addReservation({ id: btn.data('id'), name: btn.data('name'), price: btn.data('price') });
        var original = btn.text();
        btn.text('Reserved!');
        setTimeout(function() { btn.text(original); }, 1200);
    });



    function showCart() {
        var cart = getCart();
        var tbody = $('#cartBody');
        var table = $('#cartTable');
        var empty = $('.empty-cart-msg');

        if (!cart.length) {
            table.hide();
            empty.show();
            return;
        }

        table.show();
        empty.hide();
        tbody.empty();

        for (var i = 0; i < cart.length; i++) {
            var item = cart[i];
            var row = '<tr>' +
                '<td>' + item.name + '</td>' +
                '<td>$' + parseFloat(item.price).toFixed(2) + '</td>' +
                '<td><div class="input-group input-group-sm" style="max-width:130px">' +
                    '<button class="btn btn-outline-secondary btn-minus" data-id="' + item.id + '">−</button>' +
                    '<input type="text" class="form-control text-center" value="' + item.quantity + '" readonly>' +
                    '<button class="btn btn-outline-secondary btn-plus" data-id="' + item.id + '">+</button>' +
                '</div></td>' +
                '<td>$' + getSubtotal(item).toFixed(2) + '</td>' +
                '<td><button class="btn btn-sm btn-danger btn-remove" data-id="' + item.id + '"><i class="bi bi-trash"></i></button></td>' +
            '</tr>';
            tbody.append(row);
        }
    }

    $(document).on('click', '#cartBody .btn-plus', function () {
        var id = $(this).data('id');
        var cart = getCart();
        for (var i = 0; i < cart.length; i++) {
            if (cart[i].id === id) { changeQty(id, cart[i].quantity + 1); showCart(); updateCartCount(); break; }
        }
    });

    $(document).on('click', '#cartBody .btn-minus', function () {
        var id = $(this).data('id');
        var cart = getCart();
        for (var i = 0; i < cart.length; i++) {
            if (cart[i].id === id) { changeQty(id, cart[i].quantity - 1); showCart(); updateCartCount(); break; }
        }
    });

    $(document).on('click', '#cartBody .btn-remove', function () {
        removeItem($(this).data('id'));
        showCart();
    });

    if ($('#cartTable').length) {
        showCart();
    }



    $(document).on('submit', '#contactForm', function (e) {
        e.preventDefault();

        var name = $('#fullName').val().trim();
        var email = $('#email').val().trim();
        var phone = $('#phone').val().trim();
        var service = $('#serviceInterest').val();
        var msg = $('#message').val().trim();
        var ok = true;

        $('.field-error').text('').hide();

        if (!name) {
            $('#fullName').siblings('.field-error').text('Name is required.').show();
            ok = false;
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            $('#email').siblings('.field-error').text('Please enter a valid email address.').show();
            ok = false;
        }
        if (!service) {
            $('#serviceInterest').siblings('.field-error').text('Please select a service.').show();
            ok = false;
        }
        if (msg.length < 20) {
            $('#message').siblings('.field-error').text('Message must be at least 20 characters.').show();
            ok = false;
        }

        if (ok) {
            $('.form-success').fadeIn(300);
            this.reset();
        }
    });


})(jQuery);
