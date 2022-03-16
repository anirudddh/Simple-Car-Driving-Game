(function () {
  // Make a namespace `Assessment`.
  if(typeof Racer === "undefined") {
    window.Racer = {};
  };

 var Game = Racer.Game = function(context, xDim, yDim) {
    this.ctx             = context;
    this.width           = xDim;
    this.height          = yDim;
    this.cameraHeight    = 50;
    this.cameraDepth     = 10;
    this.playerX         = 0;
    this.playerZ         = 0;
    this.roadWidth       = 80;
    this.boundaries      = [-160, 160];
    this.segments        = [];
    this.speed           = 0;
    this.acceleration    = 0;
    this.maxSpeed        = 80;
    this.dx              = 0;
    this.segments        = [];
    this.numOfSegments   = 2000;
    this.segmentLength   = 200;
    this.drawDistance    = 35;
    this.sprites         = [];
    this.spriteWidth     = 20;
    this.spriteLength    = 250;
    this.numberOfSprites = 120;
    this.gameOver        = false;
    this.finalGameState  = null;
    this.startTime       = new Date().getTime();
    Util.loadImages(this);
    Util.generateSprites(this);
    Util.generateSegments(this);
  };

  Game.KEYS = {
    LEFT:  37,
    UP:    38,
    RIGHT: 39,
    DOWN:  40,
    A:     65,
    D:     68,
    S:     83,
    W:     87
  };

  Game.prototype.keyPressed = function(event) {
    if (event.which === Game.KEYS.UP || event.which === Game.KEYS.W) {
      this.acceleration = .5;
    };
    if (event.which === Game.KEYS.RIGHT || event.which === Game.KEYS.D) {
      this.dx = 1/55;
    };
    if (event.which === Game.KEYS.LEFT || event.which === Game.KEYS.A) {
      this.dx = -1/55;
    };
  };

  Game.prototype.keyUnpressed = function(event) {
    if (event.which === Game.KEYS.UP || event.which === Game.KEYS) {
      this.acceleration = -.5;
    };
    if (event.which === Game.KEYS.RIGHT) {
      if (this.dx === 1/55) {
        this.dx = 0;
      }
    };
    if (event.which === Game.KEYS.LEFT) {
      if (this.dx === -1/55) {
        this.dx = 0;
      }
    };
  };

  Game.prototype.collisionDetected = function(color) {
    if (color === Util.COLORS.STOP) {
      this.speed = 5;
    } else if (color === Util.COLORS.GO) {
      this.speed += 80;
    } else if (color === Util.COLORS.DEAD) {
      this.gameOver  = true;
      this.finalGameState = "YOU LOSE";
    } else if (color === Util.COLORS.WIN) {
      this.gameOver  = true;
      this.finalGameState = "YOU WIN";
    }
  };

  Game.prototype.adjustPosition = function() {
    //simulate drag
    console.log(this.speed);
    var slowDown = this.onGrass ? -5 : -this.speed/this.maxSpeed;
    if (this.speed >= this.maxSpeed) {
      this.speed += slowDown;
    } else {
      if (this.acceleration < 0 && this.speed <= 0) {
        this.speed = 0;
      } else {
        this.speed += this.acceleration;
      };
    };
    var xPos = this.playerX + this.speed*this.dx;
    if (xPos > this.boundaries[0] && xPos < this.boundaries[1]) {
      this.playerX = xPos;
    }
    if (xPos > this.roadWidth - 12 || xPos < -this.roadWidth + 12) {
      this.onGrass = true;
      this.maxSpeed = 30;
    } else {
      this.onGrass = false;
      this.maxSpeed = 80;
    }
    this.playerZ += this.speed;
  };

  Game.prototype.drawRoad = function() {
    var currentSegment = Math.floor(this.playerZ/200) % this.segments.length;
    for(i = 0 ; i < this.drawDistance ; i++) {
      n = (i + currentSegment) % this.segments.length;
      if (this.segments[n][0] > this.playerZ) {
        Util.drawSegment(
          this,
          this.segments[n][0],
          this.segments[n][1],
          this.segments[n][2],
          this.segments[n][3]
        )
      }
    }
  };

  Game.prototype.drawSpritesAndDetectCollisions = function() {
    Util.drawSprites(this);
    Util.detectCollisions(this);
  };

  Game.prototype.drawBackground = function() {
    this.ctx.drawImage(
      this.sunset,
      (this.playerX*-.1) -this.width/2,
      -this.height/2 -50,
      this.width*2,
      this.height*2
    );
  }

  Game.prototype.drawCar = function() {
    this.ctx.drawImage(
      this.car,
      this.width/3.5,
      this.height/1.5,
      this.width/2.5,
      this.height/3
    );
  };

  Game.prototype.drawTimer = function() {
    this.ctx.font = "10px sans-serif";
    this.ctx.fillStyle = 'black';
    this.ctx.fillText("Your Time: " + (new Date().getTime() - this.startTime)/1000, 10, 20);
  }

  Game.prototype.render = function() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.adjustPosition();
    this.drawBackground();
    this.drawRoad();
    this.drawSpritesAndDetectCollisions();
    this.drawCar();
    this.drawTimer();
    if (this.gameOver) {
      this.endGame();
    }
  };

  Game.prototype.run = function() {
    this.gameLoop = setInterval(this.render.bind(this), 1000/60);
  };

  Game.prototype.endGame = function() {
    clearInterval(this.gameLoop);
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.font = "48px serif";
    this.ctx.fillStyle = 'black';
    this.ctx.fillText(this.finalGameState, this.width/3.1, this.height/2);
    if (this.finalGameState === "YOU WIN") {
      this.ctx.fillText(
        "Final Time: " + (new Date().getTime() - this.startTime)/1000,
        this.width/3.7,
        (this.height/2) + 50
      );
    } else {
      this.ctx.font = "20px serif"
      this.ctx.fillText(
        "Try Again",
        this.width/4,
        this.height/2 + 50
      )
    }
  }
})();
