'use strict';

$('.form').click(function () {
    $(this).parent().find('.hidden').slideToggle();
});