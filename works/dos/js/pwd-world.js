////////////////////////////////////////////////////////////////////////////////
//  世界クラス
////////////////////////////////////////////////////////////////////////////////

// コンストラクタ
World = function(obj) {
  this.width = obj.width;
  this.height = obj.height;
  this.organizations = {};
  this.persons = {};
  this.organization_num = 0;
  this.turn_num = 1;
  this.target = obj.target;
  this.elm_person_num = obj.elm_person_num;                   // 人数要素
  this.elm_turn_num = obj.elm_turn_num;                       // ターン数要素
  this.elm_speed_num = obj.elm_speed_num;                     // 経過スピード要素
  this.elm_draw_arrow = obj.elm_draw_arrow;                   // 矢印描画要素
  this.elm_start_button = obj.elm_start_button;               // 開始ボタン要素
  this.elm_reset_button = obj.elm_reset_button;               // 初期化ボタン要素
  this.elm_selected_person = obj.elm_selected_person;         // 選択された個人ID要素
  this.elm_person_name = obj.elm_person_name;                 // 個人名要素
  this.elm_person_dname = obj.elm_person_dname;               // 個人表示名要素
  this.elm_person_organization = obj.elm_person_organization; // 所属組織名要素
  this.elm_person_mh = obj.elm_person_mh;                     // メンタルヘルス値要素
  this.elm_person_x = obj.elm_person_x;                       // X座標要素
  this.elm_person_y = obj.elm_person_y;                       // Y座標要素
  this.elm_person_sa = obj.elm_person_sa;                     // 受信特性a
  this.elm_person_sb = obj.elm_person_sb;                     // 受信特性b
  this.elm_person_ia = obj.elm_person_ia;                     // 発信特性a
  this.elm_person_ib = obj.elm_person_ib;                     // 発信特性b
  this.elm_person_delete_button = obj.elm_person_delete_button; // 個人削除ボタン要素
  this.elm_turn_count = obj.elm_turn_count;                   // 経過ターン数要素
  this.elm_person_count = obj.elm_person_count;               // 配置済み個人数
  this.elm_person_information_area = obj.elm_person_information_area; // 個人情報要素
  
  this.is_simulation_started = false;
  this.is_simulation_paused = false;
  
  // 描画クラスインスタンス化
  this.canvas = new Canvas({target: this.target});
  
  // マルチスレッド用変数
  this.worker;
  
  // クリックイベント定義
  $(document).on('click', this.target, {
    world: this
    }, function(event){
      var world = event.data.world;
      if(world.canvas.drag_canceled){
        world.canvas.drag_canceled = false;
        return;
      }
      var x = event.pageX - $(this).offset().left;
      var y = event.pageY - $(this).offset().top;
      
      // Person作成
      var person = world.createPerson({x: x, y: y});
      
      // Person作成できたら描画、情報表示 
      if(person !== false){
        world.drawPerson(person);
        $(world.elm_selected_person).val(person.id);
        $(world.elm_person_name).val(person.name);
        $(world.elm_person_dname).val(person.dname);
        $(world.elm_person_organization).val(person.organization.name);
        $(world.elm_person_mh).val(person.mh);
        $(world.elm_person_x).val(person.x.toFixed(2));
        $(world.elm_person_y).val(person.y.toFixed(2));
        $(world.elm_person_sa).val(person.sensitivity_a);
        $(world.elm_person_sb).val(person.sensitivity_b);
        $(world.elm_person_ia).val(person.influence_a);
        $(world.elm_person_ib).val(person.influence_b);
        $(world.elm_person_information_area).show();
        
        // 登録したイベントの解除
        $(document).off('change keyup', world.elm_person_name);
        $(document).off('change keyup', world.elm_person_dname);
        $(document).off('change keyup', world.elm_person_organization);
        $(document).off('change keyup', world.elm_person_mh);
        $(document).off('change keyup', world.elm_person_x);
        $(document).off('change keyup', world.elm_person_y);
        $(document).off('change keyup', world.elm_person_sa);
        $(document).off('change keyup', world.elm_person_sb);
        $(document).off('change keyup', world.elm_person_ia);
        $(document).off('change keyup', world.elm_person_ib);
        
        
        // 個人名バインド(change + keyup)
        $(document).on('change keyup', world.elm_person_name, function(event){
          person.name = $(this).val();
        });
        
        // 個人表示名バインド(change + keyup)
        $(document).on('change keyup', world.elm_person_dname, {
          elm_canvas: world.target
        }, function(event){
          // Person(データ)とPerson(描画)をそれぞれ更新
          $(event.data.elm_canvas).getLayer(person.id+'-text').text = $(this).val();
          person.dname = $(this).val();
          $(event.data.elm_canvas).drawLayers();  // 明示的に再描画
        });
        
        // 所属組織バインド(change + keyup)
        $(document).on('change keyup', world.elm_person_organization, function(event){
          person.organization.name = $(this).val();
        });
        
        // メンタルヘルス値バインド(change + keyup)
        $(document).on('change keyup', world.elm_person_mh, function(event){
          person.mh = $(this).val();
        });
        
        // 個人X座標バインド(change + keyup)
        $(document).on('change keyup', world.elm_person_x, {
          elm_canvas: world.target
        }, function(event){
          // Person(データ)とPerson(描画)をそれぞれ更新
          var x = +$(this).val();
          $(event.data.elm_canvas).getLayer(person.id).x = x;
          $(event.data.elm_canvas).getLayer(person.id+'-text').x = x;
          person.x = x;
          $(event.data.elm_canvas).drawLayers();  // 明示的に再描画
        });
        
        // 個人Y座標バインド(change + keyup)
        $(document).on('change keyup', world.elm_person_y, {
          elm_canvas: world.target
        }, function(event){
          // Person(データ)とPerson(描画)をそれぞれ更新
          var y = +$(this).val();
          $(event.data.elm_canvas).getLayer(person.id).y = y;
          $(event.data.elm_canvas).getLayer(person.id+'-text').y = y;
          person.y = y;
          $(event.data.elm_canvas).drawLayers();  // 明示的に再描画
        });
        
        // 受信特性aバインド(change + keyup)
        $(document).on('change keyup', world.elm_person_sa, function(event){
          person.sensitivity_a = $(this).val();
        });
        
        // 受信特性bバインド(change + keyup)
        $(document).on('change keyup', world.elm_person_sb, function(event){
          person.sensitivity_b = $(this).val();
        });
        
        // 発信特性aバインド(change + keyup)
        $(document).on('change keyup', world.elm_person_ia, function(event){
          person.influence_a = $(this).val();
        });
        
        // 発信特性bバインド(change + keyup)
        $(document).on('change keyup', world.elm_person_ib, function(event){
          person.influence_b = $(this).val();
        });
      }
    }
  );
  
  
  // 開始ボタンクリックイベント
  $(document).on('click', this.elm_start_button, {
    world: this
  }, function(event){
    var world = event.data.world;
	var wcanvas = document.getElementById('main_canvas');
	var bcanvas = document.getElementById('before_canvas');
	var context = wcanvas.getContext("2d");
	var image = context.getImageData(0, 0, world.width, world.height);
	bcanvas.getContext("2d").putImageData(image,0,0);
	addText("Start!");
	addText('turn:'+(world.turn_num-1));

    // シミュレーション開始後のクリック(一時停止)
    if(world.isSimulationStarted() === true){
      if(world.isSimulationPaused() === true){
        
        // 一時停止解除
        world.unpauseSimulation();
        
        // ターン数増加
        world.turn_num++;
        
        // 矢印削除
        world.canvas.eraseAllArrows();
        
        // ターン数確認
        if(world.turn_num < +$(world.elm_turn_num).val()){
          world.executeSimulation();
        }else{
          world.finishSimulation();
        }
      }else{
        // 一時停止
        world.pauseSimulation();
      }
      return;
    }
    
    // バリデーション
    if(world.validateSimulation() === false){
      return;
    }
    
    // シミュレーション実行用スレッドの準備
    world.worker = new Worker(URL.createObjectURL(
        new Blob(["("+worker_function.toString()+")()"], {type: 'text/javascript'})
      ));
    
    var message_func = function(world){
      return function(event){
        var data = event.data;
        
        switch(data.cmd){
          case "turn_end":		// get log zone
            for(let [key, value] of Object.entries(world.persons)){
              value.finish1Turn();  // 1ターン終了処理(一時メモリのフラッシュ)
            }
            
            if(world.isSimulationPaused() === true){
              return;
            }
            
            // ターン数増加
            world.turn_num++;
	addText('turn:'+world.turn_num);
            
            // 矢印削除
            world.canvas.eraseAllArrows();
            
            // ターン数確認
            if(world.turn_num < +$(world.elm_turn_num).val()){
              world.executeSimulation();
            }else{
              world.finishSimulation();
            }
            return;
          case "turn_messages":		// get log zone
            let args = data.args;
            
            args.forEach(function(val, index, array){
              let data = val.args;
              let sendMsg = data.sendMsg;
              let rcvMsg = data.rcvMsg;
              let send_person_param = data.from_person;
              let rcv_person_param = data.to_person;
              let send_person_key = send_person_param.id;
              let rcv_person_key = rcv_person_param.id;
              
              // send側Personパラメータ更新
			  console.log('turn:',world.turn_num+1);
              world.persons[send_person_key].sendMsg_pool = send_person_param.sendMsg_pool;
              world.persons[send_person_key].rcvMsg_pool = send_person_param.rcvMsg_pool;
              world.persons[send_person_key].sendMsg_history = send_person_param.sendMsg_history;
              world.persons[send_person_key].rcvMsg_history = send_person_param.rcvMsg_history;
				console.log('send_id:',world.persons[send_person_key].id);	
				console.log('sendMSG:',world.persons[send_person_key].sendMsg_pool[0].sendMSG);
				console.log('mh:',world.persons[send_person_key].mh);
								var text_Sendid = world.persons[send_person_key].id;
/*
							addText('send_id:'+text_Sendid);
							addText('sendMsg:'+world.persons[send_person_key].sendMsg_pool[0].sendMSG);
							addText('x:'+world.persons[send_person_key].x+',y:'+world.persons[send_person_key].y);
							addText('mh:'+world.persons[send_person_key].mh);
*/
							addText('send_id:,'+text_Sendid+',sendMsg:,'+world.persons[send_person_key].sendMsg_pool[0].sendMSG+',x:,'+world.persons[send_person_key].x+',y:,'+world.persons[send_person_key].y+',mh:,'+world.persons[send_person_key].mh);
				
              // rcv側Personパラメータ更新
              world.persons[rcv_person_key].sendMsg_pool = rcv_person_param.sendMsg_pool;
              world.persons[rcv_person_key].rcvMsg_pool = rcv_person_param.rcvMsg_pool;
              world.persons[rcv_person_key].sendMsg_history = rcv_person_param.sendMsg_history;
              world.persons[rcv_person_key].rcvMsg_history = rcv_person_param.rcvMsg_history;
				console.log('rcv_id',world.persons[rcv_person_key].id);
				console.log(world.persons[rcv_person_key].rcvMsg_pool);
								var text_Rcvid = world.persons[rcv_person_key].id;
							addText('rcv_id:'+text_Sendid);
							addText('rcvMsg:'+world.persons[rcv_person_key].rcvMsg_pool.rcvMSG);
							
              // rcv側MH変動
              world.persons[rcv_person_key].mh = rcv_person_param.mh;
              
              // send側Person移動
              world.persons[send_person_key].moveTo({
                x: send_person_param.x, 
                y: send_person_param.y
              });
              
              // rcv側Person移動
              world.persons[rcv_person_key].moveTo({
                x: rcv_person_param.x, 
                y: rcv_person_param.y
              });
              
              // 矢印描画
              if($(world.elm_draw_arrow).prop("checked") === true){
                if(send_person_key !== rcv_person_key){
                  world.canvas.drawArrow({
                    from_id: sendMsg.from.id, 
                    to_id: sendMsg.to.id, 
                    strokeDash: sendMsg.negative
                  });
                } else {
                  world.canvas.drawSelfArrow({
                    from_id: sendMsg.from.id, 
                    to_id: sendMsg.to.id, 
                    strokeDash: sendMsg.negative
                  });
                }
                world.canvas.drawRcvIcon({
                  from_id: sendMsg.from.id, 
                  to_id: sendMsg.to.id, 
                  strokeDash: rcvMsg.negative
                });
              }
            }, world);
            
            // ターン数描画
            $(world.elm_turn_count).html(world.turn_num+1);
            
            return;
        }
      };
    };
    world.worker.addEventListener('message', message_func(world));
    
    // シミュレーション初期化
    world.initSimulation();
    
    // シミュレーション開始
    world.startSimulation();
    world.executeSimulation();
    
    return true;
  });
  
  
  // 初期化ボタンクリックイベント
  $(document).on('click', this.elm_reset_button, {
    world: this
  }, function(event){
    var world = event.data.world;
    world.init(); // 初期化
  });
  
  
  // 人数変更イベント
  $(document).on('change', this.elm_person_num, {
    world: this
  }, function(event){
    var world = event.data.world;
    
    // 個人関係データ初期化
    world.deleteAllPersons();   // 個人内部データ初期化
    world.initCanvas();  // キャンバス初期化
    $(world.elm_person_information_area).hide();  // 個人情報表示エリア非表示
    
    // スイッチ処理(スコープ汚染防止)
    var persons = [];
    var switch_function = {
      
      // 任意配置
      0(world){
        
      },
      
      // 1人配置
      1(world){
        let x = world.width / 2;
        let y = world.height / 2;
        persons.push({x: x, y: y});
      },
      
      // 2人配置
      2(world){
        let x, y;
        for(var i = 0; i < 2; i++){
          x = (world.width / 2) * i + (world.width / 4);
          y = world.height / 2;
          persons.push({x: x, y: y});
        }
      },
      
      // 3人配置
      3(world){
        // 正三角形の頂点を描画
        let x, y;
        [30, 150, 270].forEach(function(val, index){
          x = Math.cos(val * Math.PI / 180) * 150 + world.width / 2;
          y = Math.sin(val * Math.PI / 180) * 150 + world.height / 2;
          persons.push({x: x, y: y});
        });
      },
      
      // 9人配置
      9(world){
        let x, y;
        for(var i = 0; i < 3; i++){
          for(var j = 0; j < 3; j++){
            x = j * world.width / 4 + world.width / 4;
            y = i * world.height / 4 + world.height / 4;
            persons.push({x: x, y: y});
          }
        }
      }
    };
    
    switch_function[$(world.elm_person_num).val()](world);  // 実行

    world.createPersons(persons); // 個人作成
    world.drawAllPersons();       // 描画
  });
  
  // 個人削除ボタンクリックイベント
  $(document).on('click', this.elm_person_delete_button, {
    world: this
  }, function(event){
    var world = event.data.world;
    var selected_person = $(world.elm_selected_person).val();
    
    // 個人削除
    world.deletePerson({id: selected_person});
    world.erasePerson({id: selected_person});
    $(world.elm_person_information_area).hide();
  });
  
};


