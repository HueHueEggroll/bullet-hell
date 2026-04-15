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

let restartDelay = 45; // frames (~0.75 sec)
let restartPressed = false;

// Art assets for later
let playerImg = null;
let bossImg = null;
let playerBulletImg = null;
let emitterImg = null;
let enemyMarkerImg = null;

const GAME_LAYOUT = {
  canvasWidth: 1200,
  canvasHeight: 900,

  playfieldX: 20,
  playfieldY: 20,
  playfieldW: 600,
  playfieldH: 800,

  sidebarX: 640,
  sidebarY: 0,
  sidebarW: 560,
  sidebarH: 900,
};

const GAME_COLORS = {
  background: [220, 180, 200], // softish pink
  playfield: [50, 50, 50], // gray
};

const gameSettings = {
  startingLives: 3,
};

const characterDefs = {
  reimuB: {
    name: "Reimu B",

    fullSpeed: 5,
    slowSpeed: 2,

    hitboxRadius: 8,
    grazeRadius: 16,

    shotInterval: 6,
    focusShotInterval: 4,

    bombCapacity: 3,
    deathbombFrames: 15,

    spreadShot: {
      bullets: [
        { offsetX: -18, offsetY: 0, angleDeg: -14, speed: 10 },
        { offsetX: -7, offsetY: 0, angleDeg: 0, speed: 10 },
        { offsetX: 7, offsetY: 0, angleDeg: 0, speed: 10 },
        { offsetX: 18, offsetY: 0, angleDeg: 14, speed: 10 },
      ],
    },

    focusShot: {
      bullets: [
        { offsetX: -16, offsetY: 0, angleDeg: 0, speed: 11 },
        { offsetX: -6, offsetY: 0, angleDeg: 0, speed: 11 },
        { offsetX: 6, offsetY: 0, angleDeg: 0, speed: 11 },
        { offsetX: 16, offsetY: 0, angleDeg: 0, speed: 11 },
      ],
    },

    bombType: "evilSealingCircle",
  },
};

const bossDefs = {
  demoBoss: {
    name: "Demo Boss",
    drawWidth: 100,
    drawHeight: 120,
    contactRadius: 32,

    deathSlowmo: {
      enabled: true,
      duration: 90,
      scale: 0.35,
    },

    lives: [
      {
        nonspell: "demo_nonspell1",
        spell: "demo_spell1",
        nonspellHpMax: 180,
        spellHpMax: 420,
        nonspellTime: 45,
        spellTime: 60,
        nonspellY: 100,
        spellY: 100,
      },
      {
        nonspell: "demo_nonspell2",
        spell: "demo_spell2",
        nonspellHpMax: 180,
        spellHpMax: 420,
        nonspellTime: 40,
        spellTime: 75,
        nonspellY: 90,
        spellY: 100,
      },
      {
        nonspell: null,
        spell: "demo_spell3",
        nonspellHpMax: 0,
        spellHpMax: 520,
        nonspellTime: 0,
        spellTime: 90,
        nonspellY: 90,
        spellY: 100,
      },
    ],
  },
};

const patternConfigs = {
  demo_nonspell1: {
    actionInterval: 24,
    actionsPerCycle: 3,
    cyclePauseFrames: 70,

    ringCount: 12,
    ringSpeed: 2.3,
    ringRotationStep: 12,

    spreadArc: 28,
    spreadCount: 3,
    spreadSpeed: 4.8,
  },

  demo_spell1: {
    driftDistance: 55,
    driftSpeed: 2.4,
    driftPauseMin: 120,
    driftPauseMax: 180,

    actionInterval: 26,
    actionsPerCycle: 3,
    cyclePauseFrames: 75,

    aimedSpreadArc: 42,
    aimedSpreadCount: 5,
    aimedSpreadSpeed: 4.2,

    ringCount: 10,
    ringSpeed: 2.1,
    ringRotationStep: 18,

    spreadAngle: 90,
    spreadArc: 65,
    spreadCount: 6,
    spreadSpeed: 2.8,
  },

  demo_nonspell2: {
    cycle: 180,
    fireWindow: 96,
    shotInterval: 4,
    arcWidthDeg: 110,
    sweepSpeed: 2.25,

    directionMode: "alternate",
    firstDirection: "rtl",
    directionRepeat: 1,

    anchorMode: "late",

    supportSpreadEvery: 72,
    supportSpreadArcDeg: 32,
    supportSpreadCount: 4,
    supportSpreadSpeed: 4.6,

    moveSpeed: 2.35,
    pauseMin: 85,
    pauseMax: 135,
    playerBias: 0.35,
    xJitter: 20,
    yJitter: 12,
  },

  demo_spell2: {
    pathSpeed: 2.6,
    defaultPause: 20,
    loopPath: true,

    pathPoints: [
      { xRatio: 0.25, y: 100, pause: 15, speed: 2.6 },
      { xRatio: 0.5, y: 75, pause: 15, speed: 2.6 },
      { xRatio: 0.75, y: 100, pause: 15, speed: 2.6 },
      { xRatio: 0.5, y: 90, pause: 48, speed: 1.8 },
    ],

    centerLingerIndex: 3,

    centerRingEvery: 26,
    centerRingCount: 10,
    centerRingSpeed: 2.9,

    centerSpreadEvery: 52,
    centerSpreadAngle: 90,
    centerSpreadArc: 70,
    centerSpreadCount: 7,
    centerSpreadSpeed: 3.0,

    moveSpreadEvery: 34,
    moveSpreadAngle: 90,
    moveSpreadArc: 90,
    moveSpreadCount: 7,
    moveSpreadSpeed: 3.3,

    burstEvery: 68,
    burstCount: 12,
    burstMinSpeed: 1.2,
    burstMaxSpeed: 2.3,

    transformStopTime: 40,
    transformSplitTime: 80,
    transformSplitCount: 4,
    transformSplitArc: 0.35,
    transformSplitSpeed: 3.5,
  },

  demo_spell3: {
    orbitSpeed: 0.04,
    orbitRadius: 60,
    orbitEnabled: false,

    spiralEvery: 4,
    spiralSpeed: 2.2,
    spiralStepDeg: 11,
    spiralReverseTime: 240,

    orbiterSpreadEvery: 10,
    orbiterSpreadArc: 22,
    orbiterSpreadCount: 3,
    orbiterSpreadSpeed: 2.8,

    cycleActionInterval: 40,
    cycleActionsPerCycle: 3,
    cyclePauseFrames: 95,

    ringCount: 8,
    ringSpeed: 2.1,

    fallbackRingCount: 12,
    fallbackRingSpeed: 2.0,

    heartSpreadArc: 42,
    heartSpreadCount: 5,
    heartSpreadSpeed: 2.4,
    heartStopTime: 65,
    heartSplitTime: 105,
    heartSplitCount: 8,
    heartSplitArc: 0.6,
    heartSplitSpeed: 3.2,

    randomBurstCount: 16,
    randomBurstMinSpeed: 1.0,
    randomBurstMaxSpeed: 2.1,
    burstStopTime: 35,
    burstSplitTime: 75,
    burstSplitCount: 6,
    burstSplitSpeed: 2.8,
  },
};

