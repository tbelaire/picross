
// localStorage save format versioning
var saveVersion = '2019.08.03';

class PuzzleModel extends Backbone.Model {

    defaults() {
        return {
            dimensionWidth: 10,		// default dimension width
            dimensionHeight: 10,	// default dimension height
            solution: [],
            state: [],
            hintsX: [],
            hintsY: [],
            mistakes: 0,
            guessed: 0,
            total: 100,
            complete: false,
            seed: 0,
            darkMode: false,
            easyMode: true	// show crossouts
        };
    }

    initialize() {
        this.on('change', this.save);
    }

    save(attributes?: Partial<any>, options?: Backbone.ModelSaveOptions): any {
        if(localStorageSupport()) {
            localStorage['picross.saveVersion'] = saveVersion;

            localStorage['picross.dimensionWidth'] = JSON.stringify(this.get('dimensionWidth'));
            localStorage['picross.dimensionHeight'] = JSON.stringify(this.get('dimensionHeight'));
            localStorage['picross.solution'] = JSON.stringify(this.get('solution'));
            localStorage['picross.state'] = JSON.stringify(this.get('state'));
            localStorage['picross.hintsX'] = JSON.stringify(this.get('hintsX'));
            localStorage['picross.hintsY'] = JSON.stringify(this.get('hintsY'));
            localStorage['picross.mistakes'] = JSON.stringify(this.get('mistakes'));
            localStorage['picross.guessed'] = JSON.stringify(this.get('guessed'));
            localStorage['picross.total'] = JSON.stringify(this.get('total'));
            localStorage['picross.complete'] = JSON.stringify(this.get('complete'));
            localStorage['picross.seed'] = JSON.stringify(this.get('seed'));
            localStorage['picross.darkMode'] = JSON.stringify(this.get('darkMode'));
            localStorage['picross.easyMode'] = JSON.stringify(this.get('easyMode'));
        }
        return false;
    }

    resume() {

        if(!localStorageSupport() || localStorage['picross.saveVersion'] != saveVersion) {
            this.reset();
            return;
        }

        var dimensionWidth = JSON.parse(localStorage['picross.dimensionWidth']);
        var dimensionHeight = JSON.parse(localStorage['picross.dimensionHeight']);
        var solution = JSON.parse(localStorage['picross.solution']);
        var state = JSON.parse(localStorage['picross.state']);
        var hintsX = JSON.parse(localStorage['picross.hintsX']);
        var hintsY = JSON.parse(localStorage['picross.hintsY']);
        var mistakes = JSON.parse(localStorage['picross.mistakes']);
        var guessed = JSON.parse(localStorage['picross.guessed']);
        var total = JSON.parse(localStorage['picross.total']);
        var complete = JSON.parse(localStorage['picross.complete']);
        var seed = JSON.parse(localStorage['picross.seed']);
        var darkMode = JSON.parse(localStorage['picross.darkMode']);
        var easyMode = JSON.parse(localStorage['picross.easyMode']);

        this.set({
            dimensionWidth: dimensionWidth,
            dimensionHeight: dimensionHeight,
            solution: solution,
            state: state,
            hintsX: hintsX,
            hintsY: hintsY,
            mistakes: mistakes,
            guessed: guessed,
            total: total,
            complete: complete,
            seed: seed,
            darkMode: darkMode,
            easyMode: easyMode
        });
    }

    reset(customSeed?: any) {

        var seed = customSeed;
        if(seed === undefined) {
            seed = '' + new Date().getTime();
        }
        (Math as any).seedrandom(seed);

        var solution = [];
        var state = [];
        var total = 0;

        for(var i = 0; i < this.get('dimensionHeight'); i++) {
            solution[i] = [];
            state[i] = [];
            for(var j = 0; j < this.get('dimensionWidth'); j++) {
                var random = Math.ceil(Math.random() * 2);
                solution[i][j] = random;
                total += (random - 1);
                state[i][j] = 0;
            }
        }

        var hintsX = [];
        var hintsY = [];

        for(var i = 0; i < this.get('dimensionHeight'); i++) {
            var streak = 0;
            hintsX[i] = [];
            for(var j = 0; j < this.get('dimensionWidth'); j++) {
                if(solution[i][j] === 1) {
                    if(streak > 0) {
                        hintsX[i].push(streak);
                    }
                    streak = 0;
                }
                else {
                    streak++;
                }
            }
            if(streak > 0) {
                hintsX[i].push(streak);
            }
        }

        for(var j = 0; j < this.get('dimensionWidth'); j++) {
            var streak = 0;
            hintsY[j] = [];
            for(var i = 0; i < this.get('dimensionHeight'); i++) {
                if(solution[i][j] === 1) {
                    if(streak > 0) {
                        hintsY[j].push(streak);
                    }
                    streak = 0;
                }
                else {
                    streak++;
                }
            }
            if(streak > 0) {
                hintsY[j].push(streak);
            }
        }

        this.set({
            solution: solution,
            state: state,
            hintsX: hintsX,
            hintsY: hintsY,
            mistakes: 0,
            guessed: 0,
            total: total,
            complete: false,
            seed: seed
        }, {silent: true});
        this.trigger('change');
    }

