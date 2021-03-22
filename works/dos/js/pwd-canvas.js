////////////////////////////////////////////////////////////////////////////////
//  描画クラス
////////////////////////////////////////////////////////////////////////////////

// コンストラクタ
Canvas = function(obj) {
  $.jCanvas.defaults.layer = true;
  this.drawn_arrow_count = 0;
  this.elm_canvas = $(obj.target);
  this.drag_canceled = false;
};

// public 個人を描画する (obj: Person)
Canvas.prototype.drawPerson = function(obj) {
  // console.log(`drawPerson: ${obj.id}`);
  this.elm_canvas.scaleCanvas({
    x: 0, y: 0,
    scale: 1
  })
  
  // 円の描画
  .drawEllipse({
    strokeStyle: 'black',       // 線の色
    strokeWidth: 1,             // 線の太さ
    x: obj.x,                   // 描画位置(X座標)
    y: obj.y,                   // 描画位置(Y座標)
    width: obj.circle_width,    // 円の横幅
    height: obj.circle_height,  // 縁の縦幅
    draggable: true,            // ドラッグ可能
    groups: [obj.id],           // グループ指定
    dragGroups: [obj.id],       // ドラッググループ指定
    bringToFront: true,         // クリック時に前面へ
    name: obj.id + '',          // 名前
    data: {
      canvas: this,     // キャンバスクラス
      isDrag: false,    // ドラッグフラグ(独自拡張データ)
      dragOffsetX: 0,   // ドラッグオフセットX(独自拡張データ)
      dragOffsetY: 0    // ドラッグオフセットY(独自拡張データ)
    },
    
    // クリックイベント (要素を全てWorldで一元管理した方が保守性高まる。要検討)
    click: function(layer) {
      
      // 個人設定値の表示 (Worldへの参照を持たせて個人設定値表示をメソッド化すべきかも)
      $('#selected_person').val(obj.id);    // 個人ID
      $('#person_name').val(obj.name);      // 個人名
      $('#person_dname').val(obj.dname);    // 個人表示名
      $('#person_organization').val(obj.organization.name); // 所属組織名
      $('#person_mh').val(obj.mh);       // メンタルヘルス値
      $('#person_x').val(obj.x.toFixed(2));            // 個人X座標
      $('#person_y').val(obj.y.toFixed(2));            // 個人Y座標
      $('#person_sa').val(obj.sensitivity_a);
      $('#person_sb').val(obj.sensitivity_b);
      $('#person_ia').val(obj.influence_a);
      $('#person_ib').val(obj.influence_b);
      $('.person_information_area').show(); // 表示実行
      
      // 登録したイベントの解除
      $(document).off('change keyup', '#person_name');
      $(document).off('change keyup', '#person_dname');
      $(document).off('change keyup', '#person_organization');
      $(document).off('change keyup', '#person_mh');
      $(document).off('change keyup', '#person_x');
      $(document).off('change keyup', '#person_y');
      $(document).off('change keyup', '#person_sa');
      $(document).off('change keyup', '#person_sb');
      $(document).off('change keyup', '#person_ia');
      $(document).off('change keyup', '#person_ib');
      
      
      // 個人名バインド(change + keyup)
      $(document).on('change keyup', '#person_name', function(event){
        obj.name = $(this).val();
      });
      
      // 個人表示名バインド(change + keyup)
      $(document).on('change keyup', '#person_dname', {
        elm_canvas: this
      }, function(event){
        // Person(データ)とPerson(描画)をそれぞれ更新
        $(event.data.elm_canvas).getLayer(obj.id+'-text').text = $(this).val();
        obj.dname = $(this).val();
        $(event.data.elm_canvas).drawLayers();  // 明示的に再描画
      });
      
      // 所属組織バインド(change + keyup)
      $(document).on('change keyup', '#person_organization', function(event){
        obj.organization.name = $(this).val();
      });
      
      // メンタルヘルス値バインド(change + keyup)
      $(document).on('change keyup', '#person_mh', function(event){
        obj.mh = $(this).val();
      });
      
      // 個人X座標バインド(change + keyup)
      $(document).on('change keyup', '#person_x', {
        elm_canvas: this
      }, function(event){
        // Person(データ)とPerson(描画)をそれぞれ更新
        var x = +$(this).val();
        $(event.data.elm_canvas).getLayer(obj.id).x = x;
        $(event.data.elm_canvas).getLayer(obj.id+'-text').x = x;
        obj.x = x;
        $(event.data.elm_canvas).drawLayers();  // 明示的に再描画
      });
      
      // 個人Y座標バインド(change + keyup)
      $(document).on('change keyup', '#person_y', {
        elm_canvas: this
      }, function(event){
        // Person(データ)とPerson(描画)をそれぞれ更新
        var y = +$(this).val();
        $(event.data.elm_canvas).getLayer(obj.id).y = y;
        $(event.data.elm_canvas).getLayer(obj.id+'-text').y = y;
        obj.y = y;
        $(event.data.elm_canvas).drawLayers();  // 明示的に再描画
      });
      
      // 受信特性aバインド(change + keyup)
      $(document).on('change keyup', '#person_sa', function(event){
        obj.sensitivity_a = $(this).val();
      });
      
      // 受信特性bバインド(change + keyup)
      $(document).on('change keyup', '#person_sb', function(event){
        obj.sensitivity_b = $(this).val();
      });
      
      // 発信特性aバインド(change + keyup)
      $(document).on('change keyup', '#person_ia', function(event){
        obj.influence_a = $(this).val();
      });
      
      // 発信特性bバインド(change + keyup)
      $(document).on('change keyup', '#person_ib', function(event){
        obj.influence_b = $(this).val();
      });
      
    },
    
    // ドラッグスタートイベント(mousedown)
    dragstart: function() {},
    
    // ドラッグ中イベント(mousedown & move)
    drag: function(layer) {
      // クリックのみで発生してしまう場合があるため、移動を検知してから処理開始
      if((layer.dx !== 0) || (layer.dy !== 0)){
        var currentLayer = $(this).getLayer(String(obj.id));
        currentLayer.data.dragOffsetX = layer.eventX - currentLayer.x;
        currentLayer.data.dragOffsetY = layer.eventY - currentLayer.y;
        $(this).getLayer(obj.id+'').data.isDrag = true;  // ドラッグ開始フラグ
      }
    },
    
    // ドラッグエンドイベント(mouseup)
    dragstop: function(layer) {
      if($(this).getLayer(obj.id+'').data.isDrag){
        obj.x = (layer.eventX - $(this).getLayer(obj.id+'').data.dragOffsetX);
        obj.y = (layer.eventY - $(this).getLayer(obj.id+'').data.dragOffsetY);
      }
      $(this).getLayer(obj.id+'').data.isDrag = false;
    },
    
    // ドラッグキャンセルイベント
    dragcancel: function(layer) {
      $(this).getLayer(obj.id).data.canvas.drag_canceled = true;
    }
  })
  
  // テキストの描画
  .drawText({
    fillStyle: "black",       // テキストの色(塗りつぶし)
    strokeStyle: "black",     // テキストの色
    strokeWidth: "0.5",       // テキストの太さ
    x: obj.x,                 // 描画位置(X座標)
    y: obj.y,                 // 描画位置(Y座標)
    fontSize: 16,             // テキストサイズ
    fontFamily: "sans-serif", // テキストフォント
    text: obj.dname,          // テキスト内容
    draggable: true,          // ドラッグ可能
    groups: [obj.id],       // グループ指定
    dragGroups: [obj.id],   // ドラッググループ指定
    bringToFront: true,       // クリック時に前面へ
    intangible: true,         // クリックイベントの透過
    name: obj.id + '-text'  // 名前
  }).restoreCanvas();
  
  return obj.id;
};

