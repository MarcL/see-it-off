/* globals __DEV__ */
import Phaser from 'phaser';
import Collectible from '../sprites/Collectible';

import config from '../config';
import collectibles from '../config/collectibles';
import faces from '../config/faces';

// TODO Move to a file
const gameConfig = {
    drinkDecrementPerTimeUnit: 1,
    drinkDecrementTimeMilliSeconds: 1000,
    drinkMaximumAmount: 250,
    foodDecrementPerMove: 2,
    foodMaximumAmount: 250,
    playerInitialMoveSpeed: 400,
    playerMaxDragMultiplier: 0.4,
    playerYPosition: 1460,
    minimumSpawnTime: 1800,
    maximumSpawnTime: 3300,
    ui: {
        face: {
            position: [800, 1600],
            scale: 1,
        },
    },
};

function randomIntegerBetween(min, max) {
    return Math.floor((Math.random() * (max - min)) + min);
}

export default class extends Phaser.State {
    init() {
        this._player = null;
        this._collectibleGroup = null;
        this._spawnTimer = 0;
        this._nextSpawnTime = 0;
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

        this.initialisePlayer();
        this.initialiseUi();
        this.setDrinkText();
        this.setFoodText();
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

        this.updateFace();

        if (this.isGameOver()) {
            this.showGameOver();
        }
    }

    // TODO - needs working out properly once rules are clear
    updateFace() {
        const foodDifference = this._foodAmount - this._drinkAmount;
        const drinkDifference = this._drinkAmount - this._foodAmount;
        let newFace = faces.FACE_NEUTRAL;

        if (foodDifference > 200) {
            newFace = faces.FACE_SICK;
        } else if (foodDifference > 100) {
            newFace = faces.FACE_GLUTTONOUS;
        } else if (foodDifference > 50) {
            newFace = faces.FACE_GOURMAND;
        }

        if (drinkDifference > 200) {
            newFace = faces.FACE_HAMMERED;
        } else if (drinkDifference > 100) {
            newFace = faces.FACE_DRUNK;
        } else if (drinkDifference > 50) {
            newFace = faces.FACE_MERRY;
        }

        this.setFace(newFace);
    }

    setFace(faceFrame) {
        if (faceFrame !== this._face.frame) {
            this._face.frame = faceFrame;
        }
    }

    isGameOver() {
        // TODO This should be based on drink/food amount
        // return this._missedItems >= 3;
        return false;
    }

    showGameOver() {
        this.add.sprite((config.gameWidth - 594) / 2, (config.gameHeight - 271) / 2, 'game-over');
        this.game.paused = true;
    }

    updateCollectibles() {
        if (this._spawnTimer > this._nextSpawnTime) {
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
        this._face.scale.x = uiFace.scale;
        this._face.scale.y = uiFace.scale;
        this.setFace(faces.FACE_NEUTRAL);

        this.setDrinkText();
        this.setFoodText();
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

            this.setDrinkText();
        }
    }

    updateFoodAmount() {
        this._foodAmount -= gameConfig.foodDecrementPerMove;
        if (this._foodAmount < 0) {
            this._foodAmount = 0;
        }
        this.setFoodText();
    }

    setDrinkText() {
        this._drinkAmountText.setText(`Drink: ${this._drinkAmount}`);
    }

    setFoodText() {
        this._foodAmountText.setText(`Food: ${this._foodAmount}`);
    }

    spawnCollectible() {
        this._nextSpawnTime = randomIntegerBetween(
            gameConfig.minimumSpawnTime,
            gameConfig.maximumSpawnTime
        );

        const dropPos = randomIntegerBetween(0, config.gameWidth);
        const dropOffset = 0;

        // Choose collectible type
        const foodOrDrink = randomIntegerBetween(0, 100);
        const isFood = (foodOrDrink >= 50);
        const collectibleTypeList = isFood ? collectibles.food : collectibles.drinks;

        const randomTypeIndex = randomIntegerBetween(0, collectibleTypeList.length - 1);
        const collectibleType = collectibleTypeList[randomTypeIndex];

        const collectible = new Collectible({
            game: this,
            x: dropPos,
            y: dropOffset,
            asset: 'collectibles',
            collectibleType,
            onOutOfBounds: this.onCollectibleOutOfBounds,
            isFood
        });

        this._collectibleGroup.add(collectible);
    }

    playerCollectedItem(collectible) {
        collectible.kill();

        const points = collectible.collectibleType.points;
        this._score += points;

        this._scoreText.setText(this._score);

        if (collectible.isFood) {
            this._foodAmount += points;

            if (this._foodAmount > gameConfig.foodMaximumAmount) {
                this._foodAmount = gameConfig.foodMaximumAmount;
            }

            this.setFoodText();
        } else {
            this._drinkAmount += points;

            if (this._drinkAmount > gameConfig.drinkMaximumAmount) {
                this._drinkAmount = gameConfig.drinkMaximumAmount;
            }

            this.setDrinkText();
        }
    }

    onCollectibleOutOfBounds(collectible) {
        collectible.kill();
        this.game._missedItems += 1;

        // TODO - Reduce food / drink amount because of this?
    }
}
