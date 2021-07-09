'use strict';


let bullet_behaviors = {
    undefined: (bullet) => {
        return [bullet.x, bullet.y];
    },
    "rain": (bullet) => {
        return [bullet.x, bullet.y + 2];
    }
};


let gameSettings = {
    enemyColor: 0xdddddd,
    enemyHitboxColor: 0xee3333
}

let cursors;


// class Player extends Phaser.GameObjects.Sprite {

// }

// class Enemy extends Phaser.GameObjects.Sprite {

// }

// class EnemyBullet extends Phaser.GameObjects.Image {

// }

class PlayerBullet extends Phaser.GameObjects.Image {
    constructor() {

    }

    init() {

    }
    update() {

    }

}



class Stage extends Phaser.Scene {
    constructor() {
        super("bulletStage");
    }
    init() {
        

    }
    preload() {
        this.load.image('enemy', 'assets/box.png');
        this.load.image('bullet', 'assets/bullet.png');

    }

    redraw() {
        this.graphics.clear();
        this.graphics.lineStyle(1, 0x0000ff);
        this.graphics.strokeCircleShape(this.playerHitIndicator);
    }

    create() {
        cursors = this.input.keyboard.createCursorKeys();

        let playerX = game.config.width/2;
        let playerY = game.config.height - 32;
        this.player = this.physics.add.sprite(playerX, playerY, 'enemy');
        //this.player.body.syncBounds = true;
        this.player.body.setSize(8,8);
        //this.player.body.setOffset(32, 32);

        this.inputTimeVert = 0.0;
        this.inputTimeHorz = 0.0;
        this.maxInputImpulse = 4.0;
        this.player.body.setMaxSpeed(320);
        //this.player.body.setDrag(25600, 12800);
        this.player.body.setDrag(600, 800);
        this.player.body.setMass(200);
        this.player.setCollideWorldBounds(true);

        this.graphics = this.add.graphics({ fillStyle: { color: 0x00ff00 } });
        this.playerHitIndicator = new Phaser.Geom.Circle(playerX, playerY, 5);

        
        this.redraw();


        this.enemies = this.physics.add.group({
            defaultKey: 'enemy',
            maxSize: 100,
            visible: false,
            active: false
        });

        this.spawnEnemy = (x, y) => {
            if(undefined == x) {
                x = Phaser.Math.Between(0, game.config.width);
            }
            if(undefined == y) {
                y = Phaser.Math.Between(0, game.config.height);
            }
            console.log("Adding enemy", x, -y);
            let enemy = this.enemies.get(x, -y);
            enemy.setActive(true);
            enemy.setVisible(true);
            enemy.lastAction = 0;
            //let color = Phaser.Display.Color();
            //enemy.setTint(color.random(50));
        };

        this.time.addEvent({
            delay: 500,
            loop: true,
            callback: this.spawnEnemy
        })

        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 2000,
            visible: false,
            active: false
        });


    }

    spawnBullet(x, y, pattern) {
        let bullet = this.bullets.get(x, y);
        if(bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.body.immovable = true;
            bullet.body.isCircle = true;
            bullet.body.allowRotation = false;
            bullet.body.moves = false;
            bullet.body.onCollide = false;
            bullet._behavior = pattern;
            bullet.startTime = this.sys.game.loop.time;
        }
    }

    update(current_time, delta_time) {
        
        // player input
        if (cursors.left.isDown) {
            this.player.setVelocityX(-20 * Math.max(this.inputTimeVert, this.maxInputImpulse));
            this.inputTimeVert += delta_time;
        } else if (cursors.right.isDown) {
            this.player.setVelocityX(20 * Math.max(this.inputTimeVert, this.maxInputImpulse));
            this.inputTimeVert += delta_time;
        } else {
            this.inputTimeVert -= delta_time * 4.0;
        }
        if (cursors.up.isDown) {
            this.player.setVelocityY(-20 * Math.max(this.inputTimeHorz, this.maxInputImpulse));
            this.inputTimeHorz += delta_time;
        } else if (cursors.down.isDown) {
            this.player.setVelocityY(20 * Math.max(this.inputTimeHorz, this.maxInputImpulse));
            this.inputTimeHorz += delta_time;
        } else {
            this.inputTimeHorz -= delta_time * 4.0;
        }
        this.inputTimeHorz = Math.max(0, this.inputTimeHorz);
        this.inputTimeVert = Math.max(0, this.inputTimeVert);
        if (this.inputTimeVert + this.inputTimeHorz <= 0) {
            this.player.setVelocityX(0);
            this.player.setVelocityY(0);
        }

        let actionCooldown = 1000.0;

        this.enemies.incY(1);
        this.enemies.getChildren().forEach(element => {
            if(element.active) {
                if(element.y > game.config.height) {
                   this.enemies.killAndHide(element);               
                } else {
                    if (current_time > actionCooldown + element.lastAction) {
                        this.spawnBullet(element.x, element.y, "rain");
                        element.lastAction = current_time;
                    }
                    
                }
            }
        });

        this.bullets.getChildren().forEach((element) => {
            if (element.active) {
                let out_of_bounds = false;
                out_of_bounds = element.y > (game.config.height * 2) ? true : out_of_bounds;
                out_of_bounds = element.y < 0 - game.config.height ? true : out_of_bounds;
                out_of_bounds = element.x < 0 - game.config.width ? true : out_of_bounds;
                out_of_bounds = element.x > (game.config.width * 2) ? true : out_of_bounds;
                if(element.active && out_of_bounds) {
                    this.bullets.killAndHide(element);               
                } else {
                    let maxLife = 10000.0;
                    let lifespan = current_time - element.startTime;
                    let bulletDelta = bullet_behaviors[element._behavior](element);
                    element.x = bulletDelta[0];
                    element.y = bulletDelta[1];
                    if (lifespan > maxLife) {
                        this.bullets.killAndHide(element);               
                    }
                }
                
            }
        })

        // player graphics
        this.playerHitIndicator.x = this.player.x + this.player.body.velocity.x;
        this.playerHitIndicator.y = this.player.y + this.player.body.velocity.y;
        this.redraw();

    }


    
}


const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 800,
    backgroundColor: 0x70a0e4,
    gameTitle: "BHell",
    gameUrl: null,
    gameVersion: "0.1",
    loaderPath: "assets",
    physics: {
        default: "arcade",
        arcade: {
            gravity: 0,
            debug: true
        }
    },
    scene: [Stage]
}

let game = new Phaser.Game(config);