// public 初期化
World.prototype.init = function() {
  var fs = require('fs');
  var formatCSV = '';
  
  // 内部データ初期化 (現状は個人データのみ)
  this.deleteAllPersons();
  
  // キャンバス初期化
  this.initCanvas();
  
  // 初期値設定
  $(this.elm_person_num).val('0');
  $(this.elm_turn_num).val(100);
  $(this.elm_speed_num).val(3);
  $(this.elm_draw_arrow).prop("checked", true);
  $(this.elm_start_button).val('Start');
  $(this.elm_turn_count).html(0);
  
  // 個人情報表示エリア非表示
  $(this.elm_person_information_area).hide();
};


//// シミュレーション関連

// public シミュレーション開始処理
World.prototype.startSimulation = function() {
  this.is_simulation_started = true;
  $(this.elm_turn_count).html(this.turn_num);
  $(this.elm_person_information_area).hide();
  $(this.elm_turn_count).html(0);
  $(this.elm_start_button).val("Stop");
  $(this.elm_person_num).prop("disabled", true);
  $(this.elm_turn_num).prop("disabled", true);
  $(this.elm_speed_num).prop("disabled", true);
  $(this.elm_draw_arrow).prop("disabled", true);
  $(this.elm_reset_button).prop("disabled", true);
  $(this.target).prop("disabled", true);
};

