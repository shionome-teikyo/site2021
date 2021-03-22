$(function() {
   $('.pagetop').click(function(){
      $('html,body').animate({scrollTop: 10});
   });
    // スクロールしたときに実行
    $(window).scroll(function () {
       // 目的のスクロール量を設定(px)
       var TargetPos = 350;
       // 現在のスクロール位置を取得
       var ScrollPos = $(window).scrollTop();
       // 現在位置が目的のスクロール量に達しているかどうかを判断
       if( ScrollPos >= TargetPos) {
          // 達していれば表示
          $("#topbutton").fadeIn();
       }
       else {
          // 達していなければ非表示
          $("#topbutton").fadeOut();
       }
    });
 });