const patternRunners = {
  demo_nonspell1(boss, cfg, timer) {
    boss.driftMove();

    boss.cycleActions(
      24,
      3,
      70,
      (step) => {
        if (step === 0 || step === 1) {
          boss.emitter.fireRingOffset(12, 2.3, boss.emitter.baseAngleDeg, {
            type: "medium",
            color: "cyan",
          });
          boss.emitter.rotateBaseAngle(12);
        } else if (step === 2) {
          boss.emitter.fireAimedSpread(28, 3, 4.8, {
            type: "rice",
            color: "yellow",
          });
        }
      },
      timer,
    );
  },

  demo_spell1(boss, cfg, timer) {
    boss.driftMove({
      distance: 55,
      speed: 2.4,
      pauseMin: 120,
      pauseMax: 180,
    });

    boss.cycleActions(
      26,
      3,
      75,
      (step) => {
        if (step === 0) {
          boss.emitter.fireAimedSpread(42, 5, 4.2, {
            type: "rice",
            color: "orange",
          });
        } else if (step === 1) {
          boss.emitter.fireRingOffset(10, 2.1, boss.emitter.baseAngleDeg, {
            type: "small",
            color: "red",
          });
          boss.emitter.rotateBaseAngle(18);
        } else if (step === 2) {
          boss.emitter.fireSpread(90, 65, 6, 2.8, {
            type: "medium",
            color: "blue",
          });
        }
      },
      timer,
    );
  },

  demo_nonspell2(boss, cfg, timer) {
    let t = timer % cfg.cycle;

    if (t >= cfg.fireWindow) {
      boss.laneBiasMove({
        speed: cfg.moveSpeed,
        pauseMin: cfg.pauseMin,
        pauseMax: cfg.pauseMax,
        playerBias: cfg.playerBias,
        xJitter: cfg.xJitter,
        yJitter: cfg.yJitter,
      });
    }

    boss.emitter.fireTimedIndexedArcSweep({
      timer,
      cycle: cfg.cycle,
      fireWindow: cfg.fireWindow,
      shotInterval: cfg.shotInterval,
      arcWidthDeg: cfg.arcWidthDeg,
      speed: cfg.sweepSpeed,
      aimed: true,
      directionMode: cfg.directionMode,
      firstDirection: cfg.firstDirection,
      directionRepeat: cfg.directionRepeat,
      anchorMode: cfg.anchorMode,
      bulletData: {
        type: "bubble",
        color: "cyan",
      },
    });

    if (timer % cfg.supportSpreadEvery === 0) {
      boss.emitter.fireAimedSpread(
        cfg.supportSpreadArcDeg,
        cfg.supportSpreadCount,
        cfg.supportSpreadSpeed,
        {
          type: "rice",
          color: "yellow",
        },
      );
    }
  },

  demo_spell2(boss, cfg, timer) {
    if (timer === 0) {
      let resolvedPathPoints = cfg.pathPoints.map((p) => ({
        x: GAME_LAYOUT.playfieldX + GAME_LAYOUT.playfieldW * p.xRatio,
        y: p.y,
        pause: p.pause,
        speed: p.speed,
      }));

      boss.startPath(
        resolvedPathPoints,
        cfg.pathSpeed,
        cfg.defaultPause,
        cfg.loopPath,
        false,
      );
    }

    boss.updatePathMovement(cfg.pathSpeed, false);

    let atCenterLinger =
      boss.pathIndex === cfg.centerLingerIndex && boss.restTimer > 0;

    if (atCenterLinger) {
      if (timer % cfg.centerRingEvery === 0) {
        boss.emitter.fireAimedRing(cfg.centerRingCount, cfg.centerRingSpeed, {
          type: "rice",
          color: "yellow",
        });
      }

      if (timer % cfg.centerSpreadEvery === 0) {
        boss.emitter.fireSpread(
          cfg.centerSpreadAngle,
          cfg.centerSpreadArc,
          cfg.centerSpreadCount,
          cfg.centerSpreadSpeed,
          { type: "small", color: "magenta" },
        );
      }
    } else {
      if (timer % cfg.moveSpreadEvery === 0) {
        boss.emitter.fireSpread(
          cfg.moveSpreadAngle,
          cfg.moveSpreadArc,
          cfg.moveSpreadCount,
          cfg.moveSpreadSpeed,
          { type: "small", color: "magenta" },
        );
      }

      if (timer % cfg.burstEvery === 0) {
        boss.emitter.fireRandomBurst(
          cfg.burstCount,
          cfg.burstMinSpeed,
          cfg.burstMaxSpeed,
          {
            type: "medium",
            color: "white",
            events: [
              {
                time: cfg.transformStopTime,
                action: (b) => {
                  b.speed = 0;
                },
              },
              {
                time: cfg.transformSplitTime,
                action: (b) => {
                  if (!b.player) return;

                  let baseAngle = atan2(b.player.y - b.y, b.player.x - b.x);

                  for (let i = 0; i < cfg.transformSplitCount; i++) {
                    let angle = map(
                      i,
                      0,
                      cfg.transformSplitCount - 1,
                      baseAngle - cfg.transformSplitArc,
                      baseAngle + cfg.transformSplitArc,
                    );

                    b.spawnBullet(b.x, b.y, angle, cfg.transformSplitSpeed, {
                      type: "rice",
                      color: "orange",
                    });
                  }

                  b.kill();
                },
              },
            ],
          },
        );
      }
    }
  },

  demo_spell3(boss, cfg, timer) {
    if (timer === 0) {
      boss.emitters = [];

      boss.actionCount = 0;
      boss.nextActionTime = 0;

      boss.emitter.reset();
      boss.emitter.startAimedSpiral();
      boss.emitter.spinDir = 1;

      let leftEmitter = new VisualEmitter(
        boss.x,
        boss.y,
        boss.bullets,
        boss.player,
        emitterImg,
      );
      leftEmitter.attachTo(boss, -cfg.orbitRadius, 0);

      let rightEmitter = new VisualEmitter(
        boss.x,
        boss.y,
        boss.bullets,
        boss.player,
        emitterImg,
      );
      rightEmitter.attachTo(boss, cfg.orbitRadius, 0);

      boss.emitters.push(leftEmitter, rightEmitter);
    }

    if (cfg.orbitEnabled && boss.emitters.length >= 2) {
      let orbitAngle = timer * cfg.orbitSpeed;

      boss.emitters[0].setOrbitOffset(
        cfg.orbitRadius,
        cfg.orbitRadius,
        orbitAngle + PI,
      );

      boss.emitters[1].setOrbitOffset(
        cfg.orbitRadius,
        cfg.orbitRadius,
        orbitAngle,
      );
    }

    if (timer === cfg.spiralReverseTime) {
      boss.emitter.spinDir *= -1;
    }

    if (timer % cfg.spiralEvery === 0) {
      boss.emitter.fireSpiralShot(cfg.spiralSpeed, cfg.spiralStepDeg, {
        type: "bubble",
        color: "purple",
      });
    }

    if (boss.emitters.length >= 2 && timer % cfg.orbiterSpreadEvery === 0) {
      boss.emitters[0].emitter.fireSpread(
        120,
        cfg.orbiterSpreadArc,
        cfg.orbiterSpreadCount,
        cfg.orbiterSpreadSpeed,
        {
          type: "rice",
          color: "blue",
        },
      );

      boss.emitters[1].emitter.fireSpread(
        60,
        cfg.orbiterSpreadArc,
        cfg.orbiterSpreadCount,
        cfg.orbiterSpreadSpeed,
        {
          type: "rice",
          color: "blue",
        },
      );
    }

    boss.cycleActions(
      cfg.cycleActionInterval,
      cfg.cycleActionsPerCycle,
      cfg.cyclePauseFrames,
      (step) => {
        if (step === 0) {
          if (boss.emitters.length >= 2) {
            boss.emitters[0].emitter.fireRing(cfg.ringCount, cfg.ringSpeed, {
              type: "medium",
              color: "blue",
            });

            boss.emitters[1].emitter.fireRing(cfg.ringCount, cfg.ringSpeed, {
              type: "medium",
              color: "blue",
            });
          } else {
            boss.emitter.fireRing(
              cfg.fallbackRingCount,
              cfg.fallbackRingSpeed,
              {
                type: "medium",
                color: "blue",
              },
            );
          }
        } else if (step === 1) {
          boss.emitter.fireAimedSpread(
            cfg.heartSpreadArc,
            cfg.heartSpreadCount,
            cfg.heartSpreadSpeed,
            {
              type: "heart",
              color: "pink",
              events: [
                {
                  time: cfg.heartStopTime,
                  action: (b) => {
                    b.speed = 0;
                  },
                },
                {
                  time: cfg.heartSplitTime,
                  action: (b) => {
                    if (!b.player) return;

                    let baseAngle = atan2(b.player.y - b.y, b.player.x - b.x);

                    for (let i = 0; i < cfg.heartSplitCount; i++) {
                      let angle = map(
                        i,
                        0,
                        cfg.heartSplitCount - 1,
                        baseAngle - cfg.heartSplitArc,
                        baseAngle + cfg.heartSplitArc,
                      );

                      b.spawnBullet(b.x, b.y, angle, cfg.heartSplitSpeed, {
                        type: "small",
                        color: "white",
                      });
                    }

                    b.kill();
                  },
                },
              ],
            },
          );
        } else if (step === 2) {
          boss.emitter.fireRandomBurst(
            cfg.randomBurstCount,
            cfg.randomBurstMinSpeed,
            cfg.randomBurstMaxSpeed,
            {
              type: "bubble",
              color: "cyan",
              events: [
                {
                  time: cfg.burstStopTime,
                  action: (b) => {
                    b.speed = 0;
                  },
                },
                {
                  time: cfg.burstSplitTime,
                  action: (b) => {
                    for (let i = 0; i < cfg.burstSplitCount; i++) {
                      let angle = (TWO_PI * i) / cfg.burstSplitCount;

                      b.spawnBullet(b.x, b.y, angle, cfg.burstSplitSpeed, {
                        type: "small",
                        color: "blue",
                      });
                    }

                    b.kill();
                  },
                },
              ],
            },
          );
        }
      },
      timer,
    );
  },
};

// ---------- Bullet type defaults ----------
let bulletTypes = {};

function setupBulletTypes() {
  bulletTypes = {
    rice: {
      sprite: null,
      drawSize: 16,
      radius: 3,
      rotate: true,
      rotationOffset: 0,
    },

    small: {
      sprite: null,
      drawSize: 8,
      radius: 3,
      rotate: false,
      rotationOffset: 0,
    },

    medium: {
      sprite: null,
      drawSize: 12,
      radius: 4,
      rotate: false,
      rotationOffset: 0,
    },

    bubble: {
      sprite: null,
      drawSize: 20,
      radius: 6,
      rotate: false,
      rotationOffset: 0,
    },

    heart: {
      sprite: null,
      drawSize: 16,
      radius: 5,
      rotate: false,
      rotationOffset: 0,
    },
  };
}

function preload() {
  // Uncomment later when we have assets
  // playerImg = loadImage("assets/player.png");
  // bossImg = loadImage("assets/boss.png");
  // emitterImg = loadImage("assets/emitter.png");
  // playerBulletImg = loadImage("assets/playerBullet.png");
  // enemyMarkerImg = loadImage("assets/enemyMarkerImg.png");
  
  // Example bullet sprites later:
  // bulletTypes.rice.sprite = loadImage("assets/rice.png");
  // bulletTypes.small.sprite = loadImage("assets/small.png");
  // bulletTypes.medium.sprite = loadImage("assets/medium.png");
  // bulletTypes.bubble.sprite = loadImage("assets/bubble.png");
  // bulletTypes.heart.sprite = loadImage("assets/heart.png");
}

function setup() {
  createCanvas(GAME_LAYOUT.canvasWidth, GAME_LAYOUT.canvasHeight);

  rectMode(CENTER);
  imageMode(CENTER);

  setupBulletTypes();

  player = new Player(getPlayerSpawnX(), getPlayerSpawnY(), playerImg);
  boss = new Boss(width / 2, 100, bullets, player, bossImg);

  player.spawnX = getPlayerSpawnX();
  player.spawnY = getPlayerSpawnY();
  player.x = player.spawnX;
  player.y = player.spawnY;
}