// public シミュレーション開始前初期化処理
World.prototype.initSimulation = function() {
  this.is_simulation_started = false;
  this.is_simulation_paused = false;
  this.turn_num = 0;
};

// public シミュレーション終了処理
World.prototype.finishSimulation = function() {
  $(this.elm_person_information_area).hide();
  $(this.elm_start_button).val("Start");
  $(this.elm_person_num).prop("disabled", false);
  $(this.elm_turn_num).prop("disabled", false);
  $(this.elm_speed_num).prop("disabled", false);
  $(this.elm_draw_arrow).prop("disabled", false);
  $(this.elm_reset_button).prop("disabled", false);
  $(this.target).prop("disabled", false);
  this.is_simulation_started = false;
  addText("Finished!");
  alert("Simulation Finished.");
};

// public シミュレーション一時停止
World.prototype.pauseSimulation = function() {
  this.is_simulation_paused = true;
  $(this.elm_start_button).val("Resume");
	addText("Pause.");
};

// public シミュレーション再開
World.prototype.unpauseSimulation = function() {
  this.is_simulation_paused = false;
  $(this.elm_start_button).val("Stop");
};

// public シミュレーション開始前バリデーション
World.prototype.validateSimulation = function() {
  if($(this.elm_person_num).val().length === 0 || 
    $(this.elm_turn_num).val().length === 0 || 
    $(this.elm_speed_num).val().length === 0){
    alert("Please set the Number of person, Turn, Speed correctly.");
    return false;
  }
  if(this.person_num() === 0){
    alert("1 or more persons required.");
    return false;
  }
};

