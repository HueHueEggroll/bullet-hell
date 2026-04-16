// things to learn: spread operator (basically a Read More) for iterables (array, string, object, etc.)
// ?? nullish coalescing operator gives right-hand value when left-hand value is null or undefined, otherwise returns left-hand value
// ? conditional operator is a more compact if-statement

// Instantiate bullet array, boss, and player
let player;
let boss;
let bullets = [];
let playerBullets = [];
let playerCanShoot = true;
let effects = [];
let gameplayActive = true;
let gameOver = false;
let gameOverFade = 0;
let gameOverTimer = 0;
let victory = false;
let victoryTimer = 0;
let victoryDelay = 90; // frames before text appears
let currentBossId = "finalDemoBoss";
let familiars = [];

let restartDelay = 45; // frames (~0.75 sec)
let restartPressed = false;

// Art assets for later
let playerImg = null;
let bossImg = null;
let playerBulletImg = null;
let emitterImg = null;
let enemyMarkerImg = null;

// ---------- Bullet type defaults ----------
let bulletTypes = {};

function preload() {
  setupBulletTypes();

  // Uncomment later when we have assets
  playerImg = loadImage("assets/player.png");
  bossImg = loadImage("assets/boss.png");
  emitterImg = loadImage("assets/emitter.png");
  // playerBulletImg = loadImage("assets/playerBullet.png");
  // enemyMarkerImg = loadImage("assets/enemyMarkerImg.png");
  // familiarImg = loadImage("assets/familliar.png");

  // Bullet sprites:
  bulletTypes.rice.sprite = loadImage("assets/rice.png");
  bulletTypes.small.sprite = loadImage("assets/small.png");
  bulletTypes.medium.sprite = loadImage("assets/medium.png");
  bulletTypes.bubble.sprite = loadImage("assets/bubble.png");
  bulletTypes.heart.sprite = loadImage("assets/heart.png");
}

function setup() {
  createCanvas(GAME_LAYOUT.canvasWidth, GAME_LAYOUT.canvasHeight);

  rectMode(CENTER);
  imageMode(CENTER);

  console.log("bulletTypes:", bulletTypes);
  console.log("rice sprite:", bulletTypes.rice?.sprite);
  console.log("small sprite:", bulletTypes.small?.sprite);
  console.log("medium sprite:", bulletTypes.medium?.sprite);
  console.log("bubble sprite:", bulletTypes.bubble?.sprite);
  console.log("heart sprite:", bulletTypes.heart?.sprite);

  player = new Player(getPlayerSpawnX(), getPlayerSpawnY(), playerImg);
  boss = new Boss(0, 0, bullets, player, bossImg, currentBossId);

  player.spawnX = getPlayerSpawnX();
  player.spawnY = getPlayerSpawnY();
  player.x = player.spawnX;
  player.y = player.spawnY;
}

