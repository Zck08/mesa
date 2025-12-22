"use strict";

/*
 Word Search View
 Adaptado para mouse + touch (pointer events)
*/

function WordSearchView(matrix, list, gameId, listId, wordsFound) {

    let selfSolved = true;

    const names = {
        cell: "cell",
        pivot: "pivot",
        selected: "selected"
    };

    const select = {
        cells: "." + names.cell,
        pivot: "#" + names.pivot,
        selected: "." + names.selected
    };

    const searchGrid = {
        row: "row",
        column: "column"
    };

    /* ===============================
       SETUP VIEW
    =============================== */

    this.setUpView = function () {
        createSearchGrid(matrix, gameId);
        createListOfWords(list, listId);
        this.enableInteraction();
    };

    function createSearchGrid(matrix, boardId) {
        for (let i = 0; i < matrix.length; i++) {
            const row = $("<div/>", { class: "boardRow" });
            for (let j = 0; j < matrix[i].length; j++) {
                $("<button/>", {
                    class: names.cell,
                    row: i,
                    column: j,
                    text: matrix[i][j]
                }).appendTo(row);
            }
            row.appendTo($(boardId));
        }
    }

    function createListOfWords(wordList, wordListId) {
        wordList.forEach(rowWords => {
            const row = $("<div/>", { class: "listRow" });
            rowWords.forEach(w => {
                $("<li/>", {
                    class: "listWord",
                    text: w.replace(/\W/g, ""),
                    textContent: w
                }).text(w).appendTo(row);
            });
            row.appendTo($(wordListId));
        });
    }

    /* ===============================
       INTERACTION (MOUSE + TOUCH)
    =============================== */

    this.enableInteraction = function () {

        let pointerDown = false;
        let selectedCells = [];
        let wordMade = "";
        let currentPath = null;

        $(gameId).css("touch-action", "none");

        /* ---- POINTER DOWN ---- */
        $(document).on("pointerdown", select.cells, function (e) {
            e.preventDefault();
            this.setPointerCapture(e.pointerId);

            pointerDown = true;
            selectedCells = [];
            wordMade = "";
            currentPath = null;

            $(this).addClass(names.selected).attr("id", names.pivot);
            selectedCells.push($(this));
            wordMade += $(this).text();
        });

        /* ---- POINTER MOVE ---- */
        $(document).on("pointermove", function (e) {
            if (!pointerDown) return;

            const el = document.elementFromPoint(e.clientX, e.clientY);
            if (!el) return;

            const $cell = $(el).closest(select.cells);
            if (!$cell.length) return;
            if (selectedCells.includes($cell)) return;

            const pivot = $(select.pivot);
            if (!pivot.length) return;

            const pr = parseInt(pivot.attr(searchGrid.row));
            const pc = parseInt(pivot.attr(searchGrid.column));
            const cr = parseInt($cell.attr(searchGrid.row));
            const cc = parseInt($cell.attr(searchGrid.column));

            const dx = cc - pc;
            const dy = cr - pr;

            let path = null;

            if (dx === 0 && dy > 0) path = paths.vert;
            else if (dx === 0 && dy < 0) path = paths.vertBack;
            else if (dy === 0 && dx > 0) path = paths.horizon;
            else if (dy === 0 && dx < 0) path = paths.horizonBack;
            else if (Math.abs(dx) === Math.abs(dy)) {
                if (dx > 0 && dy > 0) path = paths.priDiag;
                else if (dx < 0 && dy < 0) path = paths.priDiagBack;
                else if (dx > 0 && dy < 0) path = paths.secDiag;
                else if (dx < 0 && dy > 0) path = paths.secDiagBack;
            }

            if (!path) return;

            if (!currentPath) currentPath = path;
            if (path !== currentPath) return;

            $cell.addClass(names.selected);
            selectedCells.push($cell);
            wordMade += $cell.text();
        });

        /* ---- POINTER UP ---- */
        $(document).on("pointerup pointercancel", function () {
            if (!pointerDown) return;

            pointerDown = false;

            if (validWordMade(list, wordMade)) {
                $(select.selected).addClass("found");
            }

            $(select.selected).removeClass(names.selected);
            $(select.pivot).removeAttr("id");

            selectedCells = [];
            wordMade = "";
            currentPath = null;
        });
    };

    /* ===============================
       GAME LOGIC
    =============================== */

    function validWordMade(list, word) {
        for (let i = 0; i < list.length; i++) {
            for (let j = 0; j < list[i].length; j++) {
                const trimmed = list[i][j].replace(/\W/g, "");
                if (word === trimmed || word === reversedWord(trimmed)) {

                    wordsFound.push(trimmed);

                    $(".listWord[text=" + trimmed + "]")
                        .addClass(selfSolved ? "User" : "found");

                    checkPuzzleSolved(".listWord", ".listWord.found");
                    return true;
                }
            }
        }
        return false;
    }

    function checkPuzzleSolved(all, found) {
        if ($(all).length === $(found).length) {
            document.getElementById("gameInfo").textContent =
                selfSolved
                    ? "¡Encontraste todas las palabras!"
                    : "Solución mostrada.";
            return true;
        }
        return false;
    }

    function reversedWord(word) {
        return word.split("").reverse().join("");
    }
}