// public シミュレーション開始中判定
World.prototype.isSimulationStarted = function() {
  return this.is_simulation_started;
};

// public シミュレーション一時停止中判定
World.prototype.isSimulationPaused = function() {
  return this.is_simulation_paused;
};

// public シミュレーション(1ターン)開始
World.prototype.executeSimulation = function() {
  // シミュレーション用にPersons複製
  var simulation_persons = {};
  for(let[key, value] of Object.entries(this.persons)){
    simulation_persons[key] = new Person({
      id: value.id,
      name: value.name,
      dname: value.dname,
      organization: value.organization,
      x: +value.x, 
      y: +value.y,
      mh: +value.mh,
      sensitivity_a: +value.sensitivity_a,
      sensitivity_b: +value.sensitivity_b,
      influence_a: +value.influence_a,
      influence_b: +value.influence_b
    });
  }
  
  // シミュレーション開始
  this.worker.postMessage({
    persons: simulation_persons,
    speed_num: $(this.elm_speed_num).val()
  });
  
};

//// プロパティライク

// 個人の総数を返す
World.prototype.person_num = function() {
  return Object.keys(this.persons).length;
};

// ターン数を返す
World.prototype.turnCount = function() {
	return val(this.elm_turn_count);
};

//// 組織関係メソッド

