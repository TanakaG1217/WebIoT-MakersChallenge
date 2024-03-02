
const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));
import nodeWebSocketLib from "websocket"; // https://www.npmjs.com/package/websocket
import { RelayServer } from "./RelayServer.js";
import { StillCamera } from "pi-camera-connect";
import { SerialPort } from 'serialport';//gps
import { ReadlineParser } from '@serialport/parser-readline'
import { OpenAI } from "openai"; //openai api
import {dotenv} from 'dotenv';
dotenv.config({ path: '../.env' });



//GPS
let send_count =0;
const port = new SerialPort({
    path: '/dev/serial0',
    baudRate: 9600
});
let isParserActive = false; // パーサーの状態を管理
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))
parser.on('data', runningGPS)//GPSモジュールから受信で関数起動


//openai
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY // 先程取得したAPI KEY
})
var imageURI;
var completion;
var human_count;
//camera
let isRunning_cam = false;
const stillCamera = new StillCamera({
    width: 128,
    height: 128,
});
//ちりめん鯖
var channel;






//chirimen接続
async function connect() {
    // webSocketリレーの初期化
    var relay = RelayServer("chirimentest", "chirimenSocket", nodeWebSocketLib, "https://chirimen.org");
    channel = await relay.subscribe("TUZUKIGPS");
    console.log("web socketリレーサービスに接続しました");
    channel.onmessage = control;
    //GPS,CAM起動
    isParserActive = true;
    isRunning_cam = true;
    camera_cycle();
}

//webからメッセージ受信時の起動関数
function control(messge) {
    console.log('受信メッセージ：', messge.data);
    if (messge.data == "GETGPS") {
        isParserActive = true;
    } else if (messge.data == "STOPGPS") {
        isParserActive = false;
    } else if (messge.data == "RUNCAM") {
        isRunning_cam = true;
        camera_cycle();

    } else if (messge.data == "STOPCAM") {
        isRunning_cam = false;
    }
}


// GPSデータから必要な値だけ読み取り送信
async function runningGPS(data) {
    if (isParserActive === true) {
        send_count = send_count+1;
        if(send_count %11 != 0 ){
            return
        }else{
            send_count=0;
        }

        if (data.match(/^\$GPRMC/, data) !== null) {
            console.log('GPSデータ：', data);

            // GPRMCデータをカンマで分割
            const gprmcFields = data.split(',');
            const lat =
                parseInt(gprmcFields[3] / 100) +
                parseInt(gprmcFields[3] % 100) / 60 +
                parseInt((gprmcFields[3] * 10000) % 10000) / 600000;
            const lon =
                parseInt(gprmcFields[5] / 100) +
                parseInt(gprmcFields[5] % 100) / 60 +
                parseInt((gprmcFields[5] * 10000) % 10000) / 600000;

            // JSONオブジェクトを作成
            const jsonData = {
                num: 1,
                type: gprmcFields[0], // データセンテンス識別子
                time: gprmcFields[1], // UTC時刻
                status: gprmcFields[2], // ステータス
                latitude: lat, // 緯度
                longitude: lon, // 経度
                speed: parseFloat(gprmcFields[7]), // 地表の速度
                direction: parseFloat(gprmcFields[8]), // 真方位
                date: gprmcFields[9], // UTC日付
                human: human_count
            };

            channel.send(jsonData);
            console.log(JSON.stringify(jsonData, null, 2));
            //sleep(15000);
        }
    } else {
        await sleep(100);
    }
}

//カメラを１分ループ
async function camera_cycle() {
    while (isRunning_cam) {
        imageURI = await captureImage();
        var sensorData = {
            imageURI: imageURI,
            time: new Date().getTime(),
        };
        //channel.send(sensorData);
        console.log("Send ImageData: length:", JSON.stringify(sensorData).length);
        await comp();
        human_count = completion.choices[0].message.content;
        console.log(completion.choices[0].message.content)
        await sleep(60000);
    }
}

// カメラの画像をDataURIとして取得する
async function captureImage() {
    var mime = "image/jpeg";
    var encoding = "base64";
    const image = await stillCamera.takeImage();
    const b64str = image.toString(encoding);
    const dataURL = "data:" + mime + ";" + encoding + "," + b64str;
    return dataURL;
}
//APIに画像投入，コメントをcompへ
async function comp() {
    completion = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: "この画像に映し出されている人間の数を半角英数字１文字のみで返答して.人数が不明の場合 None と返して",
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: imageURI,
                            detail: "high",
                        },
                    },
                ],
            },
        ],
        max_tokens: 10,
    });
}



connect();