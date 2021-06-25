class Enemy extends Phaser.GameObjects.Image {
    constructor(scene) {
        super(this, scene, 0, 0, 'enemy');
        this.speed = Phaser.Math.GetSpeed(400, 1);
    }
    fire(x, y) {
        this.setPosition(x, y - 50);
        this.setActive(true);
        this.setVisible(true);
        this.setTint(Phaser.Display.Color.RandomRNG().color);
    }
    end() {
        this.setActive(false);
        this.setVisible(false)
    }
    update(time, delta) {
        this.y -= this.speed * delta;
        if (this.y < -50) {
            end()
        }

    }
    init() {
        
    }
}