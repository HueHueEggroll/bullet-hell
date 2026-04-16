class VisualEmitter {
  constructor(x, y, bullets, player, sprite = null, parent = null) {
    this.x = x;
    this.y = y;

    this.visible = true;
    this.active = true;

    this.sprite = sprite;
    this.drawWidth = 48;
    this.drawHeight = 48;

    this.parent = parent;
    this.attached = parent !== null;
    this.offsetX = 0;
    this.offsetY = 0;

    this.targetX = x;
    this.targetY = y;
    this.moveSpeed = 3;
    this.useBounds = false;
    this.useDriftSlowdown = false;

    this.minX = GAME_LAYOUT.playfieldX;
    this.maxX = GAME_LAYOUT.playfieldX + GAME_LAYOUT.playfieldW;
    this.minY = GAME_LAYOUT.playfieldY;
    this.maxY = GAME_LAYOUT.playfieldY + GAME_LAYOUT.playfieldH;

    this.restTimer = 0;

    this.arrivalSlowdownRadius = 72;
    this.arrivalMinSpeed = 0.75;

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

  setTarget(
    x,
    y,
    speed = this.moveSpeed,
    bounded = false,
    useDriftSlowdown = true,
  ) {
    this.targetX = x;
    this.targetY = y;
    this.moveSpeed = speed;
    this.useBounds = bounded;
    this.useDriftSlowdown = useDriftSlowdown;
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