function draw() {
  background(...GAME_COLORS.background);

  if (gameOver || victory) {
    let timer = gameOver ? gameOverTimer : victoryTimer;

    if (timer > restartDelay) {
      if (keyIsDown(82)) { // R
        if (!restartPressed) {
          restartGame();
          restartPressed = true;
        }
      } else {
        restartPressed = false;
      }
    }
  }

  push();
  rectMode(CORNER);
  noStroke();
  fill(...GAME_COLORS.playfield);

  rect(
    GAME_LAYOUT.playfieldX,
    GAME_LAYOUT.playfieldY,
    GAME_LAYOUT.playfieldW,
    GAME_LAYOUT.playfieldH,
  );

  pop();

  let bossSlowmoActive = boss.active && boss.isDying && boss.deathSlowmoEnabled;

  player.moveSpeedMultiplier = bossSlowmoActive ? boss.deathSlowmoScale : 1;
  player.shotTimeScale = bossSlowmoActive ? boss.deathSlowmoScale : 1;

  player.update();

  if (keyIsDown(88)) {
    if (!player.bombPressed) {
      useBomb(player, boss, bullets);
      player.bombPressed = true;
    }
  } else {
    player.bombPressed = false;
  }

  player.shoot(playerBullets);

  if (!gameOver) {
    boss.update();

    for (let familiar of familiars) {
      familiar.update();
    }
  }

  if (player.bulletClearTimer === 1) {
    for (let b of bullets) {
      destroyEnemyBulletWithPop(b);
    }
  }

  let bulletMoveScale = bossSlowmoActive ? boss.deathSlowmoScale : 1;

  for (let bullet of bullets) {
    if (!bullet.alive) continue;

    if (!gameOver) {
      bullet.update(bulletMoveScale);
    }

    if (player.shouldClearEnemyBullets()) {
      destroyEnemyBulletWithPop(bullet);
    }
  }

  for (let pBullet of playerBullets) {
    if (!gameOver) {
      pBullet.update(bulletMoveScale);
    }

    // Familiar collisions
    for (let familiar of familiars) {
      if (!familiar.active || !pBullet.alive) continue;

      if (playerBulletHitsFamiliar(pBullet, familiar)) {
        let hitPopSize = 14;
        if (pBullet.drawSize !== undefined && pBullet.drawSize !== null) {
          hitPopSize = max(14, pBullet.drawSize);
        }

        hitPopSize *= 1.4;

        spawnBulletPop(pBullet.x, pBullet.y, null, 20, hitPopSize);

        familiar.takeDamage(pBullet.damage);
        pBullet.alive = false;
        break;
      }
    }

    // Boss collision
    if (
      boss.active &&
      !boss.waitingToEnter &&
      pBullet.alive &&
      playerBulletHitsBoss(pBullet, boss)
    ) {
      let hitPopSize = 14;
      if (pBullet.drawSize !== undefined && pBullet.drawSize !== null) {
        hitPopSize = max(14, pBullet.drawSize);
      }

      hitPopSize *= 1.4;

      spawnBulletPop(pBullet.x, pBullet.y, null, 20, hitPopSize);

      if (!boss.isDying && boss.vulnerable) {
        boss.sectionHp -= pBullet.damage;
      }

      pBullet.alive = false;
    }
  }

  checkPlayerCollision(player, bullets);
  checkPlayerBossCollision(player, boss);

  boss.show();

  for (let familiar of familiars) {
    familiar.show();
  }

  // Player bullets (now under player)
  for (let pBullet of playerBullets) {
    pBullet.show();
  }

  // Player sprite on top
  player.show();

  // Enemy bullets
  for (let bullet of bullets) {
    bullet.show();
  }



  // Hitbox on top of everything
  player.showHitbox();

  for (let i = bullets.length - 1; i >= 0; i--) {
    if (!bullets[i].alive) {
      bullets.splice(i, 1);
    }
  }

  for (let i = playerBullets.length - 1; i >= 0; i--) {
    if (!playerBullets[i].alive) {
      playerBullets.splice(i, 1);
    }
  }

  for (let i = familiars.length - 1; i >= 0; i--) {
    if (!familiars[i].active) {
      familiars.splice(i, 1);
    }
  }

  for (let effect of effects) {
    if (!gameOver) {
      effect.update();
    }
  }
  effects = effects.filter((e) => e.alive);

  for (let effect of effects) {
    effect.show();
  }

  // Top strip
  push();
  rectMode(CORNER);
  noStroke();
  fill(...GAME_COLORS.background);

  rect(0, 0, GAME_LAYOUT.canvasWidth, GAME_LAYOUT.playfieldY);

  // Bottom strip
  rect(
    0,
    GAME_LAYOUT.playfieldY + GAME_LAYOUT.playfieldH,
    GAME_LAYOUT.canvasWidth,
    GAME_LAYOUT.canvasHeight -
    (GAME_LAYOUT.playfieldY + GAME_LAYOUT.playfieldH),
  );

  pop();

  drawEnemyTrackerMarker(boss);

  // Left and right strips
  push();
  rectMode(CORNER);
  noStroke();
  fill(...GAME_COLORS.background);

  rect(0, 0, GAME_LAYOUT.playfieldX, GAME_LAYOUT.canvasHeight);

  rect(
    GAME_LAYOUT.playfieldX + GAME_LAYOUT.playfieldW,
    0,
    GAME_LAYOUT.canvasWidth - (GAME_LAYOUT.playfieldX + GAME_LAYOUT.playfieldW),
    GAME_LAYOUT.canvasHeight,
  );

  pop();

  boss.showHpBar();
  boss.showTimer();

  drawSidebarPlayerUi(player);

  if (boss.active && !boss.waitingToEnter && boss.hasShownFightUi) {
    drawEnemyLabel(
      GAME_LAYOUT.playfieldX + 10,
      GAME_LAYOUT.playfieldY + 8,
      boss.lifeCount,
      boss,
    );
  }

  if (boss.active && !boss.waitingToEnter && boss.hasShownFightUi) {
    drawEnemyLabel(
      GAME_LAYOUT.playfieldX + 10,
      GAME_LAYOUT.playfieldY + 8,
      boss.lifeCount,
      boss,
    );
  }

  if (victory) {
    victoryTimer++;

    if (victoryTimer >= victoryDelay) {
      let fade = min((victoryTimer - victoryDelay) * 8, 140);
      let textFadeSpeed = 6;
      let textAlpha = min((victoryTimer - victoryDelay) * textFadeSpeed, 255);

      push();
      rectMode(CORNER);
      noStroke();

      fill(180, 150, 0, fade);
      rect(
        GAME_LAYOUT.playfieldX,
        GAME_LAYOUT.playfieldY,
        GAME_LAYOUT.playfieldW,
        GAME_LAYOUT.playfieldH
      );

      textAlign(CENTER, CENTER);

      fill(255, 230, 120, textAlpha);
      textSize(48);
      text(
        "Stage Clear!",
        GAME_LAYOUT.playfieldX + GAME_LAYOUT.playfieldW / 2,
        GAME_LAYOUT.playfieldY + GAME_LAYOUT.playfieldH / 2 - 20
      );

      textSize(20);
      fill(255, 230, 120, textAlpha);
      text(
        "Thank you for enjoying this demo!",
        GAME_LAYOUT.playfieldX + GAME_LAYOUT.playfieldW / 2,
        GAME_LAYOUT.playfieldY + GAME_LAYOUT.playfieldH / 2 + 30
      );

      textSize(18);
      fill(255, 230, 120, textAlpha);
      text(
        "Press R to Restart",
        GAME_LAYOUT.playfieldX + GAME_LAYOUT.playfieldW / 2,
        GAME_LAYOUT.playfieldY + GAME_LAYOUT.playfieldH / 2 + 60
      );

      pop();
    }
  }

  if (gameOver) {
    gameOverTimer++;
    gameOverFade = min(gameOverFade + 8, 160);

    push();
    rectMode(CORNER);
    noStroke();

    fill(120, 0, 0, gameOverFade);
    rect(
      GAME_LAYOUT.playfieldX,
      GAME_LAYOUT.playfieldY,
      GAME_LAYOUT.playfieldW,
      GAME_LAYOUT.playfieldH
    );

    let textFadeSpeed = 6;
    let textAlpha = min(gameOverTimer * textFadeSpeed, 255);

    textAlign(CENTER, CENTER);

    fill(180, 40, 40, textAlpha);
    textSize(48);
    text(
      "GAME OVER",
      GAME_LAYOUT.playfieldX + GAME_LAYOUT.playfieldW / 2,
      GAME_LAYOUT.playfieldY + GAME_LAYOUT.playfieldH / 2
    );

    fill(180, 40, 40, textAlpha);
    textSize(18);
    text(
      "Press R to Restart",
      GAME_LAYOUT.playfieldX + GAME_LAYOUT.playfieldW / 2,
      GAME_LAYOUT.playfieldY + GAME_LAYOUT.playfieldH / 2 + 48
    );

    pop();
  }
}

// Debug Invincibility
function keyPressed() {
  if (key === "c" || key === "C") {
    player.debugInvincible = !player.debugInvincible;

    console.log(`Invincibility: ${player.debugInvincible ? "ON" : "OFF"}`);
  }
}