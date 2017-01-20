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

  $('.HomePage .videos-item .img-o').on('click', function() {
      $('.video-player').css('display', 'block');
      const youTubeId = $(this).attr('data-youTubeId');
      const youTubeUrl = 'https://www.youtube.com/embed/' + youTubeId + '?autoplay=1';
      console.log(youTubeUrl);
      $('.video-player iframe').attr('src', youTubeUrl);
  });

  $('.video-player').on('click', function() {
      $('.video-player').css('display', 'none');
  });

  if ($('.HomePage')) {
      $('.carouselItemsWrapper').slick({
        autoplay:true,
        wrapAround:true,
        autoplayInterval:8000,
        arrows: false,
        dots: true
      });
  }

});
