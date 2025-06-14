// ────────────────────────────────────────────────────────────────────
//   :::::: M A I N   V A R I A B L E S : :  :   :    :     :        :
// ──────────────────────────────────────────────────────────────────
const RAD = Math.PI / 180;
const canvas = document.getElementById("canvas");
const canvasTx = canvas.getContext("2d");
canvasTx.tabIndex = 1;

// Improved text rendering setup
canvasTx.textBaseline = "top"; // Changed to "top" for better positioning
canvasTx.textAlign = "left";
canvasTx.font = "bold 24px 'Concert One', monospace"; // Larger, bolder font

let screenFrame = 0;

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

// Fullscreen button setup
const fullscreenBtn = document.getElementById("fullscreenBtn");
fullscreenBtn.addEventListener("click", toggleFullscreen);

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    canvas.requestFullscreen().catch(err => {
      console.error(`Error attempting to enable fullscreen: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
}

const player = {
  gameActive: true,
  gamePlaying: false,
};

// ──────────────────────────────────────────────────────────────────
//   :::::: M A I N   F U N C T I O N S : :  :   :    :     :      :
// ────────────────────────────────────────────────────────────────
function handleInput() {
  if (player.gameActive) {
    player.gameActive = false;
    player.gamePlaying = true;
    pipe.pipe = [];
  }
  if (player.gamePlaying) {
    playingObject.flying();
    SFX.bg.play();
    SFX.start.play();
  } else {
    pipe.pipe = [];
    SFX.bg.currentTime = 0;
    playingObject.rotatation = 0;
    playingObject.position.y = 50;
    UI.score[0].current = 0;
    player.gameActive = true;
  }
}

// Add both desktop and mobile controls
["keydown", "click"].forEach((event) => {
  window.addEventListener(event, handleInput, true);
});

// Mobile touch controls
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  handleInput();
}, { passive: false });

// Prevent touch scrolling
document.addEventListener("touchmove", (e) => {
  e.preventDefault();
}, { passive: false });

// ─── DRAW AND ANIMATE THE BIRD ──────────────────────────────────
const playingObject = {
  frames: 0,
  position: { x: 60, y: 50 },
  speed: 0,
  gravity: isMobile ? 0.1 : 0.125, // Adjusted for mobile
  thrust: isMobile ? 3 : 2.6,      // Adjusted for mobile
  rotatation: 0,
  imgAnimation: [
    { playObjectImg: new Image() },
    { playObjectImg: new Image() },
    { playObjectImg: new Image() },
  ],
  drewPlayObject() {
    canvasTx.save();
    canvasTx.translate(this.position.x, this.position.y);
    canvasTx.rotate(this.rotatation * RAD);
    canvasTx.drawImage(
      this.imgAnimation[this.frames].playObjectImg,
      -this.imgAnimation[this.frames].playObjectImg.width / 2,
      -this.imgAnimation[this.frames].playObjectImg.height / 2
    );
    canvasTx.restore();
  },
  updateFrames() {
    if (player.gameActive) {
      if (screenFrame % 10 === 0) this.frames++;
      if (screenFrame % 8 === 0)
        this.position.y += Math.sin(screenFrame * RAD);
    } else if (player.gamePlaying) {
      if (screenFrame % 10 === 0) this.frames++;
      this.position.y += this.speed;
      this.speed += this.gravity;
      this.objectRotation();
      this.collisioned();
    } else {
      this.frames = 1;
      const halfWidth = this.imgAnimation[0].playObjectImg.width / 2;
      if (this.position.y + halfWidth < ground.position.y) {
        this.position.y += this.speed;
        this.objectRotation();
        this.speed += this.gravity * 2;
      }
    }
    this.frames %= this.imgAnimation.length;
  },
  flying() {
    if (this.position.y > 0) {
      SFX.flap.play();
      this.speed = -this.thrust;
    }
  },
  objectRotation() {
    if (this.speed <= 0) {
      this.rotatation = Math.max(-25, (-25 * this.speed) / (-1 * this.thrust));
    } else {
      this.rotatation = Math.min(90, (90 * this.speed) / (this.thrust * 2));
    }
  },
  collisioned() {
    if (!pipe.pipe.length) return;
    const x = pipe.pipe[0].x;
    const y = pipe.pipe[0].y;
    const birdRadius = this.imgAnimation[0].playObjectImg.width / 2;
    const groundTop = canvas.height - ground.groundImg.height;
    const pipeTopHeight = y + pipe.topPipe.pipeImg.height;
    const pipeWidth = pipe.topPipe.pipeImg.width;

    if (this.position.y + birdRadius >= groundTop) {
      player.gamePlaying = false;
    }

    if (this.position.x + birdRadius >= x && this.position.x - birdRadius <= x + pipeWidth) {
      if (
        this.position.y - birdRadius <= pipeTopHeight ||
        this.position.y + birdRadius >= pipeTopHeight + pipe.pipeGap
      ) {
        SFX.hit.play();
        SFX.bg.pause();
        player.gamePlaying = false;
      }
    }
  },
};

const background = {
  backgroundImg: new Image(),
  position: { x: 0, y: 0 },
  drewBackground() {
    canvasTx.drawImage(
      this.backgroundImg,
      this.position.x,
      canvas.height - this.backgroundImg.height
    );
  },
};

const ground = {
  groundImg: new Image(),
  dx: 2,
  position: { x: 0, y: 0 },
  drewGround() {
    canvasTx.drawImage(
      this.groundImg,
      this.position.x,
      canvas.height - this.groundImg.height
    );
  },
  updateGround() {
    if (player.gamePlaying) {
      this.position.x -= this.dx;
      this.position.x %= this.groundImg.width / 14;
    }
  },
};

const pipe = {
  topPipe: { pipeImg: new Image() },
  bottomPipe: { pipeImg: new Image() },
  pipe: [],
  pipeGap: isMobile ? 100 : 85, // Wider gap on mobile
  move: true,
  drewPipe() {
    for (const p of this.pipe) {
      canvasTx.drawImage(this.topPipe.pipeImg, p.x, p.y);
      canvasTx.drawImage(
        this.bottomPipe.pipeImg,
        p.x,
        p.y + this.topPipe.pipeImg.height + this.pipeGap
      );
    }
  },
  pipeUpdate() {
    const interval = player.gameActive ? 135 : 100;
    if (screenFrame % interval === 0) {
      const yPos = -210 * Math.min(Math.random() + 0.9, 1.7);
      this.pipe.push({ x: canvas.width, y: yPos });
      if (player.gameActive) {
        playingObject.position.y = yPos + this.topPipe.pipeImg.height + this.pipeGap - 60;
      }
    }
    if (player.gamePlaying && this.move) {
      UI.score[0].current++;
      SFX.score.play();
      this.move = false;
    }
    for (const p of this.pipe) {
      p.x -= ground.dx;
    }
    if (this.pipe.length && this.pipe[0].x < -this.topPipe.pipeImg.width) {
      this.pipe.shift();
      this.move = true;
    }
  },
};

// ─── UPDATED UI OBJECT ────────────────────────────────────────────
const UI = {
  frames: 0,
  game: [{ start: new Image() }, { over: new Image() }],
  tap: [{ tapImg: new Image() }, { tapImg: new Image() }],
  score: [{ current: 0, best: 0 }],
  drewUI() {
    if (player.gameActive) {
      canvasTx.fillStyle = "rgb(126 255 90 / 30%)";
      canvasTx.fillRect(0, 0, canvas.width, canvas.height);
      canvasTx.drawImage(
        this.game[0].start,
        (canvas.width - this.game[0].start.width) / 2,
        (canvas.height - this.game[0].start.height) / 3
      );
      canvasTx.drawImage(
        this.tap[this.frames].tapImg,
        (canvas.width - this.tap[this.frames].tapImg.width) / 2,
        (canvas.height - this.tap[this.frames].tapImg.height) / 1.7
      );
    } else if (!player.gamePlaying && !player.gameActive) {
      canvasTx.fillStyle = "rgb(60 100 20 / 20%)";
      canvasTx.fillRect(0, 0, canvas.width, canvas.height);
      canvasTx.drawImage(
        this.game[1].over,
        (canvas.width - this.game[1].over.width) / 2,
        (canvas.height - this.game[1].over.height) / 2
      );
      canvasTx.drawImage(
        this.tap[this.frames].tapImg,
        (canvas.width - this.tap[this.frames].tapImg.width) / 2,
        (canvas.height - this.tap[this.frames].tapImg.height) / 1.7
      );
      SFX.bg.pause();
    }
    this.drewScore();
  },
  drewScore() {
    const scoreText = player.gamePlaying
      ? `SCORE: ${this.score[0].current}`
      : player.gameActive
      ? `BEST: ${localStorage.getItem("best") || 0}`
      : `SCORE: ${this.score[0].current}`;

    // Draw score at top-left with high contrast
    canvasTx.fillStyle = "rgba(0, 0, 0, 0.5)";
    canvasTx.fillRect(10, 10, canvasTx.measureText(scoreText).width + 20, 30);
    
    canvasTx.fillStyle = "#ffffff";
    canvasTx.strokeStyle = "#000000";
    canvasTx.lineWidth = 2;
    canvasTx.strokeText(scoreText, 20, 15);
    canvasTx.fillText(scoreText, 20, 15);
  },
  updateUI() {
    if (player.gamePlaying) {
      this.score[0].best = Math.max(
        this.score[0].current,
        localStorage.getItem("best") || 0
      );
      localStorage.setItem("best", this.score[0].best);
    }
    if (screenFrame % 20 === 0) this.frames++;
    this.frames %= this.tap.length;
  },
};


const SFX = {
  start: new Audio("assets/audio/Main_sounds/start.wav"),
  flap: new Audio("assets/audio/Main_sounds/flap.wav"),
  score: new Audio("assets/audio/Main_sounds/score.wav"),
  hit: new Audio("assets/audio/Main_sounds/hit.wav"),
  bg: new Audio("assets/audio/bg_songs/bg.mp3"),
};
SFX.start.volume = 0.2;
SFX.flap.volume = 0.2;
SFX.score.volume = 0.2;
SFX.hit.volume = 0.2;

// Handle window resize
function handleResize() {
  // Maintain internal resolution
  canvas.width = 250;
  canvas.height = 450;
  
  // Scale for display
  const scale = Math.min(
    window.innerWidth / 250,
    window.innerHeight / 450
  );
  canvas.style.width = `${250 * scale}px`;
  canvas.style.height = `${450 * scale}px`;
}

window.addEventListener("resize", handleResize);
handleResize(); // Initial call

const updateElements = () => {
  playingObject.updateFrames();
  ground.updateGround();
  pipe.pipeUpdate();
  UI.updateUI();
};

const drewElements = () => {
  // Maintain internal resolution
  canvas.width = 250;
  canvas.height = 450;
  
  canvasTx.fillStyle = "#47f0a9";
  canvasTx.fillRect(0, 0, canvas.width, canvas.height);
  background.drewBackground();
  pipe.drewPipe();
  playingObject.drewPlayObject();
  ground.drewGround(); // Draw ground after pipes and bird
  UI.drewUI(); // Draw UI last to ensure it's on top
};

function gameLoop() {
  screenFrame++;
  updateElements();
  drewElements();
  requestAnimationFrame(gameLoop);
}

gameLoop();

// ─── IMAGES ───────────────────────────────────────────────────────
playingObject.imgAnimation[0].playObjectImg.src = "assets/images/brid_img/1_brid.png";
playingObject.imgAnimation[1].playObjectImg.src = "assets/images/brid_img/2_brid.png";
playingObject.imgAnimation[2].playObjectImg.src = "assets/images/brid_img/3_brid.png";
background.backgroundImg.src = "assets/images/ground/background.png";
ground.groundImg.src = "assets/images/ground/1_ground.png";
pipe.topPipe.pipeImg.src = "assets/images/pipe_img/toppipe.png";
pipe.bottomPipe.pipeImg.src = "assets/images/pipe_img/botpipe.png";
UI.game[0].start.src = "assets/images/start&over_game_img/getready.png";
UI.game[1].over.src = "assets/images/start&over_game_img/gameOver.png";
UI.tap[0].tapImg.src = "assets/images/start&over_game_img/1_tap.png";
UI.tap[1].tapImg.src = "assets/images/start&over_game_img/2_tap.png";