// public 個人を描画する (obj: Personハッシュ)
Canvas.prototype.drawPersons = function(obj) {
  for(let [key,value] of Object.entries(obj)){
    this.drawPerson(value);
  }
};

// public 個人の描画を削除する (obj: {name: Person名})
Canvas.prototype.erasePerson = function(obj) {
  this.elm_canvas.removeLayerGroup(obj.id).drawLayers();
};

// public 個人情報を更新し、再描画する (person: person)
Canvas.prototype.redrawPerson = function(person) {
  
  // 個人を構成する円とテキストの取得
  var person_circle = this.elm_canvas.getLayer(person.id);
  var person_text = this.elm_canvas.getLayer(person.id+'-text');
  
  // 座標値の更新
  person_circle.x = person.x;
  person_circle.y = person.y;
  person_text.x = person.x;
  person_text.y = person.y;
  
  // テキストの更新
  person_text.text = person.dname;
  
  this.elm_canvas.drawLayers();  // 明示的に再描画
};

// public 矢印を描画する
Canvas.prototype.drawArrow = function(obj) {
  var from_person_circle = this.elm_canvas.getLayer(obj.from_id);
  var to_person_circle = this.elm_canvas.getLayer(obj.to_id);
  var x1 = from_person_circle.x;
  var y1 = from_person_circle.y;
  var from_circle_width = from_person_circle.width - 5;
  var x2 = to_person_circle.x;
  var y2 = to_person_circle.y;
  var to_circle_width = to_person_circle.width - 5;
  var vx = x2 - x1;
  var vy = y2 - y1;
  var v = Math.sqrt(Math.pow(vx, 2) + Math.pow(vy,2));
  var ux = vx / v;
  var uy = vy / v;
  var line_from_x = x1 + ux * from_circle_width;
  var line_from_y = y1 + uy * from_circle_width;
  var line_to_x = x2 - ux * to_circle_width;
  var line_to_y = y2 - uy * to_circle_width;
  var arrow_l_x = line_to_x - uy * 5 - ux * 10;
  var arrow_l_y = line_to_y + ux * 5 - uy * 10;
  var arrow_r_x = line_to_x + uy * 5 - ux * 10;
  var arrow_r_y = line_to_y - ux * 5 - uy * 10;
  
  this.drawn_arrow_count += 1;
  var param = {
      strokeStyle: "black",
      strokeWidth: 1,
      groups: ["arrow-" + this.drawn_arrow_count],
      name: "arrow-" + this.drawn_arrow_count + "-parts1",
      x1: line_from_x,
      y1: line_from_y,
      x2: line_to_x,
      y2: line_to_y
    };
  if(obj.strokeDash === true){
    param['strokeDash'] = [5];
    param['strokeDashOffset'] = 0;
  }
  var param2 = {
    strokeStyle: "black",
    strokeWidth: 1,
    groups: ["arrow-" + this.drawn_arrow_count],
    name: "arrow-" + this.drawn_arrow_count + "-parts2",
    x1: arrow_l_x,
    y1: arrow_l_y,
    x2: line_to_x,
    y2: line_to_y,
    x3: arrow_r_x,
    y3: arrow_r_y
  };
  this.elm_canvas.drawLine(param);
  this.elm_canvas.drawLine(param2);
};

