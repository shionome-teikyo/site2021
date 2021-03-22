const fs   = require('fs');
const http = require('http');

http.createServer((req, res) => {
  // リクエスト URL を取得する
  let url = req.url;
  console.log(url);
  // 「/」に対するリクエストには index.html を返す
  if(url === '/') {
	url = '/rakko.html';
  }
  
  // レスポンスデータを格納する変数
  let responseData = null;
  
  // fs を利用してリクエスト URL に該当するファイルを読み込む (このファイルからの相対パスとして扱う)
  fs.readFile(`.${url}`, (error, data) => {
	if(error) {
	  // ファイルが読み取れなかった場合は 404 エラーとして返答する
	  console.log('404 Error');
	  //res.writeHead(404);
	}
	else {
	  // ファイルの内容が受け取れたらレスポンスデータとして設定する
	  responseData = data;
	  
	  // 拡張子をキーに Content-Type を得るための連想配列を定義しておく
	  const extToType = {
		'html': 'html',
		'js'  : 'javascript',
		'css' : 'stylesheet'
	  };
	  
	  // ファイル名から拡張子を取得する
	  const fileNameArray = url.split('.');
	  const ext = fileNameArray[fileNameArray.length - 1].toLowerCase();
	  
	  // Content-Type が分かればそれに、分からなければプレーンテキストとして返す
	  const type = extToType[ext] || 'plain';
	  // HTTP 200 として返答する
	  res.writeHead(200, { 'Content-Type': `text/${type}` });
	}
	
	// レスポンスデータを設定し、レスポンスを返す
	res.end(responseData);
  });
  }).listen(9999);  // サーバをポート 9999 で起動する
  
  console.log('http://localhost:9999/');