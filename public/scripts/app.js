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

  $('.videos-item .img-o').on('click', function() {
      $('.video-player-wrapper').css('display', 'block');
      const youTubeId = $(this).attr('data-youTubeId');
      const youTubeUrl = 'https://www.youtube.com/embed/' + youTubeId + '?autoplay=1';
      $('.video-player iframe').attr('src', youTubeUrl);
  });

  $('.video-player').on('click', function() {
      $('.video-player-wrapper').css('display', 'none');
      $('.video-player iframe').attr('src', '');
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
