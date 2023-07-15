const START_POS_X = 50
const START_POS_Y = 50
const BLOCK_SIZE = 30
const WIDTH_BLOCK = 10
const HEIGHT_BLOCK = 20
const KEY_UP = 38
const KEY_DOWN = 40
const KEY_LEFT = 37
const KEY_RIGHT = 39
const KEY_Z = 90 //右回転
const KEY_X = 88 //左回転
const KEY_R = 82 //リセット
let GAMESTART_FLAG = false
let GAMEOVER_FLAG = false
let GAMECLEAR_FLAG = false
let speed = 500
let score = 0

let canvas = document.getElementById('Tetris')
let context = canvas.getContext('2d')

//キーボードイベント監視
const inputkey = document
inputkey.addEventListener('keydown', handleKeyDown)

//背景の描画
context.rect(START_POS_X, START_POS_Y, 360, 660)
context.stroke()

//ブロックを配列に保存(0=何もなし 1=ブロック),最後の行に色情報{
let block_I = {
  block_info: [
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0]
  ],
  color: 'cyan'
}
let block_O = {
  block_info: [
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0]
  ],
  color: 'yellow'
}
let block_S = {
  block_info: [
    [0, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 0]
  ],
  color: 'green'
}
let block_Z = {
  block_info: [
    [0, 0, 1, 0],
    [0, 1, 1, 0],
    [0, 1, 0, 0],
    [0, 0, 0, 0]
  ],
  color: 'red'
}
let block_J = {
  block_info: [
    [0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0]
  ],
  color: 'blue'
}
let block_L = {
  block_info: [
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0]
  ],
  color: 'orange'
}
let block_T = {
  block_info: [
    [0, 0, 0, 0],
    [1, 1, 1, 0],
    [0, 1, 0, 0],
    [0, 0, 0, 0]
  ],
  color: 'purple'
}

let blocklist = [block_I, block_O, block_S, block_Z, block_J, block_L, block_T]

//ステージ全体のブロック情報を保持する配列を作製
let stage_block_info = []
for (let i = 0; i < HEIGHT_BLOCK; i++) {
  stage_block_info[i] = []
  for (let j = 0; j < WIDTH_BLOCK; j++) {
    stage_block_info[i][j] = 0
  }
}

let cur_block_info = block_I
//ステージブロック情報に現在のブロック情報を入れる

//現在のブロックの始点情報
let cur_block_pos = [3, 0]
//ステージにカレントブロックを挿入
for (let i = 0; i < 4; i++) {
  for (let j = 0; j < 4; j++) {
    stage_block_info[cur_block_pos[1] + i][cur_block_pos[0] + j] =
      cur_block_info.block_info[i][j]
  }
}

function AddCurBlock () {
  //ステージのカレントブロック情報をクリア
  for (let i = 0; i < HEIGHT_BLOCK; i++) {
    for (let j = 0; j < WIDTH_BLOCK; j++) {
      if (stage_block_info[i][j] == 1) {
        stage_block_info[i][j] = 0
      }
    }
  }
  //ステージにカレントブロックを挿入
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (cur_block_info.block_info[i][j] == 1) {
        //ブロック情報が1のところをステージ上のブロックに代入(0を無条件で代入を防ぐ)
        stage_block_info[cur_block_pos[1] + i][cur_block_pos[0] + j] =
          cur_block_info.block_info[i][j]
      }
    }
  }
}

function ShiftDownBlock () {
  cur_block_pos[1] = cur_block_pos[1] + 1
  if (CollisonBlock(cur_block_info.block_info) == false) {
    SetBlock()
    ClearLine()
  }
  AddCurBlock()
}

//ブロックを設置済みにする関数
function SetBlock () {
  for (let i = 0; i < HEIGHT_BLOCK; i++) {
    for (let j = 0; j < WIDTH_BLOCK; j++) {
      if (stage_block_info[i][j] == 1) {
        stage_block_info[i][j] = 2
      }
    }
  }
  ResetBlockInfo()
  //ブロック設置後に新しいブロック情報に更新
  //もしも更新直後にブロックと衝突していたら、ゲームオーバー
  if (CollisonBlock(cur_block_info.block_info) == false) {
    GAMEOVER_FLAG = true
  }
}

