////////////////////////////////////////////////////////////////////////////////
//  個人クラス
////////////////////////////////////////////////////////////////////////////////

Person = function(obj) {
  this.id = obj.id === undefined ? this._uuid() : obj.id;
  this.dname = obj.dname === undefined ? 'A': obj.dname;
  this.name = obj.name === undefined ? 'person': obj.name;
  this.organization = obj.organization === undefined ? 'default Org.' : obj.organization;
  this.x = obj.x === undefined ? 50 : obj.x;   // x座標
  this.y = obj.y === undefined ? 50 : obj.y;   // y座標
  this.mh = obj.mh === undefined ? 0 : obj.mh;  // メンタルヘルス値
  this.sensitivity_a = obj.sensitivity_a === undefined ? 1 : obj.sensitivity_a;   // 受信特性a
  this.sensitivity_b = obj.sensitivity_b === undefined ? 0 : obj.sensitivity_b;   // 受信特性b
  this.influence_a = obj.influence_a === undefined ? 1 : obj.influence_a;       // 発信特性a
  this.influence_b = obj.influence_b === undefined ? 0 : obj.influence_b;       // 発信特性b
  this.circle_width = 20;   // 描画用パラメータ：Person描画時の円の横幅
  this.circle_height = 20;  // 描画用パラメータ：Person描画時の円の縦幅
  
  this.rcvMsg_pool = [];      // 受信メッセージ保管用
  this.sendMsg_pool = [];     // 発信メッセージ保管用
  this.rcvMsg_history = [];   // 受信メッセージ履歴
  this.sendMsg_history = [];  // 発信メッセージ履歴
  
  this.canvas = obj.canvas;   // キャンバス要素
};

// private UUIDの生成 (RFC4122準拠)
Person.prototype._uuid = function() {
  var uuid = "", i, random;
  for (i = 0; i < 32; i++) {
    random = Math.random() * 16 | 0;

    if (i == 8 || i == 12 || i == 16 || i == 20) {
      uuid += "-";
    }
    uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
  }
  return uuid;
};

// public 指定座標分移動する (coord: {x: x, y: y})
Person.prototype.move = function(coord) {
  
  // 自身のパラメータを修正
  this.addCoord(coord);
  
  this.canvas.redrawPerson(this);
};

// public 指定座標へ移動する (coord: {x: x, y: y})
Person.prototype.moveTo = function(coord) {

  // 自身のパラメータを修正
  this.setCoord(coord);
  
  this.canvas.redrawPerson(this);
};

// public 蓄積した情報を元にメンタルヘルス値を変動させる
Person.prototype.feelBy1Turn = function() {
  for(let [key, value] of Object.entries(this.rcvMsg_pool)){
    this.mh += value.rcvMSG;
  }
};

// public 1ターン終了処理
Person.prototype.finish1Turn = function() {
  
  // 履歴へ情報を移動
  this.sendMsg_history = this.sendMsg_history.concat(this.sendMsg_pool);
  this.rcvMsg_history = this.rcvMsg_history.concat(this.rcvMsg_pool);
  
  // プール初期化
  this.sendMsg_pool = [];
  this.rcvMsg_pool = [];

};

// public 蓄積した情報を元に1ターン分移動する(描画無し・バックグラウンド用)
Person.prototype.moveBy1TurnWithoutDrawing = function() {
  for(let [key, value] of Object.entries(this.sendMsg_pool)){
    if(value.from.id === value.to.id){ continue; }
    this.addCoord(this.calcCoordFromMsg(value));
  }
  for(let [key, value] of Object.entries(this.rcvMsg_pool)){
    if(value.from.id === value.to.id){ continue; }
    this.addCoord(this.calcCoordFromMsg(value));
  }
};

// public 座標を設定する
Person.prototype.setCoord = function(coord) {
  if(coord.x < 0){
    this.x = 0;
  } else if(coord.x > this.organization.width){
    this.x = this.organization.width;
  } else {
    this.x = coord.x;
  }
  if(coord.y < 0){
    this.y = 0;
  } else if(coord.y > this.organization.height){
    this.y = this.organization.height;
  } else {
    this.y = coord.y;
  }
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

// 配列をcsvで保存するfunction
function exportCSV(content){
  for (var i = 0; i < content.length; i++) {
	  var value = content[i];
	  
	  for (var j = 0; j < value.length; j++) { var innerValue = value[j]===null?'':value[j].toString(); var result = innerValue.replace(/"/g, '""'); if (result.search(/("|,|\n)/g) >= 0)
	  result = '"' + result + '"';
	  if (j > 0)
	  formatCSV += ',';
	  formatCSV += result;
	}
	formatCSV += '\n';
  }
  fs.writeFile('formList.csv', formatCSV, 'utf8', function (err) {
	if (err) {
	  console.log('保存できませんでした');
	} else {
	  console.log('保存できました');
	}
  });
}
