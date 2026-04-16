const GAME_LAYOUT = {
  canvasWidth: 1000,
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

const SIDEBAR_UI = {
  x: GAME_LAYOUT.playfieldX + GAME_LAYOUT.playfieldW + 28,

  livesLabelY: 110,
  livesIconsY: 138,

  bombsLabelY: 190,
  bombsIconsY: 218,

  grazeLabelY: 278,
  grazeValueY: 306,

  iconSpacing: 22,
  iconSize: 14,
};

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

function drawSidebarPlayerUi(player) {
  let x = SIDEBAR_UI.x;

  let labelColor = [255, 245, 235];
  let valueColor = [255, 255, 255];
  let shadowColor = [0, 0, 0, 160];

  let extraLives = max(0, (player.lives ?? 0) - 1);
  let bombs = max(0, player.bombs ?? 0);
  let graze = player.grazeCount ?? 0;

  // Larger sizes
  let labelSize = 18;
  let valueSize = 24;
  let iconSize = SIDEBAR_UI.iconSize * 1.4;

  push();
  textAlign(LEFT, TOP);
  noStroke();

  // Lives label
  textSize(labelSize);
  fill(...shadowColor);
  text("Player", x + 2, SIDEBAR_UI.livesLabelY + 2);
  fill(...labelColor);
  text("Player", x, SIDEBAR_UI.livesLabelY);

  for (let i = 0; i < extraLives; i++) {
    fill(220, 70, 70);
    circle(
      x + i * SIDEBAR_UI.iconSpacing + iconSize / 2,
      SIDEBAR_UI.livesIconsY + iconSize / 2,
      iconSize,
    );
  }

  // Bomb label
  textSize(labelSize);
  fill(...shadowColor);
  text("Bomb", x + 2, SIDEBAR_UI.bombsLabelY + 2);
  fill(...labelColor);
  text("Bomb", x, SIDEBAR_UI.bombsLabelY);

  for (let i = 0; i < bombs; i++) {
    fill(70, 200, 90);
    circle(
      x + i * SIDEBAR_UI.iconSpacing + iconSize / 2,
      SIDEBAR_UI.bombsIconsY + iconSize / 2,
      iconSize,
    );
  }

  // Graze label
  textSize(labelSize);
  fill(...shadowColor);
  text("Graze", x + 2, SIDEBAR_UI.grazeLabelY + 2);
  fill(...labelColor);
  text("Graze", x, SIDEBAR_UI.grazeLabelY);

  // Graze value
  textSize(valueSize);
  fill(...shadowColor);
  text(nf(graze, 4), x + 2, SIDEBAR_UI.grazeValueY + 2);
  fill(...valueColor);
  text(nf(graze, 4), x, SIDEBAR_UI.grazeValueY);

  pop();
}