// public 新たに作成した組織を世界に追加する
World.prototype.newOrganization = function(obj) {
  this.organizations.push(new Organization(obj));
};

// public 組織を世界に追加する
World.prototype.addOrganization = function(obj) {
  this.organizations.push(obj);
};

// public 組織を世界から削除する
World.prototype.deleteOrganization = function(obj) {
  //delete ;
};

// addtext

//// 個人関係メソッド

// public 個人を作成する (obj: {type: タイプ, name: 名前, 
//                              x: x, y: y, mh: メンタルヘルス値, 
//                              sensitivity_a: 受信特性a,
//                              sensitivity_b: 受信特性b,
//                              influence_a: 発信特性a,
//                              influence_b: 発信特性b})
World.prototype.createPerson = function(obj) {
  
  // キャンバス追加
  obj['canvas'] = this.canvas;
  
  // 暫定的に組織(=世界)追加
  obj['organization'] = new Organization({width: this.width, height: this.height});
  
  // Person作成
  var person = new Person(obj);
  
  // 既存personと重なる位置には配置不可
  for(let [key, value] of Object.entries(this.persons)){
    if((value.x > person.x - person.circle_width) && 
      (value.x < person.x + person.circle_width) && 
      (value.y > person.y - person.circle_height) && 
      (value.y < person.y + person.circle_height)){
        return false;
      }
  }
  
  // person登録
  this.persons[person.id] = person;
  
  return person;
};

