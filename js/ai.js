const UNKNOWN = 0;
const BLOCKED = 1;
const HIT = 2;

class Ai {
    constructor(model) {
        this.model = model;
        this.unknowns_grid = []
        this.column_constraints = []
        this.row_constraints = []
        this.constraints_to_recheck = []
        console.log("Loaded the AI");
    }
    
    // Executed whenever the AI Step button is pressed

    initialize() {
        this.unknowns_grid = []
        this.column_constraints = []
        this.row_constraints = []
        this.constraints_to_recheck = []
        for(let i = 0; i < this.model.get('dimensionHeight'); i++) {
            this.unknowns_grid[i] = [];
            for(let j = 0; j < this.model.get('dimensionWidth'); j++) {
                if (this.getCell(i,j) != UNKNOWN) { // Game already has cell filled in.
                    // so our unknown is exactly that value.
                    this.unknowns_grid[i,j] = new Set([this.getCell(i,j)]);
                } else {
                    // Could be either value.
                    this.unknowns_grid[i][j] = new Set([BLOCKED, HIT]);
                }
            }
        }
        // Set X hint constraints
        for(let i = 0; i < this.model.get('dimensionHeight'); i++) {
            let hints = this.model.get('hintsX')[i];
            let s = this.model.get('state')

            this.row_constraints[i] = this.computeAssignments(hints, s);
        }


    }

    // These are the possible assignments to this row, for example for a 1x5
    // 2 | _ _ _ _ _
    // We would have:
    //   [
    //      [H H B B B]
    //      [B H H B B]
    //      [B B H H B]
    //      [B B B H H]
    //   ]
    // We compute this using brute force.
    computeAssignments(hints, state) {
        assignments = []

        while (true) {

        }
        return assignments;
    }



    step() {
      console.log("One small step for ai, one giant leap for AIKIND");
    }


    // The minimum space a set of hints can fit into.
    minSpace(hints) {
        let num = hints.reduce((a, b) => a + b, 0) + hints.length - 1;
        return num;
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
