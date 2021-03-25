
// localStorage save format versioning
let saveVersion = '2019.08.03';

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

        let dimensionWidth = JSON.parse(localStorage['picross.dimensionWidth']);
        let dimensionHeight = JSON.parse(localStorage['picross.dimensionHeight']);
        let solution = JSON.parse(localStorage['picross.solution']);
        let state = JSON.parse(localStorage['picross.state']);
        let hintsX = JSON.parse(localStorage['picross.hintsX']);
        let hintsY = JSON.parse(localStorage['picross.hintsY']);
        let mistakes = JSON.parse(localStorage['picross.mistakes']);
        let guessed = JSON.parse(localStorage['picross.guessed']);
        let total = JSON.parse(localStorage['picross.total']);
        let complete = JSON.parse(localStorage['picross.complete']);
        let seed = JSON.parse(localStorage['picross.seed']);
        let darkMode = JSON.parse(localStorage['picross.darkMode']);
        let easyMode = JSON.parse(localStorage['picross.easyMode']);

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

        let seed = customSeed;
        if(seed === undefined) {
            seed = '' + new Date().getTime();
        }
        (Math as any).seedrandom(seed);

        let solution = [];
        let state = [];
        let total = 0;

        for(let i = 0; i < this.get('dimensionHeight'); i++) {
            solution[i] = [];
            state[i] = [];
            for(let j = 0; j < this.get('dimensionWidth'); j++) {
                let random = Math.ceil(Math.random() * 2);
                solution[i][j] = random;
                total += (random - 1);
                state[i][j] = 0;
            }
        }

        let hintsX = [];
        let hintsY = [];

        for(let i = 0; i < this.get('dimensionHeight'); i++) {
            let streak = 0;
            hintsX[i] = [];
            for(let j = 0; j < this.get('dimensionWidth'); j++) {
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

        for(let j = 0; j < this.get('dimensionWidth'); j++) {
            let streak = 0;
            hintsY[j] = [];
            for(let i = 0; i < this.get('dimensionHeight'); i++) {
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
        let solution = this.get('solution')[x][y];
        let state = this.get('state');
        let hintsX = this.get('hintsX');
        let hintsY = this.get('hintsY');
        let mistakes = this.get('mistakes');
        let guessed = this.get('guessed');

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
        let tracker = 0;
        for(let i = 0; i < hintsX[x].length; i++) {
            while(Math.abs(state[x][tracker]) === 1) {
                tracker++;
            }
            if(state[x][tracker] === 0) {
                break;
            }
            let streak = hintsX[x][i];
            if(streak < 0) {
                tracker += Math.abs(streak);
                continue;
            }
            for(let j = 1; j <= streak; j++) {
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
        for(let i = hintsX[x].length - 1; i >= 0; i--) {
            while(Math.abs(state[x][tracker]) === 1) {
                tracker--;
            }
            if(state[x][tracker] === 0) {
                break;
            }
            let streak = hintsX[x][i];
            if(streak < 0) {
                tracker -= Math.abs(streak);
                continue;
            }
            for(let j = 1; j <= streak; j++) {
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
        for(let i = 0; i < hintsY[y].length; i++) {
            while(Math.abs(state[tracker][y]) === 1) {
                tracker++;
            }
            if(state[tracker][y] === 0) {
                break;
            }
            let streak = hintsY[y][i];
            if(streak < 0) {
                tracker += Math.abs(streak);
                continue;
            }
            for(let j = 1; j <= streak; j++) {
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
        for(let i = hintsY[y].length - 1; i >= 0; i--) {
            while(Math.abs(state[tracker][y]) === 1) {
                tracker--;
            }
            if(state[tracker][y] === 0) {
                break;
            }
            let streak = hintsY[y][i];
            if(streak < 0) {
                tracker -= Math.abs(streak);
                continue;
            }
            for(let j = 1; j <= streak; j++) {
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

function localStorageSupport() {
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	} catch (e) {
		return false;
	}
}