// public 自分(Person)への矢印を描画する
Canvas.prototype.drawSelfArrow = function(obj) {
  var person_circle = this.elm_canvas.getLayer(obj.from_id);
  var person_circle_width = person_circle.width;
  var x = person_circle.x;
  var y = person_circle.y;
  var radius = 15;
  var start = -135;
  var end = 135;
  
  var vx = -1;
  var vy = 2;
  var v = Math.sqrt(Math.pow(vx, 2) + Math.pow(vy,2));
  var ux = vx / v;
  var uy = vy / v;
  var line_to_x = radius / Math.sqrt(2) + x + 1;  // 1だけ微調整
  var line_to_y = radius / Math.sqrt(2) + y - person_circle_width - 5;
  var arrow_l_x = line_to_x - uy * 5 - ux * 10;
  var arrow_l_y = line_to_y + ux * 5 - uy * 10;
  var arrow_r_x = line_to_x + uy * 5 - ux * 10;
  var arrow_r_y = line_to_y - ux * 5 - uy * 10;
  
  this.drawn_arrow_count += 1;
  var param = {
    strokeStyle: "black",
    strokeWidth: 1,
    groups: ["arrow-" + this.drawn_arrow_count],
    name: "self-arrow-" + this.drawn_arrow_count + "-parts1",
    x: x,
    y: y - person_circle_width - 5,
    radius: radius,
    start: start,
    end: end
  };
  if(obj.strokeDash === true){
    param['strokeDash'] = [5];
    param['strokeDashOffset'] = 0;
  }
  var param2 = {
    strokeStyle: "black",
    strokeWidth: 1,
    groups: ["arrow-" + this.drawn_arrow_count],
    name: "self-arrow-" + this.drawn_arrow_count + "-parts2",
    x1: arrow_l_x,
    y1: arrow_l_y,
    x2: line_to_x,
    y2: line_to_y,
    x3: arrow_r_x,
    y3: arrow_r_y
  };
  this.elm_canvas.drawArc(param);
  this.elm_canvas.drawLine(param2);
};

// public メッセージ受信時のアイコンを描画する
Canvas.prototype.drawRcvIcon = function(obj) {
  var person_circle = this.elm_canvas.getLayer(obj.to_id);
  var person_circle_width = person_circle.width;
  var x = person_circle.x;
  var y = person_circle.y;
  var rcv_icon_width = person_circle_width + 10;
  
  this.drawn_arrow_count += 1;  // 便宜上arrow(メッセージ時描画)とする
  var param = {
    strokeStyle: 'black',
    strokeWidth: 1,
    x: x,
    y: y,
    width: rcv_icon_width,
    height: rcv_icon_width,
    groups: ["arrow-" + this.drawn_arrow_count],
    name: "rcv-arrow-" + this.drawn_arrow_count + "-parts1",
  }
  if(obj.strokeDash === true){
    param['strokeDash'] = [5];
    param['strokeDashOffset'] = 0;
  }
  this.elm_canvas.drawEllipse(param);
};

// public 矢印を削除する
Canvas.prototype.eraseAllArrows = function() {
  while(this.drawn_arrow_count > 0){
    this.elm_canvas.removeLayerGroup('arrow-' + this.drawn_arrow_count);
    this.drawn_arrow_count -= 1;
  }
  this.elm_canvas.drawLayers();
};

// public キャンバスを初期化する
Canvas.prototype.initCanvas = function() {
  this.elm_canvas.clearCanvas().removeLayers();
  this.drawn_arrow_count = 0;
};