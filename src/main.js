



let gameSettings = {
    enemyColor: 0xdddddd,
    enemyHitboxColor: 0xee3333
}


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
    create() {
        this.enemies = this.add.group({
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
            console.log("Adding enemy", x, y);
            let enemy = this.enemies.get(x, y);
            enemy.setActive(true);
            enemy.setVisible(true);

        };

        this.time.addEvent({
            delay: 500,
            loop: true,
            callback: this.spawnEnemy
        })

//         this.enemies = this.add.group({
//             defaultKey: 'enemy',
//             classType: Enemy,
//             maxSize: 100,
//             runChildUpdate: true,
//             createCallback: (enemy) => {enemy.setName('enemy' + this.getLength())},
//             removeCallback: () => {}
//         });
//         console.log(this.enemies);

//         const that = this;
//         function addEnemy(x = undefined, y = undefined) {
//             // Set the location: this should ultimately be handled
//             // by the pattern generator.
//             if(undefined == x) {
//                 x = Phaser.Math.Between(0, game.config.width);
//             }
//             if(undefined == y) {
//                 y = Phaser.Math.Between(0, game.config.height);
//             }
//             console.log("Adding enemy", x, y);

//             if(that.enemies) {
//                 const enemy = that.enemies.get(x, y);
//                 enemy.setVisible(true);
//                 enemy.setActive(true);
//                 console.log(enemy);
//                 if (enemy) {
//                     enemy.begin(x, y);
//                 }
//             } else {
//                 console.log(`this.enemies: ${that.enemies}`);
//                 console.log(that);
//             }
//         }

//         this.time.addEvent({
//             delay: 1000,
//             loop: true,
//             callback: addEnemy
//         });


    }
    update() {

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
    scene: [Stage],
    enemyPoolSize: 5
}

let game = new Phaser.Game(config);

