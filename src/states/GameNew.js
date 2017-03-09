/* globals __DEV__ */
import Phaser from 'phaser';
import Collectible from '../sprites/Collectible';

import config from '../config';
import collectibles from '../config/collectibles';

// TODO Move to a file
const gameConfig = {
    drinkDecrementPerTimeUnit: 1,
    drinkDecrementTimeMilliSeconds: 1000,
    drinkMaximumAmount: 250,
    foodDecrementPerMove: 2,
    playerInitialMoveSpeed: 400,
    playerMaxDragMultiplier: 0.4,
    playerYPosition: 1460,
    ui: {
        face: {
            position: [800, 1600],
            scale: 1,
        },
    },
};

export default class extends Phaser.State {
    init() {
        this._player = null;
        this._collectibleGroup = null;
        this._spawnTimer = 0;
        this._drinkTimer = 0;
        this._fontStyle = null;
        this._face = null;

        this._scoreText = null;
        this._score = 0;
        this._health = 0;
        this._cursors = null;
        this._facing = 'right';
        this._missedItems = 0;
        this._drinkAmount = 0;
        this._drinkAmountText = null;
        this._foodAmount = 0;
        this._foodAmountText = null;
    }

    create() {
        this.physics.startSystem(Phaser.Physics.ARCADE);

        this.physics.arcade.gravity.y = 200;

        this.add.sprite(0, 0, 'background');
        this.add.sprite(10, 5, 'score-bg');

        this.add.button(config.gameWidth - 96 - 10, 5, 'button-pause', this.managePause, this);

        this._fontStyle = {
            font: '40px Arial',
            fill: '#FFCC00',
            stroke: '#333',
            strokeThickness: 5,
            align: 'center',
        };

        this._spawnTimer = 0;
        this._drinkTimer = 0;

        this._scoreText = this.add.text(120, 20, '0', this._fontStyle);
        this._drinkAmountText = this.add.text(120, 80, '0', this._fontStyle);
        this._foodAmountText = this.add.text(120, 160, '0', this._fontStyle);
        this._health = 10;

        this._collectibleGroup = this.add.group();

        this._missedItems = 0;

        this.spawnCollectible();

        this.initialisePlayer();
        this.initialiseUi();
    }

    managePause() {
        this.game.paused = true;
        const pausedText = this.add.text(
                300,
                400,
                'Game paused.\nTap anywhere to continue.',
                this._fontStyle
        );

        this.input.onDown.add(() => {
            pausedText.destroy();
            this.game.paused = false;
        }, this);
    }

    update() {
        this._spawnTimer += this.time.elapsed;

        this.updatePlayer();
        this.updateCollectibles();
        this.updateDrinkAmount();

        if (this.isGameOver()) {
            this.showGameOver();
        }
    }

    isGameOver() {
        // TODO This should be based on drink/food amount
        return this._missedItems >= 3;
    }

    showGameOver() {
        this.add.sprite((config.gameWidth - 594) / 2, (config.gameHeight - 271) / 2, 'game-over');
        this.game.paused = true;
    }

    updateCollectibles() {
        if (this._spawnTimer > 1000) {
            this._spawnTimer = 0;
            this.spawnCollectible();
        }

        this._collectibleGroup.forEach((collectible) => {
            collectible.update();
        });

        this.physics.arcade.overlap(
            this._player,
            this._collectibleGroup,
            this.collideWithPlayer,
            null,
            this
        );
    }

    getDrunkSpeedMultiplier() {
        const drunkPercentage = this._drinkAmount / gameConfig.drinkMaximumAmount;
        const speedMultiplier = 1 - (drunkPercentage * gameConfig.playerMaxDragMultiplier);
        return speedMultiplier;
    }

    updatePlayer() {
        const speedMultiplier = this.getDrunkSpeedMultiplier();
        const moveSpeed = gameConfig.playerInitialMoveSpeed * speedMultiplier;
        this._player.body.velocity.x = 0;

        if (this.isLeftPressed()) {
            this._player.body.velocity.x = -moveSpeed;

            if (this._facing !== 'left') {
                this._facing = 'left';
                this._player.scale.x = -1;
                this.updateFoodAmount();
            }
        } else if (this.isRightPressed()) {
            this._player.body.velocity.x = moveSpeed;

            if (this._facing !== 'right') {
                this._facing = 'right';
                this._player.scale.x = 1;
                this.updateFoodAmount();
            }
        }
    }

