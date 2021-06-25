



let gameSettings = {
    enemyColor: 0xdddddd,
    enemyHitboxColor: 0xee3333
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
    create() {
        this.enemies = this.add.group({
            classType: Enemy,
            maxSize: 100,
            runChildUpdate: true
        });

        this.time.addEvent({
            delay: 100,
            loop: true,
            callback: this.addEnemy
        });



    }
    update() {

    }

    addEnemy() {
        // Set the location: this should ultimately be handled
        // by the pattern generator.
        const x = Phaser.Math.Between(0, game.config.width);
        const y = Phaser.Math.Between(0, game.config.height);

        if(this.enemies) {

            const enemy = this.enemies.get();
            if (enemy) {
                enemy.fire(x, y);
            }
        }
    }

    // activateEnemy(enemy) {
    //     enemy
    //     .setActive(true)
    //     .setVisible(true)
    //     .setTint(Phaser.Display.Color.RandomRNG().color);
    // }

    // addEnemy() {
    //     // Set the location: this should ultimately be handled
    //     // by the pattern generator.
    //     const x = Phaser.Math.Between(0, game.config.width);
    //     const y = Phaser.Math.Between(0, game.config.height);
    
    //     const enemy = this.group.get(x, y);
    //     if (!enemy) { return; } // at maximum enemies
    //     this.activateEnemy(enemy);
       
    //     // for (const i of Array(game.config.enemyPoolSize).keys()) {
    //     //     this.enemyPool.push({x: 40, y: 40, active: true});
    //     // }
    //     // for (const e of this.enemyPool) {
    //     //     e.display = this.add.rectangle(e.x, e.y, 64, 64, gameSettings.enemyColor).setOrigin(0.5, 0.5);
    //     //     e.displayHitbox = this.add.rectangle(e.x, e.y, 16, 16, gameSettings.enemyHitboxColor).setOrigin(0.5, 0.5);
    //     // }
    // }
    
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
        }
    },
    scene: [Stage],
    enemyPoolSize: 5
}

let game = new Phaser.Game(config);

