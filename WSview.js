function WordSearchView(matrix, list, gameId, listId, wordsFound) {

    let firstCell = null;
    let waitingSecondTap = false;

    const CELL = ".cell";

    this.setUpView = function () {
        createGrid();
        createWordList();
        enableTapOnly();
    };

    function enableTapOnly() {

        // elimina cualquier evento previo
        $(document).off("click", CELL);

        $(document).on("click", CELL, function () {

            const cell = $(this);

            // PRIMER TOQUE
            if (!waitingSecondTap) {
                clearSelection();
                firstCell = cell;
                waitingSecondTap = true;
                cell.addClass("selected");
                return;
            }

            // SEGUNDO TOQUE
            const secondCell = cell;

            const path = getPath(firstCell, secondCell);
            if (!path) {
                clearSelection();
                return;
            }

            const word = selectPath(firstCell, secondCell, path);

            if (validWordMade(list, word)) {
                $(".selected").addClass("found");
            }

            clearSelection();
        });
    }

    function clearSelection() {
        waitingSecondTap = false;
        firstCell = null;
        $(".cell").removeClass("selected");
    }

    function createGrid() {
        for (let i = 0; i < matrix.length; i++) {
            const row = $("<div>").addClass("boardRow");

            for (let j = 0; j < matrix[i].length; j++) {
                $("<div>")
                    .addClass("cell")
                    .attr("data-row", i)
                    .attr("data-column", j)
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
                    .attr("data-word", word.replace(/\W/g, ""))
                    .text(word)
                    .appendTo(r);
            });
            $(listId).append(r);
        });
    }

    function getPath(a, b) {
        const ax = +a.data("row");
        const ay = +a.data("column");
        const bx = +b.data("row");
        const by = +b.data("column");

        const dx = bx - ax;
        const dy = by - ay;

        if (dx === 0 && dy !== 0) return dy > 0 ? paths.horizon : paths.horizonBack;
        if (dy === 0 && dx !== 0) return dx > 0 ? paths.vert : paths.vertBack;

        if (Math.abs(dx) === Math.abs(dy)) {
            if (dx > 0 && dy > 0) return paths.priDiag;
            if (dx < 0 && dy < 0) return paths.priDiagBack;
            if (dx > 0 && dy < 0) return paths.secDiag;
            if (dx < 0 && dy > 0) return paths.secDiagBack;
        }

        return null;
    }

    function selectPath(start, end, path) {
        let x = +start.data("row");
        let y = +start.data("column");
        const ex = +end.data("row");
        const ey = +end.data("column");

        let word = "";

        while (true) {
            const cell = $(`.cell[data-row=${x}][data-column=${y}]`);
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
                const clean = w.replace(/\W/g, "");
                const reversed = clean.split("").reverse().join("");

                if (word === clean || word === reversed) {
                    $(`.listWord[data-word="${clean}"]`).addClass("found");
                    wordsFound.push(clean);
                    return true;
                }
            }
        }
        return false;
    }
}