    guess(x, y, guess) {
        var solution = this.get('solution')[x][y];
        var state = this.get('state');
        var hintsX = this.get('hintsX');
        var hintsY = this.get('hintsY');
        var mistakes = this.get('mistakes');
        var guessed = this.get('guessed');

        if(state[x][y] != 0) {
            // already guessed
            return;
        }

        if(solution === guess) {
            state[x][y] = guess;
        } else {
            state[x][y] = solution * -1;
            mistakes++;
        }

        if(solution === 2) {
            guessed++;
        }

        // cross out x -- left
        var tracker = 0;
        for(var i = 0; i < hintsX[x].length; i++) {
            while(Math.abs(state[x][tracker]) === 1) {
                tracker++;
            }
            if(state[x][tracker] === 0) {
                break;
            }
            var streak = hintsX[x][i];
            if(streak < 0) {
                tracker += Math.abs(streak);
                continue;
            }
            for(var j = 1; j <= streak; j++) {
                if(Math.abs(state[x][tracker]) === 2) {
                    tracker++;
                    if(j === streak && (tracker === state[0].length || Math.abs(state[x][tracker]) === 1)) {
                        hintsX[x][i] = streak * -1;
                    }
                } else {
                    break;
                }
            }
        }
        // cross out x -- right
        tracker = state[0].length - 1;
        for(var i = hintsX[x].length - 1; i >= 0; i--) {
            while(Math.abs(state[x][tracker]) === 1) {
                tracker--;
            }
            if(state[x][tracker] === 0) {
                break;
            }
            var streak = hintsX[x][i];
            if(streak < 0) {
                tracker -= Math.abs(streak);
                continue;
            }
            for(var j = 1; j <= streak; j++) {
                if(Math.abs(state[x][tracker]) === 2) {
                    tracker--;
                    if(j === streak && (tracker === -1 || Math.abs(state[x][tracker]) === 1)) {
                        hintsX[x][i] = streak * -1;
                    }
                } else {
                    break;
                }
            }
        }
        // cross out y -- top
        tracker = 0;
        for(var i = 0; i < hintsY[y].length; i++) {
            while(Math.abs(state[tracker][y]) === 1) {
                tracker++;
            }
            if(state[tracker][y] === 0) {
                break;
            }
            var streak = hintsY[y][i];
            if(streak < 0) {
                tracker += Math.abs(streak);
                continue;
            }
            for(var j = 1; j <= streak; j++) {
                if(Math.abs(state[tracker][y]) === 2) {
                    tracker++;
                    if(j === streak && (tracker === state.length || Math.abs(state[tracker][y]) === 1)) {
                        hintsY[y][i] = streak * -1;
                    }
                } else {
                    break;
                }
            }
        }
        // cross out y -- bottom
        tracker = state.length - 1;
        for(var i = hintsY[y].length - 1; i >= 0; i--) {
            while(Math.abs(state[tracker][y]) === 1) {
                tracker--;
            }
            if(state[tracker][y] === 0) {
                break;
            }
            var streak = hintsY[y][i];
            if(streak < 0) {
                tracker -= Math.abs(streak);
                continue;
            }
            for(var j = 1; j <= streak; j++) {
                if(Math.abs(state[tracker][y]) === 2) {
                    tracker--;
                    if(j === streak && (tracker === -1 || Math.abs(state[tracker][y]) === 1)) {
                        hintsY[y][i] = streak * -1;
                    }
                } else {
                    break;
                }
            }
        }

        this.set({
            state: state,
            hintsX: hintsX,
            hintsY: hintsY,
            mistakes: mistakes,
            guessed: guessed
        }, {silent: true});
        this.trigger('change');
    }
}