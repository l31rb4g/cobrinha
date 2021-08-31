
Cobrinha = new Class({
    initialize() {
        this.grid = new Grid();
    }
});

Grid = new Class({
    initialize() {
        let body = $$('body')[0];
        body.setStyles({
            'padding': 0,
            'margin': 0,
        });

        this.el = new Element('div', {
            'id': 'cobrinha',
            'styles': {
                'display': 'flex',
                'flex-wrap': 'wrap',
                'border': '1px solid #ccc',
            },
        });

        let cols = Math.floor(window.getSize().x / 36);
        let rows = Math.floor(window.getSize().y / 32);

        for (i=0; i<cols * rows; i++){
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
    }
});


window.addEvent('domready', () => {

    new Cobrinha();

});