//ラインを消す
function ClearLine () {
  let count = 0
  let scorecount = 0 //一度で何段消えたかを計算
  for (let i = 0; i < HEIGHT_BLOCK; i++) {
    for (let j = 0; j < WIDTH_BLOCK; j++) {
      if (stage_block_info[i][j] == 2) {
        count++
      }
    }
    if (count == WIDTH_BLOCK) {
      stage_block_info.splice(i, 1)
      stage_block_info.unshift([])
      for (let j = 0; j < WIDTH_BLOCK; j++) {
        stage_block_info[0][j] = 0
      }
      scorecount++
    }
    count = 0
  }
  if (scorecount == 4) {
    //テトリス時ボーナス
    score += 8000
  } else {
    score += scorecount * 1000 //それ以外は段数*1000
  }
  scorecount = 0 //リセット
}

//他ブロック衝突処理(もしも他のブロックと被っていたらfalse、被っていなかったらtrue
function CollisonBlock (block_info) {
  let temp_block_info = block_info

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (temp_block_info[i][j] == 1) {
        if (
          cur_block_pos[0] + j < 0 ||
          WIDTH_BLOCK - 1 < cur_block_pos[0] + j
        ) {
          return false
        }
        if (HEIGHT_BLOCK - 1 < cur_block_pos[1] + i) {
          return false
        }
        if (stage_block_info[cur_block_pos[1] + i][cur_block_pos[0] + j] == 2) {
          return false
        }
      }
    }
  }
  return true
}

//衝突判定後にブロックをリセットする関数
function ResetBlockInfo () {
  const index = Math.floor(Math.random() * blocklist.length) //ブロックリストの個数のなかから数値をランダム生成しいんでっくすに保存
  cur_block_info = blocklist[index]
  cur_block_pos = [3, 0]
}

function RotateRight () {
  let new_block_info = []
  const len = cur_block_info.block_info.length

  for (let i = 0; i < len; i++) {
    new_block_info.push([])
    for (let j = 0; j < len; j++) {
      new_block_info[i].push(cur_block_info.block_info[len - 1 - j][i])
    }
  }
  if (CollisonBlock(new_block_info) == true) {
    return new_block_info
  } else {
    return cur_block_info.block_info
  }
}
function RotateLEFT () {
  let new_block_info = []
  const len = cur_block_info.block_info.length
  for (let i = 0; i < len; i++) {
    new_block_info.push([])
    for (let j = 0; j < len; j++) {
      new_block_info[i].push(cur_block_info.block_info[j][len - 1 - i])
    }
  }

  if (CollisonBlock(new_block_info) == true) {
    return new_block_info
  } else {
    return cur_block_info.block_info
  }
}

