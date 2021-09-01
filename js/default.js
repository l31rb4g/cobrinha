
Jogo = new Class({
    speed: 200,
    running: true,

    initialize(container) {
        this.container = container;
        this.grid = new Grid(this);

        this.cobrinha = new Cobrinha(this);
        this.cobrinha.novoBloco();
        this.cobrinha.novoBloco();

        this.novaComida();

        $$('body')[0].setStyles({
            'overflow': 'hidden',
            'font-family': 'Roboto, Arial',
        });

        this.step();
    },

    step(){
        this.cobrinha.step();

        if (this.running){
            setTimeout(() => {
                this.step();
            }, this.speed);
        }
    },

    novaComida() {
        this.comida = new Comida(this);
        this.speed -= 5;
        if (this.speed < 30){
            this.speed = 30;
        }
    },

    gameOver(){
        if (this.running){
            this.running = false;
            alert('GAME OVER');
        }
    },
});

Grid = new Class({
    initialize(jogo) {
        this.jogo = jogo;

        this.jogo.container.setStyles({
            'padding': 0,
            'margin': 0,
            'overflow': 'hidden',
            'box-sizing': 'border-box',
        });

        this.el = new Element('div', {
            'styles': {
                'display': 'flex',
                'flex-wrap': 'wrap',
                'border': '1px solid #f3f3f3',
                'box-sizing': 'border-box',
            },
        });

        this.cols = Math.floor(this.jogo.container.getSize().x / 36);
        this.rows = Math.floor(this.jogo.container.getSize().y / 32);

        for (i=0; i<this.cols * this.rows; i++){
            new Element('div', {
                'styles': {
                    'width': 36,
                    'height': 32,
                    'border': '1px solid #f3f3f3',
                    'box-sizing': 'border-box',
                },
            }).inject(this.el);
        }

        this.el.inject(this.jogo.container);
    },

    getRandomSquare(){
        let num = parseInt(Math.random() * this.cols * this.rows);
        return this.el.getElements('> div')[num];
    },
});

Cobrinha = new Class({
    direcao: 'right',
    blocos: [],
    fila: [],

    initialize(jogo) {
        this.jogo = jogo;

        let position = this.jogo.grid.cols * (this.jogo.grid.rows * 0.4) + 3;
        this.blocos.push(new Bloco(this, position));

        this.addEvents();
    },

    addEvents() {
        window.addEvents({
            'keydown': (ev) => {
                if (this.fila.length > 2) return;

                if (['up', 'down', 'left', 'right'].contains(ev.key)){
                    this.fila.push(ev.key);
                }
                else if (ev.key == 'k') {
                    this.novoBloco();
                }
            },
        });
    },

    novoBloco(){
        if (this.direcao === 'right'){
            position = this.blocos[this.blocos.length - 1].position - 1;
        }
        else if (this.direcao == 'left'){
            position = this.blocos[this.blocos.length - 1].position + 1;
        }
        else if (this.direcao == 'up'){
            position = this.blocos[this.blocos.length - 1].position + this.jogo.grid.cols;
        }
        else if (this.direcao == 'down'){
            position = this.blocos[this.blocos.length - 1].position - this.jogo.grid.cols;
        }

        this.blocos.push(new Bloco(this, position, '#777'));
    },

    step() {
        let colidiu = false;
        let pos = this.blocos[0].position;
        let direcao;

        if (this.fila.length > 0){

            direcao = this.fila[0];
            this.fila = this.fila.splice(1);

            if (
                    (this.direcao == 'up' && direcao == 'down') ||
                    (this.direcao == 'down' && direcao == 'up') ||
                    (this.direcao == 'left' && direcao == 'right') ||
                    (this.direcao == 'right' && direcao == 'left')
                ){
                // movimento ilegal
                direcao = this.direcao;
            } else {
                this.direcao = direcao;
            }
        } else {
            direcao = this.direcao;
        }

        if (direcao == 'up'){
            pos -= this.jogo.grid.cols;
            colidiu = (pos < 0);
        }
        else if (direcao == 'down'){
            pos += this.jogo.grid.cols;
            colidiu = (pos > (this.jogo.grid.cols * this.jogo.grid.rows) - 1);
        }
        else if (direcao == 'left'){
            pos--;
            colidiu = ((pos + 1) % this.jogo.grid.cols === 0);
        }
        else if (direcao == 'right'){
            pos++;
            colidiu = (pos % this.jogo.grid.cols === 0);
        }


        this.blocos[0].lastPosition = this.blocos[0].position
        this.blocos[0].position = pos;

        this.blocos[0].lastSquare = this.blocos[0].square
        this.blocos[0].square = this.jogo.grid.el.getElements('> div')[pos];

        if (colidiu || this.autoColisao()){
            return this.jogo.gameOver();
        }

        if (this.blocos[0].square == this.jogo.comida.square) {
            this.jogo.comida.die();
            this.novoBloco();
            this.jogo.novaComida();
        }

        this.blocos[0].el.inject(this.blocos[0].square);

        this.blocos.each((bloco, n) => {
            if (n > 0){
                this.blocos[n].lastPosition = this.blocos[n].position;
                this.blocos[n].position = this.blocos[n-1].lastPosition;

                this.blocos[n].lastSquare = this.blocos[n].square;
                this.blocos[n].square = this.blocos[n-1].lastSquare;

                this.blocos[n].el.inject(this.blocos[n].square);
            }
        });
    },

    autoColisao(){
        let ac = false;
        this.blocos.each((bloco, n) => {
            if (n > 0 && !ac){
                if (bloco.square === this.blocos[0].square){
                    ac = true;
                }
            }
        });
        return ac;
    },
});

Bloco = new Class({
    initialize(cobrinha, position, cor) {
        this.cobrinha = cobrinha;
        this.position = position;

        // crashando se for fora do grid
        this.square = this.cobrinha.jogo.grid.el.getElements('> div')[this.position];

        this.el = new Element('div', {
            'styles': {
                'background': cor || '#333',
                'height': '100%',
            }
        }).inject(this.square);

    },
});

Comida = new Class({
    initialize(jogo) {
        this.jogo = jogo;

        this.square = this.jogo.grid.getRandomSquare();

        this.el = new Element('div', {
            'id': 'ee',
            'text': 'OS',
            'styles': {
                'height': '100%',
                'color': '#fff',
                'background': '#3779C6',
                'border': '1px solid #3779C6',
                'line-height': 29,
                'text-align': 'center',
                'font-size': 11,
                'font-weight': 'bold',
            },
        }).inject(this.square);
    },

    die() {
        this.el.dispose();
    },
});

