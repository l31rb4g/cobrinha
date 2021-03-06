
Jogo = new Class({
    score: 0,
    speed: 200,
    running: true,

    debug: false,

    initialize(container) {
        this.container = container;
        this.start();
    },

    start(){
        this.container.setStyles({
            'display': 'flex',
            'font-family': 'Roboto, Arial',
        });

        this.painel = new Painel(this);
        this.grid = new Grid(this);

        let sleep = 0;
        if (this.grid.cols >= 15 && this.grid.rows >= 15){
            this.grid.splash();
            sleep = 500;
        }

        setTimeout(() => {
            this.grid.clear();
            this.cobrinha = new Cobrinha(this);
            this.cobrinha.novoBloco();
            this.cobrinha.novoBloco();

            this.novaComida();

            $$('body')[0].setStyles({
                'overflow': 'hidden',
            });

            this.step();

        }, sleep);
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
            new GameOver(this);
        }
    },

    restart() {
        this.score = 0;
        this.speed = 200;
        this.running = true;

        this.container.empty();
        this.start();
    },
});


Grid = new Class({
    splashed: [],

    initialize(jogo) {
        this.jogo = jogo;

        this.jogo.container.setStyles({
            'padding': 0,
            'margin': 0,
            'overflow': 'hidden',
            'box-sizing': 'border-box',
        });

        let espacoDisponivel = {
            x: this.jogo.container.getSize().x - this.jogo.painel.width,
            y: this.jogo.container.getSize().y,
        }

        this.el = new Element('div', {
            'styles': {
                'display': 'flex',
                'width': espacoDisponivel.x,
                'height': espacoDisponivel.y,
                'flex-wrap': 'wrap',
                'border': '1px solid #f3f3f3',
                'box-sizing': 'border-box',
                'align-content': 'flex-start',
            },
        });

        this.cols = Math.floor((espacoDisponivel.x - 2) / 36);
        this.rows = Math.floor((espacoDisponivel.y - 2) / 32);

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

    splash() {
        let art = `
            ----PPPPP------
            ---PAAAAAP-----
            ---PAAAAAAP----
            --PAPAAAPAP----
            --PAPAAAPAVP---
            --PRAAAAARVP---
            ---PVVVVVVP----
            ----PPPPPPP----
            --PPAAPAAVPP---
            -PAAAPAAAVPVP--
            PAAPVVVVVPAVVP-
            PVAAPPPPPAAVPVP
            PVAAAAAAAAAVPVP
            -PVVVVVVVVVPPVP
            --PPPPPPPPP--P-
        `;
        let cores = {
            '-': 'transparent',
            'P': '#000',
            'A': '#95B90B',
            'V': '#009900',
            'R': '#EDC1D2',
        }

        let x = Math.floor((this.cols - 15) / 2);
        let y = Math.floor((this.rows - 15) / 2);
        let rows = art.trim().split('\n');
        let div;
        let row;

        rows.each((_row) => {
            row = _row.trim();
            for (col=0; col<row.length; col++){
                div = this.el.getElements('> div')[(y * this.cols) + x + col];
                div.setStyle('background', cores[row[col]]);
                this.splashed.push(div);
            }
            y++;
        });
    },

    clear() {
        this.splashed.each((el) => {
            el.setStyle('background', 'none');
        });
    },
});


Painel = new Class({
    width: 108,

    initialize(jogo) {
        this.jogo = jogo;
        
        this.el = new Element('div', {
            'styles': {
                'width': this.width,
                'height': this.jogo.container.getSize().y,
                'box-sizing': 'border-box',
                'background': '#eee',
                'color': '#333',
                'padding': 10,
                'font-size': 12,
            }
        }).adopt(
            new Element('div', {
                'text': 'PONTUA????O',
                'styles': {
                    'font-weight': 'bold',
                    'margin-top': 10,
                }
            }),
            new Element('div', {
                'class': 'score',
            }),
            new Element('div', {
                'text': 'VELOCIDADE',
                'styles': {
                    'font-weight': 'bold',
                    'margin-top': 20,
                }
            }),
            new Element('div', {
                'class': 'speed',
            }),
        ).inject(this.jogo.container);
        this.refresh();
    },

    milhares(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    },

    refresh() {
        this.el.getElement('.score').set('text', this.milhares(this.jogo.score));

        let velocidade = parseInt((1 - (this.jogo.speed - 30) / 170) * 100);
        if (velocidade <= 0){
            velocidade = 1;
        }
        if (velocidade > 100){
            velocidade = 100;
        }
        this.el.getElement('.speed').set('text', velocidade + '%');
    },
});


Cobrinha = new Class({
    direcao: 'right',
    blocos: [],
    fila: [],

    initialize(jogo) {
        this.jogo = jogo;

        let position = parseInt(this.jogo.grid.cols * (this.jogo.grid.rows * 0.4) + 3);
        this.blocos.push(new Bloco(this, position));

        this.addEvents();
    },

    addEvents() {
        window.addEvents({
            'keydown': (ev) => {
                if (this.fila.length > 2) return;
                
                let direcao = ev.key;
                if (direcao == 'w') direcao = 'up';
                if (direcao == 'a') direcao = 'left';
                if (direcao == 's') direcao = 'down';
                if (direcao == 'd') direcao = 'right';

                if (['up', 'down', 'left', 'right'].contains(direcao)){
                    this.fila.push(direcao);
                }
                else if (ev.key == 'k') {
                    this.novoBloco();
                }
            },
        });
    },

    novoBloco(){
        let direcao;

        if (this.blocos.length > 2){
            let u = this.blocos[this.blocos.length - 1];
            let p = this.blocos[this.blocos.length - 2];

            if ((u.position + 1) == p.position){
                direcao = 'right';
            } else if ((u.position - 1) == p.position){
                direcao = 'left';
            } else if ((u.position - this.jogo.grid.cols) == p.position){
                direcao = 'up';
            } else if ((u.position + this.jogo.grid.cols) == p.position){
                direcao = 'down';
            }
        } else {
            direcao = this.direcao;
        }

        if (direcao === 'right'){
            position = this.blocos[this.blocos.length - 1].position - 1;
        }
        else if (direcao == 'left'){
            position = this.blocos[this.blocos.length - 1].position + 1;
        }
        else if (direcao == 'up'){
            position = this.blocos[this.blocos.length - 1].position + this.jogo.grid.cols;
        }
        else if (direcao == 'down'){
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
            if (this.jogo.debug){
                return;
            }
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

        // comeu
        if (this.blocos[0].square == this.jogo.comida.square) {
            this.jogo.comida.die();
            this.novoBloco();
            this.jogo.novaComida();
            this.jogo.score += 10;
            this.jogo.painel.refresh();
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

        this.square = this.cobrinha.jogo.grid.el.getElements('> div')[this.position];

        this.el = new Element('div', {
            'styles': {
                'background': cor || '#333',
                'height': '100%',
                'margin': 0,
                'padding': 0,
                'box-sizing': 'border-box',
            }
        });

        if (this.square){
            this.el.inject(this.square);
        }
    },
});


Comida = new Class({
    square: null,

    initialize(jogo) {
        this.jogo = jogo;

        while (!this.square || this.square.getChildren().length > 0){
            this.square = this.jogo.grid.getRandomSquare();
        }

        this.el = new Element('div', {
            'id': 'ee',
            'text': 'OS',
            'styles': {
                'height': '100%',
                'color': '#fff',
                'background': '#0061ff',
                'border': '1px solid #0061ff',
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

GameOver = new Class({
    initialize(jogo) {
        this.jogo = jogo;

        /*this.overlay = new Element('div', {
            'styles': {
                'position': 'fixed',
                'width': '100%',
                'height': '100%',
                'top': 0,
                'left': 0,
                'background': '#333',
                'opacity': 0.8,
                'z-index': 4,
            }
        }).inject(this.jogo.container);*/

        this.el = new Element('div', {
            'styles': {
                'position': 'absolute',
                'width': 300,
                'height': 160,
                'background': '#fff',
                'border': '2px solid #555',
                'text-align': 'center',
                'border-radius': 10,
                'top': '50%',
                'left': '50%',
                'box-sizing': 'border-box',
                'margin-left': -150,
                'margin-top': -80,
                'z-index': 5,
            }
        }).adopt(
            new Element('h2', {
                'text': 'Fim de jogo!',
                'styles': {
                    'margin': 15,
                },
            }),
            new Element('p', {'text': 'Voc?? fez ' + this.jogo.score + ' pontos.'}),
            new Element('button', {
                'text': 'Jogar de novo',
                'styles': {
                    'display': 'block',
                    'margin': '20px auto 0',
                    'padding': '5px 10px',
                    'cursor': 'pointer',
                },
                'events': {
                    'click': () => {
                        this.jogo.restart();
                        this.die();
                    },
                },
            }),
        ).inject(this.jogo.container);
    },

    die() {
        //this.overlay.dispose();
        this.el.dispose();
    },
});
