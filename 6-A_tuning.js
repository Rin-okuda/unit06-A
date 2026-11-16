const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");

// 調整する数
const CONFIG = {
  GRAVITY: 2000,
  JUMP_SPEED: 600,
  MOVE_SPEED: 300,
  MAX_JUMPS: 2,
  FALL_GRAVITY_RATE: 1.5,

  WALL_JUMP_X: 350,   // 壁ジャンプ時の横速度
  WALL_JUMP_Y: 600    // 壁ジャンプ時の上速度
};

const BOUNCE = 0.30;
const TARGET_HEIGHT = 64;

const player = {
  x: 80,
  y: 20,
  w: 32,
  h: 32,

  vx: 0,              // 横方向の速度を追加
  vy: 0,

  isGrounded: false,
  jumpsLeft: CONFIG.MAX_JUMPS,

  touchingLeftWall: false,
  touchingRightWall: false
};

const floor = {
  x: 0,
  y: 320,
  w: 640,
  h: 40
};

const keys = {};

document.addEventListener("keydown", (e) => {
  keys[e.code] = true;

  // Spaceを押した瞬間だけ
  if (e.code === "Space" && !e.repeat) {

    // 左壁に触れている → 右上へジャンプ
    if (player.touchingLeftWall) {
      player.vx = CONFIG.WALL_JUMP_X;
      player.vy = -CONFIG.WALL_JUMP_Y;
    }

    // 右壁に触れている → 左上へジャンプ
    else if (player.touchingRightWall) {
      player.vx = -CONFIG.WALL_JUMP_X;
      player.vy = -CONFIG.WALL_JUMP_Y;
    }

    // 通常ジャンプ・空中ジャンプ
    else if (player.jumpsLeft > 0) {
      player.vy = -CONFIG.JUMP_SPEED;
      player.jumpsLeft--;
    }
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});


// 床との当たり判定
function collideWithFloor() {

  if (player.y + player.h > floor.y) {

    player.y = floor.y - player.h;

    // 少し跳ねる
    player.vy = -player.vy * BOUNCE;

    player.isGrounded = true;

    // 着地したらジャンプ回数を戻す
    player.jumpsLeft = CONFIG.MAX_JUMPS;

  } else {
    player.isGrounded = false;
  }
}


// 左右の壁との当たり判定
function collideWithWalls() {

  // 毎フレームいったんfalseにする
  player.touchingLeftWall = false;
  player.touchingRightWall = false;

  // 左壁
  if (player.x < 0) {

    player.x = 0;
    player.touchingLeftWall = true;
  }

  // 右壁
  if (player.x + player.w > canvas.width) {

    player.x = canvas.width - player.w;
    player.touchingRightWall = true;
  }
}


function update(dt) {

  // -------------------------
  // 左右移動
  // -------------------------

  // 壁ジャンプ直後のvxを残したいので、
  // キー入力があるときだけ通常速度に変更
  if (keys["ArrowRight"]) {
    player.vx = CONFIG.MOVE_SPEED;
  }
  else if (keys["ArrowLeft"]) {
    player.vx = -CONFIG.MOVE_SPEED;
  }
  else {

    // 少しずつ横速度を減らす
    player.vx *= 0.90;

    // ほぼ0なら完全に止める
    if (Math.abs(player.vx) < 1) {
      player.vx = 0;
    }
  }

  // 横位置更新
  player.x = player.x + player.vx * dt;


  // -------------------------
  // 重力
  // -------------------------

  // 落下中だけ重力を強くする
  const g =
    player.vy > 0
      ? CONFIG.GRAVITY * CONFIG.FALL_GRAVITY_RATE
      : CONFIG.GRAVITY;

  player.vy = player.vy + g * dt;

  // 縦位置更新
  player.y = player.y + player.vy * dt;


  // -------------------------
  // 当たり判定
  // -------------------------

  collideWithWalls();
  collideWithFloor();
}


function draw() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 床
  ctx.fillStyle = "#203060";
  ctx.fillRect(
    floor.x,
    floor.y,
    floor.w,
    floor.h
  );

  // 目印の線
  ctx.fillStyle = "#ff6b6b";
  ctx.fillRect(
    0,
    floor.y - TARGET_HEIGHT,
    canvas.width,
    2
  );

  // プレイヤー
  ctx.fillStyle =
    player.isGrounded
      ? "#7ef5e1"
      : "#ffd166";

  ctx.fillRect(
    player.x,
    player.y,
    player.w,
    player.h
  );

  // デバッグ表示
  ctx.fillStyle = "#e8eeff";
  ctx.font = "14px monospace";

  ctx.fillText(
    "vx = " +
      player.vx.toFixed(0) +
      "  vy = " +
      player.vy.toFixed(0) +
      "  jumpsLeft = " +
      player.jumpsLeft,
    10,
    20
  );

  ctx.fillText(
    "LeftWall = " +
      player.touchingLeftWall +
      "  RightWall = " +
      player.touchingRightWall,
    10,
    40
  );
}


let last = performance.now();

function loop(now) {

  const dt =
    Math.min(
      (now - last) / 1000,
      0.033
    );

  last = now;

  update(dt);
  draw();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);