const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    backgroundColor: '#1abc9c'
};

const game = new Phaser.Game(config);

let snake, food, cursors;
let score = 0;
let scoreText;
const GRID_SIZE = 20;

function preload() {
    this.load.image('food', 'https://labs.phaser.io/assets/sprites/apple.png');
    this.load.image('snake', 'https://opengameart.org/sites/default/files/square.png');
}

function create() {
    const Food = new Phaser.Class({
        Extends: Phaser.GameObjects.Image,
        initialize: function Food(scene, x, y) {
            Phaser.GameObjects.Image.call(this, scene, x, y, 'food');
            this.total = 0;
            this.setScale(0.5);
            scene.physics.add.existing(this);
            scene.children.add(this);
        },
        spawn: function() {
            const x = Phaser.Math.Between(1, 39) * GRID_SIZE;
            const y = Phaser.Math.Between(1, 29) * GRID_SIZE;
            this.setPosition(x, y);
        }
    });

    const Snake = new Phaser.Class({
        initialize: function Snake(scene) {
            this.scene = scene;
            this.body = [];
            this.head = null;
            this.speed = 200;
            this.moveTime = 0;
            this.tail = [];
            this.direction = 'RIGHT';
        },

        update: function(time) {
            if (time >= this.moveTime) {
                return this.move(time);
            }
        },

        move: function(time) {
            this.moveTime = time + this.speed;

            // Move tail segments
            if (this.tail.length > 0) {
                for (let i = this.tail.length - 1; i > 0; i--) {
                    this.tail[i].x = this.tail[i - 1].x;
                    this.tail[i].y = this.tail[i - 1].y;
                }
                this.tail[0].x = this.head.x;
                this.tail[0].y = this.head.y;
            }

            // Change direction based on WASD keys
            if (cursors.left.isDown && this.direction !== 'RIGHT') {
                this.direction = 'LEFT';
            } else if (cursors.right.isDown && this.direction !== 'LEFT') {
                this.direction = 'RIGHT';
            } else if (cursors.up.isDown && this.direction !== 'DOWN') {
                this.direction = 'UP';
            } else if (cursors.down.isDown && this.direction !== 'UP') {
                this.direction = 'DOWN';
            }

            // Move head based on current direction
            switch(this.direction) {
                case 'LEFT':
                    this.head.x -= GRID_SIZE;
                    break;
                case 'RIGHT':
                    this.head.x += GRID_SIZE;
                    break;
                case 'UP':
                    this.head.y -= GRID_SIZE;
                    break;
                case 'DOWN':
                    this.head.y += GRID_SIZE;
                    break;
            }
        },

        grow: function() {
            const newPart = this.scene.add.rectangle(
                this.head.x, 
                this.head.y, 
                GRID_SIZE, 
                GRID_SIZE, 
                0x00ff00
            );
            this.scene.physics.add.existing(newPart);
            this.tail.push(newPart);
        },

        hitBorder: function() {
            const head = this.head;
            return (
                head.x < 0 || 
                head.x >= this.scene.game.config.width || 
                head.y < 0 || 
                head.y >= this.scene.game.config.height
            );
        }
    });

    snake = new Snake(this);
    
    snake.head = this.add.rectangle(
        20 * Math.floor(config.width / (2 * GRID_SIZE)), 
        20 * Math.floor(config.height / (2 * GRID_SIZE)), 
        GRID_SIZE, 
        GRID_SIZE, 
        0x00ff00
    );
    this.physics.add.existing(snake.head);
    snake.head.body.setCollideWorldBounds(true);

    food = new Food(this, 100, 200);
food.spawn();

    cursors = {
        up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    this.physics.add.overlap(snake.head, food, function() {
        food.spawn();
        snake.grow();
        score += 10;
        document.getElementById('score').textContent = score;
    }, null, this);

    scoreText = this.add.text(16, 16, 'Score: 0', { 
        fontSize: '32px', 
        fill: '#fff' 
    });
}

function update(time) {
    snake.update(time);

    if (snake.hitBorder()) {
        this.scene.restart();
        score = 0;
        document.getElementById('score').textContent = score;
    }
}
