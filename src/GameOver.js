'use strict';

class GameOver extends Phaser.Scene {
    constructor() {
        super("gameOverStage");
    }

    create(data) {
        this.score = data.score;
        this.scoreText = this.add.text(
            game.config.width/2,
            (game.config.height/2) + 100,
            this.score,
            { 
                fontFamily: "Papyrus, Comic Sans, serif",
                textAlign: 'center',
                fontSize: "32px"              
            }
            
        )
        this.scoreText.setOrigin(0.5);

        this.gameOverText = this.add.text(
            game.config.width/2, 
            0-game.config.height/2, 
            "Game\nOver", 
            { 
                fontFamily: "Papyrus, Comic Sans, serif",
                textAlign: 'center',
                fontSize: "64px"              
        });
        this.gameOverText.setOrigin(0.5);

        this.gameOverTween = this.tweens.add({
            targets: this.gameOverText,
            y: game.config.height/2,
            duration: 2000,
            repeat: 0,
            hold: 1000,
            ease: 'Bounce.easeOut'
        });
    }

}