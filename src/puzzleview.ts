

let touchSupport = true;

class PuzzleView extends Backbone.View {
	mouseStartX: number;
	mouseStartY: number;
	mouseEndX: number;
	mouseEndY: number;
	mouseMode: number;
	ai: Ai;
	model: PuzzleModel;

	constructor(properies: any) {
		super(properies);
		this.model = properies.model;
		this.ai = properies.ai;
		this.mouseStartX = -1;
		this.mouseStartY = -1;
		this.mouseEndX = -1;
		this.mouseEndY = -1;
		this.mouseMode = 0;
	}

	events() {
		if (touchSupport && 'ontouchstart' in document.documentElement) {
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
				"click #seed": function (e: { currentTarget: { select: () => void; }; }) { e.currentTarget.select(); },
				"click #customSeed": function (e: { currentTarget: { select: () => void; }; }) { e.currentTarget.select(); },
				"contextmenu #puzzle": function (e: { preventDefault: () => void; }) { e.preventDefault(); }
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
				"click #seed": function (e: { currentTarget: { select: () => void; }; }) { e.currentTarget.select(); },
				"click #customSeed": function (e: { currentTarget: { select: () => void; }; }) { e.currentTarget.select(); },
				"contextmenu #puzzle": function (e: { preventDefault: () => void; }) { e.preventDefault(); }
			}
		}
	}

	initialize(options: any) {
		this.ai = options.ai;
		this.mouseStartX = -1;
		this.mouseStartY = -1;
		this.mouseEndX = -1;
		this.mouseEndY = -1;
		this.mouseMode = 0;
		this.model.resume();
		$('#dimensions').val(this.model.get('dimensionWidth') + 'x' + this.model.get('dimensionHeight'));
		if (this.model.get('darkMode')) {
			$('#dark').attr('checked', 'checked');
		} else {
			$('#dark').removeAttr('checked');
		}
		if (this.model.get('easyMode')) {
			$('#easy').attr('checked', 'checked');
		} else {
			$('#easy').removeAttr('checked');
		}
		this.render();
		this.showSeed();
	}

	changeDarkMode(e: any) {
		let darkMode = $('#dark').attr('checked') !== undefined;
		this.model.set({ darkMode: darkMode });
		this.render();
	}

	changeEasyMode(e: any) {
		let easyMode = $('#easy').attr('checked') !== undefined;
		this.model.set({ easyMode: easyMode });
		this.render();
	}

	changeDimensions(e?: undefined) {
		let dimensions: any = $('#dimensions').val();
		dimensions = dimensions.split('x');
		this.model.set({
			dimensionWidth: dimensions[0],
			dimensionHeight: dimensions[1]
		});
	}

	_newGame(customSeed?: string) {
		$('#puzzle').removeClass('complete');
		$('#puzzle').removeClass('perfect');
		$('#progress').removeClass('done');
		$('#mistakes').removeClass('error');
		this.changeDimensions();
		this.model.reset(customSeed);
		this.render();
		this.showSeed();
	}

	newGame(e: any) {
		$('#customSeed').val('');
		this._newGame();
	}

	aiStep(e: any) {
		console.log("AI go beep boop");
		this.ai.step();
	}

	newCustom(e: { preventDefault: () => void; }) {
		e.preventDefault();

		let customSeed = $.trim($('#customSeed').val() as string);
		if (customSeed.length) {
			this._newGame(customSeed);
		} else {
			this._newGame();
		}
	}

	showSeed() {
		let seed = this.model.get('seed');
		$('#seed').val(seed);
	}

	clickStart(e: { target: any; which: any; preventDefault: () => void; }) {
		if (this.model.get('complete')) {
			return;
		}

		let target = $(e.target);

		if (this.mouseMode != 0 || target.attr('data-x') === undefined || target.attr('data-y') === undefined) {
			this.mouseMode = 0;
			this.render();
			return;
		}

		this.mouseStartX = parseInt(target.attr('data-x'));
		this.mouseStartY = parseInt(target.attr('data-y'));
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
	}

	mouseOver(e: { currentTarget: any; }) {
		let target = $(e.currentTarget);
		let endX: number = parseInt(target.attr('data-x'));
		let endY: number = parseInt(target.attr('data-y'));
		this.mouseEndX = endX;
		this.mouseEndY = endY;

		$('td.hover').removeClass('hover');
		$('td.hoverLight').removeClass('hoverLight');

		if (this.mouseMode === 0) {
			$('td.cell[data-y=' + endY + ']').addClass('hoverLight');
			$('td.cell[data-x=' + endX + ']').addClass('hoverLight');
			$('td.cell[data-x=' + endX + '][data-y=' + endY + ']').addClass('hover');
			return;
		}

		let startX = this.mouseStartX;
		let startY = this.mouseStartY;

		if (startX === -1 || startY === -1) {
			return;
		}

		let diffX = Math.abs(endX - startX);
		let diffY = Math.abs(endY - startY);

		if (diffX > diffY) {
			$('td.cell[data-x=' + endX + ']').addClass('hoverLight');
			let start = Math.min(startX, endX);
			let end = Math.max(startX, endX);
			for (let i = start; i <= end; i++) {
				$('td.cell[data-x=' + i + '][data-y=' + startY + ']').addClass('hover');
			}
		} else {
			$('td.cell[data-y=' + endY + ']').addClass('hoverLight');
			let start = Math.min(startY, endY);
			let end = Math.max(startY, endY);
			for (let i = start; i <= end; i++) {
				$('td.cell[data-x=' + startX + '][data-y=' + i + ']').addClass('hover');
			}
		}
	}

	mouseOut(e: any) {
		if (this.mouseMode === 0) {
			$('td.hover').removeClass('hover');
			$('td.hoverLight').removeClass('hoverLight');
		}
	}

	clickEnd(e: { target: any; which: any; preventDefault: () => void; }) {
		if (this.model.get('complete')) {
			return;
		}

		let target = $(e.target);
		switch (e.which) {
			case 1:
				// left click
				e.preventDefault();
				if (this.mouseMode != 1) {
					this.mouseMode = 0;
					return;
				}
				if (target.attr('data-x') === undefined || target.attr('data-y') === undefined) {
					this.clickArea(this.mouseEndX, this.mouseEndY, 2);
				} else {
					this.clickArea(parseInt(target.attr('data-x')), parseInt(target.attr('data-y')), 2);
				}
				break;
			case 3:
				// right click
				e.preventDefault();
				if (this.mouseMode != 3) {
					this.mouseMode = 0;
					return;
				}
				if (target.attr('data-x') === undefined || target.attr('data-y') === undefined) {
					this.clickArea(this.mouseEndX, this.mouseEndY, 1);
				} else {
					this.clickArea(parseInt(target.attr('data-x')), parseInt(target.attr('data-y')), 1);
				}
				break;
		}
		this.mouseMode = 0;
		this.checkCompletion();
		this.render();
	}

	clickArea(endX: number, endY: number, guess: number) {
		let startX = this.mouseStartX;
		let startY = this.mouseStartY;

		if (startX === -1 || startY === -1) {
			return;
		}

		let diffX = Math.abs(endX - startX);
		let diffY = Math.abs(endY - startY);

		if (diffX > diffY) {
			for (let i = Math.min(startX, endX); i <= Math.max(startX, endX); i++) {
				this.model.guess(i, startY, guess);
			}
		} else {
			for (let i = Math.min(startY, endY); i <= Math.max(startY, endY); i++) {
				this.model.guess(startX, i, guess);
			}
		}
	}

	touchStart(e: any) {
		if (this.model.get('complete')) {
			return;
		}
		let target = $(e.target);
		this.mouseStartX = this.mouseEndX = e.originalEvent.touches[0].pageX;
		this.mouseStartY = this.mouseEndY = e.originalEvent.touches[0].pageY;
		let that = this;
		this.mouseMode = setTimeout(function () {
			that.model.guess(target.attr('data-x'), target.attr('data-y'), 1);
			that.render();
		}, 750);
	}

	touchMove(e: any) {
		if (this.model.get('complete')) {
			return;
		}
		this.mouseEndX = e.originalEvent.touches[0].pageX;
		this.mouseEndY = e.originalEvent.touches[0].pageY;
		if (Math.abs(this.mouseEndX - this.mouseStartX) >= 10 || Math.abs(this.mouseEndY - this.mouseStartY) >= 10) {
			clearTimeout(this.mouseMode);
		}
	}

	touchEnd(e: { target: any; }) {
		if (this.model.get('complete')) {
			return;
		}
		clearTimeout(this.mouseMode);
		let target = $(e.target);
		if (Math.abs(this.mouseEndX - this.mouseStartX) < 10 && Math.abs(this.mouseEndY - this.mouseStartY) < 10) {
			this.model.guess(target.attr('data-x'), target.attr('data-y'), 2);
			this.checkCompletion();
			this.render();
		}
	}

	checkCompletion() {
		if (this.model.get('complete')) {
			return;
		}

		let guessed = this.model.get('guessed');
		let total = this.model.get('total');

		if (guessed === total) {
			let hintsX = this.model.get('hintsX');
			let hintsY = this.model.get('hintsY');

			for (let i = 0; i < hintsX.length; i++) {
				for (let j = 0; j < hintsX[i].length; j++) {
					hintsX[i][j] = Math.abs(hintsX[i][j]) * -1;
				}
			}
			for (let i = 0; i < hintsY.length; i++) {
				for (let j = 0; j < hintsY[i].length; j++) {
					hintsY[i][j] = Math.abs(hintsY[i][j]) * -1;
				}
			}

			this.model.set({
				complete: true,
				hintsX: hintsX,
				hintsY: hintsY
			});
		}
	}

	render(): this {
		let mistakes = this.model.get('mistakes');
		$('#mistakes').text(mistakes);
		if (mistakes > 0) {
			$('#mistakes').addClass('error');
		}

		let progress = this.model.get('guessed') / this.model.get('total') * 100;
		$('#progress').text(progress.toFixed(1) + '%');

		if (this.model.get('darkMode')) {
			$('body').addClass('dark');
		} else {
			$('body').removeClass('dark');
		}

		if (this.model.get('complete')) {
			$('#puzzle').addClass('complete');
			$('#progress').addClass('done');
			if (mistakes === 0) {
				$('#puzzle').addClass('perfect');
			}
		}

		let state = this.model.get('state');
		let hintsX = this.model.get('hintsX');
		let hintsY = this.model.get('hintsY');

		let hintsXText = [];
		let hintsYText = [];
		if (this.model.get('easyMode')) {
			for (let i = 0; i < hintsX.length; i++) {
				hintsXText[i] = [];
				for (let j = 0; j < hintsX[i].length; j++) {
					if (hintsX[i][j] < 0) {
						hintsXText[i][j] = '<em>' + Math.abs(hintsX[i][j]) + '</em>';
					} else {
						hintsXText[i][j] = hintsX[i][j];
					}
				}
			}
			for (let i = 0; i < hintsY.length; i++) {
				hintsYText[i] = [];
				for (let j = 0; j < hintsY[i].length; j++) {
					if (hintsY[i][j] < 0) {
						hintsYText[i][j] = '<em>' + Math.abs(hintsY[i][j]) + '</em>';
					} else {
						hintsYText[i][j] = hintsY[i][j];
					}
				}
			}
		} else {
			for (let i = 0; i < hintsX.length; i++) {
				hintsXText[i] = [];
				for (let j = 0; j < hintsX[i].length; j++) {
					hintsXText[i][j] = Math.abs(hintsX[i][j]);
				}
			}
			for (let i = 0; i < hintsY.length; i++) {
				hintsYText[i] = [];
				for (let j = 0; j < hintsY[i].length; j++) {
					hintsYText[i][j] = Math.abs(hintsY[i][j]);
				}
			}
		}

		let html = '<table>';
		html += '<tr><td class="key"></td>';
		for (let i = 0; i < state[0].length; i++) {
			html += '<td class="key top">' + hintsYText[i].join('<br/>') + '</td>';
		}
		html += '</tr>';
		for (let i = 0; i < state.length; i++) {
			html += '<tr><td class="key left">' + hintsXText[i].join('&nbsp;') + '</td>';
			for (let j = 0; j < state[0].length; j++) {
				html += '<td class="cell s' + Math.abs(state[i][j]) + '" data-x="' + i + '" data-y="' + j + '">';
				if (state[i][j] < 0) {
					html += 'X'; //&#9785;
				}
				html += '</td>';
			}
			html += '</tr>';
		}
		html += '</table>';

		$('#puzzle').html(html);

		let side = (600 - (state[0].length * 5)) / state[0].length;
		$('#puzzle td.cell').css({
			width: side,
			height: side,
			fontSize: Math.ceil(200 / state[0].length)
		});
		return this;
	}
}