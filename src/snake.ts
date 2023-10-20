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

type SnakeBody = {
    x: number, 
    y: number,

    next: SnakeBody | null,
    prev: SnakeBody | null
}

type Fruit = { x: number, y: number }

let isSnakeBody = (obj: any): obj is SnakeBody =>  obj && obj.x !== undefined && obj.y !== undefined && obj.next !== undefined && obj.prev !== undefined;
let isFruit = (obj: any): obj is Fruit => obj && obj.x !== undefined && obj.y !== undefined && !isSnakeBody(obj);

type GameMap = (Fruit | SnakeBody | null)[][];

let gameMap : GameMap = Array.from({length: WIDTH }, () => Array.from({length: HEIGHT}, () => null));

function buildSnake(position: {x: number, y: number} = { x: Math.floor(WIDTH/2), y: Math.floor(HEIGHT/2)}, direction: Direction = 'right') : Snake{
    
    let arr: SnakeBody[] = [];
    for(let i = 0; i < 3; i++) arr.push({x: position.x + i, y: position.y, next: null, prev: arr[i-1] || null});
    for(let i = 0; i < 3; i++) arr[i].next = arr[i+1] || null;

    return {
        head: arr[2],
        tail: arr[0],
        direction: direction,

        length: 3,
        move: function() {
    

            let newHead: SnakeBody;
            if(this.direction == "right") newHead = {x: this.head.x + 1, y: this.head.y, next: null, prev: null};
            else if(this.direction == "left") newHead = {x: this.head.x - 1, y: this.head.y, next: null, prev: null};
            else if(this.direction == "up") newHead = {x: this.head.x, y: this.head.y - 1, next: null, prev: null};
            else if(this.direction == "down") newHead = {x: this.head.x, y: this.head.y + 1, next: null, prev: null};
            else throw new Error('Invalid direction');

            
            if(isSnakeBody(gameMap[newHead.x][newHead.y])) return GAME_OVER = true;
            if(isFruit(gameMap[newHead.x][newHead.y])) {
                this.tail = { x: this.tail.x, y: this.tail.y, next: this.tail, prev: null };
                
                EXISTING_FRUITS--;
            }

            /**
             * HEAD
             */
            gameMap[newHead.x][newHead.y] = newHead; // Agrego la nueva cabeza al mapa.
            newHead.prev = this.head;
            this.head.next = newHead;
            newHead.prev = this.head;
            this.head = newHead;

            /**
             * TAIL
             */
            gameMap[this.tail.x][this.tail.y] = null; // Borro la cola vieja del mapa.
            this.tail = this.tail.next || this.tail;
            this.tail.prev = null;
 
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

let snake = buildSnake({x: 0, y:0 }, "down" );

let snakeChallenge = document.getElementById('snakeChallenge') as HTMLDivElement;

function renderSnake(){
    snake.move();
    let current: SnakeBody | null = snake.head;
    // Creo un nuevo mapa.
    while(current !== null){
        if(current.x < 0 || current.x >= WIDTH || current.y < 0 || current.y >= HEIGHT) return GAME_OVER = true;

        gameMap[current.x][current.y] = current;
        current = current.prev;
    }

}

function renderFruit(): void {
    let x = Math.floor(Math.random() * WIDTH);
    let y = Math.floor(Math.random() * HEIGHT);

    if(gameMap[x][y] !== null) return renderFruit();
    if(EXISTING_FRUITS > 0) return;

    gameMap[x][y] = {x, y};
    EXISTING_FRUITS++;
}

function renderMap(){
    snakeChallenge.innerHTML = '';
    // Basicamente recorro todo el mapa.
    renderSnake();
    renderFruit();

    if(GAME_OVER) return snakeChallenge.innerHTML = '<h1>GAME OVER</h1><h2>Press F5 to restart</h2>';
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