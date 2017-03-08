import Phaser from 'phaser';

export default class extends Phaser.Sprite {

    constructor({game, x, y, asset, collectibleType, onOutOfBounds}) {
        super(game, x, y, asset);
        this.anchor.setTo(0.5);

        // TODO - Remove % 4 when we've got all sprites
        this.frame = collectibleType.frameNumber % 5;

        game.physics.enable(this, Phaser.Physics.ARCADE);

        this.checkWorldBounds = true;
        this.events.onOutOfBounds.add(onOutOfBounds, this);
        this.anchor.setTo(0.5, 0.5);

        this.rotateSpeed = (Math.random() * 4) - 2;
        this.collectibleType = collectibleType;
    }

    update() {
        this.angle += this.rotateSpeed;
    }
}
