'use strict';

let bullet_behaviors = {
    undefined: (scene, bullet) => {
        return [bullet.x, bullet.y];
    },
    "player": (scene, bullet) => {
        return [bullet.x, bullet.y - bullet.bulletSpeed];
    },
    "rain": (scene, bullet) => {
        return [bullet.x, bullet.y + 2];
    },
    "outward": (scene, bullet, current_time) => {
        const life_time = current_time - bullet.startTime;
        const moveProgress = (life_time / 5000.0) % 1.0;
        const currentAngle = bullet.spawnAngle + (360.0 * bullet.spawnOffset);
        const currentDistance = 0.01 * life_time;
        let bulletLoc = bullet.spawnLocation.clone().add(scene.physics.velocityFromAngle(currentAngle, currentDistance));
        return [bulletLoc.x, bulletLoc.y];
    },
    "spin-in-place": (scene, bullet, current_time) => {
        const life_time = current_time - bullet.startTime;
        const moveProgress = (life_time / 5000.0) % 1.0;
        const currentAngle = bullet.spawnAngle + (360.0 * moveProgress) + (360.0 * bullet.spawnOffset);
        let initial_travel = bullet.spawnImpetus.clone().scale(life_time / 1000.0); // impetus is distance vector per one second
        const currentDistance = 0.01 * life_time;
        let bulletLoc = bullet.spawnLocation.clone().add(initial_travel);
        bulletLoc.add(scene.physics.velocityFromAngle(currentAngle, currentDistance));
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
    }
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
            drawLayer.activeScroll = false;
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
            let enemy = this.enemies.get(x, y);
            enemy.setActive(true);
            enemy.setVisible(true);
            enemy.lastAction = 0;
            enemy.setVelocityY(40.0);
            //let color = Phaser.Display.Color();
            //enemy.setTint(color.random(50));
        };

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
 

        //this.spawnEnemy();
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
            bullet.setDepth(20);
            return bullet;
        }
    }

    spawnBullet(x, y, pattern, current_time, spawn_offset, initial_velocity, settings={bulletSpeed: 0.01, spinRate: 15000.0}) {
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

            bullet.bulletSpeed = settings.bulletSpeed; // per second
            bullet.spinRate = settings.spinRate; // in revolutions per second

            bullet.setDepth(10);
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
        let mapScrollSpeed = 5.0;
        this.landscapeLayers.forEach((layer) => {
            layer.mapY += mapScrollSpeed * delta_time;
            if (layer.mapY > this.landscapeLayers.length * 512) {
                layer.mapY = 0 - (this.mapOffset);
                layer.mapX = 0 - Phaser.Math.RND.integerInRange(0, 2) * 16;
                layer.x = layer.mapX;
            }
        });

        let topOfActiveLayer = this.landscapeLayers.reduce((acc, cur) => {
            if (cur.activeScroll) {
                if (!isNaN(cur.layer.y)) {
                    console.log(`current: ${cur.layer.y}`);
                    if (acc > cur.layer.y) {
                        acc = cur.layer.y;
                    }
                }
            }
            console.assert(!isNaN(acc));
            return acc;
        }, 0);
        if(this.activeBackgroundLayers() > 2) {
            debugger;
        }

        if (this.activeBackgroundLayers() < 2) {
            // We're in danger of having a blank space in the background!
            // Pick a background layer that isn't being used
            let inactive_layers = this.landscapeLayers.filter(lay => lay.activeScroll == false);
            if(inactive_layers.length > 0) {
                let new_layer = Phaser.Math.RND.pick(inactive_layers);
                new_layer.y = topOfActiveLayer - (new_layer.layer.heightInPixels + 512);
                if(isNaN(new_layer.y)) {
                    debugger;
                }
                new_layer.activeScroll = true;
                new_layer.x = Phaser.Math.RND.integerInRange(0,512);
                topOfActiveLayer = new_layer.y;
            }
        }

        console.log(this.activeBackgroundLayers());

        
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


        // Later, I'm going to give the enemies more elaborate behaviors. But for right now, they just fire bullet patterns on a timer.
        const actionCooldownLimit = 2000.0; 

        //this.enemies.incY(1);
        this.enemies.getChildren().forEach(element => {
            if(element.active) {
                if(element.y > game.config.height * 2) {
                   this.enemies.killAndHide(element);               
                } else {
                    if (current_time > actionCooldownLimit + element.lastAction) {
                        // Spawn One
                        //this.spawnBullet(element.x, element.y, "spin-in-place", current_time, 0.0, element.body.velocity);
                        // Spawn Many
                        const spawn_count = 6;
                        for(const i of Array(spawn_count).keys()) {
                            this.spawnBullet(element.x, 
                                             element.y, 
                                             "spin-with-impetus", 
                                             current_time, 
                                             i / spawn_count, 
                                             element.body.velocity.clone(), 
                                             {
                                                bulletSpeed: 0.02, 
                                                spinRate: 17000.0
                                            });
                        }
                        element.lastAction = current_time;
                    }
                }
            }
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
                    let lifespan = current_time - element.startTime;
                    let bulletDelta = bullet_behaviors[element._behavior](this, element, current_time);
                    element.x = bulletDelta[0];
                    element.y = bulletDelta[1];
                    if (lifespan > maxBulletLife) {
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

