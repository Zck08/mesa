function WordSearchView(matrix, list, gameId, listId, wordsFound) {

    let firstCell = null;
    let selecting = false;

    const CELL = ".cell";

    this.setUpView = function () {
        createGrid();
        createWordList();
    };

    this.enableTapOnly = function () {

        $(document).off("click", CELL);

        $(document).on("click", CELL, function () {

            const cell = $(this);

            if (!selecting) {
                resetSelection();
                firstCell = cell;
                selecting = true;
                cell.addClass("selected");
                return;
            }

            // segundo toque
            const secondCell = cell;
            const path = getPath(firstCell, secondCell);

            if (!path) {
                resetSelection();
                return;
            }

            const word = selectPath(firstCell, secondCell, path);

            if (validWordMade(list, word)) {
                $(".selected").addClass("found");
            }

            resetSelection();
        });
    };

    function resetSelection() {
        selecting = false;
        firstCell = null;
        $(".cell").removeClass("selected");
    }

    function createGrid() {
        for (let i = 0; i < matrix.length; i++) {
            const row = $("<div>").addClass("boardRow");
            for (let j = 0; j < matrix[i].length; j++) {
                $("<button>")
                    .addClass("cell")
                    .attr({ row: i, column: j })
                    .text(matrix[i][j])
                    .appendTo(row);
            }
            $(gameId).append(row);
        }
    }

    function createWordList() {
        list.forEach(row => {
            const r = $("<div>").addClass("listRow");
            row.forEach(word => {
                $("<li>")
                    .addClass("listWord")
                    .attr("text", word.replace(/\W/g, ""))
                    .text(word)
                    .appendTo(r);
            });
            $(listId).append(r);
        });
    }

    function getPath(a, b) {
        const ax = +a.attr("row");
        const ay = +a.attr("column");
        const bx = +b.attr("row");
        const by = +b.attr("column");

        const dx = bx - ax;
        const dy = by - ay;

        if (dx === 0) return dy > 0 ? paths.horizon : paths.horizonBack;
        if (dy === 0) return dx > 0 ? paths.vert : paths.vertBack;
        if (Math.abs(dx) === Math.abs(dy)) {
            if (dx > 0 && dy > 0) return paths.priDiag;
            if (dx < 0 && dy < 0) return paths.priDiagBack;
            if (dx > 0 && dy < 0) return paths.secDiag;
            return paths.secDiagBack;
        }
        return null;
    }

    function selectPath(start, end, path) {

        let x = +start.attr("row");
        let y = +start.attr("column");
        const ex = +end.attr("row");
        const ey = +end.attr("column");

        let word = "";

        while (true) {
            const cell = $(`[row=${x}][column=${y}]`);
            cell.addClass("selected");
            word += cell.text();

            if (x === ex && y === ey) break;

            const next = incr[path](x, y);
            x = next.x;
            y = next.y;
        }

        return word;
    }

    function validWordMade(list, word) {
        for (let row of list) {
            for (let w of row) {
                const t = w.replace(/\W/g, "");
                if (word === t || word === t.split("").reverse().join("")) {
                    $(".listWord[text=" + t + "]").addClass("found");
                    wordsFound.push(t);
                    return true;
                }
            }
        }
        return false;
    }
}