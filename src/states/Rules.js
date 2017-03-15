import Phaser from 'phaser';
import config from '../config';
import {constants as faceConstants} from '../config/faces';

export default class extends Phaser.State {
    create() {
        this.stage.backgroundColor = '#222';
        const fontStyle = {
            font: '100px eraserregular',
            fill: '#fff',
            align: 'center'
        };

        const gameOverText = this.add.text(config.gameWidth * 0.5, config.gameHeight * 0.1, 'RULES', fontStyle);
        gameOverText.anchor.setTo(0.5);

        this.add.button(
            config.gameWidth * 0.85,
            config.gameHeight * 0.02,
            'close-button',
            this.closeButton,
            this,
            1,
            0
        );

        const page1 = this.createPage1();
        const page2 = this.createPage2();
        const page3 = this.createPage3();
        this._pages = [page1, page2, page3];

        this._currentPage = 0;
        this.showPage(this._currentPage, true);
    }

    closeButton() {
        this.state.start('MainMenu');
    }

    createTitleText(title) {
        const fontStyle = {
            font: '60px dinregular',
            fill: '#fff',
            align: 'center',
            wordWrap: true,
            wordWrapWidth: config.gameWidth * 0.9
        };

        const text = this.add.text(
            config.gameWidth * 0.5,
            config.gameHeight * 0.2,
            title,
            fontStyle
        );
        text.anchor.setTo(0.5);

        return text;
    }

    createText(x, y, content, align = 'center', wordWrapWidth = config.gameWidth * 0.9, font) {
        const fontStyle = {
            font: font || '40px dinregular',
            fill: '#fff',
            align,
            wordWrap: true,
            wordWrapWidth
        };

        const text = this.add.text(
            x,
            y,
            content,
            fontStyle
        );

        return text;
    }

    createCenteredText(x, y, content, align = 'center', wordWrapWidth = config.gameWidth * 0.9, font) {
        console.log(font);
        const text = this.createText(x, y, content, align, wordWrapWidth, font);
        text.anchor.setTo(0.5);
        return text;
    }

    showPage(pageIndex, show) {
        this._pages[pageIndex].visible = show;
    }

    nextButtonPressed() {
        this.showPage(this._currentPage, false);
        this._currentPage += 1;
        this.showPage(this._currentPage, true);
    }

    previousButtonPressed() {
        this.showPage(this._currentPage, false);
        this._currentPage -= 1;
        this.showPage(this._currentPage, true);
    }

    createNextButton() {
        const button = this.add.button(
            config.gameWidth * 0.75,
            config.gameHeight * 0.94,
            'next-button',
            this.nextButtonPressed,
            this,
            0,
            1
        );
        button.anchor.setTo(0.5);

        return button;
    }

    createPreviousButton() {
        const button = this.add.button(
            config.gameWidth * 0.25,
            config.gameHeight * 0.94,
            'previous-button',
            this.previousButtonPressed,
            this,
            0,
            1
        );
        button.anchor.setTo(0.5);

        return button;
    }

    createSprite(x, y, asset) {
        const sprite = this.add.sprite(x, y, asset);
        return sprite;
    }

    createFaceSprite(x, y, frameNumber, scale = 2) {
        const faceSprite = this.createSprite(x, y, 'faces');
        faceSprite.scale = {x: scale, y: scale};
        faceSprite.frame = frameNumber;

        return faceSprite;
    }

    createPage1() {
        const page = this.add.group();
        const xPos = config.gameWidth * 0.1;

        page.add(this.createTitleText('Help Tom have the time of his life!'));
        page.add(this.createText(xPos, config.gameHeight * 0.25, 'Move Tom left and right to catch the food and drink.'));

        const controlsScreenshot = this.createSprite(
            config.gameWidth * 0.5,
            config.gameHeight * 0.53,
            'controls-screenshot'
        );
        controlsScreenshot.anchor.setTo(0.5);
        page.add(controlsScreenshot);

        page.add(this.createText(xPos, config.gameHeight * 0.78, 'Keep Tom going and party all night by balancing his food and drink intake.'));
        page.add(this.createNextButton());
        page.visible = false;

        return page;
    }

    createPage2() {
        const page = this.add.group();
        const leftColumnX = config.gameWidth * 0.1;
        const rightColumnX = config.gameWidth * 0.49;

        page.add(this.createTitleText('Did you believe it was easy to keep a Robinson Happy?'));
        page.add(this.createText(leftColumnX, config.gameHeight * 0.3, 'If Tom drinks more than he eats, controlling him becomes harder as he gets drunk.', 'left', config.gameWidth * 0.5));
        page.add(this.createText(leftColumnX, config.gameHeight * 0.43, 'The game is over when he\'s totally pissed.', 'left', config.gameWidth * 0.5));
        page.add(this.createFaceSprite(
            config.gameWidth * 0.6,
            config.gameHeight * 0.3,
            faceConstants.FACE_HAMMERED
        ));

        page.add(this.createText(rightColumnX, config.gameHeight * 0.6, 'If Tom eats more than he drinks, controlling him becomes harder as he gets fat.', 'left', config.gameWidth * 0.5));
        page.add(this.createText(rightColumnX, config.gameHeight * 0.76, 'The game is over when he\'s too fat to move.', 'left', config.gameWidth * 0.5));
        page.add(this.createFaceSprite(
            config.gameWidth * 0.03,
            config.gameHeight * 0.55,
            faceConstants.FACE_SICK
        ));

        page.add(this.createPreviousButton());
        page.add(this.createNextButton());
        page.visible = false;

        return page;
    }

    createPage3() {
        const page = this.add.group();
        const xPos = config.gameWidth * 0.1;

        page.add(this.createText(xPos, config.gameHeight * 0.2, 'Keep in mind that, as time goes by, the effect of alcohol tends to disappear.', 'left'));
        const foodBar = this.createSprite(
            config.gameWidth * 0.5,
            config.gameHeight * 0.31,
            'rules-bar-food'
        );
        foodBar.anchor.setTo(0.5);
        page.add(foodBar);

        page.add(this.createText(xPos, config.gameHeight * 0.38, 'Also, the more you make him move left and right, the more calories he burns.', 'left'));
        const drinksBar = this.createSprite(
            config.gameWidth * 0.5,
            config.gameHeight * 0.51,
            'rules-bar-drinks'
        );
        drinksBar.anchor.setTo(0.5);
        page.add(drinksBar);

        page.add(this.createCenteredText(config.gameWidth * 0.5, config.gameHeight * 0.6, 'A bored and tired Tom is an unhappy Tom.'));
        page.add(this.createCenteredText(
            config.gameWidth * 0.5,
            config.gameHeight * 0.68,
            'Don\'t let him call it a night too early!',
            'center',
            config.gameWidth * 0.9,
            '50px dinregular'
        ));

        const faceSprites = [
            {frame: faceConstants.FACE_BORED, xPos: 0.25},
            {frame: faceConstants.FACE_ANNOYED, xPos: 0.5},
            {frame: faceConstants.FACE_ANGRY, xPos: 0.75}
        ];

        faceSprites.forEach((faceData) => {
            const face = this.createFaceSprite(
                config.gameWidth * faceData.xPos,
                config.gameHeight * 0.8,
                faceData.frame,
                1
            );
            face.anchor.setTo(0.5);
            page.add(face);
        });

        page.add(this.createPreviousButton());
        page.visible = false;

        return page;
    }
}
