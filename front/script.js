import { RelayServer } from "https://chirimen.org/remote-connection/js/beta/RelayServer.js";

var channel;
var markersLayer_raspi = new L.LayerGroup(); // マーカーレイヤーを初期化
var markersLayer_sp = new L.LayerGroup(); // マーカーレイヤーを初期化

var tramStations = [
  { latitude: 33.8484007, longitude: 132.7849554, name: '<b>道後公園</b><br>' },
  { latitude: 33.8503724, longitude: 132.7849963, name: '<b>道後温泉</b><br>' },
  { latitude: 33.8465721, longitude: 132.7754855, name: '<b>上一万</b><br>' },
  { latitude: 33.8443839, longitude: 132.7753400, name: '<b>警察署前</b><br>' },
  { latitude: 33.8417423, longitude: 132.7748572, name: '<b>勝山町</b><br>最寄りのラーメン屋<br><a href="https://tabelog.com/ehime/A3801/A380101/38014085/" target="_blank">明日食堂</b></a>' },
  { latitude: 33.8412263, longitude: 132.7701787, name: '<b>大街道</b><br>最寄りのラーメン屋<br><a href="https://tabelog.com/ehime/A3801/A380101/38011671/" target="_blank">錦iwamoto</b></a><br><a href="https://tabelog.com/ehime/A3801/A380101/38000319/" target="_blank">麺鮮醤油房周平</b></a><br><a href="https://tabelog.com/ehime/A3801/A380101/38010904/" target="_blank">つけめん　蔵木</b></a>' },
  { latitude: 33.8410453, longitude: 132.7665007, name: '<b>県庁前</b><br>' },
  { latitude: 33.839828, longitude: 132.764865, name: '<b>市役所前駅</b><br>' },
  { latitude: 33.839218, longitude: 132.761906, name: '<b>南堀瑞</b><br>最寄りのラーメン屋<br><a href="https://tabelog.com/ehime/A3801/A380101/38009893/" target="_blank">彩食堂</b></a>' },
  {// latitude: 33.839332, longitude: 132.761182, name: '<b>南堀瑞駅</b><br>' },
    latitude: 33.840074, longitude: 132.758302, name: '<b>西堀瑞</b><br>'
  },
  { latitude: 33.840149, longitude: 132.755457, name: '<b>大手町駅前</b><br>最寄りのラーメン屋<br><a href="https://tabelog.com/ehime/A3801/A380101/38013859/" target="_blank">番町製麺</b></a>' },
  { latitude: 33.841030, longitude: 132.752318, name: '<b>JR松山前駅</b><br>' },
  { latitude: 33.843918, longitude: 132.752563, name: '<b>宮田町</b><br>' },
  { latitude: 33.847231, longitude: 132.755289, name: '<b>古町</b><br>' },
  { latitude: 33.851445, longitude: 132.756234, name: '<b>萱町六丁目</b><br>' },
  { latitude: 33.853471, longitude: 132.758488, name: '<b>本町六丁目</b><br>' },
  { latitude: 33.853334, longitude: 132.758901, name: '<b>本町六丁目</b><br>' },
  { latitude: 33.853529, longitude: 132.760615, name: '<b>木屋町駅</b><br>' },
  { latitude: 33.851382, longitude: 132.762466, name: '<b>高砂町</b><br>最寄りのラーメン屋<br><a href="https://tabelog.com/ehime/A3801/A380101/38012446/" target="_blank">油そば　周平</b></a>' },
  { latitude: 33.849147, longitude: 132.764850, name: '<b>清水町</b><br>' },
  { latitude: 33.848071, longitude: 132.769312, name: '<b>鉄炮町</b><br>最寄りのラーメン屋<br><a href="https://tabelog.com/ehime/A3801/A380101/38013435/" target="_blank">夢を語れ　松山</b></a>' },
  { latitude: 33.848041, longitude: 132.773169, name: '<b>文京町</b><br>' },
  { latitude: 33.847595, longitude: 132.774549, name: '<b>平和通り一丁目</b><br>' },
  { latitude: 33.840309, longitude: 132.758732, name: '<b>本町一丁目</b><br>' },
  { latitude: 33.845139, longitude: 132.758780, name: '<b>本町三丁目</b><br>' },
  { latitude: 33.847837, longitude: 132.758838, name: '<b>本町四丁目</b><br>' },
  { latitude: 33.850614, longitude: 132.758813, name: '<b>本町五丁目</b><br>最寄りのラーメン屋<br><a href="https://tabelog.com/ehime/A3801/A380101/38010868/" target="_blank">横浜家系ラーメン・黒帯</b></a>' },
  { latitude: 33.836200, longitude: 132.762188, name: '<b>松山市駅</b><br>最寄りのラーメン屋<br><a href="https://tabelog.com/ehime/A3801/A380101/38012616/" target="_blank">味噌とんこつラーメン　まる</b></a><br><a href="https://tabelog.com/ehime/A3801/A380101/38000131/" target="_blank">ラーメンショップ銀天街</b></a><br><a href="https://tabelog.com/ehime/A3801/A380101/38013677/" target="_blank">東京油組総本店　松山組</b></a><br><a href="https://tabelog.com/ehime/A3801/A380101/38011335/" target="_blank">拉麺　閏</b></a>' },
  { latitude: 33.8473983, longitude: 132.7798386, name: '<b>南町</b><br>' },
  // 他の駅のデータも追加
];

