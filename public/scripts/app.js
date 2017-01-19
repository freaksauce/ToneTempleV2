jQuery(function() {

  $('#hamburger').on('click', function() {
    console.log('hamburger click');
    if ($(this).hasClass('open')) {
      $(this).removeClass('open');
    }else{
      $(this).addClass('open');
    }
  });

});
