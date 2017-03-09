import Phaser from 'phaser';

export default class extends Phaser.Sprite {

    constructor({game, x, y, asset, collectibleType, onOutOfBounds, isFood}) {
        super(game, x, y, asset);
        this.anchor.setTo(0.5);

        this.frame = collectibleType.frameNumber;

        game.physics.enable(this, Phaser.Physics.ARCADE);

        this.checkWorldBounds = true;
        this.events.onOutOfBounds.add(onOutOfBounds, this);
        this.anchor.setTo(0.5, 0.5);

        this.rotateSpeed = (Math.random() * 4) - 2;
        this.collectibleType = collectibleType;
        this.isFood = isFood;
    }

    update() {
        this.angle += this.rotateSpeed;
    }
}