    isLeftPressed() {
        return this._cursors.left.isDown || this.hasTouchedLeft();
    }

    isRightPressed() {
        return this._cursors.right.isDown || this.hasTouchedRight();
    }

    hasTouchedLeft() {
        if (this.input.activePointer.isDown) {
            return (this.input.activePointer.worldX < (config.gameWidth / 2));
        }

        return false;
    }

    hasTouchedRight() {
        if (this.input.activePointer.isDown) {
            return (this.input.activePointer.worldX > (config.gameWidth / 2));
        }

        return false;
    }

    initialisePlayer() {
        this._player = this.add.sprite(config.gameWidth * 0.5, gameConfig.playerYPosition, 'monster-idle');

        this._player.animations.add('idle', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 10, true);
        this._player.animations.play('idle');

        this._cursors = this.game.input.keyboard.createCursorKeys();
        this.game.physics.enable(this._player, Phaser.Physics.ARCADE);
        this._player.body.allowGravity = false;
        this._player.body.collideWorldBounds = true;

        this._player.anchor.setTo(0.5, 0);
    }

    initialiseUi() {
        const uiFace = gameConfig.ui.face;
        this._face = this.add.sprite(uiFace.position[0], uiFace.position[1], 'faces');
        this._face.frame = 3;
        this._face.scale.x = uiFace.scale;
        this._face.scale.y = uiFace.scale;

        this.setDrinkText(this._drinkAmount);
        this.setFoodText(this._drinkAmount);
    }

    collideWithPlayer(player, collectible) {
        this.playerCollectedItem(collectible);
    }

    updateDrinkAmount() {
        this._drinkTimer += this.time.elapsed;
        if (this._drinkTimer > gameConfig.drinkDecrementTimeMilliSeconds) {
            this._drinkTimer = 0;

            this._drinkAmount -= gameConfig.drinkDecrementPerTimeUnit;
            if (this._drinkAmount < 0) {
                this._drinkAmount = 0;
            }
            this.setDrinkText(this._drinkAmount);

            // TODO Remove - Testing face frames
            this._face.frame += 1;
            this._face.frame = this._face.frame % 13;
        }
    }

    updateFoodAmount() {
        this._foodAmount -= gameConfig.foodDecrementPerMove;
        if (this._foodAmount < 0) {
            this._foodAmount = 0;
        }
        this.setFoodText(this._foodAmount);
    }

    setDrinkText(amount) {
        this._drinkAmountText.setText(`Drink: ${amount}`);
    }

    setFoodText(amount) {
        this._foodAmountText.setText(`Food: ${amount}`);
    }

    spawnCollectible() {
        const dropPos = Math.floor(Math.random() * config.gameWidth);
        const dropOffset = 0;

        // Choose collectible type
        const foodOrDrink = Math.floor(Math.random() * 100);
        const collectibleTypeList = (foodOrDrink >= 50) ? collectibles.food : collectibles.drinks;

        // TODO - Comment in when all graphics are available
        const randomTypeIndex = Math.floor(Math.random() * collectibleTypeList.length);
        const collectibleType = collectibleTypeList[randomTypeIndex];

        const collectible = new Collectible({
            game: this,
            x: dropPos,
            y: dropOffset,
            asset: 'collectibles',
            collectibleType,
            onOutOfBounds: this.onCollectibleOutOfBounds,
        });

        this._collectibleGroup.add(collectible);
    }

    playerCollectedItem(collectible) {
        collectible.kill();

        const points = collectible.collectibleType.points;
        this._score += points;

        this._scoreText.setText(this._score);

        // TODO Determine whether it's food or drink and update accordingly
        this._drinkAmount += points;
        this._foodAmount += points;
        if (this._drinkAmount > gameConfig.drinkMaximumAmount) {
            this._drinkAmount = gameConfig.drinkMaximumAmount;
        }
    }

    onCollectibleOutOfBounds(collectible) {
        collectible.kill();
        this.game._missedItems += 1;

        // TODO - Reduce food / drink amount because of this?
    }
}