document.addEventListener("DOMContentLoaded", function() {
  // Leafletの地図を初期化
  var map = L.map("map").setView([33.8460057, 132.7628741], 15); // 中心座標とズームレベル

  // OpenStreetMapのタイルレイヤーを追加
  L.tileLayer("http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
    attribution:
      '<a href="https://www.openstreetmap.org/copyright" target="_blank">©OpenStreetMap</a> contributors, Tiles: <a href="http://map.hotosm.org/" target="_blank">©HOT</a>',
  }).addTo(map); //最初に表示させるタイルに addTo() をつける

  onload = async function() {
    // webSocketリレーの初期化
    var relay = RelayServer("chirimentest", "chirimenSocket");
    channel = await relay.subscribe("TUZUKIGPS");
    //messageDiv.innerText = "web socketリレーサービスに接続しました";
    channel.onmessage = getMessage;
  };

  window.addEventListener(
    "DOMContentLoaded",
    function() {
      if (navigator.geolocation) {
        //var watchId = navigator.geolocation.watchPosition(successFunc, errorFunc);
        updateLocation();
        // 1秒ごとに位置情報を更新
        //setInterval(updateLocation, 4000);
      } else {
        document
          .getElementById("ex_gps")
          .insertAdjacentHTML(
            "afterbegin",
            "エラー：geolocationを取得できません。",
          );
      }
    },
    false,
  );

  function getMessage(msg) {
    // メッセージを受信したときに起動する関数
    var mdata = msg.data;
    var iconimage;
    var nakamimozi;
    //messageDiv.innerText = JSON.stringify(mdata);
    console.log("mdata:", mdata);
    // numTd.innerText = mdata.num;
    // typeTd.innerText = mdata.type;
    // timeTd.innerText = mdata.time;
    // statusTd.innerText = mdata.status;
    // latiTd.innerText = mdata.latitude;
    // lonTd.innerText = mdata.longitude;
    // spdTd.innerText = mdata.speed;
    // dirTd.innerText = mdata.direction;
    // dateTd.innerText = mdata.date;
    // humanTd.innerText = mdata.human;
    // mdata.humanの値を取得
    var mdataHuman = mdata.human;

    // 判定ロジック
    var humanInfo;
    if (mdataHuman <= 10) {
      humanInfo = "低";
    } else if (mdataHuman <= 20) {
      humanInfo = "中";
    } else if (mdataHuman = "None") {
      humanInfo = "ガラガラです";
    } else if (mdataHuman <= 30) {
      humanInfo = "高";
    } else {
      humanInfo = "激混み";
    }

    if (mdata.num == 1) {
      //アイコンの色，画像指定
      iconimage = '電車のフリーアイコン.png',
        nakamimozi = "路線などを説明<br>乗車率：" + humanInfo
      // GPS1のアイコン
    }
    var dennsha = L.icon({
      iconUrl: iconimage,
      iconSize: [50, 50], // アイコンのサイズ
      iconAnchor: [16, 32], // アイコンのアンカー位置（底辺中央）
      popupAnchor: [0, -20] // ポップアップの位置（上辺中央）
    });

    // マーカーを作成
    //var marker2 = L.marker([33.8520611, 132.7865251], { icon: dennshared }).addTo(map);

    // ポップアップに表示されるHTML要素を作成
    var popupContent = "<b>道後温泉本館</b><br>ここに詳細な情報が入ります。";

    // ポップアップのサイズを指定
    var popupOptions = {
      maxWidth: 300, // ポップアップの最大幅
      maxHeight: 200, // ポップアップの最大高さ
    };

    // ポップアップを作成し、上記で作成したHTML要素を追加
    var popup = L.popup(popupOptions).setContent(popupContent);

    // マーカーにポップアップを設定
    marker2.bindPopup(popup);

    // マーカーがクリックされたときにポップアップを表示
    marker2.on("click", function() {
      marker2.openPopup();
    });

    //緯度経度の１０進数への変換
    var lat = mdata.latitude;
    var lon = mdata.longitude;
    markersLayer_raspi.clearLayers();
    if (lat == !0) {
      var newMarker = L.marker([lat, lon], { icon: dennsha })
        .addTo(markersLayer_raspi)
        .bindPopup(nakamimozi + lat)
        .openPopup();

      markersLayer_raspi.addTo(map);
    }
  }

  function updateLocation() {
    navigator.geolocation.getCurrentPosition(successFunc, errorFunc);
  }
  function successFunc(position) {
    var crd = position.coords;

    var text =
      "緯度 latitude：" +
      crd.latitude +
      "<br />" +
      "経度 longitude：" +
      crd.longitude +
      "<br />" +
      "高度 altitude：" +
      crd.altitude +
      "<br />" +
      "水平方向の誤差 accuracy：" +
      crd.accuracy +
      "<br />" +
      "垂直方向の誤差 altitudeAccuracy：" +
      crd.altitudeAccuracy +
      "<br />" +
      "方向 heading：" +
      crd.heading +
      "<br />" +
      "速度 speed：" +
      crd.speed;

    var lat = crd.latitude;
    var lon = crd.longitude;
    markersLayer_sp.clearLayers();

    var newMarker = L.marker([lat, lon])
      .addTo(markersLayer_sp)
      .bindPopup("現在地１")
      .openPopup();

    markersLayer_sp.addTo(map);
    //document.getElementById("ex_gps").innerHTML = text;
  }

  function errorFunc(error) {
    //document.getElementById("ex_gps").innerHTML =
    //"エラーコード：" + error.code + "<br />エラー内容：" + error.message;
  }


  var imageUrl = "rosenn.png"; // 画像のURLを指定

  var imageBounds = [
    [33.8340765, 132.7508068],
    [33.8558902, 132.7863492]
  ]; // 画像の表示範囲の座標を指定


  var imageOverlay = L.imageOverlay(imageUrl, imageBounds).addTo(map);

  //駅マーカー
  tramStations.forEach(function(station) {
    var stationIcon = L.icon({
      iconUrl: '33691.png',
      iconSize: [35, 23], // アイコンのサイズ
      iconAnchor: [16, 32], // アイコンのアンカー位置（底辺中央）
      popupAnchor: [0, -10] // ポップアップの位置（上辺中央）
    });

    var stationMarker = L.marker([station.latitude, station.longitude], {
      icon: stationIcon
    }).addTo(map);

    // ポップアップのサイズを指定
    var popupOptions = {
      maxWidth: 300, // ポップアップの最大幅
      maxHeight: 300, // ポップアップの最大高さ
    };

    stationMarker.bindPopup(station.name, popupOptions);
  });



  //観光地座標
  var sightseeing = [
    { latitude: 33.850678, longitude: 132.785432, name: '<b><a href="https://www.city.matsuyama.ehime.jp/kanko/kankoguide/shitestukoen/karakuri.html" target="_blank">坊ちゃんからくり時計</b></a><br>午前8時から午後10時までの間、1時間ごと（下記の期間は30分ごと）に道後温泉らしい音楽とともにせり上がり、小説「坊っちゃん」の登場キャラクターが観光客を歓迎します。<br><b><a href="https://www.city.matsuyama.ehime.jp/kanko/kankoguide/shitestukoen/hojyoen.html" target="_blank">放生園「足湯」</a></b><br>道後の湯で傷を癒したという白鷺の足跡の残った「鷺石」や、明治24年から昭和29年まで道後温泉本館で使用した湯釜から出る「足湯」などがある。<br><b>坊ちゃん列車</b><br>夏目漱石の小説に出てくる主人公の乗車した列車を復元した列車が飾られている。' },
  ];
  // 観光地アイコン
  sightseeing.forEach(function(kankou) {
    var kankouIcon = L.icon({
      iconUrl: '温泉マーク.png',
      iconSize: [35, 35], // アイコンのサイズ
      iconAnchor: [16, 32], // アイコンのアンカー位置（底辺中央）
      popupAnchor: [0, -32] // ポップアップの位置（上辺中央）
    });

    var kankouMarker = L.marker([kankou.latitude, kankou.longitude], {
      icon: kankouIcon
    }).addTo(map);

    kankouMarker.bindPopup(kankou.name);
  });

  //観光地マーカー２
  var sightseeing2 = [
    { latitude: 33.845569, longitude: 132.765535, name: '<b><a href="https://www.matsuyamajo.jp/" target="_blank">松山城</b></a><br>松山市の中心部、標高132ｍの勝山に築かれた松山城。山頂に本丸、裾野には史跡庭園となっている二之丸と、堀之内公園として親しまれている三之丸が広がります。「現存十二天守」の一つで、城内には21棟の重要文化財があります。4つの登城道とロープウェイ・リフトを利用する方法があり、期間限定・曜日限定のイベントも開催されているので、2度、3度と訪れても楽しみは尽きません。' },
  ];
  // 観光地アイコン
  sightseeing2.forEach(function(kankou2) {
    var kankou2Icon = L.icon({
      iconUrl: '城.png',
      iconSize: [35, 35], // アイコンのサイズ
      iconAnchor: [16, 32], // アイコンのアンカー位置（底辺中央）
      popupAnchor: [0, -32] // ポップアップの位置（上辺中央）
    });

    var kankouMarker2 = L.marker([kankou2.latitude, kankou2.longitude], {
      icon: kankou2Icon
    }).addTo(map);

    kankouMarker2.bindPopup(kankou2.name);
  });

  // 道後温泉本館
  var dougoonsenhonkan = L.icon({
    iconUrl: '温泉マーク.png',
    iconSize: [35, 35], // アイコンのサイズ
    iconAnchor: [16, 32], // アイコンのアンカー位置（底辺中央）
    popupAnchor: [0, -32] // ポップアップの位置（上辺中央）
  });

  // マーカーを作成
  var marker5 = L.marker([33.8520611, 132.7865251], { icon: dougoonsenhonkan }).addTo(map);

  // ポップアップに表示されるHTML要素を作成
  var popupContent = '<b><a href="https://dogo.jp/onsen/honkan" target="_blank">道後温泉本館</b></a><br>道後温泉本館は、日本最古といわれる道後温泉のシンボルで、「神の湯」に代表される温泉施設です。道後温泉本館の一番の魅力は、日本の公衆浴場として初めて、平成6年(1994)に国の重要文化財に指定されながら、博物館化せずに現役の公衆浴場として営業を続けているところです。平成21年(2009)に発行されたミシュラン・グリーンガイド・ジャポンでは、最高位の三つ星を獲得しています。';

  // ポップアップのサイズを指定
  var popupOptions = {
    maxWidth: 400, // ポップアップの最大幅
    maxHeight: 300, // ポップアップの最大高さ
  };

  // ポップアップを作成し、上記で作成したHTML要素を追加
  var popup = L.popup(popupOptions).setContent(popupContent);

  // マーカーにポップアップを設定
  marker5.bindPopup(popup);

  // マーカーがクリックされたときにポップアップを表示
  marker5.on("click", function() {
    marker5.openPopup();
  });


  // くるりん
  var kururinn = L.icon({
    iconUrl: '観覧車.png',
    iconSize: [35, 35], // アイコンのサイズ
    iconAnchor: [16, 32], // アイコンのアンカー位置（底辺中央）
    popupAnchor: [0, -32] // ポップアップの位置（上辺中央）
  });
  // マーカーを作成
  var marker3 = L.marker([33.8356186, 132.7625348], { icon: kururinn }).addTo(map);

  // ポップアップに表示されるHTML要素を作成
  var popupContent2 = '<b><a href="https://www.iyotetsu.co.jp/kankou/kururin/" target="_blank">くるりん</b></a><br>直径45m,地上85mの高さの観覧車。松山市街を360度一望でき、天気の良い日には遠く瀬戸内海の島々までもが見渡せる。';

  // ポップアップのサイズを指定
  var popupOptions = {
    maxWidth: 400, // ポップアップの最大幅
    maxHeight: 300, // ポップアップの最大高さ
  };

  // ポップアップを作成し、上記で作成したHTML要素を追加
  var popup = L.popup(popupOptions).setContent(popupContent2);

  // マーカーにポップアップを設定
  marker3.bindPopup(popup);

  // マーカーがクリックされたときにポップアップを表示
  marker3.on("click", function() {
    marker3.openPopup();
  });

  //子規堂
  var sikidou = L.icon({
    iconUrl: 'お寺.png',
    iconSize: [35, 35], // アイコンのサイズ
    iconAnchor: [16, 32], // アイコンのアンカー位置（底辺中央）
    popupAnchor: [0, -32] // ポップアップの位置（上辺中央）
  });
  // マーカーを作成
  var marker4 = L.marker([33.834636, 132.763461], { icon: sikidou }).addTo(map);

  // ポップアップに表示されるHTML要素を作成
  var popupContent4 = '<b><a href="https://shikido.ehime.jp/" target="_blank">子規堂</b></a><br>子規堂は、正岡家の菩提寺である正宗寺（しょうじゅうじ）境内に建ち、子規が17歳まで暮らした家を復元した記念堂である。子規堂内には、子規の直筆原稿や遺墨・遺品などを展示しており、筆まめで鋭敏な子規の性格を感じとる事ができる。勉強部屋や愛用の机などもみもの。正宗寺の境内墓地に入ると右手に高浜虚子の筆塚、正面には子規の埋髪塔と内藤鳴雪の髭塔があり、その後方には正岡家のお墓がある。また、子規堂の正面には夏目漱石が小説の中で「マッチ箱のような汽車」と評した通称『坊っちゃん列車』の客車もある。';

  // ポップアップのサイズを指定
  var popupOptions = {
    maxWidth: 400, // ポップアップの最大幅
    maxHeight: 300, // ポップアップの最大高さ
  };

  // ポップアップを作成し、上記で作成したHTML要素を追加
  var popup = L.popup(popupOptions).setContent(popupContent4);

  // マーカーにポップアップを設定
  marker4.bindPopup(popup);

  // マーカーがクリックされたときにポップアップを表示
  marker4.on("click", function() {
    marker4.openPopup();
  });

  //坊ちゃん列車ミュージアム
  var dougoonsenhonkan = L.icon({
    iconUrl: '汽車.png',
    iconSize: [35, 35], // アイコンのサイズ
    iconAnchor: [16, 32], // アイコンのアンカー位置（底辺中央）
    popupAnchor: [0, -32] // ポップアップの位置（上辺中央）
  });
  // マーカーを作成
  var marker2 = L.marker([33.835525, 132.764222], { icon: dougoonsenhonkan }).addTo(map);

  // ポップアップに表示されるHTML要素を作成
  var popupContent4 = '<b><a href="https://www.iyotetsu.co.jp/museum/" target="_blank">坊ちゃん列車ミュージアム</b></a><br>明治20年(1887年)の創立以来、積み重ねてきた伊予鉄道の歴史を紹介している「坊っちゃん列車ミュージアム」。館内には、創業時から約67年間走り続けた「坊っちゃん列車」の原寸大レプリカが展示されているほか、レールや車輌部品、パネルなどを間近で観られるなど、ゆっくりと伊予鉄道の歴史を体感することができる。鉄道ファンのみならず、大人から子供まで幅広い世代が楽しめる空間となっている。';

  // ポップアップのサイズを指定
  var popupOptions = {
    maxWidth: 400, // ポップアップの最大幅
    maxHeight: 300, // ポップアップの最大高さ
  };

  // ポップアップを作成し、上記で作成したHTML要素を追加
  var popup = L.popup(popupOptions).setContent(popupContent4);

  // マーカーにポップアップを設定
  marker2.bindPopup(popup);

  // マーカーがクリックされたときにポップアップを表示
  marker2.on("click", function() {
    marker2.openPopup();
  });

});
