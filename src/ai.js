$(function() {
    console.log("Heyo");
    $("#mistakes").text(69);
});

function testFunc() {console.log("lmao");}
testFunc();

class Ai {
    constructor(model) {
        this.model = model;
        console.log("Loaded with a model");
    }
    
    // The minimum space a set of hints can fit into.
    minSpace(hints) {
        let num = hints.reduce((a, b) => a + b, 0) + hints.length - 1;
        return num;
    }
    
    // Executed whenever the AI Step button is pressed
    step() {
      console.log("One small step for ai, one giant leap for AIKIND");
    }

    getRow(i) {
        return this.model.get('state')[i];
    }
    getCol(j) {
        return this.model.get('state').map(row => row[j]);
    }

    getCell(i, j) {
        return this.model.get('state')[i][j];
    }
}
