$(function() {
    var $win = $(window),
        $main = $('header'),
        $nav = $('.headerTitle'),
        $pelm = $('.headerTitle p'), 
        navHeight = $nav.outerHeight(),
        navPos = $nav.offset().top,
        pelmHeight = $pelm.outerHeight(),
        fixedClass = 'fixed';
  
    $win.on('load scroll', function() {
      var value = $(this).scrollTop();
      if ( value > navPos ) {
        $nav.addClass(fixedClass);
        $main.css('margin-top', navHeight+pelmHeight-2);
      } else {
        $nav.removeClass(fixedClass);
        $main.css('margin-top', '0');
      }
    });
  });