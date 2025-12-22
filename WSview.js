/* 
Created By Catherine Rodriquez
PATCH: soporte táctil real (mobile)
*/

"use strict";

function WordSearchView(matrix, list, gameId, listId, wordsFound) {

	"use strict";

	var selfSolved = true;

	var names = { 
		cell: "cell",
		pivot: "pivot",
		selectable: "selectable",
		selected: "selected",
		path: "path"
	};

 	var select = {  
		cells: "." + names.cell,
		pivot: "#" + names.pivot,
		selectable: "." + names.selectable,
		selected: "." + names.selected
	};

	var searchGrid = {
		row: "row",
		column: "column"
	};

	this.setUpView = function() {
		createSearchGrid(matrix, names.cell, searchGrid.row, searchGrid.column, gameId);
		createListOfWords(list, listId);
	};

	function createSearchGrid(matrix, cellName, rowAttr, colAttr, boardId) {
		for (var i = 0; i < matrix.length; i++) {
			var row = $("<div/>").attr({class: "boardRow"});
			for (var j = 0; j < matrix[i].length; j++) {
				var letter = $("<button/>");  
				letter.attr({class: cellName, [rowAttr]: i, [colAttr]: j}).text(matrix[i][j]);
				letter.appendTo(row);
			}
			row.appendTo($(boardId));
		}
	}

	function createListOfWords(wordList, wordListId) {
		for (var i = 0; i < wordList.length; i++) {
			var row = $("<div/>").attr({class: "listRow"});
			for (var j = 0; j < wordList[i].length; j++) {
				var word = $("<li/>");
				word.attr({class: "listWord", text: wordList[i][j].replace(/\W/g, "")});
				word.text(wordList[i][j]);
				word.appendTo(row);
			}
			row.appendTo($(wordListId));
		}
	}

	// ==============================
	//  PARCHE REAL PARA MÓVIL
	// ==============================
	this.enableTouchOnly = function () {

    let selectedCells = [];
    let wordMade = "";
    let active = false;
    let currentPath = null;

    $(gameId).css({
        "touch-action": "none",
        "user-select": "none"
    });

    // =====================
    // TOUCH START
    // =====================
    $(select.cells).on("touchstart", function (e) {
        e.preventDefault();

        active = true;
        selectedCells = [];
        wordMade = "";
        currentPath = null;

        const cell = $(this);

        cell.addClass(names.selected).attr("id", names.pivot);
        selectedCells.push(cell);
        wordMade += cell.text();

        highlightValidDirections(cell, matrix, names.selectable);
    });

    // =====================
    // TOUCH MOVE
    // =====================
    $(document).on("touchmove", function (e) {
        if (!active) return;

        const touch = e.originalEvent.touches[0];
        const el = document.elementFromPoint(touch.clientX, touch.clientY);

        if (!el || !el.classList.contains(names.cell)) return;

        const cell = $(el);

        if (!cell.hasClass(names.selectable)) return;
        if (selectedCells.includes(cell)) return;

        const path = cell.attr(names.path);

        if (!currentPath) currentPath = path;
        if (path !== currentPath) return;

        cell.addClass(names.selected);
        selectedCells.push(cell);
        wordMade += cell.text();
    });

    // =====================
    // TOUCH END
    // =====================
    $(document).on("touchend touchcancel", function () {
        if (!active) return;

        active = false;

        if (validWordMade(list, wordMade)) {
            $(select.selected).addClass("found");
        }

        $(select.selected).removeClass(names.selected);
        $(select.cells).removeAttr(names.path);
        $(select.pivot).removeAttr("id");
        $(select.selectable).removeClass(names.selectable);

        selectedCells = [];
        wordMade = "";
        currentPath = null;
    });
};

	function highlightValidDirections(selectedCell, matrix, makeSelectable) {
		var cellRow = parseInt(selectedCell.attr(searchGrid.row));
		var cellCol = parseInt(selectedCell.attr(searchGrid.column));

		Object.keys(paths).forEach(function(path) {
			makeRangeSelectable(cellRow, cellCol, matrix.length, paths[path], makeSelectable);
		});
	}

	function makeRangeSelectable(x, y, l, p, selectable) {  
		for (var i = incr[p](x, y).x, j = incr[p](x, y).y; bounds[p](i, j, l); i = incr[p](i, j).x, j = incr[p](i, j).y) {
			$("[" + searchGrid.row + "= " + i + "][" + searchGrid.column + "= " + j + "]")
				.addClass(selectable)
				.attr({[names.path]: p});
		}
	}

	function validWordMade (list, wordToCheck) {
		for (var i = 0; i < list.length; i++) {
			for (var j = 0; j < list[i].length; j++) {
				var trimmedWord = list[i][j].replace(/\W/g, "");
				if (wordToCheck == trimmedWord || wordToCheck == reversedWord(trimmedWord)) {
					wordsFound.push(trimmedWord);   
					$(".listWord[text = " + trimmedWord + "]").addClass(selfSolved ? "User" : "found");
					checkPuzzleSolved(".listWord", ".listWord.found");
					return true;
				}
			}
		}
	}

	function checkPuzzleSolved (fullList, foundWordsList) {
		if ($(fullList).length == $(foundWordsList).length) {
			document.getElementById('gameInfo').textContent = selfSolved
				? 'Yay! You found them ALL! Press New Game to play again!'
				: 'Answers Revealed... better luck next time!';
			return true;
		}
		return false;
	}

	function reversedWord(word) {
		var reversedWord = "";
		for (var i = word.length - 1; i >= 0; i--) reversedWord += word.charAt(i);
		return reversedWord;
	}
}
