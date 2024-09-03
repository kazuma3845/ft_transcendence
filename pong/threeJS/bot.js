export default class Bot {
  constructor(pong, form) {
    this.pong = pong;
    this.form = form;
    this.bot_in_place = false;
  }

  handleBallHit() {
    const currentTime = Date.now();
    const timeSinceLastExec = currentTime - this.pong.lastExecTime;

    if (timeSinceLastExec >= 1000) {
      this.sendDataToBot(this);
    } else {
      setTimeout(() => {
        this.sendDataToBot(this);
      }, 1000 - timeSinceLastExec);
    }
  }

  sendDataToBot() {
    const data = {
      ball_position: [this.form.ball.position.x, this.form.ball.position.y],
      ball_speed: this.pong.initialSpeed,
      ball_angle: this.pong.ball_angle,
      field_height: this.pong.arenaHeight,
      field_length: this.pong.arenaWidth,
      paddle_position: [
        this.form.paddleRight.position.x,
        this.form.paddleRight.position.y,
      ],
      paddle_size: this.form.paddle_size[1],
      paddle_move_speed: this.pong.paddle_move_speed,
      side: "right", // ou "left" selon la logique
      score: this.pong.score, // Mettre à jour avec le score actuel
      ballPaused: this.pong.ballPaused,
      bot_lvl: this.pong.botLVL, // ! MOD THIS TO ADJUST BOT LVL
    };
    console.log("Sending data:", JSON.stringify(data));
    fetch("http://localhost:8081/api/receive-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        this.processBotResponse(data);
      })
      .catch((error) => console.error("Erreur:", error));
  }

  processBotResponse(data) {
    console.log("Réponse reçue:", data);
    this.input = data.input;
  }

  replaceBot() {
    let raw_input =
      this.form.paddleRight.position.y / this.pong.paddle_move_speed;
    this.input = Math.round(raw_input) * -1;
    // console.log("Mouvements pour se replacer au centre :", this.input);
  }

  updateBotPosition() {
    // console.log("Déplacer le bot de:", this.input);
    this.pong.keysPressed["o"] = false;
    this.pong.keysPressed["k"] = false;

    if (this.input > 0) {
      this.pong.keysPressed["o"] = true;
      this.input--;
    } else if (this.input < 0) {
      this.pong.keysPressed["k"] = true;
      this.input++;
    }
  }

  startGame() {
    if (!this.bot_in_place) {
        const halfArenaHeight = this.pong.arenaHeight / 2;
        const paddleY = this.form.paddleRight.position.y;
        const distanceToTop = halfArenaHeight - paddleY;
        const distanceToBottom = -halfArenaHeight - paddleY;

        if (paddleY < 0) // Je genere un chiffre random en fonction de la distance la plus eloignee
            this.input = Math.round(Math.random() * distanceToTop / this.pong.paddle_move_speed);
         else
            this.input = Math.round(Math.random() * distanceToBottom / this.pong.paddle_move_speed);
        this.bot_in_place = true;
    }
    if (this.input === 0) {
        const delay = (1 - this.pong.botLVL) * 500; // Calculer le délai basé sur la difficulté du bot
        setTimeout(() => {
            this.pong.ballPaused = false;
            this.bot_in_place = false;
        }, delay);
    }
  }
}
