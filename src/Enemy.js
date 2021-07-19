'use strict';

const defaultEnemySettings = {
    texture: 'enemy', 
    movement: 'normal', 
    speed: 400, 
    lifespan: null,
    bullets: {
        count: 6,
        spawnAngle: 180,
        spawnRotationRate: 10.0,
        speed: 10.0
    }
};

class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, 
                x=0, 
                y=-512, 
                enemySettings=defaultEnemySettings) {

        if(!enemySettings) {
            enemySettings = defaultEnemySettings;
        }
        super(scene, x, y);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.beginTime = null;

        this.setTexture(enemySettings.texture);
        this.movementType = enemySettings.movement;
        this.speed = Phaser.Math.GetSpeed(enemySettings.speed, 1);

        // Normal movement - just go forward
        this.body.setVelocityY(enemySettings.speed);

        this.lastAction = 0;
        this.cooldown = 1000.0
        this.BulletProperties = [];
        let bp = {};
        console.log(enemySettings);
        bp.speed = enemySettings.bullets.speed;
        bp.count = enemySettings.bullets.count;
        bp.spawnRotationRate = enemySettings.bullets.spawnRotationRate;
        bp.spawnAngle = enemySettings.bullets.spawnAngle;
        this.BulletProperties.push(bp);
    }
    init() {

    }
    spawn(x=undefined, y=undefined, enemySettings = defaultEnemySettings) {
        // Spawn
        if(undefined == x) { x = Phaser.Math.Between(0, game.config.width); }
        if(undefined == y) { y = Phaser.Math.Between(0, game.config.height); }
        this.setPosition(x,y);
        this.setActive(true);
        this.setVisible(true);
        this.beginTime = null;
    }
    despawn() {
        this.setActive(false);
        this.setVisible(false);
        this.beginTime = null;
    }
    update(current_time) {
        if(!beginTime) {
            this.beginTime = current_time;
        }
        if (element.y > game.config.height * 2) {
            this.despawn();
        }
        if(lifespan) {
            if(current_time > lifespan + this.beginTime) {
                this.despawn();
            }
        }
        if (this.active) {
            if(this.lastAction + this.cooldown < current_time) {
                // Take next action
                this.lastAction = current_time;
            }
        }
    }
}

        //this.enemies.incY(1);
        // this.enemies.getChildren().forEach(element => {
        //     if(element.active) {
        //         if(element.y > game.config.height * 2) {
        //            this.enemies.killAndHide(element);               
        //         } else {
        //             if (current_time > actionCooldownLimit + element.lastAction) {
        //                 // Spawn One
        //                 //this.spawnBullet(element.x, element.y, "spin-in-place", current_time, 0.0, element.body.velocity);
        //                 // Spawn Many
        //                 const spawn_count = element.bullets.spawnCount;
        //                 for(const i of Array(spawn_count).keys()) {
        //                     this.spawnBullet(element.x, 
        //                                      element.y, 
        //                                      "outward-with-momentum", 
        //                                      current_time, 
        //                                      (i / spawn_count), 
        //                                      element.body.velocity.clone(), 
        //                                      {
        //                                         bulletSpeed: element.bullets.bulletSpeed, 
        //                                         spinRate: 17000.0,
        //                                         spawnAngle: element.bullets.angle,
        //                                         spawnAngleRotationRate: element.bullets.spawnRotation
        //                                     });
        //                 }
        //                 element.lastAction = current_time;
        //             }
        //         }
        //     }
        // });

// this.spawnEnemy = (x, y, settings = {bulletCount:6, bulletAngle:180, bulletAngleRotationRate: 10.0, bulletSpeed: 10.0, velocity: 40.0}) => {
//     if(undefined == x) {
//         x = Phaser.Math.Between(0, game.config.width);
//     }
//     if(undefined == y) {
//         y = Phaser.Math.Between(0, game.config.height);
//     }
//     console.log("Adding enemy", x, -y);
//     let enemy = this.enemies.get(x, y);
//     enemy.setActive(true);
//     enemy.setVisible(true);
//     enemy.lastAction = 0;
//     enemy.setVelocityY(settings.velocity);
//     enemy.bullets = {};
//     enemy.bullets.speed = settings.bulletSpeed;
//     enemy.bullets.spawnCount = settings.bulletCount;
//     enemy.bullets.angle = settings.bulletAngle;
//     enemy.bullets.spawnRotation = settings.bulletAngleRotationRate;
//     //let color = Phaser.Display.Color();
//     //enemy.setTint(color.random(50));
//     return enemy;
// };

// class Enemy extends Phaser.GameObjects.Sprite {
//     constructor(scene, x=100, y=100) {
//         super(scene, x, y);
//         this.setTexture('enemy');
//         this.speed = Phaser.Math.GetSpeed(400, 1);
//         console.log("Enemy constructor");
//     }
//     init() {
//         console.log("Enemy");
//     }
//     begin(x, y) {
//         this.setPosition(x, y);
//         this.setActive(true);
//         this.setVisible(true);
//         let color = Phaser.Display.Color();
//         this.setTint(color.random(50));
//     }
//     end() {
//         console.log("end");
//         this.setActive(false);
//         this.setVisible(false)
//     }
//     update(time, delta) {
//         this.y -= this.speed * delta;
//         if (this.y < 200) {
//             this.end()
//         }
//     }
//     init() {
        
//     }
// }