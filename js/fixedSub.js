$(function() {
    var $win = $(window),
        $main = $('.pageBodySub'),
        $nav = $('.sideMenu'),
        navHeight = $nav.outerHeight(),
        $pelm = $('.headerTitle p'), 
        navPos = $nav.offset().top-200,
        pelmHeight = $pelm.outerHeight(),
        fixedClass = 'fixedSub';
  
    $win.on('load scroll', function() {
      var value = $(this).scrollTop();
      if ( value > navPos ) {
        $nav.addClass(fixedClass);
        $main.css('margin-top', navHeight+pelmHeight+20);
      } else {
        $nav.removeClass(fixedClass);
        $main.css('margin-top', '0');
      }
    });
  });