//キーが押された時の処理
function handleKeyDown (event) {
  //矢印キーのデフォルト入力を無効化（画面スクロール)
  const keycode = event.keyCode
  if ([37, 38, 39, 40].includes(event.keyCode)) {
    event.preventDefault()
  }
  //リセット
  if (keycode == KEY_R) {
    AllReset()
    GAMESTART_FLAG = true
    score = 0
  }
  if (GAMEOVER_FLAG == true || GAMESTART_FLAG == false || GAMECLEAR_FLAG == true) {
    return
  }

  if (keycode == KEY_LEFT) {
    //配列の範囲を超えた場合or横にブロックが存在している場合動かせない
    for (let i = 0; i < HEIGHT_BLOCK; i++) {
      if (stage_block_info[i][0] == 1) {
        return
      }
    }
    for (let i = 0; i < HEIGHT_BLOCK; i++) {
      for (let j = 1; j < WIDTH_BLOCK - 1; j++) {
        if (stage_block_info[i][j] == 1 && stage_block_info[i][j - 1] == 2) {
          return
        }
      }
    }
    cur_block_pos[0] -= 1
  }
  if (keycode == KEY_RIGHT) {
    for (let i = 0; i < HEIGHT_BLOCK; i++) {
      if (stage_block_info[i][WIDTH_BLOCK - 1] == 1) {
        return
      }
    }
    for (let i = 0; i < HEIGHT_BLOCK; i++) {
      for (let j = 0; j < WIDTH_BLOCK - 2; j++) {
        if (stage_block_info[i][j] == 1 && stage_block_info[i][j + 1] == 2) {
          return
        }
      }
    }
    cur_block_pos[0] += 1
  }
  if (keycode == KEY_DOWN) {
    ShiftDownBlock()
  }
  //ブロックを右回転
  if (keycode == KEY_X) {
    cur_block_info.block_info = RotateRight()
  }
  //ブロックを左回転
  if (keycode == KEY_Z) {
    cur_block_info.block_info = RotateLEFT()
  }

  AddCurBlock() //stage情報を更新
}

function StartGame () {
  GAMESTART_FLAG = true
}

function AllReset () {
  //ステージのブロック情報を全てクリア
  for (let i = 0; i < HEIGHT_BLOCK; i++) {
    for (let j = 0; j < WIDTH_BLOCK; j++) {
      if (stage_block_info[i][j] != 0) {
        stage_block_info[i][j] = 0
      }
    }
  }
  ResetBlockInfo()
  AddCurBlock()
  GAMEOVER_FLAG = false
  GAMESTART_FLAG = false
  GAMECLEAR_FLAG = false
  score = 0
}

//速度調整
function SpeedChange (event) {
  speed = event.target.value
  switch (speed) {
    case 'slow':
      speed = 500
      break
    case 'middle':
      speed = 250
      break
    case 'fast':
      speed = 125
      break
    default:
      speed = 500
  }
  //タイマーをリセット
  clearInterval(intervalID)
  //新たにタイマーを設定
  intervalID = setInterval(IntervalHandle, speed)
}

//壁ブロックの描画
context.fillStyle = 'grey'
for (let i = 0; i < HEIGHT_BLOCK + 2; i++) {
  context.fillRect(
    START_POS_X,
    START_POS_Y + BLOCK_SIZE * i,
    BLOCK_SIZE,
    BLOCK_SIZE
  )
  context.fillRect(
    START_POS_X + (WIDTH_BLOCK + 1) * BLOCK_SIZE,
    START_POS_Y + BLOCK_SIZE * i,
    BLOCK_SIZE,
    BLOCK_SIZE
  )
  context.strokStyle = 'black'
  context.strokeRect(
    START_POS_X,
    START_POS_Y + BLOCK_SIZE * i,
    BLOCK_SIZE,
    BLOCK_SIZE
  )
  context.strokStyle = 'black'
  context.strokeRect(
    START_POS_X + (WIDTH_BLOCK + 1) * BLOCK_SIZE,
    START_POS_Y + BLOCK_SIZE * i,
    BLOCK_SIZE,
    BLOCK_SIZE
  )
}
for (let i = 0; i < WIDTH_BLOCK; i++) {
  context.fillRect(
    START_POS_X + BLOCK_SIZE * (i + 1),
    START_POS_Y + BLOCK_SIZE * (HEIGHT_BLOCK + 1),
    BLOCK_SIZE,
    BLOCK_SIZE
  )
  context.strokStyle = 'black'
  context.strokeRect(
    START_POS_X + BLOCK_SIZE * (i + 1),
    START_POS_Y + BLOCK_SIZE * (HEIGHT_BLOCK + 1),
    BLOCK_SIZE,
    BLOCK_SIZE
  )
}

