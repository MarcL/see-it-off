/* globals __DEV__ */
import Phaser from 'phaser';
import Collectible from '../sprites/Collectible';

import config from '../config';
import collectibles from '../config/collectibles';
import faces from '../config/faces';

const DEBUG_GAME = false;

// TODO Move to a file
const gameConfig = {
    drinkDecrementPerTimeUnit: 4,
    drinkDecrementTimeMilliSeconds: 1000,
    drinkMinimumAmount: -250,
    drinkMaximumAmount: 250,
    foodDecrementPerMove: 2,
    foodMinimumAmount: -250,
    foodMaximumAmount: 250,
    playerInitialMoveSpeed: 500,
    playerMaxDragMultiplier: 0.4,
    playerYPosition: 860,
    minimumSpawnTime: 1200,
    maximumSpawnTime: 2500,
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
        this._foodBar = null;
        this._drinksBar = null;
        this._score = 0;
        this._cursors = null;
        this._facing = 'idle';
        this._foodMaximumTotal = gameConfig.foodMaximumAmount - gameConfig.foodMinimumAmount;
        this._drinkMaximumTotal = gameConfig.drinkMaximumAmount - gameConfig.drinkMinimumAmount;
        this._foodAmount = 0;
        this._drinkAmount = 0;
    }

    create() {
        this.game.time.advancedTiming = true;
        this.physics.startSystem(Phaser.Physics.ARCADE);

        this.physics.arcade.gravity.y = 200;

        this.add.sprite(0, 0, 'background-game');
        this.add.button(
            config.gameWidth * 0.86,
            config.gameHeight * 0.03,
            'pause-button',
            this.managePause,
            this,
            1,
            0
        );

        this._fontStyle = {
            font: '40px Arial',
            fill: '#FFCC00',
            stroke: '#333',
            strokeThickness: 5,
            align: 'center',
        };

        this._spawnTimer = 0;
        this._drinkTimer = 0;

        this.initialisePlayer();
        this._collectibleGroup = this.add.group();

        this.initialiseUi();

        this.setDrinksBar();
        this.setFoodBar();
        this.setTotalScore();
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

        if ((drinkDifference <= 50) && (foodDifference <= 50)) {
            if (this._score > 200) {
                newFace = faces.FACE_LAUGHING;
            } else if (this._score > 100) {
                newFace = faces.FACE_CHEERFUL;
            } else if (this._score > 50) {
                newFace = faces.FACE_HAPPY;
            } else if (this._score < -200) {
                newFace = faces.FACE_ANGRY;
            } else if (this._score < -100) {
                newFace = faces.FACE_ANNOYED;
            } else if (this.score < -50) {
                newFace = faces.FACE_BORED;
            }
        }

        this.setFace(newFace);
    }

    setFace(faceFrame) {
        if (faceFrame !== this._face.frame) {
            this._face.frame = faceFrame;
        }
    }

    isGameOver() {
        const noDrinkPoints = (this._drinkAmount <= gameConfig.drinkMinimumAmount);
        const noFoodPoints = (this._foodAmount <= gameConfig.foodMinimumAmount);
        return noDrinkPoints || noFoodPoints;
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
                this._player.animations.play('move-left');
                this.updateFoodAmount();
            }
        } else if (this.isRightPressed()) {
            this._player.body.velocity.x = moveSpeed;

            if (this._facing !== 'right') {
                this._facing = 'right';
                this._player.animations.play('move-right');
                this.updateFoodAmount();
            }
        } else if (this._facing !== 'idle') {
            this._facing = 'idle';
            this._player.animations.play('idle');
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
        this._player = this.add.sprite(config.gameWidth * 0.5, gameConfig.playerYPosition, 'player');
        this._player.scale = {x: 1, y: 1};
        this._player.animations.add('idle', [0, 1, 2, 3], 10, true);
        this._player.animations.add('move-left', [4, 5, 6, 7], 10, true);
        this._player.animations.add('move-right', [8, 9, 10, 11], 10, true);
        this._player.animations.play('idle');

        this._cursors = this.game.input.keyboard.createCursorKeys();
        this.game.physics.enable(this._player, Phaser.Physics.ARCADE);
        this._player.body.allowGravity = false;
        this._player.body.collideWorldBounds = true;

        // Original player spritesheet: 436x436
        this._player.body.setSize(218, 200, 109, 118);

        this._player.anchor.setTo(0.5, 0);
    }

    // TODO - Unify UI positions
    initialiseUi() {
        this.add.sprite(0, 0, 'frame');

        const faceBg = {
            x: config.gameWidth * 0.83,
            y: config.gameHeight * 0.89
        };
        const faceBackground = this.add.sprite(faceBg.x, faceBg.y, 'background-face');
        faceBackground.anchor.setTo(0.5, 0.5);

        this._face = this.add.sprite(faceBg.x + 4, faceBg.y + 10, 'faces');
        this._face.anchor.setTo(0.5, 0.5);
        this.setFace(faces.FACE_NEUTRAL);

        const scorePos = {
            x: faceBg.x,
            y: faceBg.y + 130
        };
        const scoreBar = this.add.sprite(scorePos.x, scorePos.y, 'score-bar');
        scoreBar.anchor.setTo(0.5, 0.5);

        this.createScoreText(scorePos);

        this.add.sprite(config.gameWidth * 0.02, config.gameHeight * 0.82, 'food-bar');
        this._foodBar = this.add.sprite(config.gameWidth * 0.18, config.gameHeight * 0.845, 'bars', 0);
        this._foodBar.scale.x = 1;
        this._foodBar.anchor.setTo(0, 0.5);

        this.add.sprite(config.gameWidth * 0.03, config.gameHeight * 0.9, 'drinks-bar');
        this._drinksBar = this.add.sprite(config.gameWidth * 0.18, config.gameHeight * 0.935, 'bars', 2);
        this._drinksBar.scale.x = 1;
        this._drinksBar.anchor.setTo(0, 0.5);

        this.setDrinksBar();
        this.setFoodBar();
    }

    collideWithPlayer(player, collectible) {
        this.playerCollectedItem(collectible);
    }

    updateDrinkAmount() {
        this._drinkTimer += this.time.elapsed;
        if (this._drinkTimer > gameConfig.drinkDecrementTimeMilliSeconds) {
            this._drinkTimer = 0;

            this._drinkAmount -= gameConfig.drinkDecrementPerTimeUnit;
            if (this._drinkAmount < gameConfig.drinkMinimumAmount) {
                this._drinkAmount = gameConfig.drinkMinimumAmount;
            }

            this.setDrinksBar();
            this.setTotalScore();
        }
    }

    updateFoodAmount() {
        this._foodAmount -= gameConfig.foodDecrementPerMove;
        if (this._foodAmount < gameConfig.foodMinimumAmount) {
            this._foodAmount = gameConfig.foodMinimumAmount;
        }
        this.setFoodBar();
        this.setTotalScore();
    }

    setTotalScore() {
        this._score = this._foodAmount + this._drinkAmount;
        this._scoreText.setText(this._score);
    }

    setDrinksBar() {
        this._drinksBar.scale.x =
            (this._drinkAmount + gameConfig.drinkMaximumAmount) / this._drinkMaximumTotal;
    }

    setFoodBar() {
        this._foodBar.scale.x =
            (this._foodAmount + gameConfig.foodMaximumAmount) / this._foodMaximumTotal;
    }

    spawnCollectible() {
        this._nextSpawnTime = randomIntegerBetween(
            gameConfig.minimumSpawnTime,
            gameConfig.maximumSpawnTime
        );

        const dropPos = randomIntegerBetween(config.gameWidth * 0.05, config.gameWidth * 0.95);
        const dropOffset = 0;

        // Choose collectible type
        const foodOrDrink = randomIntegerBetween(0, 100);
        const isFood = (foodOrDrink >= 50);
        const collectibleTypeList = isFood ? collectibles.food : collectibles.drinks;

        const randomTypeIndex = randomIntegerBetween(0, collectibleTypeList.length);
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
        // this._score += points;

        // this._scoreText.setText(this._score);

        if (collectible.isFood) {
            this._foodAmount += points;

            if (this._foodAmount > gameConfig.foodMaximumAmount) {
                this._foodAmount = gameConfig.foodMaximumAmount;
            }

            this.setFoodBar();
            this.setTotalScore();
        } else {
            this._drinkAmount += points;

            if (this._drinkAmount > gameConfig.drinkMaximumAmount) {
                this._drinkAmount = gameConfig.drinkMaximumAmount;
            }

            this.setDrinksBar();
            this.setTotalScore();
        }
    }

    onCollectibleOutOfBounds(collectible) {
        collectible.kill();
    }

    createScoreText(position) {
        this._scoreText = this.add.text(position.x, position.y, '0', this._fontStyle);
        this._scoreText.font = 'dinregular';
        this._scoreText.fontSize = 40;
        this._scoreText.fill = '#111';
        this._scoreText.smoothed = false;
        this._scoreText.anchor.setTo(0.5);
    }

    render() {
        if (DEBUG_GAME) {
            this.game.debug.text(this.game.time.fps, 2, 14, '#fff');

            this._collectibleGroup.forEach((collectible) => {
                this.game.debug.body(collectible);
            });

            this.game.debug.body(this._player);
        }
    }
}