// public 個人を作成する (obj: [{type: タイプ, name: 名前, 
//                              x: x, y: y, mh: メンタルヘルス値, 
//                              sensitivity_a: 受信特性a,
//                              sensitivity_b: 受信特性b,
//                              influence_a: 発信特性a,
//                              influence_b: 発信特性b}])
World.prototype.createPersons = function(obj) {
  obj.forEach(function(val, index, array){
    this.createPerson(val);
  }, this);
};

// public 個人を削除する (obj: {id: PersonID})
World.prototype.deletePerson = function(obj) {
  if(obj.id in this.persons){
    delete this.persons[obj.id];
  }
  return true;
};

// public 個人を全て削除する
World.prototype.deleteAllPersons = function() {
  this.persons = {};
};

// public 個人を取得する
World.prototype.getPerson = function(obj) {
  
};


//// 描画関係メソッド

// public 個人を描画する (obj: {id: personID})
World.prototype.drawPerson = function(obj) {
  if(obj.id in this.persons){
    this.canvas.drawPerson(this.persons[obj.id]);
    $(this.elm_person_count).html(this.person_num());
  }
};

// public 全個人を描画する
World.prototype.drawAllPersons = function() {
  for(let [key, value] of Object.entries(this.persons)){
    this.drawPerson({id: value.id});
  }
};

// public 個人の描画を削除する
World.prototype.erasePerson = function(obj) {
  this.canvas.erasePerson(obj);
  $(this.elm_person_count).html(this.person_num());
};

// public 描画初期化
World.prototype.initCanvas = function() {

  // キャンバス初期化
  this.canvas.initCanvas();

  // 配置済み個人数初期化
  $(this.elm_person_count).html(0);
};



////////////////////////////////////////////////////////////////////////////////
// マルチスレッド用処理
////////////////////////////////////////////////////////////////////////////////

