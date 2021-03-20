$(function() {
    console.log("Heyo");
    $("#mistakes").text(69);
});

function testFunc() {console.log("lmao");}
testFunc();

enum CellState {
  UNKNOWN = 0,
  BLOCK = 1,
  HIT = 2,
}
type Line = Array<CellState>;

class Ai {
    model: any;

    constructor(model) {
        this.model = model;
        console.log("Loaded with a model");
    }
    
    // The minimum space a set of hints can fit into.
    minSpace(hints: Array<number>): number {
        let num = hints.reduce((a, b) => a + b, 0) + hints.length - 1;
        return num;
    }
    
    // Executed whenever the AI Step button is pressed
    step() {
      console.log("One small step for ai, one giant leap for AIKIND");
    }

    getRow(i: number): Line {
        return this.model.get('state')[i].map(entry => entry.abs())
    }
    getCol(j: number): Line {
        return this.model.get('state').map(row => row[j].abs());
    }

    getCell(i, j) {
        return this.model.get('state')[i][j];
    }
}
