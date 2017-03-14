/* globals __DEV__ */
import Phaser from 'phaser';
import Collectible from '../sprites/Collectible';

import config from '../config';
import collectibles from '../config/collectibles';
import {constants as faceConstants, setLastFace} from '../config/faces';

const DEBUG_GAME = false;
const gameConfig = config.rules;

const randomIntegerBetween = (min, max) => Math.floor((Math.random() * (max - min)) + min);
const calculateScale = (amount, maximum, total) => (amount + maximum) / total;
const getBarFrameNumber = (amount) => {
    if (amount > 50) {
        return 0;
    } else if (amount < 0) {
        return 2;
    }

    return 1;
};

export default class extends Phaser.State {
    init() {
        this._player = null;
        this._collectibleGroup = null;
        this._spawnTimer = 0;
        this._nextSpawnTime = 0;
        this._drinkTimer = 0;
        this._fontStyle = null;
        this._face = null;
        this._pauseMenu = null;
        this._resumeButton = null;
        this._quitButton = null;
        this._emitter = null;
        this._music = null;
        this._pauseButton = null;

        this._scoreText = null;
        this._foodBar = null;
        this._drinksBar = null;
        this._score = 0;
        this._cursors = null;
        this._facing = 'idle';
        this._foodMaximumTotal = gameConfig.foodMaximumAmount - gameConfig.foodMinimumAmount;
        this._drinkMaximumTotal = gameConfig.drinkMaximumAmount - gameConfig.drinkMinimumAmount;
        this._foodAmount = 250;
        this._drinkAmount = 250;
        this._foodSound = null;
        this._drinkSound = null;
    }