function DrawBlock () {
  //ブロックを描画(左上を始点とし、塗りつぶしたブロックを描画し、輪郭を描画)
  for (let i = 0; i < HEIGHT_BLOCK; i++) {
    for (let j = 0; j < WIDTH_BLOCK; j++) {
      context.fillStyle = cur_block_info.color //配列に格納した色情報
      if (stage_block_info[i][j] == 1) {
        context.fillRect(
          START_POS_X + BLOCK_SIZE + j * BLOCK_SIZE,
          START_POS_Y + BLOCK_SIZE + i * BLOCK_SIZE,
          BLOCK_SIZE,
          BLOCK_SIZE
        )
        context.strokStyle = 'black'
        context.strokeRect(
          START_POS_X + BLOCK_SIZE + j * BLOCK_SIZE,
          START_POS_Y + BLOCK_SIZE + i * BLOCK_SIZE,
          BLOCK_SIZE,
          BLOCK_SIZE
        )
      } else if (stage_block_info[i][j] == 2) {
        context.fillStyle = 'gold' //配列に格納した色情報
        context.fillRect(
          START_POS_X + BLOCK_SIZE + j * BLOCK_SIZE,
          START_POS_Y + BLOCK_SIZE + i * BLOCK_SIZE,
          BLOCK_SIZE,
          BLOCK_SIZE
        )
        context.strokStyle = 'black'
        context.strokeRect(
          START_POS_X + BLOCK_SIZE + j * BLOCK_SIZE,
          START_POS_Y + BLOCK_SIZE + i * BLOCK_SIZE,
          BLOCK_SIZE,
          BLOCK_SIZE
        )
      }
    }
  }
}

function DrawScore () {
  if (score >= 50000) {
    GAMECLEAR_FLAG = true
  }
  context.fillStyle = 'black'
  context.font = '20px Arial'
  context.fillText(
    'SCORE: ' + score + '点',
    START_POS_X + BLOCK_SIZE * (WIDTH_BLOCK + 3),
    START_POS_Y + BLOCK_SIZE
  )
  context.fillText(
    'CLEAR: 50000点',
    START_POS_X + BLOCK_SIZE * (WIDTH_BLOCK + 3),
    START_POS_Y + BLOCK_SIZE + 30
  )
}

function DrawGameOver () {
  context.fillStyle = 'black'
  context.font = '50px Arial'
  context.fillText(
    'GAME OVER',
    START_POS_X + BLOCK_SIZE,
    START_POS_Y + (BLOCK_SIZE * HEIGHT_BLOCK) / 2
  )
}
function DrawGameClear () {
  // const gradient = context.createLinearGradient(0, 0, canvas.width, 0)
  // gradient.addColorStop(0, 'red')
  // gradient.addColorStop(1, 'blue')
  context.fillStyle = 'red'
  context.font = '45px Arial'
  context.fillText(
    'GAME CLEAR',
    START_POS_X + BLOCK_SIZE,
    START_POS_Y + (BLOCK_SIZE * HEIGHT_BLOCK) / 2
  )
}

function IntervalHandle () {
  if (GAMESTART_FLAG == false || GAMEOVER_FLAG == true || GAMECLEAR_FLAG) {
    return
  }
  ShiftDownBlock()
}
let intervalID = setInterval(IntervalHandle, speed)

setInterval(function () {
  context.clearRect(
    START_POS_X + BLOCK_SIZE,
    START_POS_Y,
    WIDTH_BLOCK * BLOCK_SIZE,
    (HEIGHT_BLOCK + 1) * BLOCK_SIZE
  )
  context.clearRect(
    START_POS_X + BLOCK_SIZE * (WIDTH_BLOCK + 3),
    START_POS_Y,
    WIDTH_BLOCK * 20,
    (HEIGHT_BLOCK + 1) * 6
  )
  //ゲームスタート前なら描画しない
  if (GAMESTART_FLAG == false) {
    return
  }
  DrawBlock()
  DrawScore()
  if (GAMEOVER_FLAG == true) {
    DrawGameOver()
  }
  if(GAMECLEAR_FLAG == true){
    DrawGameClear()
  }
}, 10)