var worker_function = function(){
  // シミュレーション用Personクラス
  Person = function(obj) {
    this.id = obj.id;
    this.dname = obj.dname === undefined ? 'A': obj.dname;
    this.name = obj.name === undefined ? 'person': obj.name;
    this.organization = obj.organization === undefined ? '' : obj.organization;
    this.x = obj.x === undefined ? 50 : obj.x;   // x座標
    this.y = obj.y === undefined ? 50 : obj.y;   // y座標
    this.mh = obj.mh === undefined ? 0 : obj.mh;  // メンタルヘルス値
    this.sensitivity_a = obj.sensitivity_a === undefined ? 1 : obj.sensitivity_a;   // 受信特性a
    this.sensitivity_b = obj.sensitivity_b === undefined ? 0 : obj.sensitivity_b;   // 受信特性b
    this.influence_a = obj.influence_a === undefined ? 1 : obj.influence_a;       // 発信特性a
    this.influence_b = obj.influence_b === undefined ? 0 : obj.influence_b;       // 発信特性b
    
    this.rcvMsg_pool = {};      // 受信メッセージ保管用
    this.sendMsg_pool = [];     // 発信メッセージ保管用
    this.rcvMsg_history = [];   // 受信メッセージ履歴
    this.sendMsg_history = [];  // 発信メッセージ履歴
  };
  
  // private 原メッセージを発生させる
  Person.prototype._generateMessage = function() {
    // Box Muller法のjavascript実装
    return Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
  };
  
  // public sendMSGを発生させる (person: Person)
  Person.prototype.sendMessage = function(person) {
    var sendMSG = this.influence_a * this._generateMessage() + this.influence_b;
    var negative = sendMSG < 0 ? true: false;
    var sendMsgObj = {
      from: this, 
      to: {
        id: person.id,
        dname: person.dname,
        x: person.x, y: person.y,
        person: person
      },
      sendMSG: sendMSG,
      rcvMSG: null,
      negative: negative
    };
    this.sendMsg_pool.push(sendMsgObj);
     // console.log(`【MSG発信】from: ${sendMsgObj.from.dname} to ${sendMsgObj.to.dname}`);
    return sendMsgObj;
  };
  
  // public rcvMSGを発生させる (MsgObj)
  Person.prototype.receiveMessage = function(sendMsgObj) {
    var rcvMSG = this.sensitivity_a * sendMsgObj.sendMSG + this.sensitivity_b;
    var negative = rcvMSG < 0 ? true: false;
    var rcvMsgObj = {
      from: {
        id: sendMsgObj.from.id,
        dname: sendMsgObj.from.dname,
        x: sendMsgObj.from.x, y: sendMsgObj.from.y,
        person: sendMsgObj.from
      },
      to: this,
      sendMSG: null,
      rcvMSG: rcvMSG,
      negative: negative
    };
    this.rcvMsg_pool[sendMsgObj.from.id] = rcvMsgObj;
    // console.log(`【MSG受信】from:${rcvMsgObj.from.dname} to ${rcvMsgObj.to.dname}`);
    return rcvMsgObj;
  };
  
  // public rcvMsgを取得する (person_id)
  Person.prototype.getRcvMsgFromPool = function(person_id) {
    return this.rcvMsg_pool[person_id];
  };
  
  // public 蓄積した情報を元に1ターン分移動する(描画無し・バックグラウンド用)
  Person.prototype.moveBy1TurnWithoutDrawing = function() {
    for(let [key, value] of Object.entries(this.sendMsg_pool)){
      let to_person = value.to.person;
      let rcvMsg = to_person.getRcvMsgFromPool(value.from.id);
      
      // rcv側MH変動
      to_person.feelByMsg(rcvMsg);
      
      // 自身へのメッセージ以外について移動処理
      if(value.from.id !== value.to.id){ 
        
        // send側移動
        this.addCoord(this.calcCoordFromMsg(value));
        
        // rcv側移動
        to_person.addCoord(to_person.calcCoordFromMsg(rcvMsg));
        
      }
      
      return [{
        cmd: "moving", 
        args: {
          from_person: this,
          to_person: to_person,
          sendMsg: value,
          rcvMsg: rcvMsg
        }
      }];
      
    }
    
  };
  
  // public rcvMsgを元にメンタルヘルス値を変動させる
  Person.prototype.feelByMsg = function(rcvMsg) {
    // console.log(`【MH変動】${rcvMsg.rcvMSG}`);
    this.mh += rcvMsg.rcvMSG;
  };
  
  // public 1ターン終了処理
  Person.prototype.finish1Turn = function() {
    
    // 履歴へ情報を移動
    this.sendMsg_history = this.sendMsg_history.concat(this.sendMsg_pool);
    this.rcvMsg_history = this.rcvMsg_history.concat(this.rcvMsg_pool);
	
    // プール初期化
    this.sendMsg_pool = [];
    this.rcvMsg_pool = {};
  };
  
  // public Personとの距離算出 (person: Person)
  Person.prototype.calcDistance = function(person) {
    return Math.sqrt(Math.pow(this.x - person.x, 2) + Math.pow(this.y - person.y, 2));
  };
  
  // public 送信先(受信する)Personを選ぶ (persons: [Person,])
  Person.prototype.selectRcvPerson = function(persons) {
    var ranks = [];
    
    // 各個人への距離を算出
    for(let [key, value] of Object.entries(persons)){
      ranks.push({person: value, distance: this.calcDistance(value)});
    }
    
    // distanceをキーに昇順ソート
    ranks.sort(function(a,b){
      if(a.distance < b.distance) return -1;
      if(a.distance > b.distance) return 1;
      return 0;
    });
    
    // 距離の近い順から確率計算
    var n = Object.keys(persons).length;
    for(let [key, value] of Object.entries(ranks)){
      ranks[key]['odds'] = (n - key) / (n * (n + 1) / 2);
    }
    
    var dice = Math.random();
    var total_odds = ranks[0].odds;
    for(let [key, value] of Object.entries(ranks)){
      if(dice < total_odds){
        return value.person;
      }
      total_odds += value.odds;
    }
    return ranks[ranks.length - 1].person;  // 配列の最後を返す
  };
  
  // public メッセージを元に移動座標を算出する
  Person.prototype.calcCoordFromMsg = function(MsgObj) {
    var deg;      // 角度
    var distance; // 距離(斜辺：三角関数)
    var x, y;     // 距離(底辺、高さ：三角関数)
    var Msg;      // メッセージ
    var x1, x2, y1, y2; // 2点座標
    
    if(MsgObj.rcvMSG === null){
      // sendMSG
      Msg = MsgObj.sendMSG;
      x1 = MsgObj.from.x;
      y1 = MsgObj.from.y;
      x2 = MsgObj.to.x;
      y2 = MsgObj.to.y;
    } else {
      // rcvMsg
      Msg = MsgObj.rcvMSG;
      x1 = MsgObj.to.x;
      y1 = MsgObj.to.y;
      x2 = MsgObj.from.x;
      y2 = MsgObj.from.y;
    }
    
    // 同じ座標だった場合は移動しない
    if((x1 == x2) &&  (y1 == y2)){
      return {x: x1, y: y1};
    }
    
    deg = Math.atan((y2 - y1) / (x2 - x1));
    distance = Math.abs(Msg);
    
    x = distance * Math.cos(deg);
    y = distance * Math.sin(deg);
    
    if(Msg < 0){
      x = -x;
      y = -y;
    }
    if((y2 - y1) < 0 && (x2 - x1) < 0){
      x = -x;
      y = -y;
    } else if((x2 - x1) < 0){
      x = -x;
      y = -y;
    }
    
    return {x: x, y: y};
  };
  
  // public 座標を設定する
  Person.prototype.addCoord = function(coord) {
    if(this.x + coord.x < 0){
      this.x = 0;
    } else if(this.x + coord.x > this.organization.width){
      this.x = this.organization.width;
    } else {
      this.x = this.x + coord.x;
    }
    if(this.y + coord.y < 0){
      this.y = 0;
    } else if(this.y + coord.y > this.organization.height){
      this.y = this.organization.height;
    } else {
      this.y = this.y + coord.y;
    }
  };
  
  
  
  // シミュレーション用スレッド
  self.addEventListener('message', function(event) {
    
    // オブジェクトから設定値取得
    var persons_param = event.data.persons;
    var persons = {};
    var speed_num = event.data.speed_num;
    var speed = 300 * (4 - speed_num) + 100;  // ウェイト秒(ms)
    var args = [];  // ターン毎のメッセージ履歴(描画用)
    
    // シミュレーションスタート
    
    // メインスレッドから届いたデータを処理用に加工
    for(let[key, value] of Object.entries(persons_param)){
      persons[key] = new Person({
        id: persons_param[key].id,
        name: persons_param[key].name,
        dname: persons_param[key].dname,
        organization: persons_param[key].organization,
        x: persons_param[key].x, 
        y: persons_param[key].y,
        mh: persons_param[key].mh,
        sensitivity_a: persons_param[key].sensitivity_a,
        sensitivity_b: persons_param[key].sensitivity_b,
        influence_a: persons_param[key].influence_a,
        influence_b: persons_param[key].influence_b
      });
    }
      
    args = [];
    
    // 各個人に対してメッセージ送受信
    for(let[key, value] of Object.entries(persons)){
      
      // メッセージ発信先決定
      let rcvPerson = value.selectRcvPerson(persons);
      
      // メッセージ受発信
      rcvPerson.receiveMessage(value.sendMessage(rcvPerson));
      
      // 移動・MH変動
      args = args.concat(value.moveBy1TurnWithoutDrawing());
      
    }
    
    // ターン中の全メッセージデータを描画用に通知
    self.postMessage({
      cmd: "turn_messages", 
      args: args
    });
    
    var d1 = new Date().getTime(); 
    var d2 = new Date().getTime(); 
    while( d2 < d1+speed ){ 
      d2=new Date().getTime(); 
    } 
    
    // ターン終了処理
    for(let [key, value] of Object.entries(persons)){
      value.finish1Turn();
    }
    
    // ターン終了
    self.postMessage({
      cmd: "turn_end"
    });
      
  }, false);
};

