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
    if (!this.alive) return;

    let typeData = bulletTypes[this.type] ?? {};
    let sprite = this.sprite ?? typeData.sprite ?? null;
    let drawSize = this.drawSize ?? typeData.drawSize ?? 12;
    let shouldRotate = this.rotateSprite ?? typeData.rotate ?? false;
    let rotationOffset = this.rotationOffset ?? typeData.rotationOffset ?? 0;

    push();
    translate(this.x, this.y);
    imageMode(CENTER);

    if (sprite) {
      if (shouldRotate) {
        rotate(this.angle + rotationOffset);
      }

      image(sprite, 0, 0, drawSize, drawSize);
    } else {
      noStroke();
      fill(255);
      circle(0, 0, drawSize);
    }

    // if (this.type === "bubble") {
    //   noFill();
    //   stroke(255, 0, 0);
    //   strokeWeight(1);
    //   circle(0, 0, this.radius * 2);
    // }

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
      fill(200, 200, 200, 120);
      rectMode(CENTER);
      rect(0, 0, this.drawWidth, this.drawHeight);
    }

    pop();
  }
}