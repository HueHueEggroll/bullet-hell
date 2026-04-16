class FamiliarEnemy {
  constructor(x, y, bullets, player, sprite = null) {
    this.x = x;
    this.y = y;

    this.visible = true;
    this.active = true;
    this.isDead = false;

    this.sprite = sprite;
    this.drawWidth = 48;
    this.drawHeight = 48;
    this.hitRadius = 14;

    this.hp = 40;
    this.maxHp = 40;

    // Movement
    this.mode = "idle";

    this.targetX = x;
    this.targetY = y;
    this.moveSpeed = 3;
    this.useBounds = false;
    this.useDriftSlowdown = false;

    this.minX = GAME_LAYOUT.playfieldX + this.drawWidth / 2;
    this.maxX =
      GAME_LAYOUT.playfieldX + GAME_LAYOUT.playfieldW - this.drawWidth / 2;
    this.minY = GAME_LAYOUT.playfieldY + this.drawHeight / 2;
    this.maxY =
      GAME_LAYOUT.playfieldY + GAME_LAYOUT.playfieldH - this.drawHeight / 2;

    this.restTimer = 0;
    this.arrivalSlowdownRadius = 72;
    this.arrivalMinSpeed = 0.75;

    // Orbit
    this.orbitParent = null;
    this.orbitBaseAngle = 0;
    this.orbitOffsetAngle = 0;

    this.orbitRadiusX = 0;
    this.orbitRadiusY = 0;
    this.orbitTargetRadiusX = 0;
    this.orbitTargetRadiusY = 0;
    this.orbitRadiusLerp = 0.12;

    this.orbitSpeed = 0;

    this.emitter = new BulletEmitter(this, bullets, player);
  }

  update() {
    if (!this.active) return;

    this.emitter.update();

    if (this.mode === "orbit" && this.orbitParent) {
      this.updateOrbit();
      return;
    }

    this.moveTowardTarget();
  }

  updateOrbit() {
    this.orbitRadiusX = lerp(
      this.orbitRadiusX,
      this.orbitTargetRadiusX,
      this.orbitRadiusLerp,
    );

    this.orbitRadiusY = lerp(
      this.orbitRadiusY,
      this.orbitTargetRadiusY,
      this.orbitRadiusLerp,
    );

    let angle = this.orbitBaseAngle + this.orbitOffsetAngle;

    this.x = this.orbitParent.x + cos(angle) * this.orbitRadiusX;
    this.y = this.orbitParent.y + sin(angle) * this.orbitRadiusY;
  }

  startOrbit(parent, baseAngle, offsetAngle, radiusX, radiusY, speed) {
    this.mode = "orbit";
    this.orbitParent = parent;
    this.orbitBaseAngle = baseAngle;
    this.orbitOffsetAngle = offsetAngle;

    // Spawn from center, then expand outward
    this.orbitRadiusX = 0;
    this.orbitRadiusY = 0;
    this.orbitTargetRadiusX = radiusX;
    this.orbitTargetRadiusY = radiusY;

    this.orbitSpeed = speed;
  }

  stopOrbit() {
    this.mode = "idle";
    this.orbitParent = null;
  }

  setOrbitBaseAngle(angle) {
    this.orbitBaseAngle = angle;
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

    if (this.useDriftSlowdown && dist < this.arrivalSlowdownRadius) {
      let t = constrain(dist / this.arrivalSlowdownRadius, 0, 1);
      speed = lerp(this.arrivalMinSpeed, this.moveSpeed, t * t);
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
    useDriftSlowdown = true,
  ) {
    this.mode = "target";
    this.targetX = x;
    this.targetY = y;
    this.moveSpeed = speed;
    this.useBounds = bounded;
    this.useDriftSlowdown = useDriftSlowdown;
  }

  moveToRelativeTarget(
    parent,
    offsetX,
    offsetY,
    speed = this.moveSpeed,
    bounded = false,
    useDriftSlowdown = true,
  ) {
    this.setTarget(
      parent.x + offsetX,
      parent.y + offsetY,
      speed,
      bounded,
      useDriftSlowdown,
    );
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

  takeDamage(damage) {
    if (!this.active || this.isDead) return;

    this.hp -= damage;

    if (this.hp <= 0) {
      this.die();
    }
  }

  die() {
    spawnBulletPop(this.x, this.y, null, 20, this.drawWidth * 1.2);

    this.isDead = true;
    this.active = false;
    this.visible = false;
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
      fill(255, 140, 180);
      circle(0, 0, this.drawWidth);
    }

    pop();
  }
}
