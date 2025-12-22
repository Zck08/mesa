/* 
Created By Catherine Rodriquez
*/

"use strict";

//This object contains the necessary functions to create the 'view' of the word search,
//which essentially refers to displaying the puzzle and handling mouse events
function WordSearchView(matrix, list, gameId, listId, wordsFound) {

	"use strict";

	//variable to store if the puzzle was solved by the player or by the solve button
	var selfSolved = true;

	//object to hold oft-used class/id/attribute names
	var names = { 

		cell: "cell",
		pivot: "pivot",
		selectable: "selectable",
		selected: "selected",
		path: "path"

	};

 	//object to hold oft-used class/id selectors 
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

	/* creates the word search puzzle grid and the table containing the list
	 * of words to find
	 */
	this.setUpView = function() {

		createSearchGrid(matrix, names.cell, searchGrid.row, searchGrid.column, gameId);
		createListOfWords(list, listId);

	}

	
    //this function makes a 'table' of divs to store each letter in the matrix of letters created in wordsearchlogic.js
	function createSearchGrid(matrix, cellName, rowAttr, colAttr, boardId) {

		//loops through rows
		for (var i = 0; i < matrix.length; i++) {

			//creates a div for the table row and gives it a row class
			var row = $("<div/>");
			row.attr({class: "boardRow"});  //only really used once, so it's not in a variable

			//loops through columns
			for (var j = 0; j < matrix[i].length; j++) {

				//each letter in the row is a button element
				var letter = $("<button/>");  
				
				//the letter is given a cell class, and given row and column attributes!
				letter.attr({
					class: cellName, 
					[rowAttr]: i, 
					[colAttr]: j}).text(matrix[i][j]); //sets text of button to the respective matrix index

				//adds letter to the larger row element
				letter.appendTo(row);

			}

			//adds the row of letters to the larger game board element
			row.appendTo($(boardId));
		}

	}

	/** This function creates a table-type object to insert all the words
	 * contained in the word search puzzle. players refer to this table
	 * when looking for words to find 
	 *
	 * @param {Array[]} wordList a matrix of words to insert into list container
	 * @param {String} wordListId the ID of the container! 
	 */

    /* 
    This function creates a table-type object to insert all the words contained in the word search puzzle 
    - players refer to this table when looking for words to find 
    */
	function createListOfWords(wordList, wordListId) {

		//loops through rows
		for (var i = 0; i < wordList.length; i++) {

			//creates a div for the row
			var row = $("<div/>");
			row.attr({class: "listRow"}); //gives the rows a list row class

			//loops through columns
			for (var j = 0; j < wordList[i].length; j++) {

				//each individual word is a list item element!
				var word = $("<li/>");

				//they're given a list word class, and an attribute containing it's trimmed text (as in the puzzle)
				word.attr({class: "listWord", text: wordList[i][j].replace(/\W/g, "")});

				//given text from it's respected list index
				word.text(wordList[i][j]);

				//added to the larger list row element
				word.appendTo(row);

			}

			//row of words added to the larger word list div
			row.appendTo($(wordListId));

		}

	}

    //this function solves the puzzle for the player
	this.solve = function(wordLoc, matrix) {

		/** converts the object into an array and loops through each index to find 
		 * the word with the coordinates/orientation properties, setting the words to found!
		 *
		 * @param {String} word - the (trimmed) word placed in the puzzle
		 */

        /*
        converts the object into an array and loops through each index to find the word with the 
        coordinates/orientation properties, setting the words to found
        */
		Object.keys(wordLoc).forEach(function(word) {  	

			//path of the word
			var p = wordLoc[word].p;

			//the x and y value the word starts from
			var startX = wordLoc[word].x;
			var startY = wordLoc[word].y;

			/** initialized variables: k - for word length
			 *						   x - for starting x/row
			 *						   y - for starting y/column
			 *
			 * conditions: k - less than total length of word
			 *
			 * increments: k - incremented by 1, 
			 *			   x & y - incremented by x & y functions for path p inside  
			 *			   object 'incr'
			 */
			for (var k = 0, x = startX, y = startY; k < word.length; k++, x = incr[p](x, y).x, y = incr[p](x, y).y) {

				//finds the puzzle cell with the respective x and y value and sets it as lost
				$(select.cells + "[row = " + x + "][column = " + y + "]").addClass("lost");	

			}

			//set to false since the program solved it for the player
			selfSolved = false;

			//checks if valid word made (which it was)
			validWordMade(list, word);	
	
		});

	}

	/** this function encapsulates all the mouse events for making a move by breaking it down 
	 * into three main parts: pressing the mouse down (mousedown), dragging it (mouseenter), 
	 * and finally releasing the mouse (mouseup)!
	 */
this.triggerMouseDrag = function () {

    let selectedCells = [];
    let wordMade = "";
    let pointerIsDown = false;
    let currentPath = null;

    $(gameId).css("touch-action", "none");
	$(select.cells).css({
    "touch-action": "none",
    "user-select": "none"
	});

    // ======================
    // POINTER DOWN (inicio)
    // ======================
    $(select.cells).on("pointerdown", function (e) {
        e.preventDefault();
        this.setPointerCapture(e.pointerId);

        pointerIsDown = true;
        selectedCells = [];
        wordMade = "";
        currentPath = null;

        $(this).addClass(names.selected).attr("id", names.pivot);
        selectedCells.push($(this));
        wordMade += $(this).text();

        highlightValidDirections($(this), matrix, names.selectable);
    });

    // ======================
    // ENTRAR A OTRA CELDA
    // ======================
	$(document).on("pointermove", function (e) {
		if (!pointerIsDown) return;

		const el = document.elementFromPoint(e.clientX, e.clientY);
		if (!el) return;

		const $cell = $(el).closest(select.cells);
		if (!$cell.length) return;

		if (!$cell.hasClass(names.selectable)) return;

		const path = $cell.attr(names.path);

		if (!currentPath) {
			currentPath = path;
		}

		if (path !== currentPath) return;
		if (selectedCells.includes($cell)) return;

		$cell.addClass(names.selected);
		selectedCells.push($cell);
		wordMade += $cell.text();
	});

    // ======================
    // POINTER UP (fin)
    // ======================
    $(document).on("pointerup pointercancel", function () {
        if (!pointerIsDown) return;

        pointerIsDown = false;

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


    /*
    highlights all the valid directions in the matrix from where mouse is first clicked
	    top -> bottom
        left -> right
        both diagonals
    */
	function highlightValidDirections(selectedCell, matrix, makeSelectable) {

		//gets the row and column of where the cell the mouse pressed on is
		var cellRow = parseInt(selectedCell.attr(searchGrid.row));
		var cellCol = parseInt(selectedCell.attr(searchGrid.column));

		//converts the global paths object into an array
		Object.keys(paths).forEach(function(path) { //path - each property's name (e.g. 'vert', 'priDiagBack')

			//makes each cell in each of the paths selectable
			makeRangeSelectable(cellRow, cellCol, matrix.length, paths[path], makeSelectable);

		});

	}

	/** this functions makes a given path selectable but giving each cell in the path a 'selectable' class! 
	 * this makes it so that the player can only select cells on specific paths (which makes selecting vertically, 
	 * horizontally, and diagonally much less of a hassle!)
	 */
	function makeRangeSelectable(x, y, l, p, selectable) {  

		/** initialized variables: x - starting row, incremented to exclude the pivot
		 *						   y - starting column, incremented to exclude the pivot					   
		 *
		 * condition: x & y to stay within recommended bounds for path p 
		 *			  (determined by object bounds)
		 *
		 * increments: x & y - incremented by function determined for path p (by  
		 *			   object 'incr')
		 */
		for (var i = incr[p](x, y).x, j = incr[p](x, y).y;  //initialized variables
			bounds[p](i, j, l);  							//condition
			i = incr[p](i, j).x, j=incr[p](i, j).y) {		//increments

			//select the specific DOM elements with the specific row/column attribute values
			$("[" + searchGrid.row + "= " + i + "][" + searchGrid.column + "= " + j + "]")
				.addClass(selectable) //makes it selectable
				.attr({[names.path]: p}); //gives it a path attribute with the value of p

		}

	}

	/** this function finds and selects the range of cells from the pivot (first selected cell) to
	 * the cell the mouse is currently hovering on, altogether going from end to end on the puzzle
	 * matrix
	 */
	function selectCellRange(cellsSelector, hoveredCell, pathAttr, path, selectedCells, wordConstructed) {

		//variable to hold index of cell hovered on
		var hoverIndex;

		//variable to hold index of pivot
		var pivotIndex;  

		//selector for cells in the particular path the mouse is on
		var cellRange = cellsSelector + "[" + pathAttr + " =" + path + "]";

		//setting indices depending on how the paths flow
		switch(path) {

			case paths.vert:
			case paths.horizon:
			case paths.priDiag: 
			case paths.secDiag:				

				//hoverIndex > pivotIndex 
				hoverIndex = hoveredCell.index(cellRange)+1;
				pivotIndex = 0;

				//sets up wordConstructed with the pivot's letter (to start it off)
				wordConstructed = $(select.pivot).text();

				//using the pivot text, selects cells and adds their text to wordConstructed
				wordConstructed = selectLetters(selectedCells, wordConstructed, cellRange, pivotIndex, hoverIndex);
				

				break;
			
			case paths.vertBack:   
			case paths.horizonBack:
			case paths.priDiagBack:
			case paths.secDiagBack:

				//hoverIndex < pivotIndex
				hoverIndex = hoveredCell.index(cellRange);
				pivotIndex = $(cellRange).length;

				//selects range of cells between the pivot and the cell the mouse is on
			 	wordConstructed += selectLetters(selectedCells, wordConstructed, cellRange, hoverIndex, pivotIndex);

			 	//adds pivot text to the end
				wordConstructed += $(select.pivot).text();

				break;

		}

		return {word: wordConstructed, array: selectedCells};
		
	}

	/** this function selects the range of cells between the pivot cell and the
	 * the cell the mouse is hovered, and adds their text to the constructed word's string
	 */
	function selectLetters(selectedCells, wordConstructed, range, lowerIndex, upperIndex) {

		//only goes through the the range between the pivot and wherever the mouse is on the path!
		$(range).slice(lowerIndex, upperIndex).each(function() {

			//selects the cell
			$(this).addClass(names.selected);

			//adds it to the array of cells
			selectedCells.push($(this));

			//updates the word being made to include the newest cell's letter
			wordConstructed += $(this).text();

		});

		return wordConstructed;

	}
	
	/** checks if the word a user made after a move is an actual word to find, and 
	 * if so, sets the word as found! otherwise, nothing happens 
	 */
	function validWordMade (list, wordToCheck) {

		//loops through rows
		for (var i = 0; i < list.length; i++) {

			//loops through columns
			for (var j = 0; j < list[i].length; j++) {

				//trims the word at the index (to make comparison easier)
				var trimmedWord = list[i][j].replace(/\W/g, "")

				//if the word user made is the same as the trimmed word, or the reverse of it
				if (wordToCheck == trimmedWord ||
					wordToCheck == reversedWord(trimmedWord)) {

                    wordsFound.push(trimmedWord);   
                    //console.log(trimmedWord);
					
					//sets the word inside the list div as found (changes color, strikethroughs text)

                    if(selfSolved){
                        $(".listWord[text = " + trimmedWord + "]").addClass("User");
                    }
                    else{ 
                        $(".listWord[text = " + trimmedWord + "]").addClass("found");
                    }
                    
    

					//checks if the last word to find was found
					checkPuzzleSolved(".listWord", ".listWord.found");
					
					return true;
									
				}

			}

		}

	}	
    
	/** checks if all the words in the puzzle have been found, what method was used to 
	 * solve the puzzle, and updates the h2 instructions heading accordingly
	 */
	function checkPuzzleSolved (fullList, foundWordsList) {

		//if all the words in the list to find have been found (no. of words to find == no. of found words)
		if ($(fullList).length == $(foundWordsList).length) {

            continueGame = false;

			//if user solved the puzzle themselves
			if (selfSolved) {

                document.getElementById('gameInfo').textContent = 'Yay! You found them ALL! Press New Game to play again!';

			}

			//if user used the solve button 
			else {

                document.getElementById('gameInfo').textContent = 'Answers Revealed... better luck next time!';
			}	

			return true;

        }

        return false;

	}

    //reverses the string 
	function reversedWord(word) {

		//creates empty string to store reversed word
		var reversedWord = "";

		//loops through from end of word to the beginning (instead of traditional beginning to end)
		for (var i = word.length - 1; i >= 0; i--) {

			//adds the character to reversed word
			reversedWord += word.charAt(i);

		}

		return reversedWord;

	}
	function getDirectionFromDrag(pivot, x, y) {
		const rect = pivot[0].getBoundingClientRect();
		const dx = x - (rect.left + rect.width / 2);
		const dy = y - (rect.top + rect.height / 2);

		if (Math.abs(dx) > Math.abs(dy)) {
			return dx > 0 ? paths.horizon : paths.horizonBack;
		} else if (Math.abs(dy) > Math.abs(dx)) {
			return dy > 0 ? paths.vert : paths.vertBack;
		} else {
			if (dx > 0 && dy > 0) return paths.priDiag;
			if (dx < 0 && dy < 0) return paths.priDiagBack;
			if (dx > 0 && dy < 0) return paths.secDiag;
			return paths.secDiagBack;
		}
	}

}