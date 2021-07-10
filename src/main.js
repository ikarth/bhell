'use strict';


let bullet_behaviors = {
    undefined: (scene, bullet) => {
        return [bullet.x, bullet.y];
    },
    "rain": (scene, bullet) => {
        return [bullet.x, bullet.y + 2];
    },
    "spin-in-place": (scene, bullet, current_time) => {
        const life_time = current_time - bullet.startTime;
        const moveProgress = (life_time / 5000.0) % 1.0;
        const currentAngle = bullet.spawnAngle + (360.0 * moveProgress) + (360.0 * bullet.spawnOffset);
        const currentDistance = 0.01 * life_time;
        let bulletLoc = bullet.spawnLocation.clone().add(scene.physics.velocityFromAngle(currentAngle, currentDistance));
        return [bulletLoc.x, bulletLoc.y];
    },
    "spin-with-impetus": (scene, bullet, current_time) => {
        const life_time = current_time - bullet.startTime;
        const moveProgress = (life_time / bullet.spinRate) % 1.0;
        const currentAngle = bullet.spawnAngle + (360.0 * moveProgress) + (360.0 * bullet.spawnOffset);
        const currentDistance = bullet.bulletSpeed * life_time;
        let initial_travel = bullet.spawnImpetus.clone().scale(life_time / 1000.0); // impetus is distance vector per one second
        let bulletLoc = bullet.spawnLocation.clone().add(initial_travel);
        bulletLoc.add(scene.physics.velocityFromAngle(currentAngle, currentDistance));
        return [bulletLoc.x, bulletLoc.y];
    },
    // "spin-parent": (scene, bullet, current_time) => {
    //     const life_time = current_time - bullet.startTime;
    //     const moveProgress = (life_time / 2000.0) % 1.0;
    //     const currentAngle = bullet.spawnAngle + (360.0 * moveProgress);
    //     const currentDistance = 0.01 * life_time;
    //     const parentLocation = new Phaser.Math.Vector2(bullet.parent.x, bullet.parent.y);
    //     let bulletLoc = parentLocation.clone().add(scene.physics.velocityFromAngle(currentAngle, currentDistance));

    //     return [bulletLoc.x, bulletLoc.y];
    // }
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
        this.load.image('player', 'assets/player.png');
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
        this.player = this.physics.add.sprite(playerX, playerY, 'player');
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
        this.player.setDepth(100);

        this.graphics = this.add.graphics({ fillStyle: { color: 0x00ff00 } });
        this.playerHitIndicator = new Phaser.Geom.Circle(playerX, playerY, 5);

        
        this.redraw();


        this.enemies = this.physics.add.group({
            defaultKey: 'enemy',
            maxSize: 100,
            visible: false,
            active: false,
            runChildUpdate: true
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
            enemy.setVelocityY(40.0);
            //let color = Phaser.Display.Color();
            //enemy.setTint(color.random(50));
        };

        this.time.addEvent({
            delay: 5000,
            loop: true,
            callback: this.spawnEnemy
        })

        // An object pool for the enemy bullets. 
        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: config.gameplay.bulletPoolSize, // note that this uses config.gameplay and NOT game.config.gameplay
            visible: false,
            active: false,
            runChildUpdate: false
        });
        // Populate the object pool so we don't have slowdowns when we need to create new bullets...
        this.bullets.createMultiple({ quantity: config.gameplay.bulletPoolSize, active: false });
 

        this.spawnEnemy();
    }

    spawnBullet(x, y, pattern, current_time, spawn_offset, initial_velocity, parent) {
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
            bullet.startTime = current_time;

            bullet.spawnLocation = new Phaser.Math.Vector2(x,y);
            bullet.spawnAngle = 180;
            bullet.spawnOffset = spawn_offset;
            bullet.spawnImpetus = initial_velocity;
            
            //bullet.parent = parent;

            bullet.bulletSpeed = 0.01; // per second
            bullet.spinRate = 15000.0; // in revolutions per second
            
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

        //this.enemies.incY(1);
        this.enemies.getChildren().forEach(element => {
            if(element.active) {
                if(element.y > game.config.height) {
                   this.enemies.killAndHide(element);               
                } else {
                    if (current_time > actionCooldown + element.lastAction) {
                        // Spawn One
                        //this.spawnBullet(element.x, element.y, "spin-in-place", current_time, 0.0, element.body.velocity, element);
                        // Spawn Many
                        const spawn_count = 6;
                        for(const i of Array(spawn_count).keys()) {
                            this.spawnBullet(element.x, element.y, "spin-with-impetus", current_time, i / spawn_count, element.body.velocity.clone(), element);
                        }
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
                    let maxLife = 300000.0;
                    let lifespan = current_time - element.startTime;
                    let bulletDelta = bullet_behaviors[element._behavior](this, element, current_time);
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
            debug: false
        }
    },
    scene: [Stage],
    gameplay: { // Phaser ignores this, but we can use it directly
        bulletPoolSize: 20000
    }
}

let game = new Phaser.Game(config);

