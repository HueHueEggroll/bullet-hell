function playerBulletHitsBoss(bullet, boss) {
  return (
    bullet.x > boss.x - boss.drawWidth / 2 &&
    bullet.x < boss.x + boss.drawWidth / 2 &&
    bullet.y > boss.y - boss.drawHeight / 2 &&
    bullet.y < boss.y + boss.drawHeight / 2
  );
}

function playerBulletHitsFamiliar(pBullet, familiar) {
  let bulletRadius = pBullet.radius ?? 6;

  let dx = pBullet.x - familiar.x;
  let dy = pBullet.y - familiar.y;

  let distSq = dx * dx + dy * dy;
  let hitDist = bulletRadius + familiar.hitRadius;

  return distSq <= hitDist * hitDist;
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

function spawnBulletPop(x, y, sprite = null, lifetime = 14, drawSize = 18) {
  effects.push(new TempEffect(x, y, sprite, lifetime, drawSize));
}

function useBomb(player, boss, bullets) {
  if (!gameplayActive) return false;

  
  // if (player.bombs <= 0) return false;
  // player.bombs--;
  

  if (player.pendingDeath) {
    player.cancelPendingDeath();
  }

  let bombDamage = 50;

  for (let b of bullets) {
    destroyEnemyBulletWithPop(b);
  }

  for (let familiar of familiars) {
    if (!familiar.active) continue;

    familiar.takeDamage(bombDamage);
  }

  player.invulnTimer = 270;

  if (
    boss &&
    boss.active &&
    !boss.waitingToEnter &&
    !boss.isDying &&
    boss.vulnerable
  ) {
    boss.sectionHp -= bombDamage;
  }

  return true;
}

function spawnEffect(x, y, sprite = null, lifetime = 12, drawSize = 24) {
  effects.push(new TempEffect(x, y, sprite, lifetime, drawSize));
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

function setupBulletTypes() {
  bulletTypes = {
    rice: {
      sprite: bulletTypes.rice?.sprite ?? null,
      drawSize: 16,
      radius: 3,
      rotate: true,
      rotationOffset: HALF_PI,
    },

    small: {
      sprite: bulletTypes.small?.sprite ?? null,
      drawSize: 8,
      radius: 3,
      rotate: false,
      rotationOffset: 0,
    },

    medium: {
      sprite: bulletTypes.medium?.sprite ?? null,
      drawSize: 12,
      radius: 4,
      rotate: false,
      rotationOffset: 0,
    },

    bubble: {
      sprite: bulletTypes.bubble?.sprite ?? null,
      drawSize: 84,
      radius: 24,
      rotate: false,
      rotationOffset: 0,
    },

    heart: {
      sprite: bulletTypes.heart?.sprite ?? null,
      drawSize: 32,
      radius: 5,
      rotate: true,
      rotationOffset: -HALF_PI,
    },
  };
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
