
Jogo = new Class({
    speed: 250,
    running: true,

    initialize() {
        this.grid = new Grid(this);
        this.cobrinha = new Cobrinha(this);

        this.intervalSpeed = setInterval(() => {
            this.speed -= 10;
            if (this.speed < 30){
                this.speed = 30;
                clearInterval(this.intervalSpeed);
            }
        }, 5000);

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

    gameOver(){
        this.running = false;
        clearInterval(this.intervalSpeed);
        alert('GAME OVER');
    },
});

Grid = new Class({
    initialize(jogo) {
        this.jogo = jogo;

        let body = $$('body')[0];
        body.setStyles({
            'padding': 0,
            'margin': 0,
            'overflow': 'hidden',
        });

        this.el = new Element('div', {
            'styles': {
                'display': 'flex',
                'flex-wrap': 'wrap',
                'border': '1px solid #ccc',
            },
        });

        this.cols = Math.floor(window.getSize().x / 36);
        this.rows = Math.floor(window.getSize().y / 32);

        for (i=0; i<this.cols * this.rows; i++){
            new Element('div', {
                'styles': {
                    'width': 36,
                    'height': 32,
                    'border': '1px solid #ccc',
                    'box-sizing': 'border-box',
                },
            }).inject(this.el);
        }

        this.el.inject(body);
    },
});

Cobrinha = new Class({
    direcao: 'right',
    blocos: [],

    initialize(jogo) {
        this.jogo = jogo;

        //let randomPosition = parseInt(Math.random() * (this.jogo.grid.cols * this.jogo.grid.rows));
        let position = 245;
        this.blocos.push(new Bloco(this, position));

        window.addEvents({
            'keydown': (ev) => {
                if (ev.key === 'up'){
                    if (this.direcao != 'down'){
                        this.direcao = 'up';
                    }
                } else if (ev.key == 'down'){
                    if (this.direcao != 'up'){
                        this.direcao = 'down';
                    }
                } else if (ev.key == 'left'){
                    if (this.direcao != 'right'){
                        this.direcao = 'left';
                    }
                } else if (ev.key == 'right'){
                    if (this.direcao != 'left'){
                        this.direcao = 'right';
                    }
                } else if (ev.key == 'k') {
                    this.novoBloco();
                }
            },
        });
    },

    novoBloco(){
        position = this.blocos[this.blocos.length - 1].position - 1;
        this.blocos.push(new Bloco(this, position, '#777'));
    },

    step() {
        let colidiu = false;
        let pos = this.blocos[0].position;

        if (this.direcao == 'up'){
            pos -= this.jogo.grid.cols;
            colidiu = (pos < 0);
        }
        else if (this.direcao == 'down'){
            pos += this.jogo.grid.cols;
            colidiu = (pos > (this.jogo.grid.cols * this.jogo.grid.rows) - 1);
        }
        else if (this.direcao == 'left'){
            pos--;
            colidiu = ((pos + 1) % this.jogo.grid.cols === 0);
        }
        else if (this.direcao == 'right'){
            pos++;
            colidiu = (pos % this.jogo.grid.cols === 0);
        }

        if (colidiu){
            return this.jogo.gameOver();
        }

        this.blocos[0].lastPosition = this.blocos[0].position
        this.blocos[0].position = pos;

        this.blocos[0].lastSquare = this.blocos[0].square
        this.blocos[0].square = this.jogo.grid.el.getElements('> div')[pos];

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
});

Bloco = new Class({
    initialize(cobrinha, position, cor) {
        this.cobrinha = cobrinha;
        this.position = position;

        this.square = this.cobrinha.jogo.grid.el.getElements('> div')[this.position];

        this.el = new Element('div', {
            'styles': {
                'background': cor || '#333',
                'height': '100%',
            }
        }).inject(this.square);

    },
});


window.addEvent('domready', () => {
    new Jogo();
});

