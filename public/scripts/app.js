jQuery(function() {

  $('#hamburger').on('click', function() {
    if ($(this).hasClass('open')) {
      $(this).removeClass('open');
      $('.mobileMenu').css({display: 'none'})
    }else{
      $(this).addClass('open');
      $('.mobileMenu').css({display: 'block'})
    }
  });

});
