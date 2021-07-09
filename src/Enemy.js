class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, x=100, y=100) {
        super(scene, x, y);
        this.setTexture('enemy');
        this.speed = Phaser.Math.GetSpeed(400, 1);
        console.log("Enemy constructor");
    }
    init() {
        console.log("Enemy");
    }
    begin(x, y) {
        this.setPosition(x, y);
        this.setActive(true);
        this.setVisible(true);
        let color = Phaser.Display.Color();
        this.setTint(color.random(50));
    }
    end() {
        console.log("end");
        this.setActive(false);
        this.setVisible(false)
    }
    update(time, delta) {
        this.y -= this.speed * delta;
        if (this.y < 200) {
            this.end()
        }
    }
    init() {
        
    }
}