$(document).ready(function () {
    $('#mobile_btn').on('click', function () {
        $('#mobile_menu').toggleClass('active');

        let icone = $('#mobile_btn').find('img');

        if ($('#mobile_menu').hasClass('active')) {

            icone.attr('src', './img/x-solid-full.svg');
        } else {

            icone.attr('src', './img/bars-solid-full.svg');
        }

    });
});