function draw() {
  background(...GAME_COLORS.background);

  if (gameOver) {
    if (gameOverTimer > restartDelay) {
      if (keyIsDown(82)) {
        // R
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
    // X
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

  player.show();
  boss.show();
  player.showHitbox();

  for (let bullet of bullets) {
    bullet.show();
  }

  for (let pBullet of playerBullets) {
    pBullet.show();
  }

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

  // Enemy tracker marker goes above the bottom strip
  drawEnemyTrackerMarker(boss);

  // Left and right strips go on top of the marker
  push();
  rectMode(CORNER);
  noStroke();
  fill(...GAME_COLORS.background);

  // Left strip
  rect(0, 0, GAME_LAYOUT.playfieldX, GAME_LAYOUT.canvasHeight);

  // Right strip
  rect(
    GAME_LAYOUT.playfieldX + GAME_LAYOUT.playfieldW,
    0,
    GAME_LAYOUT.canvasWidth - (GAME_LAYOUT.playfieldX + GAME_LAYOUT.playfieldW),
    GAME_LAYOUT.canvasHeight,
  );

  pop();

  boss.showHpBar();
  boss.showTimer();

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

      push();
      rectMode(CORNER);
      noStroke();

      // Yellow overlay over playfield
      fill(180, 150, 0, fade * 0.7);
      rect(
        GAME_LAYOUT.playfieldX,
        GAME_LAYOUT.playfieldY,
        GAME_LAYOUT.playfieldW,
        GAME_LAYOUT.playfieldH,
      );

      let textFadeSpeed = 6;
      let textAlpha = min((victoryTimer - victoryDelay) * textFadeSpeed, 255);

      textAlign(CENTER, CENTER);

      fill(255, 230, 120, textAlpha);
      textSize(48);
      text(
        "Stage Clear!",
        GAME_LAYOUT.playfieldX + GAME_LAYOUT.playfieldW / 2,
        GAME_LAYOUT.playfieldY + GAME_LAYOUT.playfieldH / 2 - 20,
      );

      fill(255, 230, 120, textAlpha);
      textSize(20);
      text(
        "Thank you for enjoying this demo!",
        GAME_LAYOUT.playfieldX + GAME_LAYOUT.playfieldW / 2,
        GAME_LAYOUT.playfieldY + GAME_LAYOUT.playfieldH / 2 + 30,
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

    // Red overlay over playfield only
    fill(120, 0, 0, gameOverFade);
    rect(
      GAME_LAYOUT.playfieldX,
      GAME_LAYOUT.playfieldY,
      GAME_LAYOUT.playfieldW,
      GAME_LAYOUT.playfieldH,
    );

    let textFadeSpeed = 6;
    let textAlpha = min(gameOverTimer * textFadeSpeed, 255);

    textAlign(CENTER, CENTER);

    fill(180, 40, 40, textAlpha);
    textSize(48);
    text(
      "GAME OVER",
      GAME_LAYOUT.playfieldX + GAME_LAYOUT.playfieldW / 2,
      GAME_LAYOUT.playfieldY + GAME_LAYOUT.playfieldH / 2,
    );

    fill(180, 40, 40, textAlpha);
    textSize(18);
    text(
      "Press R to Restart",
      GAME_LAYOUT.playfieldX + GAME_LAYOUT.playfieldW / 2,
      GAME_LAYOUT.playfieldY + GAME_LAYOUT.playfieldH / 2 + 48,
    );

    pop();
  }
}

function getPlayerSpawnX() {
  return GAME_LAYOUT.playfieldX + GAME_LAYOUT.playfieldW / 2;
}

function getPlayerSpawnY() {
  return GAME_LAYOUT.playfieldY + GAME_LAYOUT.playfieldH - 80;
}

function drawEnemyLabel(x, y, lives, boss) {
  let intro = boss.getUiTextIntroProgress();
  let visibility = boss.getUiTextVisibilityProgress();

  // Start around the middle of the screen
  let startX = width * 0.5;
  let finalX = x + boss.enemyLabelOffsetX;
  let labelX = lerp(startX, finalX, intro);

  textAlign(LEFT, TOP);

  // Shadow
  fill(0, 0, 0, boss.hpBarShadowAlpha * visibility);

  textSize(boss.enemyLabelTextSize);
  text(
    boss.enemyLabelText,
    labelX + boss.enemyShadowOffsetX,
    y + boss.enemyLabelOffsetY + boss.enemyShadowOffsetY,
  );

  textSize(boss.enemyLivesTextSize);
  text(
    lives,
    x + boss.enemyLivesOffsetX + boss.enemyShadowOffsetX,
    y + boss.enemyLivesOffsetY + boss.enemyShadowOffsetY,
  );

  // Main text
  fill(...boss.enemyLabelColor, 255 * visibility);
  textSize(boss.enemyLabelTextSize);
  text(boss.enemyLabelText, labelX, y + boss.enemyLabelOffsetY);

  fill(...boss.enemyLivesColor, 255 * visibility);
  textSize(boss.enemyLivesTextSize);
  text(lives, x + boss.enemyLivesOffsetX, y + boss.enemyLivesOffsetY);
}

function drawEnemyTrackerMarker(boss) {
  if (!boss || !boss.active || !boss.visible || boss.waitingToEnter) return;

  let label = "Enemy";

  push();
  textSize(12);
  textAlign(CENTER, CENTER);

  // Measure width based on text (same as before)
  let textW = textWidth(label);
  let paddingX = 8;
  let boxW = textW + paddingX * 2;

  let rawX = boss.x;

  let edgePadding = boxW * 0.5; // how far outside it can go

  let markerX = constrain(
    rawX,
    GAME_LAYOUT.playfieldX - edgePadding,
    GAME_LAYOUT.playfieldX + GAME_LAYOUT.playfieldW + edgePadding,
  );

  let topY = GAME_LAYOUT.playfieldY + GAME_LAYOUT.playfieldH;
  let bottomY = GAME_LAYOUT.canvasHeight;
  let height = bottomY - topY;

  let hpRatio = 1;
  if (boss.sectionHpMax > 0) {
    hpRatio = constrain(boss.sectionHp / boss.sectionHpMax, 0, 1);
  }

  let color = [120, 120, 120, 100];

  if (hpRatio <= 0.1) {
    color = [170, 95, 105, 220];
  } else if (hpRatio <= 0.2) {
    let blink = frameCount % 8 < 4;
    if (blink) color = [170, 95, 105, 200];
  } else if (hpRatio <= 0.3) {
    let blink = frameCount % 16 < 8;
    if (blink) color = [170, 95, 105, 180];
  }

  rectMode(CENTER);
  noStroke();

  // Vertical column
  fill(...color);
  rect(markerX, topY + height / 2, boxW, height);

  // Centered text
  fill(120);
  text(label, markerX, topY + height / 2);

  pop();
}

function cleanupBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    if (!bullets[i].alive) {
      bullets.splice(i, 1);
    }
  }
}

function checkPlayerCollision(player, bullets) {
  for (let b of bullets) {
    if (!b.alive) continue;

    let dx = b.x - player.x;
    let dy = b.y - player.y;
    let dist = sqrt(dx * dx + dy * dy);

    let hitDist = player.hitboxRadius + b.radius;
    let grazeDist = player.grazeRadius + b.radius;

    // Graze
    if (player.canGraze() && !b.grazed && dist <= grazeDist && dist > hitDist) {
      b.grazed = true;
      player.graze();
    }

    // If invulnerable, clear bullets on contact
    if (!player.canBeHit() && dist <= hitDist) {
      destroyEnemyBulletWithPop(b);
      continue;
    }

    // Normal hit
    if (player.canBeHit() && dist <= hitDist) {
      player.hit();
      destroyEnemyBulletWithPop(b);
      break;
    }
  }
}

function checkPlayerBossCollision(player, boss) {
  if (!gameplayActive) return;
  if (!boss.active || !boss.visible) return;
  if (boss.waitingToEnter) return;
  if (boss.isEntering) return;
  if (boss.isDying) return;
  if (!player.canBeHit()) return;

  let dx = player.x - boss.x;
  let dy = player.y - boss.y;

  let distSq = dx * dx + dy * dy;
  let combinedRadius = player.hitboxRadius + boss.contactRadius;

  if (distSq <= combinedRadius * combinedRadius) {
    player.hit();
  }
}

function triggerGameOver() {
  if (gameOver) return;

  gameOver = true;
  gameOverFade = 0;
  gameOverTimer = 0;

  gameplayActive = false;
  playerCanShoot = false;
}

function restartGame() {
  gameOver = false;
  gameOverFade = 0;
  gameOverTimer = 0;

  victory = false;
  victoryTimer = 0;

  gameplayActive = true;
  playerCanShoot = true;

  bullets = [];
  playerBullets = [];
  effects = [];

  player = new Player(getPlayerSpawnX(), getPlayerSpawnY(), playerImg);
  boss = new Boss(0, 0, bullets, player, bossImg, "demoBoss");
}

function triggerVictory() {
  victory = true;
  victoryTimer = 0;
}

// Debug Invincibility
function keyPressed() {
  if (key === "c" || key === "C") {
    player.debugInvincible = !player.debugInvincible;

    console.log(`Invincibility: ${player.debugInvincible ? "ON" : "OFF"}`);
  }
}

function spawnEffect(x, y, sprite = null, lifetime = 12, drawSize = 24) {
  effects.push(new TempEffect(x, y, sprite, lifetime, drawSize));
}

// =========================
// Player
// =========================

class Player {
  constructor(x, y, sprite = null, characterId = "reimuB") {
    this.x = x;
    this.y = y;

    this.spawnX = x;
    this.spawnY = y;

    this.characterId = characterId;
    this.characterData = characterDefs[characterId];

    this.fullSpeed = this.characterData.fullSpeed ?? 5;
    this.slowSpeed = this.characterData.slowSpeed ?? 2;
    this.moveSpeedMultiplier = 1;
    this.shotTimeScale = 1;

    this.size = 28;
    this.hitboxRadius = this.characterData.hitboxRadius;
    this.grazeRadius = this.characterData.grazeRadius;

    this.sprite = sprite;
    this.drawWidth = 64;
    this.drawHeight = 96;

    this.invulnTimer = 300; // 5 seconds at stage start
    this.respawnTimer = 0;
    this.deathTimer = 0;

    // Death / deathbomb system
    this.deathbombWindow = 0;
    this.pendingDeath = false;
    this.pendingDeathSource = null;
    this.deathbombFrames = this.characterData.deathbombFrames ?? 6;

    this.bulletClearTimer = 0;
    this.enemyBulletSuppressTimer = 0;

    this.grazeCount = 0;

    this.shotCooldown = 0;
    this.shotInterval = this.characterData.shotInterval ?? 6;
    this.focusShotInterval = this.characterData.focusShotInterval ?? 4;

    this.spreadShotConfig = this.characterData.spreadShot;
    this.focusShotConfig = this.characterData.focusShot;
    this.bombType = this.characterData.bombType;

    // Life system (settings-controlled)
    this.lives = gameSettings.startingLives;
    this.maxLives = gameSettings.startingLives;

    // Bomb system
    this.bombs = this.characterData.bombCapacity;
    this.maxBombs = this.characterData.bombCapacity;
    this.bombPressed = false;

    this.isDead = false;
    this.debugInvincible = false;
  }

  update() {
    if (this.invulnTimer > 0) this.invulnTimer--;
    if (this.respawnTimer > 0) this.respawnTimer--;
    if (this.deathTimer > 0) this.deathTimer--;
    if (this.shotCooldown > 0) this.shotCooldown--;
    if (this.bulletClearTimer > 0) this.bulletClearTimer--;
    if (this.enemyBulletSuppressTimer > 0) this.enemyBulletSuppressTimer--;

    if (this.pendingDeath) {
      if (this.deathbombWindow > 0) {
        this.deathbombWindow--;
      } else {
        this.resolveDeath();
      }
    }

    if (this.isDead && this.deathTimer <= 0) {
      if (this.lives <= 0) {
        triggerGameOver();
        return;
      }

      this.isDead = false;
      this.x = this.spawnX;
      this.y = this.spawnY;
      this.respawnTimer = 30;
    }

    if (!this.isDead && this.respawnTimer === 0 && !this.pendingDeath) {
      this.move();
    }
  }

  move() {
    const focused = keyIsDown(16); // Shift
    let speed = focused ? this.slowSpeed : this.fullSpeed;
    speed *= this.moveSpeedMultiplier;

    let moveX = 0;
    let moveY = 0;

    if (keyIsDown(LEFT_ARROW)) moveX -= 1;
    if (keyIsDown(RIGHT_ARROW)) moveX += 1;
    if (keyIsDown(UP_ARROW)) moveY -= 1;
    if (keyIsDown(DOWN_ARROW)) moveY += 1;

    if (moveX !== 0 || moveY !== 0) {
      const len = Math.hypot(moveX, moveY);
      this.x += (moveX / len) * speed;
      this.y += (moveY / len) * speed;
    }

    let offscreenAllowanceX = 6;
    let offscreenAllowanceY = 6;

    let leftBound =
      GAME_LAYOUT.playfieldX + this.drawWidth / 2 - offscreenAllowanceX;
    let rightBound =
      GAME_LAYOUT.playfieldX +
      GAME_LAYOUT.playfieldW -
      this.drawWidth / 2 +
      offscreenAllowanceX;

    let topBound =
      GAME_LAYOUT.playfieldY + this.drawHeight / 2 - offscreenAllowanceY;
    let bottomBound =
      GAME_LAYOUT.playfieldY +
      GAME_LAYOUT.playfieldH -
      this.drawHeight / 2 +
      offscreenAllowanceY;

    this.x = constrain(this.x, leftBound, rightBound);
    this.y = constrain(this.y, topBound, bottomBound);
  }

  fireShotLayout(layout, playerBullets) {
    for (let shot of layout.bullets) {
      let angle = radians(shot.angleDeg);

      let vx = sin(angle) * shot.speed;
      let vy = -cos(angle) * shot.speed;

      playerBullets.push(
        new PlayerBullet(
          this.x + shot.offsetX,
          this.y + 4 + shot.offsetY,
          vx,
          vy,
        ),
      );
    }
  }

  shoot(playerBullets) {
    if (!gameplayActive || !playerCanShoot || this.pendingDeath) return;
    if (this.isDead) return;
    if (this.respawnTimer > 0) return;
    if (!keyIsDown(90)) return;
    if (this.shotCooldown > 0) return;

    let focused = keyIsDown(16);

    let baseInterval = focused ? this.focusShotInterval : this.shotInterval;

    let interval = max(1, ceil(baseInterval / this.shotTimeScale));

    let layout = focused ? this.focusShotConfig : this.spreadShotConfig;

    this.fireShotLayout(layout, playerBullets);

    this.shotCooldown = interval;
  }

  hit() {
    if (!this.canBeHit()) return;
    this.startDeathbombWindow();
  }

  startDeathbombWindow() {
    if (this.debugInvincible) return;
    if (this.isDead) return;
    if (this.respawnTimer > 0) return;
    if (this.invulnTimer > 0) return;
    if (this.pendingDeath) return;

    this.pendingDeath = true;
    this.deathbombWindow = this.deathbombFrames;
  }

  cancelPendingDeath() {
    this.pendingDeath = false;
    this.deathbombWindow = 0;
  }

  resolveDeath() {
    this.pendingDeath = false;
    this.deathbombWindow = 0;

    if (this.lives > 0) {
      this.lives--;
    }

    this.isDead = true;
    this.deathTimer = 45;
    this.invulnTimer = 240;
    this.bulletClearTimer = 12;
    this.enemyBulletSuppressTimer = 120;
  }

  canBeHit() {
    if (this.debugInvincible) return false;

    return (
      !this.isDead &&
      !this.pendingDeath &&
      this.invulnTimer <= 0 &&
      this.respawnTimer <= 0
    );
  }

  canGraze() {
    return !this.isDead && this.respawnTimer <= 0;
  }

  graze() {
    this.grazeCount++;
  }

  shouldClearEnemyBullets() {
    return this.enemyBulletSuppressTimer > 0;
  }

  show() {
    if (this.isDead) return;

    push();
    translate(this.x, this.y + 4);

    let alpha = 255;

    // Flicker between solid and semi-transparent instead of disappearing
    if (this.invulnTimer > 0) {
      alpha = frameCount % 8 < 3 ? 160 : 255;
    }

    if (this.sprite) {
      imageMode(CENTER);
      tint(255, alpha);
      image(this.sprite, 0, 0, this.drawWidth, this.drawHeight);
      noTint();
    } else {
      noStroke();
      fill(255, alpha);
      rectMode(CENTER);
      rect(0, 0, this.drawWidth, this.drawHeight);
    }

    pop();
  }

  showHitbox() {
    if (this.isDead) return;

    // Show hitbox if focusing OR if deathbomb window is active
    if (!this.pendingDeath && !keyIsDown(16)) return;

    push();
    translate(this.x, this.y + 4);

    noStroke();

    if (this.pendingDeath) {
      fill(80, 160, 255); // blue during deathbomb window
    } else {
      fill(255, 0, 0); // red when focused
    }

    circle(0, 0, this.hitboxRadius * 2);

    pop();
  }
}

class PlayerBullet {
  constructor(x, y, vx = 0, vy = -10, sprite = null) {
    this.x = x;
    this.y = y;

    this.vx = vx;
    this.vy = vy;

    this.sprite = sprite;
    this.drawWidth = 8;
    this.drawHeight = 16;

    this.damage = 1;
    this.alive = true;
  }

  update(moveScale = 1) {
    this.x += this.vx * moveScale;
    this.y += this.vy * moveScale;

    if (
      this.x < -20 ||
      this.x > width + 20 ||
      this.y < -20 ||
      this.y > height + 20
    ) {
      this.alive = false;
    }
  }

  show() {
    push();
    translate(this.x, this.y);

    if (this.sprite) {
      imageMode(CENTER);
      image(this.sprite, 0, 0, this.drawWidth, this.drawHeight);
    } else {
      noStroke();
      fill(120, 255, 255);
      rectMode(CENTER);
      rect(0, 0, this.drawWidth, this.drawHeight);
    }

    pop();
  }
}

function playerBulletHitsBoss(bullet, boss) {
  return (
    bullet.x > boss.x - boss.drawWidth / 2 &&
    bullet.x < boss.x + boss.drawWidth / 2 &&
    bullet.y > boss.y - boss.drawHeight / 2 &&
    bullet.y < boss.y + boss.drawHeight / 2
  );
}

function useBomb(player, boss, bullets) {
  if (!gameplayActive) return false;

  /*
  if (player.bombs <= 0) return false;
  player.bombs--;
  */

  if (player.pendingDeath) {
    player.cancelPendingDeath();
  }

  for (let b of bullets) {
    destroyEnemyBulletWithPop(b);
  }

  player.invulnTimer = 270;

  if (
    boss &&
    boss.active &&
    !boss.waitingToEnter &&
    !boss.isDying &&
    boss.vulnerable
  ) {
    boss.sectionHp -= 50;
  }

  return true;
}

function spawnBulletPop(x, y, sprite = null, lifetime = 14, drawSize = 18) {
  effects.push(new TempEffect(x, y, sprite, lifetime, drawSize));
}

function destroyEnemyBulletWithPop(
  bullet,
  sprite = null,
  lifetime = 14,
  drawSize = null,
) {
  if (!bullet || !bullet.alive) return;

  let resolvedSize = drawSize;

  if (resolvedSize === null || resolvedSize === undefined) {
    if (bullet.drawSize !== undefined && bullet.drawSize !== null) {
      resolvedSize = bullet.drawSize;
    } else if (bullet.radius !== undefined && bullet.radius !== null) {
      resolvedSize = bullet.radius * 2;
    } else {
      resolvedSize = 14;
    }
  }

  resolvedSize = max(14, resolvedSize) * 1.5;

  spawnBulletPop(bullet.x, bullet.y, sprite, lifetime, resolvedSize);
  bullet.alive = false;
}

function clearEnemyBulletsWithPop(
  bulletsArray,
  sprite = null,
  lifetime = 8,
  drawSize = 18,
) {
  for (let bullet of bulletsArray) {
    if (!bullet.alive) continue;
    destroyEnemyBulletWithPop(bullet, sprite, lifetime, drawSize);
  }
}

// =========================
// Bullet
// =========================

class Bullet {
  constructor(x, y, angle, speed, options = {}) {
    this.x = x;
    this.y = y;

    this.angle = angle;
    this.speed = speed;

    this.turnRate = options.turnRate ?? 0;
    this.accel = options.accel ?? 0;

    this.vx = cos(this.angle) * this.speed;
    this.vy = sin(this.angle) * this.speed;

    this.age = 0;
    this.alive = true;
    this.grazed = false;

    this.type = options.type ?? "small";
    let def = bulletTypes[this.type] ?? bulletTypes.small;

    this.radius = options.radius ?? def.radius;

    this.drawSize = options.drawSize ?? def.drawSize;
    this.color = options.color ?? "white";

    this.sprite = options.sprite ?? def.sprite;
    this.rotateSprite = options.rotateSprite ?? def.rotate;
    this.rotationOffset = options.rotationOffset ?? def.rotationOffset ?? 0;

    this.player = options.player ?? null;
    this.spawnBullet = options.spawnBullet ?? null;

    this.events = (options.events ?? []).map((event) => ({
      time: event.time,
      action: event.action,
      done: false,
    }));
  }

  update(moveScale = 1) {
    this.age++;

    this.runEvents();
    this.updateMotion();
    this.move(moveScale);
    this.checkBounds();
  }

  runEvents() {
    for (let event of this.events) {
      if (!event.done && this.age === event.time) {
        event.action(this);
        event.done = true;
      }
    }
  }

  updateMotion() {
    this.angle += this.turnRate;
    this.speed += this.accel;

    if (this.speed < 0) {
      this.speed = 0;
    }

    this.vx = cos(this.angle) * this.speed;
    this.vy = sin(this.angle) * this.speed;
  }

  move(moveScale = 1) {
    this.x += this.vx * moveScale;
    this.y += this.vy * moveScale;
  }

  checkBounds() {
    if (
      this.x < -80 ||
      this.x > width + 80 ||
      this.y < -80 ||
      this.y > height + 80
    ) {
      this.alive = false;
    }
  }

  kill() {
    this.alive = false;
  }

  show() {
    push();
    translate(this.x, this.y);

    if (this.sprite) {
      imageMode(CENTER);

      if (this.rotateSprite) {
        rotate(this.angle + this.rotationOffset);
      }

      image(this.sprite, 0, 0, this.drawSize, this.drawSize);
    } else {
      noStroke();
      fill(this.color);
      circle(0, 0, this.drawSize);
    }

    pop();
  }
}

// =========================
// Boss
// =========================

class Boss {
  constructor(x, y, bullets, player, sprite = null, bossId = "demoBoss") {
    this.bossId = bossId;
    this.bossData = bossDefs[bossId];

    this.x = -60;
    this.y = -60;

    this.bullets = bullets;
    this.player = player;

    this.setupVisualDefaults(sprite);
    this.setupStateDefaults();
    this.setupMovementDefaults();
    this.setupMovementTuning();
    this.setupTimingDefaults();
    this.setupDisplayDefaults();
    this.setupUiDefaults();
    this.setupDeathTuning();

    this.emitter = new BulletEmitter(this, bullets, player);
    this.emitters = [];

    this.lives = this.createLives();

    this.currentLife = 0;
    this.lifeCount = this.lives.length;

    this.sectionType = "nonspell";
    this.sectionHp = 0;
    this.sectionHpMax = 0;

    this.prepareFirstSection();
  }

  // #region Setup helpers

  setupVisualDefaults(sprite) {
    this.sprite = sprite;
    this.drawWidth = this.bossData.drawWidth;
    this.drawHeight = this.bossData.drawHeight;
    this.contactRadius = this.bossData.contactRadius;
  }

  setupStateDefaults() {
    this.visible = true;
    this.active = true;
    this.vulnerable = false;
    this.phaseReady = false;

    this.isEntering = true;
    this.waitingToEnter = true;
    this.hasStartedFight = false;
    this.hasShownFightUi = false;

    this.isDying = false;
    this.deathTimer = 0;
  }

  setupMovementDefaults() {
    this.targetX = this.x;
    this.targetY = this.y;
    this.moveSpeed = 3;
    this.useBounds = false;
    this.useDriftSlowdown = false;

    this.minX = GAME_LAYOUT.playfieldX + this.drawWidth / 2;
    this.maxX =
      GAME_LAYOUT.playfieldX + GAME_LAYOUT.playfieldW - this.drawWidth / 2;

    this.minY = GAME_LAYOUT.playfieldY + this.drawHeight / 2;
    this.maxY =
      GAME_LAYOUT.playfieldY + GAME_LAYOUT.playfieldH / 3 - this.drawHeight / 2;

    this.restTimer = 0;
    this.randomMoveReady = true;

    this.currentPause = 0;
    this.pauseMin = 120;
    this.pauseMax = 180;

    this.pathPoints = [];
    this.pathIndex = 0;
    this.pathPause = 20;
    this.pathLoop = true;
    this.followingPath = false;
  }

  setupMovementTuning() {
    this.entranceSpeed = 8.8;

    // Phase transitions should take about as long as a normal drift move
    this.transitionDurationFrames = 20;

    this.arrivalSlowdownRadius = 72;
    this.arrivalMinSpeed = 0.75;

    this.entranceSlowdownRadius = 140;
    this.entranceMinSpeed = 1.1;
  }

  setupTimingDefaults() {
    this.actionCount = 0;
    this.nextActionTime = 0;
    this.phaseTimer = 0;
    this.phaseStartDelay = 60;
    this.nonspellIntroDelay = 30;
    this.spellIntroDelay = 75;

    this.sectionTimeMax = 0;
    this.sectionTime = 0;

    this.timerPaused = false;
    this.patternPaused = false;
  }

  setupDisplayDefaults() {
    this.displaySectionHp = 0;
    this.displayLifeRefillTimer = 0;
    this.displayLifeRefillDuration = 80;

    this.displayBarFillRatio = null;
    this.displayRefillStartBarRatio = 0;
    this.transitionHoldBarRatio = null;

    this.timeoutDrainTimer = 0;
    this.timeoutDrainDuration = 80;
    this.displayDrainStartBarRatio = 1;
    this.displayDrainTargetBarRatio = 0;
    this.pendingSectionAdvance = false;

    this.uiIntroTimer = 0;
    this.uiIntroDuration = 60;
  }

  setupUiDefaults() {
    this.hpBarLifeAreaW = 80;
    this.hpBarTimerAreaW = 40;
    this.hpBarMargin = 0;
    this.hpBarY = 12;
    this.hpBarH = 5;

    this.hpBarVisualNonspellWeight = 4;
    this.hpBarVisualSpellWeight = 1;

    this.hpBarNonspellColor = [215, 215, 225];
    this.hpBarSpellColor = [235, 120, 165];
    this.hpBarShadowAlpha = 110;

    this.timerTextSize = 24;
    this.timerShadowOffsetX = 2;
    this.timerShadowOffsetY = 2;
    this.timerMainX = 7;
    this.timerMainY = 8;

    this.timerColorHigh = [150, 220, 255];
    this.timerColorMid = [190, 160, 255];
    this.timerColorLow = [255, 150, 210];
    this.timerColorCritical = [255, 100, 100];

    this.enemyLabelText = "Enemy";
    this.enemyLabelTextSize = 14;
    this.enemyLivesTextSize = 24;

    this.enemyLabelOffsetX = 0;
    this.enemyLabelOffsetY = 2;
    this.enemyLivesOffsetX = 50;
    this.enemyLivesOffsetY = 0;

    this.enemyShadowOffsetX = 2;
    this.enemyShadowOffsetY = 2;

    this.enemyLabelColor = [255, 200, 90];
    this.enemyLivesColor = [255, 240, 160];
  }

  setupDeathTuning() {
    let slowmo = this.bossData.deathSlowmo ?? {};

    this.deathSlowmoEnabled = slowmo.enabled ?? false;
    this.deathDuration = slowmo.duration ?? 90;
    this.deathSlowmoScale = slowmo.scale ?? 0.35;
  }

  createLives() {
    return this.bossData.lives.map((life) => ({ ...life }));
  }

  // #endregion

  // #region Core flow

  update() {
    if (!this.active) return;

    if (this.isDying) {
      this.updateDeathSequence();
      return;
    }

    if (this.waitingToEnter) {
      if (this.player.invulnTimer <= 0) {
        this.waitingToEnter = false;
        this.hasStartedFight = true;
        this.beginPhaseTransition();
      }
      return;
    }

    let life = this.lives[this.currentLife];
    if (!life) return;

    this.emitter.update?.();

    for (let e of this.emitters) {
      e.update?.();
    }

    let arrived = this.moveTowardTarget();

    if (!this.phaseReady && arrived) {
      this.finishPhaseTransition();
    }

    if (!this.timerPaused && this.sectionTime > 0) {
      this.sectionTime--;
    }

    if (this.phaseReady && !this.pendingSectionAdvance) {
      if (!this.patternPaused) {
        this.phaseTimer++;
      }

      this.vulnerable = this.phaseTimer >= this.getCurrentPhaseIntroDelay();

      this.runCurrentPattern(life);
    }

    if (
      this.vulnerable &&
      keyIsDown(88) &&
      frameCount % 5 === 0 &&
      !this.pendingSectionAdvance
    ) {
      this.sectionHp -= 2;
    }

    if (this.phaseReady && !this.pendingSectionAdvance && this.sectionHp <= 0) {
      this.advanceSection();
      this.updateDisplayHp();
      return;
    }

    if (
      this.phaseReady &&
      !this.pendingSectionAdvance &&
      this.sectionTime <= 0
    ) {
      if (this.sectionType === "spell") {
        this.advanceSection();
        this.updateDisplayHp();
        return;
      } else {
        this.startTimeoutDrain();
      }
    }

    this.updateDisplayHp();
    this.updateUiIntro();
  }

  prepareFirstSection() {
    let life = this.lives[this.currentLife];
    if (!life) return;

    this.sectionType = "nonspell";
    this.sectionHpMax = life.nonspellHpMax;
    this.sectionHp = this.sectionHpMax;

    this.sectionTimeMax = life.nonspellTime * 60;
    this.sectionTime = this.sectionTimeMax;

    this.displaySectionHp = this.sectionHp;
    this.displayBarFillRatio = 0;
    this.displayRefillStartBarRatio = 0;
    this.displayLifeRefillTimer = this.displayLifeRefillDuration;

    this.phaseReady = false;
    this.vulnerable = false;
    this.isEntering = true;
  }

  startCurrentSection() {
    let life = this.lives[this.currentLife];
    if (!life) return;

    if (this.sectionType === "nonspell" && !life.nonspell) {
      this.sectionType = "spell";
    }

    this.timerPaused = false;
    this.patternPaused = false;
    this.pendingSectionAdvance = false;
    this.timeoutDrainTimer = 0;

    if (this.sectionType === "nonspell") {
      this.sectionHpMax = life.nonspellHpMax;
      this.sectionHp = this.sectionHpMax;

      this.sectionTimeMax = life.nonspellTime * 60;
      this.sectionTime = this.sectionTimeMax;
    } else {
      this.sectionHpMax = life.spellHpMax;
      this.sectionHp = this.sectionHpMax;

      this.sectionTimeMax = life.spellTime * 60;
      this.sectionTime = this.sectionTimeMax;
    }

    if (this.displayLifeRefillTimer <= 0) {
      if (this.transitionHoldBarRatio === null) {
        this.displayBarFillRatio = null;
      }
      this.displaySectionHp = this.sectionHp;
    }

    this.beginPhaseTransition();
  }

  advanceSection() {
    let life = this.lives[this.currentLife];

    if (this.sectionType === "nonspell" && life.spell) {
      this.displayLifeRefillTimer = 0;

      let holdRatio = this.getSpellSectionBaseRatio(life);
      this.transitionHoldBarRatio = holdRatio;
      this.displayBarFillRatio = holdRatio;

      this.sectionType = "spell";
      this.sectionHpMax = life.spellHpMax;
      this.sectionHp = this.sectionHpMax;
      this.displaySectionHp = this.sectionHp;

      this.startCurrentSection();
      return;
    }

    let refillStartRatio = this.getDisplayedBarFillRatio();

    this.currentLife++;
    this.lifeCount--;

    if (this.currentLife >= this.lives.length) {
      this.startDeathSequence();
      return;
    }

    this.sectionType = "nonspell";
    this.displayLifeRefillTimer = this.displayLifeRefillDuration;
    this.displayRefillStartBarRatio = refillStartRatio;
    this.displayBarFillRatio = refillStartRatio;

    this.startCurrentSection();
  }

  beginPhaseTransition() {
    let life = this.lives[this.currentLife];
    if (!life) return;

    this.phaseTimer = 0;
    this.phaseReady = false;
    this.vulnerable = false;

    this.isEntering = this.currentLife === 0 && this.sectionType === "nonspell";

    this.timerPaused = false;
    this.patternPaused = false;

    this.emitter.reset?.();
    this.emitters = [];

    this.restTimer = 0;
    this.randomMoveReady = true;
    this.currentPause = 0;

    this.pathPoints = [];
    this.pathIndex = 0;
    this.followingPath = false;

    this.actionCount = 0;
    this.nextActionTime = 0;

    let startY =
      this.sectionType === "nonspell"
        ? (life.nonspellY ?? 100)
        : (life.spellY ?? 90);

    let targetX = GAME_LAYOUT.playfieldX + GAME_LAYOUT.playfieldW / 2;
    let targetY = startY;

    if (
      !this.isEntering &&
      this.sectionType === "nonspell" &&
      this.currentLife > 0
    ) {
      targetX = this.x;
    }

    let transitionSpeed;

    if (this.isEntering) {
      transitionSpeed = this.entranceSpeed;
    } else {
      transitionSpeed = this.getSpeedForDuration(
        targetX,
        targetY,
        this.transitionDurationFrames,
      );
    }

    this.setTarget(targetX, targetY, transitionSpeed, false, !this.isEntering);

    for (let b of this.bullets) {
      destroyEnemyBulletWithPop(b);
    }
  }

  finishPhaseTransition() {
    this.phaseReady = true;
    this.vulnerable = false;
    this.phaseTimer = 0;

    if (!this.hasShownFightUi) {
      this.startUiIntro();
      this.hasShownFightUi = true;
    }

    this.isEntering = false;
    this.emitter.reset?.();
  }

  startDeathSequence() {
    if (this.isDying) return;

    this.isDying = true;
    this.deathTimer = this.deathDuration;

    this.phaseReady = false;
    this.vulnerable = false;

    this.timerPaused = true;
    this.patternPaused = true;

    this.emitter.reset?.();
    this.emitters = [];
  }

  updateDeathSequence() {
    if (this.deathTimer > 0) {
      this.deathTimer--;
    }

    if (this.deathTimer <= 0) {
      for (let b of this.bullets) {
        destroyEnemyBulletWithPop(b);
      }

      this.isDying = false;
      this.active = false;
      this.visible = false;

      playerCanShoot = false;
      gameplayActive = false;

      triggerVictory();
    }
  }

  // #endregion

  // #region Movement

  moveTowardTarget() {
    let dx = this.targetX - this.x;
    let dy = this.targetY - this.y;
    let dist = sqrt(dx * dx + dy * dy);

    if (dist < 1) {
      this.restTimer++;
      return true;
    }

    this.restTimer = 0;

    let speed = this.moveSpeed;

    let slowdownRadius;
    let minSpeed;

    if (this.isEntering) {
      slowdownRadius = this.entranceSlowdownRadius;
      minSpeed = this.entranceMinSpeed;
    } else if (this.useDriftSlowdown) {
      slowdownRadius = this.arrivalSlowdownRadius;
      minSpeed = this.arrivalMinSpeed;
    } else {
      slowdownRadius = this.arrivalSlowdownRadius;
      minSpeed = this.arrivalMinSpeed;
    }

    if (dist < slowdownRadius) {
      let t = constrain(dist / slowdownRadius, 0, 1);
      speed = lerp(minSpeed, this.moveSpeed, t * t);
    }

    speed = min(speed, dist);

    this.x += (dx / dist) * speed;
    this.y += (dy / dist) * speed;

    if (this.useBounds) {
      this.x = constrain(this.x, this.minX, this.maxX);
      this.y = constrain(this.y, this.minY, this.maxY);
    }

    return false;
  }

  setTarget(
    x,
    y,
    speed = this.moveSpeed,
    bounded = false,
    useDriftSlowdown = false,
  ) {
    this.targetX = x;
    this.targetY = y;
    this.moveSpeed = speed;
    this.useBounds = bounded;
    this.useDriftSlowdown = useDriftSlowdown;
    this.currentPause = 0;
  }

  getSpeedForDuration(targetX, targetY, durationFrames) {
    if (durationFrames <= 0) return this.moveSpeed;

    let dx = targetX - this.x;
    let dy = targetY - this.y;
    let dist = sqrt(dx * dx + dy * dy);

    return dist / durationFrames;
  }

  moveInDirection(
    angle,
    distance,
    speed = this.moveSpeed,
    bounded = false,
    useDriftSlowdown = true,
  ) {
    let x = this.x + cos(angle) * distance;
    let y = this.y + sin(angle) * distance;
    this.setTarget(x, y, speed, bounded, useDriftSlowdown);
  }

  getCurrentPause() {
    if (this.currentPause === 0) {
      this.currentPause = floor(random(this.pauseMin, this.pauseMax));
    }
    return this.currentPause;
  }

  driftMove({
    distance = 45,
    speed = 2.3,
    centerAngle = null,
    arcWidth = null,
    bounded = true,
    pauseMin = 90,
    pauseMax = 140,
    immediateFirstMove = false,
  } = {}) {
    this.pauseMin = pauseMin;
    this.pauseMax = pauseMax;

    let pause = this.getCurrentPause();

    if (!(immediateFirstMove && this.phaseTimer === 0)) {
      if (this.restTimer < pause) {
        this.randomMoveReady = true;
        return;
      }
    }

    if (!this.randomMoveReady) return;

    let angle;

    if (centerAngle === null || arcWidth === null) {
      angle = random(TWO_PI);
    } else {
      angle = random(centerAngle - arcWidth / 2, centerAngle + arcWidth / 2);
    }

    this.moveInDirection(angle, distance, speed, bounded, true);

    this.randomMoveReady = false;
    this.currentPause = 0;
  }

  laneBiasMove({
    speed = 2.3,
    pauseMin = 90,
    pauseMax = 140,
    playerBias = 0.35,
    xJitter = 20,
    yJitter = 12,
  } = {}) {
    this.pauseMin = pauseMin;
    this.pauseMax = pauseMax;

    let pause = this.getCurrentPause();

    if (this.restTimer < pause) {
      this.randomMoveReady = true;
      return;
    }

    if (!this.randomMoveReady) return;

    let targetX = lerp(
      this.x + random(-xJitter, xJitter),
      this.player.x,
      playerBias,
    );

    let targetY = this.y + random(-yJitter, yJitter);

    targetX = constrain(targetX, this.minX, this.maxX);
    targetY = constrain(targetY, this.minY, this.maxY);

    this.setTarget(targetX, targetY, speed, true, true);

    this.randomMoveReady = false;
    this.currentPause = 0;
  }

  startPath(points, speed = 3, pauseFrames = 20, loop = true, bounded = false) {
    this.pathPoints = points.map((p) => ({
      x: p.x,
      y: p.y,
      pause: p.pause ?? pauseFrames,
      speed: p.speed ?? speed,
    }));

    this.pathIndex = 0;
    this.pathPause = pauseFrames;
    this.pathLoop = loop;
    this.followingPath = this.pathPoints.length > 0;

    if (this.followingPath) {
      let p = this.pathPoints[0];
      this.setTarget(p.x, p.y, p.speed, bounded);
    }
  }

  updatePathMovement(speed = this.moveSpeed, bounded = false) {
    if (!this.followingPath || this.pathPoints.length === 0) return;

    let currentPoint = this.pathPoints[this.pathIndex];
    let currentPause = currentPoint.pause ?? this.pathPause;

    if (this.restTimer < currentPause) return;

    this.pathIndex++;

    if (this.pathIndex >= this.pathPoints.length) {
      if (this.pathLoop) {
        this.pathIndex = 0;
      } else {
        this.followingPath = false;
        return;
      }
    }

    let p = this.pathPoints[this.pathIndex];
    let pointSpeed = p.speed ?? speed;
    this.setTarget(p.x, p.y, pointSpeed, bounded);
  }

  // #endregion

  // #region Pause / timing helpers

  setPauseState({
    timerPaused = this.timerPaused,
    patternPaused = this.patternPaused,
  } = {}) {
    this.timerPaused = timerPaused;
    this.patternPaused = patternPaused;
  }

  isSectionPaused() {
    return this.timerPaused || this.patternPaused;
  }

  isInPhaseStartup(delayFrames) {
    return this.phaseTimer < delayFrames;
  }

  getCurrentPhaseIntroDelay() {
    return this.sectionType === "spell"
      ? this.spellIntroDelay
      : this.nonspellIntroDelay;
  }

  getPatternTimer() {
    return this.phaseTimer - this.getCurrentPhaseIntroDelay();
  }

  isPatternActive() {
    return this.getPatternTimer() >= 0;
  }

  // #endregion

  // #region HP / UI state helpers

  getCurrentBarFillRatio() {
    if (this.sectionHpMax <= 0) return 0;
    return constrain(this.displaySectionHp / this.sectionHpMax, 0, 1);
  }

  getActualBarFillRatio() {
    let life = this.lives[this.currentLife];
    if (!life) return 0;

    let visualNonspellWeight = this.hpBarVisualNonspellWeight;
    let visualSpellWeight = this.hpBarVisualSpellWeight;
    let visualTotal = visualNonspellWeight + visualSpellWeight;

    let hasNonspell = life.nonspell && life.nonspellHpMax > 0;

    if (this.sectionType === "nonspell") {
      if (!hasNonspell || life.nonspellHpMax <= 0) return 0;

      let nonspellRatio = constrain(this.sectionHp / life.nonspellHpMax, 0, 1);
      return (
        (visualSpellWeight + nonspellRatio * visualNonspellWeight) / visualTotal
      );
    }

    if (this.sectionType === "spell") {
      if (life.spellHpMax <= 0) return 0;

      let spellRatio = constrain(this.sectionHp / life.spellHpMax, 0, 1);

      if (!hasNonspell) {
        return spellRatio;
      }

      return (spellRatio * visualSpellWeight) / visualTotal;
    }

    return 0;
  }

  getSpellSectionBaseRatio(life = this.lives[this.currentLife]) {
    if (!life) return 0;

    let visualNonspellWeight = this.hpBarVisualNonspellWeight;
    let visualSpellWeight = this.hpBarVisualSpellWeight;
    let visualTotal = visualNonspellWeight + visualSpellWeight;

    let hasNonspell = life.nonspell && life.nonspellHpMax > 0;

    if (!hasNonspell) return 1;
    return visualSpellWeight / visualTotal;
  }

  getDisplayedBarFillRatio() {
    if (this.transitionHoldBarRatio !== null) {
      return constrain(this.transitionHoldBarRatio, 0, 1);
    }

    if (this.displayBarFillRatio !== null) {
      return constrain(this.displayBarFillRatio, 0, 1);
    }

    return this.getActualBarFillRatio();
  }

  startUiIntro() {
    this.uiIntroTimer = this.uiIntroDuration;
  }

  updateUiIntro() {
    if (this.uiIntroTimer > 0) {
      this.uiIntroTimer--;
    }
  }

  getUiIntroProgress() {
    if (this.uiIntroDuration <= 0) return 1;
    return 1 - this.uiIntroTimer / this.uiIntroDuration;
  }

  getUiTextIntroProgress() {
    if (this.currentLife !== 0) return 1;
    return this.getUiIntroProgress();
  }

  getUiTextVisibilityProgress() {
    let intro = this.getUiTextIntroProgress();
    let outro = this.isDying
      ? constrain(this.deathTimer / this.deathDuration, 0, 1)
      : 1;

    return intro * outro;
  }

  startTimeoutDrain() {
    if (this.pendingSectionAdvance) return;

    this.pendingSectionAdvance = true;
    this.timeoutDrainTimer = this.timeoutDrainDuration;
    this.displayDrainStartBarRatio = this.getDisplayedBarFillRatio();

    let life = this.lives[this.currentLife];

    if (this.sectionType === "nonspell" && life && life.spell) {
      this.displayDrainTargetBarRatio = this.getSpellSectionBaseRatio(life);
    } else {
      this.displayDrainTargetBarRatio = 0;
    }

    this.displayBarFillRatio = this.displayDrainStartBarRatio;

    this.setPauseState({
      timerPaused: true,
      patternPaused: true,
    });
  }

  shouldDelayBarFill() {
    if (!this.phaseReady) return true;
    if (this.currentLife === 0 && this.uiIntroTimer > 0) return true;
    return false;
  }

  updateDisplayHp() {
    if (this.timeoutDrainTimer > 0) {
      this.timeoutDrainTimer--;

      let t = 1 - this.timeoutDrainTimer / this.timeoutDrainDuration;
      this.displayBarFillRatio = lerp(
        this.displayDrainStartBarRatio,
        this.displayDrainTargetBarRatio,
        t,
      );

      if (this.timeoutDrainTimer <= 0) {
        this.displayBarFillRatio = this.displayDrainTargetBarRatio;
        this.pendingSectionAdvance = false;
        this.advanceSection();
      }

      return;
    }

    if (this.displayLifeRefillTimer > 0) {
      if (this.shouldDelayBarFill()) {
        this.displayBarFillRatio = this.displayRefillStartBarRatio;
        return;
      }

      this.displayLifeRefillTimer--;

      let t = 1 - this.displayLifeRefillTimer / this.displayLifeRefillDuration;
      let targetRatio = this.getActualBarFillRatio();

      this.displayBarFillRatio = lerp(
        this.displayRefillStartBarRatio,
        targetRatio,
        t,
      );

      if (this.displayLifeRefillTimer <= 0) {
        this.displayBarFillRatio = null;
        this.displaySectionHp = this.sectionHp;
      }

      return;
    }

    if (this.phaseReady) {
      this.transitionHoldBarRatio = null;
    }

    this.displayBarFillRatio = null;
    this.displaySectionHp = this.sectionHp;
  }

  // #endregion

  // #region UI drawing helpers

  drawUiShadowRect(x, y, w, h, color) {
    fill(0, 0, 0, this.hpBarShadowAlpha);
    rect(x + 1, y + 2, w, h);

    fill(...color);
    rect(x, y, w, h);
  }

  drawAnimatedHpBar(
    x,
    y,
    barW,
    barH,
    spellW,
    hasNonspell,
    spellColor,
    nonspellColor,
    overrideRatio = null,
  ) {
    let ratio =
      overrideRatio !== null ? overrideRatio : this.displayBarFillRatio;

    let fillW = constrain(ratio, 0, 1) * barW;

    if (fillW <= 0) return;

    if (!hasNonspell) {
      this.drawUiShadowRect(x, y, fillW, barH, spellColor);
      return;
    }

    if (fillW <= spellW) {
      this.drawUiShadowRect(x, y, fillW, barH, spellColor);
    } else {
      this.drawUiShadowRect(x, y, spellW, barH, spellColor);
      this.drawUiShadowRect(x + spellW, y, fillW - spellW, barH, nonspellColor);
    }
  }

  drawSectionHpBar(
    x,
    y,
    barH,
    spellW,
    nonspellW,
    life,
    spellColor,
    nonspellColor,
  ) {
    if (this.sectionType === "nonspell") {
      let whiteW = map(
        this.displaySectionHp,
        0,
        life.nonspellHpMax,
        0,
        nonspellW,
      );

      if (spellW > 0) {
        this.drawUiShadowRect(x, y, spellW, barH, spellColor);
      }

      if (whiteW > 0) {
        this.drawUiShadowRect(x + spellW, y, whiteW, barH, nonspellColor);
      }
    } else if (this.sectionType === "spell") {
      let redW = map(this.displaySectionHp, 0, life.spellHpMax, 0, spellW);

      if (redW > 0) {
        this.drawUiShadowRect(x, y, redW, barH, spellColor);
      }
    }
  }

  // #endregion

  // #region UI / rendering

  showHpBar() {
    let life = this.lives[this.currentLife];
    if (!life) return;

    if (!this.hasShownFightUi) return;

    let x = GAME_LAYOUT.playfieldX + this.hpBarLifeAreaW + this.hpBarMargin;
    let y = GAME_LAYOUT.playfieldY + this.hpBarY;
    let barH = this.hpBarH;
    let barW =
      GAME_LAYOUT.playfieldW -
      this.hpBarLifeAreaW -
      this.hpBarTimerAreaW -
      this.hpBarMargin * 2;

    let visualNonspellWeight = this.hpBarVisualNonspellWeight;
    let visualSpellWeight = this.hpBarVisualSpellWeight;
    let visualTotal = visualNonspellWeight + visualSpellWeight;

    let hasNonspell = life.nonspell && life.nonspellHpMax > 0;

    let spellW = hasNonspell ? barW * (visualSpellWeight / visualTotal) : barW;

    let nonspellW = hasNonspell
      ? barW * (visualNonspellWeight / visualTotal)
      : 0;

    rectMode(CORNER);
    noStroke();

    let nonspellColor = this.hpBarNonspellColor;
    let spellColor = this.hpBarSpellColor;

    if (this.transitionHoldBarRatio !== null) {
      let holdW = spellW;

      if (holdW > 0) {
        this.drawUiShadowRect(x, y, holdW, barH, spellColor);
      }

      rectMode(CENTER);
      return;
    }

    if (this.displayBarFillRatio !== null) {
      this.drawAnimatedHpBar(
        x,
        y,
        barW,
        barH,
        spellW,
        hasNonspell,
        spellColor,
        nonspellColor,
      );

      rectMode(CENTER);
      return;
    }

    this.drawSectionHpBar(
      x,
      y,
      barH,
      spellW,
      nonspellW,
      life,
      spellColor,
      nonspellColor,
    );

    rectMode(CENTER);
  }

  showTimer() {
    if (!this.active || this.waitingToEnter) return;
    if (!this.hasShownFightUi) return;

    let seconds = ceil(this.sectionTime / 60);
    seconds = constrain(seconds, 0, 99);

    let display = nf(seconds, 2);

    let timerColor;

    if (seconds >= 20) {
      timerColor = this.timerColorHigh;
    } else if (seconds >= 10) {
      timerColor = this.timerColorMid;
    } else if (seconds >= 5) {
      timerColor = this.timerColorLow;
    } else {
      timerColor = this.timerColorCritical;
    }

    let visibility = this.getUiTextVisibilityProgress();

    textAlign(RIGHT, TOP);

    fill(0, 0, 0, this.hpBarShadowAlpha * visibility);
    textSize(this.timerTextSize);
    text(
      display,
      GAME_LAYOUT.playfieldX +
        GAME_LAYOUT.playfieldW -
        this.timerMainX +
        this.timerShadowOffsetX,
      GAME_LAYOUT.playfieldY + this.timerMainY + this.timerShadowOffsetY,
    );

    fill(...timerColor, 255 * visibility);
    textSize(this.timerTextSize);
    text(
      display,
      GAME_LAYOUT.playfieldX + GAME_LAYOUT.playfieldW - this.timerMainX,
      GAME_LAYOUT.playfieldY + this.timerMainY,
    );
  }

  show() {
    if (!this.visible) return;
    if (this.waitingToEnter) return;

    push();
    translate(this.x, this.y);

    if (this.sprite) {
      imageMode(CENTER);
      image(this.sprite, 0, 0, this.drawWidth, this.drawHeight);
    } else {
      noStroke();
      fill(this.vulnerable ? 255 : 180);
      rectMode(CENTER);
      rect(0, 0, this.drawWidth, this.drawHeight);
    }

    pop();

    // Debug boss contact circle
    push();
    noFill();
    stroke(255, 0, 0);
    strokeWeight(1);
    circle(this.x, this.y, this.contactRadius * 2);
    pop();

    for (let e of this.emitters) {
      e.show?.();
    }
  }

  // #endregion

  // #region Pattern helpers

  cycleActions(
    actionInterval,
    actionsPerCycle,
    pauseFrames,
    actionFunc,
    timer = this.phaseTimer,
  ) {
    if (timer < this.nextActionTime) return;

    actionFunc(this.actionCount);

    this.actionCount++;

    if (this.actionCount >= actionsPerCycle) {
      this.actionCount = 0;
      this.nextActionTime = timer + pauseFrames;
    } else {
      this.nextActionTime = timer + actionInterval;
    }
  }

  runCurrentPattern(life) {
    let patternName =
      this.sectionType === "nonspell" ? life.nonspell : life.spell;

    if (!patternName) return;

    let timer = this.getPatternTimer();
    if (timer < 0) return;

    let runner = patternRunners[patternName];
    if (!runner) return;

    let cfg = patternConfigs[patternName] ?? {};
    runner(this, cfg, timer);
  }

  // #endregion
}

// =========================
// BulletEmitter
// =========================

class BulletEmitter {
  constructor(owner, bullets, player = null) {
    this.owner = owner;
    this.bullets = bullets;
    this.player = player;

    this.baseAngle = 0; // internal radians
    this.baseAngleDeg = 0; // convenience mirror for pattern code
    this.spinDir = 1;

    this.sweepBaseAngle = 0;
    this.sweepDirection = 1;
    this.arcSweepBaseAngle = 0;
    this.arcSweepCycleIndex = -1;
    this.arcSweepStartT = 0;
  }

  // #region Core state / spawn

  reset() {
    this.baseAngle = 0;
    this.baseAngleDeg = 0;
    this.spinDir = 1;

    this.sweepBaseAngle = 0;
    this.sweepDirection = 1;
    this.arcSweepBaseAngle = 0;
    this.arcSweepCycleIndex = -1;
    this.arcSweepStartT = 0;
  }

  rotateBaseAngle(stepDeg) {
    this.baseAngle += radians(stepDeg);
    this.baseAngleDeg += stepDeg;
  }

  spawnBullet(x, y, angle, speed, bulletData = {}) {
    this.bullets.push(
      new Bullet(x, y, angle, speed, {
        ...bulletData,
        player: this.player,
        spawnBullet: (bx, by, bAngle, bSpeed, bOptions = {}) => {
          this.spawnBullet(bx, by, bAngle, bSpeed, bOptions);
        },
      }),
    );
  }

  update() {}

  // #endregion

  // #region Instant angular helpers

  _getInstantAngles({
    centerAngleDeg = 90,
    aimed = false,
    totalArcDeg = 60,
    count = 5,
    fullCircle = false,
    startAngleDeg = 0,
    gapAngleDeg = null,
    gapArcDeg = 0,
    gapOffsetDeg = 0,
  } = {}) {
    if (count <= 0) return [];

    let baseAngle = radians(centerAngleDeg);

    if (aimed) {
      if (!this.player) return [];

      baseAngle = atan2(
        this.player.y - this.owner.y,
        this.player.x - this.owner.x,
      );
    }

    let totalArc = radians(totalArcDeg);
    let startAngle = radians(startAngleDeg);
    let gapArc = radians(gapArcDeg);

    let resolvedGapAngle = gapAngleDeg !== null ? radians(gapAngleDeg) : null;

    if (gapArc > 0 && resolvedGapAngle === null) {
      resolvedGapAngle =
        (fullCircle ? startAngle : baseAngle) + radians(gapOffsetDeg);
    }

    let angles = [];

    if (fullCircle) {
      for (let i = 0; i < count; i++) {
        let angle = startAngle + (TWO_PI * i) / count;

        if (gapArc > 0 && resolvedGapAngle !== null) {
          let diff = atan2(
            sin(angle - resolvedGapAngle),
            cos(angle - resolvedGapAngle),
          );

          if (abs(diff) <= gapArc / 2) continue;
        }

        angles.push(angle);
      }

      return angles;
    }

    if (count === 1) {
      let angle = baseAngle;

      if (gapArc > 0 && resolvedGapAngle !== null) {
        let diff = atan2(
          sin(angle - resolvedGapAngle),
          cos(angle - resolvedGapAngle),
        );

        if (abs(diff) <= gapArc / 2) return [];
      }

      return [angle];
    }

    let spreadStart = baseAngle - totalArc / 2;
    let spreadEnd = baseAngle + totalArc / 2;

    for (let i = 0; i < count; i++) {
      let angle = map(i, 0, count - 1, spreadStart, spreadEnd);

      if (gapArc > 0 && resolvedGapAngle !== null) {
        let diff = atan2(
          sin(angle - resolvedGapAngle),
          cos(angle - resolvedGapAngle),
        );

        if (abs(diff) <= gapArc / 2) continue;
      }

      angles.push(angle);
    }

    return angles;
  }

  _fireAngles(angles, speed, bulletData = {}) {
    for (let angle of angles) {
      this.spawnBullet(this.owner.x, this.owner.y, angle, speed, bulletData);
    }
  }

  // #endregion

  // #region Spread family

  fireSpread(centerAngleDeg, totalArcDeg, count, speed, bulletData = {}) {
    let angles = this._getInstantAngles({
      centerAngleDeg,
      totalArcDeg,
      count,
    });

    this._fireAngles(angles, speed, bulletData);
  }

  fireAimedSpread(totalArcDeg, count, speed, bulletData = {}) {
    let angles = this._getInstantAngles({
      aimed: true,
      totalArcDeg,
      count,
    });

    this._fireAngles(angles, speed, bulletData);
  }

  fireGapSpread(
    centerAngleDeg,
    totalArcDeg,
    count,
    speed,
    gapAngleDeg,
    gapArcDeg,
    bulletData = {},
  ) {
    let angles = this._getInstantAngles({
      centerAngleDeg,
      totalArcDeg,
      count,
      gapAngleDeg,
      gapArcDeg,
    });

    this._fireAngles(angles, speed, bulletData);
  }

  fireAimedGapSpread(
    totalArcDeg,
    count,
    speed,
    gapOffsetDeg = 0,
    gapArcDeg = 20,
    bulletData = {},
  ) {
    let angles = this._getInstantAngles({
      aimed: true,
      totalArcDeg,
      count,
      gapOffsetDeg,
      gapArcDeg,
    });

    this._fireAngles(angles, speed, bulletData);
  }

  // #endregion

  // #region Ring family

  fireRing(count, speed, bulletData = {}) {
    let angles = this._getInstantAngles({
      fullCircle: true,
      count,
      startAngleDeg: 0,
    });

    this._fireAngles(angles, speed, bulletData);
  }

  fireRingOffset(count, speed, startAngleDeg = 0, bulletData = {}) {
    let angles = this._getInstantAngles({
      fullCircle: true,
      count,
      startAngleDeg,
    });

    this._fireAngles(angles, speed, bulletData);
  }

  fireAimedRing(count, speed, bulletData = {}) {
    let startAngleDeg = 0;

    if (this.player) {
      let aimedAngle = atan2(
        this.player.y - this.owner.y,
        this.player.x - this.owner.x,
      );
      startAngleDeg = degrees(aimedAngle);
    }

    let angles = this._getInstantAngles({
      fullCircle: true,
      count,
      startAngleDeg,
    });

    this._fireAngles(angles, speed, bulletData);
  }

  fireGapRing(
    count,
    speed,
    startAngleDeg = 0,
    gapAngleDeg = 0,
    gapArcDeg = 20,
    bulletData = {},
  ) {
    let angles = this._getInstantAngles({
      fullCircle: true,
      count,
      startAngleDeg,
      gapAngleDeg,
      gapArcDeg,
    });

    this._fireAngles(angles, speed, bulletData);
  }

  fireAimedGapRing(
    count,
    speed,
    gapOffsetDeg = 0,
    gapArcDeg = 20,
    bulletData = {},
  ) {
    let startAngleDeg = 0;

    if (this.player) {
      let aimedAngle = atan2(
        this.player.y - this.owner.y,
        this.player.x - this.owner.x,
      );
      startAngleDeg = degrees(aimedAngle);
    }

    let angles = this._getInstantAngles({
      fullCircle: true,
      count,
      startAngleDeg,
      gapArcDeg,
      gapOffsetDeg,
    });

    this._fireAngles(angles, speed, bulletData);
  }

  // #endregion

  // #region Sequential angular helpers
  // Public API uses degrees. Internal math stays in radians.

  startSequentialAngle(angleDeg = 0) {
    this.baseAngle = radians(angleDeg);
    this.baseAngleDeg = angleDeg;
  }

  startAimedSequentialAngle(angleOffsetDeg = 0) {
    if (!this.player) return;

    let aimedAngle = atan2(
      this.player.y - this.owner.y,
      this.player.x - this.owner.x,
    );

    this.baseAngle = aimedAngle + radians(angleOffsetDeg);
    this.baseAngleDeg = degrees(this.baseAngle);
  }

  startSequentialArcAtEdge(
    arcWidthDeg,
    side = -1,
    aimed = true,
    baseAngleDeg = 90,
    angleOffsetDeg = 0,
  ) {
    let centerAngle;

    if (aimed) {
      if (!this.player) return;

      centerAngle = atan2(
        this.player.y - this.owner.y,
        this.player.x - this.owner.x,
      );
    } else {
      centerAngle = radians(baseAngleDeg);
    }

    let halfArc = radians(arcWidthDeg) / 2;

    this.baseAngle = centerAngle + radians(angleOffsetDeg) + halfArc * side;
    this.baseAngleDeg = degrees(this.baseAngle);
  }

  setSequentialDirection(direction = 1) {
    this.spinDir = direction >= 0 ? 1 : -1;
  }

  _getSweepRelative(progress, halfArc) {
    return this.spinDir >= 0
      ? lerp(-halfArc, halfArc, progress)
      : lerp(halfArc, -halfArc, progress);
  }

  _fireSequentialAngle(angle, speed, bulletData = {}) {
    this.spawnBullet(this.owner.x, this.owner.y, angle, speed, bulletData);
  }

  stepSpiral(speed, stepDeg, bulletData = {}) {
    let angle = this.baseAngle;

    this._fireSequentialAngle(angle, speed, bulletData);

    this.baseAngle += radians(stepDeg) * this.spinDir;
    this.baseAngleDeg = degrees(this.baseAngle);
  }

  stepAimedArcSpiral(speed, stepDeg, arcWidthDeg, bulletData = {}) {
    if (!this.player) return;

    let aimedAngle = atan2(
      this.player.y - this.owner.y,
      this.player.x - this.owner.x,
    );

    let halfArc = radians(arcWidthDeg) / 2;
    let step = radians(stepDeg) * this.spinDir;

    let relative = atan2(
      sin(this.baseAngle - aimedAngle),
      cos(this.baseAngle - aimedAngle),
    );

    relative += step;

    if (relative > halfArc) {
      relative = -halfArc;
    } else if (relative < -halfArc) {
      relative = halfArc;
    }

    let angle = aimedAngle + relative;

    this._fireSequentialAngle(angle, speed, bulletData);

    this.baseAngle = angle;
    this.baseAngleDeg = degrees(this.baseAngle);
  }

  stepArcSweep(
    progress,
    arcWidthDeg,
    speed,
    bulletData = {},
    anchorProgress = null,
    anchorOffsetDeg = 0,
  ) {
    let halfArc = radians(arcWidthDeg) / 2;

    let relative = this._getSweepRelative(progress, halfArc);

    if (anchorProgress !== null) {
      let anchorRelative = this._getSweepRelative(anchorProgress, halfArc);
      relative -= anchorRelative;
    }

    let angle = this.baseAngle + relative + radians(anchorOffsetDeg);

    this._fireSequentialAngle(angle, speed, bulletData);
  }

  stepArcSweepIndexed(
    shotIndex,
    shotCount,
    arcWidthDeg,
    speed,
    bulletData = {},
    anchorIndex = null,
    anchorOffsetDeg = 0,
  ) {
    let progress = shotCount > 1 ? shotIndex / (shotCount - 1) : 0;

    let anchorProgress = null;

    if (anchorIndex !== null && shotCount > 1) {
      anchorProgress = anchorIndex / (shotCount - 1);
    }

    this.stepArcSweep(
      progress,
      arcWidthDeg,
      speed,
      bulletData,
      anchorProgress,
      anchorOffsetDeg,
    );
  }

  fireTimedIndexedArcSweep({
    timer,
    cycle = 180,
    fireWindow = 96,
    shotInterval = 4,
    arcWidthDeg = 110,
    speed = 2.25,
    aimed = true,
    baseAngleDeg = 90,

    // Direction control
    directionMode = "alternate", // "alternate", "ltr", "rtl", "sequence"
    firstDirection = "rtl", // "ltr" or "rtl"
    directionRepeat = 1, // how many full sweeps before switching
    directionSequence = null, // e.g. ["ltr", "rtl", "ltr", "ltr"]

    // Anchor control
    anchorMode = "late", // "early", "late", "center", "ratio", "index"
    anchorRatio = 0.35, // used for early/late/ratio
    anchorIndex = null, // used when anchorMode === "index"

    anchorOffsetDeg = 0,
    bulletData = {},
  } = {}) {
    if (timer < 0) return false;
    if (shotInterval <= 0) return false;
    if (directionRepeat <= 0) directionRepeat = 1;

    let t = timer % cycle;
    let cycleIndex = floor(timer / cycle);

    let shotsPerSweep = floor(fireWindow / shotInterval);
    if (shotsPerSweep <= 0) return false;

    // Determine sweep direction
    let sweepLeftToRight = true;

    if (directionMode === "ltr") {
      sweepLeftToRight = true;
    } else if (directionMode === "rtl") {
      sweepLeftToRight = false;
    } else if (
      directionMode === "sequence" &&
      Array.isArray(directionSequence) &&
      directionSequence.length > 0
    ) {
      let seqDir = directionSequence[cycleIndex % directionSequence.length];
      sweepLeftToRight = seqDir === "ltr";
    } else {
      // grouped alternating
      let groupedCycleIndex = floor(cycleIndex / directionRepeat);
      let firstIsLTR = firstDirection === "ltr";
      let evenGroup = groupedCycleIndex % 2 === 0;
      sweepLeftToRight = firstIsLTR ? evenGroup : !evenGroup;
    }

    // Keep your current visual mapping
    let direction = sweepLeftToRight ? -1 : 1;

    // Lock cycle state once per cycle
    if (this.arcSweepCycleIndex !== cycleIndex) {
      this.arcSweepCycleIndex = cycleIndex;
      this.arcSweepStartT = t;

      if (aimed) {
        if (!this.player) return false;

        this.arcSweepBaseAngle = atan2(
          this.player.y - this.owner.y,
          this.player.x - this.owner.x,
        );
      } else {
        this.arcSweepBaseAngle = radians(baseAngleDeg);
      }
    }

    // Local timer starts from the first frame this cycle was actually seen
    let localT = t - this.arcSweepStartT;
    if (localT < 0) return false;

    let maxFireT = (shotsPerSweep - 1) * shotInterval;

    if (localT > maxFireT) return false;
    if (localT % shotInterval !== 0) return false;

    let shotIndex = floor(localT / shotInterval);
    if (shotIndex >= shotsPerSweep) return false;

    // Anchor resolution
    let earlySideAnchorIndex = floor((shotsPerSweep - 1) * anchorRatio);
    let lateSideAnchorIndex = shotsPerSweep - 1 - earlySideAnchorIndex;

    let resolvedAnchorIndex = lateSideAnchorIndex; // default matches your current setup

    if (anchorMode === "early") {
      resolvedAnchorIndex = earlySideAnchorIndex;
    } else if (anchorMode === "late") {
      resolvedAnchorIndex = lateSideAnchorIndex;
    } else if (anchorMode === "center") {
      resolvedAnchorIndex = floor(shotsPerSweep / 2);
    } else if (anchorMode === "ratio") {
      let ratioIndex = floor((shotsPerSweep - 1) * anchorRatio);
      resolvedAnchorIndex = constrain(ratioIndex, 0, shotsPerSweep - 1);
    } else if (anchorMode === "index") {
      let explicitIndex = anchorIndex ?? 0;
      resolvedAnchorIndex = constrain(explicitIndex, 0, shotsPerSweep - 1);
    }

    let progress = shotsPerSweep > 1 ? shotIndex / (shotsPerSweep - 1) : 0;

    let anchorProgress =
      shotsPerSweep > 1 ? resolvedAnchorIndex / (shotsPerSweep - 1) : 0;

    let halfArc = radians(arcWidthDeg) / 2;

    let relative =
      direction >= 0
        ? lerp(-halfArc, halfArc, progress)
        : lerp(halfArc, -halfArc, progress);

    let anchorRelative =
      direction >= 0
        ? lerp(-halfArc, halfArc, anchorProgress)
        : lerp(halfArc, -halfArc, anchorProgress);

    relative -= anchorRelative;

    let angle = this.arcSweepBaseAngle + relative + radians(anchorOffsetDeg);

    this.spawnBullet(this.owner.x, this.owner.y, angle, speed, bulletData);
    return true;
  }

  // Readable compatibility wrappers

  startAimedSpiral(angleOffsetDeg = 0) {
    this.startAimedSequentialAngle(angleOffsetDeg);
  }

  startAimedSpiralAtArcEdge(arcWidthDeg, side = -1, angleOffsetDeg = 0) {
    this.startSequentialArcAtEdge(arcWidthDeg, side, true, 90, angleOffsetDeg);
  }

  fireSpiralShot(speed, stepDeg, bulletData = {}) {
    this.stepSpiral(speed, stepDeg, bulletData);
  }

  fireAimedSpiralArcShot(speed, stepDeg, arcWidthDeg, bulletData = {}) {
    this.stepAimedArcSpiral(speed, stepDeg, arcWidthDeg, bulletData);
  }

  startArcSweep(aimed = true, baseAngleDeg = 90, direction = 1) {
    if (aimed) {
      this.startAimedSequentialAngle(0);
    } else {
      this.startSequentialAngle(baseAngleDeg);
    }

    this.setSequentialDirection(direction);
  }

  fireArcSweepShot(
    progress,
    arcWidthDeg,
    speed,
    bulletData = {},
    anchorProgress = null,
    anchorOffsetDeg = 0,
  ) {
    this.stepArcSweep(
      progress,
      arcWidthDeg,
      speed,
      bulletData,
      anchorProgress,
      anchorOffsetDeg,
    );
  }

  fireArcSweepIndexedShot(
    shotIndex,
    shotCount,
    arcWidthDeg,
    speed,
    bulletData = {},
    anchorIndex = null,
    anchorOffsetDeg = 0,
  ) {
    this.stepArcSweepIndexed(
      shotIndex,
      shotCount,
      arcWidthDeg,
      speed,
      bulletData,
      anchorIndex,
      anchorOffsetDeg,
    );
  }

  // #endregion

  // #region Special helpers

  fireRandomBurst(count, minSpeed, maxSpeed, bulletData = {}) {
    if (count <= 0) return;

    for (let i = 0; i < count; i++) {
      let angle = random(TWO_PI);
      let speed = random(minSpeed, maxSpeed);
      this.spawnBullet(this.owner.x, this.owner.y, angle, speed, bulletData);
    }
  }

  // #endregion
}

// =========================
// VisualEmitter
// =========================

class VisualEmitter {
  constructor(x, y, bullets, player, sprite = null, parent = null) {
    this.x = x;
    this.y = y;

    this.visible = true;
    this.active = true;

    this.sprite = sprite;
    this.drawWidth = 24;
    this.drawHeight = 24;

    this.parent = parent;
    this.attached = parent !== null;
    this.offsetX = 0;
    this.offsetY = 0;

    this.targetX = x;
    this.targetY = y;
    this.moveSpeed = 0;
    this.restTimer = 0;

    this.emitter = new BulletEmitter(this, bullets, player);
  }

  update() {
    if (!this.active) return;

    this.emitter.update();

    if (this.attached && this.parent) {
      this.followParent();
    } else {
      this.moveTowardTarget();
    }
  }

  followParent() {
    this.x = this.parent.x + this.offsetX;
    this.y = this.parent.y + this.offsetY;
  }

  moveTowardTarget() {
    let dx = this.targetX - this.x;
    let dy = this.targetY - this.y;
    let dist = sqrt(dx * dx + dy * dy);

    if (dist < 1) {
      this.x = this.targetX;
      this.y = this.targetY;
      this.restTimer++;
      return true;
    }

    this.restTimer = 0;

    let speed = this.moveSpeed;

    if (dist < 20) {
      speed = map(dist, 0, 20, 1.0, this.moveSpeed);
    }

    this.x += (dx / dist) * speed;
    this.y += (dy / dist) * speed;

    return false;
  }

  attachTo(parent, offsetX = 0, offsetY = 0) {
    this.parent = parent;
    this.attached = true;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.followParent();
  }

  detach() {
    this.attached = false;
    this.parent = null;
  }

  setOrbitOffset(radiusX, radiusY, angle) {
    this.offsetX = cos(angle) * radiusX;
    this.offsetY = sin(angle) * radiusY;
  }

  setTarget(x, y, speed = this.moveSpeed) {
    this.targetX = x;
    this.targetY = y;
    this.moveSpeed = speed;
  }

  hide() {
    this.visible = false;
  }

  showEmitter() {
    this.visible = true;
  }

  show() {
    if (!this.visible) return;

    push();
    translate(this.x, this.y);

    if (this.sprite) {
      imageMode(CENTER);
      image(this.sprite, 0, 0, this.drawWidth, this.drawHeight);
    } else {
      noStroke();
      fill(255, 180, 0);
      circle(0, 0, this.drawWidth);
    }

    pop();
  }
}

class TempEffect {
  constructor(x, y, sprite = null, lifetime = 20, drawSize = 28) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.lifetime = lifetime;
    this.maxLifetime = lifetime;
    this.drawSize = drawSize;
    this.alive = true;
  }

  update() {
    this.lifetime--;

    if (this.lifetime <= 0) {
      this.alive = false;
    }
  }

  show() {
    let alpha = map(this.lifetime, 0, this.maxLifetime, 0, 255);
    let scale = map(this.lifetime, this.maxLifetime, 0, 0.85, 1.05);

    let size = this.drawSize * scale;

    push();
    translate(this.x, this.y);
    noStroke();

    // Draw layered circles to simulate a radial gradient
    for (let i = 4; i >= 1; i--) {
      let t = i / 4;

      let r = size * t;

      // Inner = brighter, outer = darker
      let gray = lerp(240, 120, 1 - t);
      let a = alpha * t * 0.6;

      fill(gray, gray, gray, a);
      circle(0, 0, r);
    }

    pop();
  }
}