    create() {
        this.game.time.advancedTiming = true;
        this.physics.startSystem(Phaser.Physics.ARCADE);

        this.physics.arcade.gravity.y = config.gravity;

        this.add.sprite(0, 0, 'background-game');
        this._pauseButton = this.add.button(
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

        this.initialiseParticleEmitter();
        this.initialiseUi();
        this.initialisePauseMenu();

        this.setDrinksBar();
        this.setFoodBar();
        this.setTotalScore();

        this.initialiseSound();
    }

    initialisePauseMenu() {
        this._pauseMenu = this.add.group();
        const background = this.add.sprite(0, 0, 'black-background');
        background.scale = {x: 17, y: 26};

        const fontStyle = {
            font: '100px eraserregular',
            fill: '#fff',
            align: 'center'
        };

        const pausedText = this.add.text(config.gameWidth * 0.5, config.gameHeight * 0.15, 'GAME PAUSED', fontStyle);
        pausedText.anchor.setTo(0.5);

        this._resumeButton = this.add.button(
            config.gameWidth * 0.5,
            config.gameHeight * 0.35,
            'resume-button',
            null,
            null,
            1,
            0
        );
        this._resumeButton.anchor.setTo(0.5);

        this._quitButton = this.add.button(
            config.gameWidth * 0.5,
            config.gameHeight * 0.8,
            'quit-button',
            null,
            null,
            1,
            0
        );
        this._quitButton.anchor.setTo(0.5);

        this._pauseMenu.add(background);
        this._pauseMenu.add(pausedText);
        this._pauseMenu.add(this._resumeButton);
        this._pauseMenu.add(this._quitButton);
        this._pauseMenu.visible = false;
    }

    managePause() {
        this.game.paused = true;
        this._pauseMenu.visible = true;

        // Phaser stops updateding all subsystems on game.paused so buttons don't function
        // as expected, hence this hack to check bounds. Short on time! :)
        this.input.onDown.add(() => {
            if (this.game.paused) {
                const {x: inputX, y: inputY} = this.game.input;

                if (this._resumeButton.getBounds().contains(inputX, inputY)) {
                    this._pauseMenu.visible = false;
                    this.game.paused = false;
                }

                if (this._quitButton.getBounds().contains(inputX, inputY)) {
                    this._pauseMenu.visible = false;
                    this.game.paused = false;

                    this.stopMusic();
                    this.state.start('MainMenu');
                }
            }
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

    updateFace() {
        const foodDifference = this._foodAmount - this._drinkAmount;
        const drinkDifference = this._drinkAmount - this._foodAmount;
        let newFace = faceConstants.FACE_NEUTRAL;

        if (foodDifference > 200) {
            newFace = faceConstants.FACE_SICK;
        } else if (foodDifference > 100) {
            newFace = faceConstants.FACE_GLUTTONOUS;
        } else if (foodDifference > 50) {
            newFace = faceConstants.FACE_GOURMAND;
        }

        if (drinkDifference > 200) {
            newFace = faceConstants.FACE_HAMMERED;
        } else if (drinkDifference > 100) {
            newFace = faceConstants.FACE_DRUNK;
        } else if (drinkDifference > 50) {
            newFace = faceConstants.FACE_MERRY;
        }

        if ((drinkDifference <= 50) && (foodDifference <= 50)) {
            if (this._score > 200) {
                newFace = faceConstants.FACE_LAUGHING;
            } else if (this._score > 100) {
                newFace = faceConstants.FACE_CHEERFUL;
            } else if (this._score > 50) {
                newFace = faceConstants.FACE_HAPPY;
            } else if (this._score < -200) {
                newFace = faceConstants.FACE_ANGRY;
            } else if (this._score < -100) {
                newFace = faceConstants.FACE_ANNOYED;
            } else if (this.score < -50) {
                newFace = faceConstants.FACE_BORED;
            }
        }

        this.setFace(newFace);
    }

    setFace(faceFrame) {
        if (faceFrame !== this._face.frame) {
            this._face.frame = faceFrame;
        }
        setLastFace(faceFrame);
    }

    isGameOver() {
        const noDrinkPoints = (this._drinkAmount <= gameConfig.drinkMinimumAmount);
        const noFoodPoints = (this._foodAmount <= gameConfig.foodMinimumAmount);

        // TODO - REMOVE: DEBUG
        if (this._cursors.up.isDown) {
            return true;
        }

        return noDrinkPoints || noFoodPoints;
    }

    showGameOver() {
        this.stopMusic();
        this.state.start('GameOver');
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
        this.setFace(faceConstants.FACE_NEUTRAL);

        const scorePos = {
            x: faceBg.x,
            y: faceBg.y + 130
        };
        const scoreBar = this.add.sprite(scorePos.x, scorePos.y, 'score-bar');
        scoreBar.anchor.setTo(0.5, 0.5);

        this.createScoreText(scorePos);

        const foodBarPos = {x: config.gameWidth * 0.02, y: config.gameHeight * 0.84};
        const foodBarBackground = this.add.sprite(foodBarPos.x, foodBarPos.y, 'food-bar');
        foodBarBackground.anchor.setTo(0, 0.5);
        this._foodBar = this.add.sprite(foodBarPos.x + 161, foodBarPos.y - 5, 'bars', 1);
        this._foodBar.anchor.setTo(0, 0.5);
        this._foodBar.scale.x = 1;

        const drinksBarPos = {x: config.gameWidth * 0.025, y: config.gameHeight * 0.94};
        const drinksBarBackground = this.add.sprite(drinksBarPos.x, drinksBarPos.y, 'drinks-bar');
        drinksBarBackground.anchor.setTo(0, 0.5);
        this._drinksBar = this.add.sprite(drinksBarPos.x + 154, drinksBarPos.y - 6, 'bars', 1);
        this._drinksBar.anchor.setTo(0, 0.5);
        this._drinksBar.scale.x = 1;

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
        this._drinksBar.scale.x = calculateScale(
            this._drinkAmount,
            gameConfig.drinkMaximumAmount,
            this._drinkMaximumTotal
        );
        this._drinksBar.frame = getBarFrameNumber(this._drinkAmount);
    }

    setFoodBar() {
        this._foodBar.scale.x = calculateScale(
            this._foodAmount,
            gameConfig.foodMaximumAmount,
            this._foodMaximumTotal
        );
        this._foodBar.frame = getBarFrameNumber(this._foodAmount);
    }

    spawnCollectible() {
        this._nextSpawnTime = randomIntegerBetween(
            gameConfig.minimumSpawnTime,
            gameConfig.maximumSpawnTime
        );

        const dropPos = randomIntegerBetween(config.gameWidth * 0.05, config.gameWidth * 0.95);
        const dropOffset = 0;

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

        const {x, y} = this._player.position;
        this.triggerEatParticles(x, y + config.player.mouthOffset);

        if (collectible.isFood) {
            this._foodAmount += points;

            if (this._foodAmount > gameConfig.foodMaximumAmount) {
                this._foodAmount = gameConfig.foodMaximumAmount;
            }

            this.setFoodBar();
            this.setTotalScore();
            this._foodSound.play();
        } else {
            this._drinkAmount += points;

            if (this._drinkAmount > gameConfig.drinkMaximumAmount) {
                this._drinkAmount = gameConfig.drinkMaximumAmount;
            }

            this.setDrinksBar();
            this.setTotalScore();
            this._drinkSound.play();
        }
    }

    onCollectibleOutOfBounds(collectible) {
        collectible.kill();
    }

    createScoreText(position) {
        const fontStyle = {
            font: '40px dinregular',
            fill: '#111',
            align: 'center'
        };

        this._scoreText = this.add.text(position.x, position.y, '0', fontStyle);
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

    initialiseParticleEmitter() {
        this._emitter = this.game.add.emitter(0, 0, 100);

        this._emitter.makeParticles('spit');
    }

    triggerEatParticles(x, y) {
        this._emitter.x = x;
        this._emitter.y = y;

        this._emitter.start(true, 1000, null, 5);
    }

    initialiseSound() {
        this._music = this.game.add.audio('main-music');
        this._music.loop = true;
        this._foodSound = this.game.add.audio('food');
        this._drinkSound = this.game.add.audio('drink');

        const sounds = [this._music, this._foodSound, this._drinkSound];
        this.game.sound.setDecodedCallback(sounds, this.soundLoaded, this);
    }

    soundLoaded() {
        this._music.play();
    }

    stopMusic() {
        this._music.stop();
    }
}
