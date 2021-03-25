interface Store {
    save(gamestate: GameState): void;
    /** Returns null if the saveVersion is mismatched or no game is saved. */
    load(): GameState | null;
}


// localStorage save format versioning
let saveVersion = '2019.08.03';

function localStorageSupport() {
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	} catch (e) {
		return false;
	}
}

class LocalStorage implements Store {
    save(gamestate: GameState) {
        if(localStorageSupport()) {
            localStorage['picross.saveVersion'] = saveVersion;

            localStorage['picross.dimensionWidth'] = JSON.stringify(gamestate.dimensionWidth);
            localStorage['picross.dimensionHeight'] = JSON.stringify(gamestate.dimensionHeight);
            localStorage['picross.solution'] = JSON.stringify(gamestate.solution);
            localStorage['picross.state'] = JSON.stringify(gamestate.state);
            localStorage['picross.hintsX'] = JSON.stringify(gamestate.hintsX);
            localStorage['picross.hintsY'] = JSON.stringify(gamestate.hintsY);
            localStorage['picross.mistakes'] = JSON.stringify(gamestate.mistakes);
            localStorage['picross.guessed'] = JSON.stringify(gamestate.guessed);
            localStorage['picross.total'] = JSON.stringify(gamestate.total);
            localStorage['picross.complete'] = JSON.stringify(gamestate.complete);
            localStorage['picross.seed'] = JSON.stringify(gamestate.seed);
            localStorage['picross.darkMode'] = JSON.stringify(gamestate.darkMode);
            localStorage['picross.easyMode'] = JSON.stringify(gamestate.easyMode);
        }
    }

    load(): GameState {
        if(!localStorageSupport() || localStorage['picross.saveVersion'] != saveVersion) {
            return null;
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

        return {
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
        };
    }

}