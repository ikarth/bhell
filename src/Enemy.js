'use strict';

const defaultEnemySettings = {
    texture: 'enemy', 
    movement: 'normal', 
    speed: 50.0, 
    lifespan: null,
    bullets: {
        cooldown: 500.0, // time between bullet firings...
        onlySpawnOnScreen: true,
        count: 2, // number to spawn at the same time (at regular angles)
        spawnAngle: 0,
        spawnRotationRate: 0.01, // 0.01 is reasonable
        speed: 0.048, // 0.01 is reasonable
        spinRate: 0.0,
        inheritParentVelocity: 1.0 // mostly keep this between 0.0 and 1.0
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

        this.configure(enemySettings);
    }
    configure(enemySettings) {
        this.beginTime = null;
        this.lifespan = enemySettings.lifespan;

        this.setTexture(enemySettings.texture);
        this.movementType = enemySettings.movement;
        this.speed = Phaser.Math.GetSpeed(enemySettings.speed, 1);

        // Normal movement - just go forward
        this.body.setVelocityY(enemySettings.speed);
        this.enemySpeed = enemySettings.speed;

        this.lastAction = 0;
        this.nextAction = 0;
        this.cooldown = 1000.0
        this.BulletProperties = [];
        let bp = {};
        console.log(enemySettings);
        bp.speed = enemySettings.bullets.speed;
        bp.count = enemySettings.bullets.count;
        bp.spinRate = enemySettings.bullets.spinRate;
        bp.spawnRotationRate = enemySettings.bullets.spawnRotationRate;
        bp.spawnAngle = enemySettings.bullets.spawnAngle;
        bp.inheritParentVelocity = enemySettings.bullets.inheritParentVelocity;
        bp.cooldown = enemySettings.bullets.cooldown;
        this.BulletProperties.push(bp);
    }
    init() {
        
    }
    spawn(x=undefined, y=undefined, enemySettings = defaultEnemySettings) {
        // Spawn
        if(undefined == x) { x = Phaser.Math.Between(0, game.config.width); }
        if(undefined == y) { y = Phaser.Math.Between(0, game.config.height); }
        //y=0; // Temporary hack to place at top of screen - replace with real pattern spawning later
        this.setPosition(x,y);
        this.setActive(true);
        this.setVisible(true);
        this.beginTime = null;
        this.lastAction = 0;
        this.nextAction = 0;

        this.configure(enemySettings);
        
        this.body.setVelocityY(this.enemySpeed);
        console.log("Spawned Enemy");
        console.log(this);
    }
    despawn() {
        this.setActive(false);
        this.setVisible(false);
        this.beginTime = null;
    }
    update(current_time, delta_time) {
        if(!this.beginTime) {
            this.beginTime = current_time;
        }
        if (this.y > game.config.height * 2) {
            this.despawn();
        }
        if(this.lifespan) {
            if(current_time > lifespan + this.beginTime) {
                this.despawn();
            }
        }
        if (this.active) {
            if(this.nextAction < current_time) {
                // Take next action
                let cooldown = this.actionSpawnBullets(current_time);
                this.lastAction = current_time;
                this.nextAction = current_time + cooldown;
            }
        }
    }

    actionSpawnBullets(current_time) {
        let bullet_properties = this.BulletProperties[0];
        for(const i of Array(bullet_properties.count).keys()) {
            let firing_angle = bullet_properties.spawnAngle;
            firing_angle += (current_time * bullet_properties.spawnRotationRate);
            firing_angle += (i / bullet_properties.count) * 360.0;
            firing_angle = Phaser.Math.Angle.WrapDegrees(firing_angle)
            const inherit_factor = 0.001;
            let parent_velocity = this.body.velocity.clone().scale(bullet_properties.inheritParentVelocity * inherit_factor);
            const new_bullet_settings = {
                spawnX: this.x,
                spawnY: this.y,
                spawnTime: current_time,
                spawnVelocity: parent_velocity,
                spawnAngle: firing_angle,
                spawnSpeed: bullet_properties.speed,
                bulletSpin: bullet_properties.spinRate
            };
            this.scene.spawnNewBullet(new_bullet_settings);
        }
        return bullet_properties.cooldown;
    }
}

