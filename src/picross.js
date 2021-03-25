$(function() {

	var theModel = new PuzzleModel();
	var theAi = new Ai(theModel);
	new PuzzleView({model: theModel, ai: theAi, el: "body"});
});
