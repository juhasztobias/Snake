// GAME CONFIGURATIONS.
let WIDTH = 50;
let HEIGHT = 30;
let REFRESH_RATE = 50; // 50ms
let GAME_OVER = false;
let EXISTING_FRUITS = 0;

type Direction = 'up' | 'down' | 'left' | 'right';

type Snake = {
    head: SnakeBody,
    tail: SnakeBody,

    length: number,
    direction: Direction,

    move(): void, // Make the snake move
    changeDirection(direction: Direction): void // Change the direction of the snake
}

type Block = {
    x: number,
    y: number,

    type: 'snake' | 'fruit'
}

type SnakeBody = Block & { type: 'snake', next: SnakeBody | null }
type Fruit = Block & { type: 'fruit' }




let isSnakeBody = (obj: any): obj is Block =>  obj && obj.type === 'snake';
let isFruit = (obj: any): obj is Block => obj && obj.type === 'fruit';

type GameMap = (Block | null)[][];

let gameMap : GameMap = Array.from({length: WIDTH }, () => Array.from({length: HEIGHT}, () => null));

function buildSnake(position: {x: number, y: number} = { x: Math.floor(WIDTH/2), y: Math.floor(HEIGHT/2)}) : Snake{
    
    let arr: SnakeBody[] = [];
    for(let i = 0; i < 3; i++){
        arr.push({ x: position.x + i, y: position.y, type: 'snake', next: null });
        gameMap[position.x + i][position.y] = arr[i];   // Agrego la serpiente al mapa.
    }
    for(let i = 0; i < 2; i++) arr[i].next = arr[i+1];


    return {
        head: arr[2],
        tail: arr[0],
        direction: 'right',

        length: 3,
        move: function() {

            let newHead: SnakeBody = { x: this.head.x, y: this.head.y, type: 'snake', next: null };
            if(this.direction == "right") newHead.x++;
            else if(this.direction == "left") newHead.x--;
            else if(this.direction == "up") newHead.y--;
            else if(this.direction == "down") newHead.y++;
            else throw new Error('Invalid direction');

            if(isSnakeBody(gameMap[newHead.x][newHead.y])) return GAME_OVER = true;
            let hasEaten = isFruit(gameMap[newHead.x][newHead.y]);
            
            /**
             * HEAD
             */
            gameMap[newHead.x][newHead.y] = newHead; // Agrego la nueva cabeza al mapa.
            this.head.next = newHead; // Actualizo la cabeza de la serpiente.
            this.head = newHead;
            
            /**
             * TAIL
             */
            if(hasEaten){
                EXISTING_FRUITS--;
            } else {
                // Si no comio, elimino la cola.
                gameMap[this.tail.x][this.tail.y] = null;
                this.tail = this.tail.next as SnakeBody;
            }
        },
        changeDirection: function(direction: Direction){ 
            if(this.direction == 'up' && direction == 'down') return;
            if(this.direction == 'down' && direction == 'up') return;
            if(this.direction == 'left' && direction == 'right') return;
            if(this.direction == 'right' && direction == 'left') return;

            this.direction = direction 
        },
    };
}

let snake = buildSnake();

let snakeChallenge = document.getElementById('snakeChallenge') as HTMLDivElement;

function createFruit(): void {
    if(EXISTING_FRUITS > 0) return;

    let x = Math.floor(Math.random() * WIDTH);
    let y = Math.floor(Math.random() * HEIGHT);

    if(gameMap[x][y] !== null) return createFruit();

    gameMap[x][y] = {x, y, type: "fruit"};
    EXISTING_FRUITS++;
}

function renderMap(){
    // Limpio la pantalla
    snakeChallenge.innerHTML = '';

    // Muevo la serpiente
    snake.move();
    // Creo una fruta, si es necesario.
    createFruit();
    
    if(GAME_OVER) return snakeChallenge.innerHTML = '<h1>GAME OVER</h1><h2>Press F5 to restart</h2>';

    // Renderizo el mapa.
    for(let i = 0; i < HEIGHT; i++){
        let row = document.createElement('div');
        row.classList.add('row');
        snakeChallenge.appendChild(row);

        for(let j = 0; j < WIDTH; j++){
            let div = document.createElement('div');
            div.classList.add('cell');
            if(isSnakeBody(gameMap[j][i])) div.classList.add('snake');
            if(isFruit(gameMap[j][i])) div.classList.add('fruit');
            row.appendChild(div);
        }
    }
}

// Renderizo el mapa cada 50ms.
setInterval(() => renderMap(), REFRESH_RATE);

document.addEventListener('keydown', (e) => {
    e.preventDefault();
    if(e.key == 'ArrowUp') snake.changeDirection('up');
    else if(e.key == 'ArrowDown') snake.changeDirection('down');
    else if(e.key == 'ArrowLeft') snake.changeDirection('left');
    else if(e.key == 'ArrowRight') snake.changeDirection('right');
});