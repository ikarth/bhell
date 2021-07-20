'use strict';

let moveBullet = (scene, bullet, current_time) => {
    const life_time = current_time - bullet.spawnTime;
    const bullet_distance = (life_time * bullet.spawnSpeed);
    let firing_angle = Phaser.Math.DegToRad(bullet.spawnAngle);
    let spin_cycle = Phaser.Math.Angle.WrapDegrees(current_time * bullet.bulletSpin);
    let amount_to_spin = Phaser.Math.DegToRad(spin_cycle);
    let spin_angle = new Phaser.Math.Vector2(0.0, 1.0).rotate(amount_to_spin);
    let firing_vector = spin_angle.rotate(firing_angle).scale(bullet_distance);
    let inherited_velocity = bullet.spawnVelocity.clone().scale(life_time);
    firing_vector.add(inherited_velocity);
    let new_position = new Phaser.Math.Vector2(bullet.spawnX, bullet.spawnY).add(firing_vector);
    return [new_position.x, new_position.y];
};

let gameSettings = {
    enemyColor: 0xdddddd,
    enemyHitboxColor: 0xee3333
}

// global variables for the keys...
let cursors;
let triggerKey;


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
        this.load.image('playerBullet', 'assets/bullet.png');
        this.load.image('map_tileset', 'assets/colored_packed.png');
        this.load.tilemapTiledJSON('bhell_map', 'assets/bhell_backgrounds.json');
    }

    redraw() {
        this.graphics.clear();
        this.graphics.lineStyle(1, 0x0000ff);
        this.graphics.strokeCircleShape(this.playerHitIndicator);
    }

    create() {
        this.mapX = 0;
        this.mapY = 0;
        this.mapOffset = 16 * 32 * 2; // tile size * map chunk height * scaling
        this.map = this.add.tilemap('bhell_map');
        this.tileset = this.map.addTilesetImage('kenny', 'map_tileset', 16, 16, 0, 0);
        this.landscapeLayers = [];
        for(let i = 0; i < 5; i++) {
            let drawLayer = this.map.createLayer(`landscape${i+1}`, this.tileset, this.mapX, this.mapY + (this.mapOffset * i));
            drawLayer.scale = 2;
            drawLayer.setOrigin(0,0);
            drawLayer.mapX = this.mapX;
            drawLayer.mapY = 0 - (this.mapOffset * i);
            drawLayer.offsetIndex = i;
            drawLayer.activeScroll = true;
            this.landscapeLayers.push(drawLayer);
        }
        //this.landscapeLayers[0].activeScroll = true;

        cursors = this.input.keyboard.createCursorKeys();
        triggerKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        let playerX = game.config.width/2;
        let playerY = game.config.height - 32;
        this.player = this.physics.add.sprite(playerX, playerY, 'player');
        //this.player.body.syncBounds = true;
        this.player.body.setSize(8,8);
        //this.player.body.setOffset(32, 32);

        this.physics.add.collider(this.player, this.obstacleLayer);

        this.inputTimeVert = 0.0;
        this.inputTimeHorz = 0.0;
        this.maxInputImpulse = 4.0;
        this.player.body.setMaxSpeed(320);
        //this.player.body.setDrag(25600, 12800);
        this.player.body.setDrag(600, 800);
        this.player.body.setMass(200);
        this.player.setCollideWorldBounds(true);
        this.player.setDepth(100);

        this.playerActionCooldown = 100;
        this.playerLastActionTime = 0;

        //this.graphics = this.add.graphics({ fillStyle: { color: 0x00ff00 } });
        //this.playerHitIndicator = new Phaser.Geom.Circle(playerX, playerY, 5);
        //this.redraw();


        this.enemies = this.physics.add.group({
            classType: Enemy,
            maxSize: 100,
            visible: false,
            active: false,
            runChildUpdate: true
        });

        this.spawnEnemy = () => {
            let enemy = this.enemies.get();
            enemy.spawn();
            console.log(enemy);
        }

        this.time.addEvent({
            delay: 15000,
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

        this.playerBullets = this.physics.add.group({
            defaultKey: 'playerBullet',
            maxSize: config.gameplay.playerBulletPoolSize,
            visible: false,
            active: false,
            runChildUpdate: false
        });
        // populate player bullet pool
        this.playerBullets.createMultiple({quantity: config.gameplay.playerBulletPoolSize, active: false});
 

        this.spawnEnemy();

    }

  

    spawnNewBullet(settings) {
        let bullet = this.bullets.get(settings.spawnX, settings.spawnY);
        if(bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.body.immovable = true;
            bullet.body.isCircle = true;
            bullet.body.allowRotation = false;
            bullet.body.moves = false;
            bullet.body.onCollide = false;
            bullet.spawnX = settings.spawnX;
            bullet.spawnY = settings.spawnY;
            bullet.spawnTime = settings.spawnTime;
            bullet.bulletSpin = settings.bulletSpin;
            bullet.spawnSpeed = settings.spawnSpeed;
            bullet.spawnAngle = settings.spawnAngle;
            bullet.spawnVelocity = settings.spawnVelocity;
            bullet.setDepth(100);
        }
    }

    spawnPlayerBullet(x, y, pattern, current_time, settings={bulletSpeed: 1.01}) {
        let bullet = this.playerBullets.get(x,y);
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
            bullet.bulletSpeed = settings.bulletSpeed; // per second
            bullet.setDepth(200);
            return bullet;
        }
    }

    activeBackgroundLayers() {
        return this.landscapeLayers.reduce((accum, current) => {
            if (current.activeScroll) {
             return accum + 1;   
            }
            return accum;
        }, 0);
    }

    update(current_time, delta_time) {
        this.mapY += 0.1 * delta_time;
        let mapScrollSpeed = 0.3;
        this.landscapeLayers.forEach((layer) => {
            layer.mapY += mapScrollSpeed * delta_time;
            if (layer.mapY > this.landscapeLayers.length * 512) {
                layer.mapY = 0 - (this.mapOffset);
                layer.mapX = 0 - Phaser.Math.RND.integerInRange(0, 2) * 16;
                layer.x = layer.mapX;
            }
            layer.y = layer.mapY;

            // Could do it as an absolute position vs time if I worked out the math right...
            // layer.y = layer.mapY + (((0 + this.landscapeLayers.length) * 512) * ((current_time / 10000.0) % 1.0));
            // console.log(layer.y);
        });
        
        // player input - movement
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

        // player input - shooting
        if(triggerKey.isDown) {
            if (current_time > this.playerActionCooldown + this.playerLastActionTime) {
                this.spawnPlayerBullet(this.player.x, this.player.y, "player", current_time, {bulletSpeed: 10.0});
                this.playerLastActionTime = current_time;
            }
        }

        this.playerBulletMaxLife = 10000.0;
        this.playerBullets.getChildren().forEach(element => {
            if (element.active) {
                let out_of_bounds = false;
                out_of_bounds = element.y > (game.config.height * 2) ? true : out_of_bounds;
                out_of_bounds = element.y < 0 - game.config.height ? true : out_of_bounds;
                out_of_bounds = element.x < 0 - game.config.width ? true : out_of_bounds;
                out_of_bounds = element.x > (game.config.width * 2) ? true : out_of_bounds;
                if(element.active && out_of_bounds) {
                    this.bullets.killAndHide(element);               
                } else {
                    let lifespan = current_time - element.startTime;
                    if (lifespan > this.maxBulletLife) {
                        this.bullets.killAndHide(element);               
                    }
                    let bulletDelta = bullet_behaviors[element._behavior](this, element, current_time);
                    element.x = bulletDelta[0];
                    element.y = bulletDelta[1];
                }
            }
        });


        // Group objects need to be updated manually (see https://github.com/photonstorm/phaser/issues/3378)
        this.enemies.getChildren().forEach(element => {
            element.update(current_time, delta_time);
        });


        const maxBulletLife = 300000.0;

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
                    //console.log(element);
                    let lifespan = current_time - element.spawnTime;
                    //let bulletDelta = bullet_behaviors[element._behavior](this, element, current_time);
                    let bulletDelta = moveBullet(this, element, current_time);
                    element.x = bulletDelta[0];
                    element.y = bulletDelta[1];
                    if (lifespan > maxBulletLife) {
                        console.log(bullet);
                        this.bullets.killAndHide(element);               
                    }
                }                
            }
        })

        // player graphics
        //this.playerHitIndicator.x = this.player.x + this.player.body.velocity.x;
        //this.playerHitIndicator.y = this.player.y + this.player.body.velocity.y;
        //this.redraw();
    }
}


const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 800,
    pixelArt: true,
    backgroundColor: 0x472d3c,
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
    scene: [Stage],
    gameplay: { // Phaser ignores this, but we can use it directly
        bulletPoolSize: 20000,
        playerBulletPoolSize: 200
    }
}

let game = new Phaser.Game(config);

