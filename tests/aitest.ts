
describe("Ai", () => {
  let model;
  let ai;

  beforeEach(function() {
    model = {};
    ai = new Ai(model);
  });
  describe("minSpace", () => {

    it(" handles 2 2", () => {
        expect(ai.minSpace([2,2])).toBe(5);
    });
    it(" handles 1 1 1 1 1", () => {
        expect(ai.minSpace([1,1,1,1,1])).toBe(9);
    })
  })

});