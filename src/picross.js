$(function() {

	var touchSupport = true;

	var PuzzleView = Backbone.View.extend({

		el: $("body"),

		events: function() {
			if(touchSupport && 'ontouchstart' in document.documentElement) {
				return {
					"click #new": "newGame",
					"change #dark": "changeDarkMode",
					"change #easy": "changeEasyMode",
					"mousedown": "clickStart",
					"mouseover td.cell": "mouseOver",
					"mouseout td.cell": "mouseOut",
					"mouseup": "clickEnd",
					"touchstart td.cell": "touchStart",
					"touchmove td.cell": "touchMove",
					"touchend td.cell": "touchEnd",
					"submit #customForm": "newCustom",
					"click #seed": function(e) { e.currentTarget.select(); },
					"click #customSeed": function(e) { e.currentTarget.select(); },
					"contextmenu #puzzle": function(e) { e.preventDefault(); }
				}
			} else {
				return {
					"click #new": "newGame",
                    "click #AI": "aiStep",
					"change #dark": "changeDarkMode",
					"change #easy": "changeEasyMode",
					"mousedown": "clickStart",
					"mouseover td.cell": "mouseOver",
					"mouseout td.cell": "mouseOut",
					"mouseup": "clickEnd",
					"submit #customForm": "newCustom",
					"click #seed": function(e) { e.currentTarget.select(); },
					"click #customSeed": function(e) { e.currentTarget.select(); },
					"contextmenu #puzzle": function(e) { e.preventDefault(); }
				}
			}
		},

		mouseStartX: -1,
		mouseStartY: -1,
		mouseEndX: -1,
		mouseEndY: -1,
		mouseMode: 0,

		initialize: function(options) {
			this.ai = options.ai;
			this.model.resume();
			$('#dimensions').val(this.model.get('dimensionWidth') + 'x' + this.model.get('dimensionHeight'));
			if(this.model.get('darkMode')) {
				$('#dark').attr('checked', 'checked');
			} else {
				$('#dark').removeAttr('checked');
			}
			if(this.model.get('easyMode')) {
				$('#easy').attr('checked', 'checked');
			} else {
				$('#easy').removeAttr('checked');
			}
			this.render();
			this.showSeed();
		},

		changeDarkMode: function(e) {
			var darkMode = $('#dark').attr('checked') !== undefined;
			this.model.set({darkMode: darkMode});
			this.render();
		},

		changeEasyMode: function(e) {
			var easyMode = $('#easy').attr('checked') !== undefined;
			this.model.set({easyMode: easyMode});
			this.render();
		},

		changeDimensions: function(e) {
			var dimensions = $('#dimensions').val();
			dimensions = dimensions.split('x');
			this.model.set({
				dimensionWidth: dimensions[0],
				dimensionHeight: dimensions[1]
			});
		},

		_newGame: function(customSeed) {
			$('#puzzle').removeClass('complete');
			$('#puzzle').removeClass('perfect');
			$('#progress').removeClass('done');
			$('#mistakes').removeClass('error');
			this.changeDimensions();
			this.model.reset(customSeed);
			this.render();
			this.showSeed();
		},

		newGame: function(e) {
			$('#customSeed').val('');
			this._newGame();
		},

        aiStep: function(e) {
            console.log("AI go beep boop");
			this.ai.step();
		},

		newCustom: function(e) {
			e.preventDefault();

			var customSeed = $.trim($('#customSeed').val());
			if(customSeed.length) {
				this._newGame(customSeed);
			} else {
				this._newGame();
			}
		},

		showSeed: function() {
			var seed = this.model.get('seed');
			$('#seed').val(seed);
		},

		clickStart: function(e) {
			if(this.model.get('complete')) {
				return;
			}

			var target = $(e.target);

			if(this.mouseMode != 0 || target.attr('data-x') === undefined || target.attr('data-y') === undefined) {
				this.mouseMode = 0;
				this.render();
				return;
			}

			this.mouseStartX = target.attr('data-x');
			this.mouseStartY = target.attr('data-y');
			switch (e.which) {
				case 1:
					// left click
					e.preventDefault();
					this.mouseMode = 1;
					break;
				case 3:
					// right click
					e.preventDefault();
					this.mouseMode = 3;
					break;
			}
		},

		mouseOver: function(e) {
			var target = $(e.currentTarget);
			var endX = target.attr('data-x');
			var endY = target.attr('data-y');
			this.mouseEndX = endX;
			this.mouseEndY = endY;

			$('td.hover').removeClass('hover');
			$('td.hoverLight').removeClass('hoverLight');

			if(this.mouseMode === 0) {
				$('td.cell[data-y=' + endY + ']').addClass('hoverLight');
				$('td.cell[data-x=' + endX + ']').addClass('hoverLight');
				$('td.cell[data-x=' + endX + '][data-y=' + endY + ']').addClass('hover');
				return;
			}

			var startX = this.mouseStartX;
			var startY = this.mouseStartY;

			if(startX === -1 || startY === -1) {
				return;
			}

			var diffX = Math.abs(endX - startX);
			var diffY = Math.abs(endY - startY);

			if(diffX > diffY) {
				$('td.cell[data-x=' + endX + ']').addClass('hoverLight');
				var start = Math.min(startX, endX);
				var end = Math.max(startX, endX);
				for(var i = start; i <= end; i++) {
					$('td.cell[data-x=' + i + '][data-y=' + startY + ']').addClass('hover');
				}
			} else {
				$('td.cell[data-y=' + endY + ']').addClass('hoverLight');
				var start = Math.min(startY, endY);
				var end = Math.max(startY, endY);
				for(var i = start; i <= end; i++) {
					$('td.cell[data-x=' + startX + '][data-y=' + i + ']').addClass('hover');
				}
			}
		},

		mouseOut: function(e) {
			if(this.mouseMode === 0) {
				$('td.hover').removeClass('hover');
				$('td.hoverLight').removeClass('hoverLight');
			}
		},

		clickEnd: function(e) {
			if(this.model.get('complete')) {
				return;
			}

			var target = $(e.target);
			switch (e.which) {
				case 1:
					// left click
					e.preventDefault();
					if(this.mouseMode != 1) {
						this.mouseMode = 0;
						return;
					}
					if(target.attr('data-x') === undefined || target.attr('data-y') === undefined) {
						this.clickArea(this.mouseEndX, this.mouseEndY, 2);
					} else {
						this.clickArea(target.attr('data-x'), target.attr('data-y'), 2);
					}
					break;
				case 3:
					// right click
					e.preventDefault();
					if(this.mouseMode != 3) {
						this.mouseMode = 0;
						return;
					}
					if(target.attr('data-x') === undefined || target.attr('data-y') === undefined) {
						this.clickArea(this.mouseEndX, this.mouseEndY, 1);
					} else {
						this.clickArea(target.attr('data-x'), target.attr('data-y'), 1);
					}
					break;
			}
			this.mouseMode = 0;
			this.checkCompletion();
			this.render();
		},

		clickArea: function(endX, endY, guess) {
			var startX = this.mouseStartX;
			var startY = this.mouseStartY;

			if(startX === -1 || startY === -1) {
				return;
			}

			var diffX = Math.abs(endX - startX);
			var diffY = Math.abs(endY - startY);

			if(diffX > diffY) {
				for(var i = Math.min(startX, endX); i <= Math.max(startX, endX); i++) {
					this.model.guess(i, startY, guess);
				}
			} else {
				for(var i = Math.min(startY, endY); i <= Math.max(startY, endY); i++) {
					this.model.guess(startX, i, guess);
				}
			}
		},

		touchStart: function(e) {
			if(this.model.get('complete')) {
				return;
			}
			var target = $(e.target);
			this.mouseStartX = this.mouseEndX = e.originalEvent.touches[0].pageX;
			this.mouseStartY = this.mouseEndY = e.originalEvent.touches[0].pageY;
			var that = this;
			this.mouseMode = setTimeout(function() {
				that.model.guess(target.attr('data-x'), target.attr('data-y'), 1);
				that.render();
			}, 750);
		},

		touchMove: function(e) {
			if(this.model.get('complete')) {
				return;
			}
			this.mouseEndX = e.originalEvent.touches[0].pageX;
			this.mouseEndY = e.originalEvent.touches[0].pageY;
			if(Math.abs(this.mouseEndX - this.mouseStartX) >= 10 || Math.abs(this.mouseEndY - this.mouseStartY) >= 10) {
				clearTimeout(this.mouseMode);
			}
		},

		touchEnd: function(e) {
			if(this.model.get('complete')) {
				return;
			}
			clearTimeout(this.mouseMode);
			var target = $(e.target);
			if(Math.abs(this.mouseEndX - this.mouseStartX) < 10 && Math.abs(this.mouseEndY - this.mouseStartY) < 10) {
				this.model.guess(target.attr('data-x'), target.attr('data-y'), 2);
				this.checkCompletion();
				this.render();
			}
		},

		checkCompletion: function() {
			if(this.model.get('complete')) {
				return;
			}

			var guessed = this.model.get('guessed');
			var total = this.model.get('total');

			if(guessed === total) {
				var hintsX = this.model.get('hintsX');
				var hintsY = this.model.get('hintsY');

				for(var i = 0; i < hintsX.length; i++) {
					for(var j = 0; j < hintsX[i].length; j++) {
						hintsX[i][j] = Math.abs(hintsX[i][j]) * -1;
					}
				}
				for(var i = 0; i < hintsY.length; i++) {
					for(var j = 0; j < hintsY[i].length; j++) {
						hintsY[i][j] = Math.abs(hintsY[i][j]) * -1;
					}
				}

				this.model.set({
					complete: true,
					hintsX: hintsX,
					hintsY: hintsY
				});
			}
		},

		render: function() {
			var mistakes = this.model.get('mistakes');
			$('#mistakes').text(mistakes);
			if(mistakes > 0) {
				$('#mistakes').addClass('error');
			}

			var progress = this.model.get('guessed') / this.model.get('total') * 100;
			$('#progress').text(progress.toFixed(1) + '%');

			if(this.model.get('darkMode')) {
				$('body').addClass('dark');
			} else {
				$('body').removeClass('dark');
			}

			if(this.model.get('complete')) {
				$('#puzzle').addClass('complete');
				$('#progress').addClass('done');
				if(mistakes === 0) {
					$('#puzzle').addClass('perfect');
				}
			}

			var state = this.model.get('state');
			var hintsX = this.model.get('hintsX');
			var hintsY = this.model.get('hintsY');

			var hintsXText = [];
			var hintsYText = [];
			if(this.model.get('easyMode')) {
				for(var i = 0; i < hintsX.length; i++) {
					hintsXText[i] = [];
					for(var j = 0; j < hintsX[i].length; j++) {
						if(hintsX[i][j] < 0) {
							hintsXText[i][j] = '<em>' + Math.abs(hintsX[i][j]) + '</em>';
						} else {
							hintsXText[i][j] = hintsX[i][j];
						}
					}
				}
				for(var i = 0; i < hintsY.length; i++) {
					hintsYText[i] = [];
					for(var j = 0; j < hintsY[i].length; j++) {
						if(hintsY[i][j] < 0) {
							hintsYText[i][j] = '<em>' + Math.abs(hintsY[i][j]) + '</em>';
						} else {
							hintsYText[i][j] = hintsY[i][j];
						}
					}
				}
			} else {
				for(var i = 0; i < hintsX.length; i++) {
					hintsXText[i] = [];
					for(var j = 0; j < hintsX[i].length; j++) {
						hintsXText[i][j] = Math.abs(hintsX[i][j]);
					}
				}
				for(var i = 0; i < hintsY.length; i++) {
					hintsYText[i] = [];
					for(var j = 0; j < hintsY[i].length; j++) {
						hintsYText[i][j] = Math.abs(hintsY[i][j]);
					}
				}
			}

			var html = '<table>';
			html += '<tr><td class="key"></td>';
			for(var i = 0; i < state[0].length; i++) {
				html += '<td class="key top">' + hintsYText[i].join('<br/>') + '</td>';
			}
			html += '</tr>';
			for(var i = 0; i < state.length; i++) {
				html += '<tr><td class="key left">' + hintsXText[i].join('&nbsp;') + '</td>';
				for(var j = 0; j < state[0].length; j++) {
					html += '<td class="cell s' + Math.abs(state[i][j]) + '" data-x="' + i + '" data-y="' + j + '">';
					if(state[i][j] < 0) {
						html += 'X'; //&#9785;
					}
					html += '</td>';
				}
				html += '</tr>';
			}
			html += '</table>';

			$('#puzzle').html(html);

			var side = (600 - (state[0].length * 5)) / state[0].length;
			$('#puzzle td.cell').css({
				width: side,
				height: side,
				fontSize: Math.ceil(200 / state[0].length)
			});
		}
	});

	var theModel = new PuzzleModel();
	var theAi = new Ai(theModel);
	new PuzzleView({model: theModel, ai: theAi});

});

function localStorageSupport() {
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	} catch (e) {
		return false;
	}
}
