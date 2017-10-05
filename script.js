(function() {
    var colRowMap = [];

    function Cell(col, row, ref) {
        this.col = col;
        this.row = row;
        this.type = null;
        this.cell = ref;
    }

    Cell.prototype.markCell = function(player) {
        this.cell.addClass(player);
        this.type = player;
    };

    Cell.prototype.clearCell = function() {
        this.cell.removeClass('player1 player2');
        this.type = null;
    };

    var game = {
        init: function() {
            this.currPlayer = 'player1';
            this.columnCounter = [5,5,5,5,5,5,5];
            this.gameboard = this.generateBoard();
            this.diagonals = this.generateDiagonals();
        },
        //gameboard is an array of each possible cell. Each entry in the array is an object that contains the
        generateBoard: function(){
            var board = [];
            for(var i = 0; i < 7; i++){
                for(var j =0; j < 6; j++){
                    var cell = $('.gameboard').children().eq(i).children().eq(j).children().eq(0);
                    board.push(new Cell(i, j, cell));
                    colRowMap.push(i + ',' + j);
                }
            }
            //return an array of objects that represent each cell
            console.log(board);
            return board;
        },
        generateDiagonals: function() {
            var diagonals =     [
                [0, 7, 14, 21, 28, 35],
                [6, 13, 20, 27, 34, 41],
                [12, 19, 26, 33, 40],
                [18, 25, 32, 39],
                [1, 8, 15, 22, 29],
                [2, 9, 16, 23],
                [36, 31, 26, 21, 16, 11],
                [30, 25, 20, 15, 10, 5],
                [24, 19, 14, 9, 4],
                [18, 13, 8, 3],
                [37, 32, 27, 22, 17],
                [38, 33, 28, 23]
            ];

            var cellDiagonals = [];
            diagonals.forEach(function(diag){
                var cellDiag = [];
                diag.forEach(function(cellIndex){
                    cellDiag.push(game.gameboard[cellIndex]);
                });

                cellDiagonals.push(cellDiag);
                //loop through each value in the diag array and get the correpsonding game.gameboard[]
            }); //end forEach

            return cellDiagonals;
        }
    };

    function mark(e) {
        var column = e.currentTarget.id.substring(3);
        //get the counter for this column
        //what is the current empty spot (which row in the column)
        var row = game.columnCounter[column];
        //check to make sure the column is not completely filled
        if(row >= 0) {
            var cellIndex = colRowMap.indexOf(column + ',' + row);
            game.gameboard[cellIndex].markCell();
            //decrement counter so we know that spot is taken.
            game.columnCounter[column]--;
        } else {
            console.log('no spots left in this column');
            game.currPlayer = game.currPlayer == 'player1' ? 'player2' : 'player1';
        }
    }

    function checkSet(arr) {
        //this function takes an array of objects.  It loops through the objects building a string that will add a w if the currentPlayer owns that cell and l if not.
        //Then it will look for the index of wwww
        var winStr = '';
        arr.forEach(function(cell){
            if(cell.type == game.currPlayer) {
                winStr += 'w';
            } else {
                winStr += 'l';
            }
        });
        if(winStr.indexOf('wwww') > 0) {
            console.log('we have a winner!');
            return true;
        }
        return false;
    }

    function checkWin() {
        //get sets for columns
        //splice the gameboard into 7 chunks of 6 cells
        //send in each chunk
        var cols =[];
        var i = 0;
        while(i < 42){
            cols[i] = game.gameboard.slice(i, i + 6);

            if(checkSet(cols[i])){
                return true;
            } else {
                i += 6;
            }
        }

        //get sets for rows
        var j = 0;
        while(j < 6) {
            var row = [];
            var k = j;
            while(k < 42) {
                row.push(game.gameboard[k]);
                k += 6;
            }
            console.log(row);
            if(checkSet(row)) {
                return true;
            } else {
                j++;
            }
        }

        //get sets for diagonals
        for(var m = 0; m < game.diagonals.length; m++) {
            if(checkSet(game.diagonals[m])) {
                return true;
            }
        }
        //return false if there is no winner.
        return false;
    }

    function play(e) {

        mark(e);

        if(!checkWin()) {
            //switch players and then
            //display a message that says whose turn it is.
            game.currPlayer = game.currPlayer == 'player1' ? 'player2' : 'player1';
            $('.message').html(game.currPlayer + '\'s turn!');
        } else {
            //display winning message
            console.log('The winner is: ' + game.currPlayer);
            $('.message').html(game.currPlayer + ' wins!!');
            $('.column').off('click');
            $('#reset').addClass('blink');
            $('.message').toggle().animate({'font-size': '100px'}, 2000);
        }
    }

    function reset() {
        //reset game values
        //not calling init again because it would clear the gameboard
        game.init();
        // game.currPlayer = 'player1';
        // game.columnCounter = [5,5,5,5,5,5,5];
        game.gameboard.forEach(function(cell){
            cell.clearCell();
        });
        $('.message').toggle();
        $('#reset').removeClass('blink').blur();
        $('.column').on('click', play);

    }
    //initialize the gameboard
    game.init();
    $('.message').toggle();
    //console.log("gameboard: " + game.gameboard[0].cell.addClass('player1'));
    //addEventListeners
    $('.column').on('click', play);
    $('#reset').on('click', function(){
        $('.gameboard').hide( "explode", {pieces: 16 }, 2000 );
        $('.gameboard').show( "explode", {pieces: 8 }, 2000 );
        reset();

    });

}());

/*
Each div at the top has a specific id that represents its location.
Every time someone click on a div at the top a piece falls in to the proper column.
A counter for each column is updated so I know where each piece is
The column counter corresponds to...

A map of the table can be represented in javascript as an array of 42 objects.
Each object has the property of
-filled: true/false
-player: 1/2

or on each turn, I loop through the set of winning combinations and start a counter if the winning combination
has that cell in it.
but I need to keep track of who has the spot
so I could call a counter for player 1 and a counter for player 2.  If player 1 has one and player 2 gets one in that combo that we auto matically delete this from the options (slice it out of array?)
then i call a function that asks for the counters - if any of them are 4, then we have a winner!



A map of winning combinations is an array of all the possible wins.
[{
    pattern: '1 2 3 4';
    yellow: '1 '
    red:
}

*/
//SO action of play goes
//row1.on('click', function(){
//get the id of the column that was clicked
//get the count for the column
//match that to the cell's coordinate
//get the nth child of the gameboard div and change its color to the appropriate color (add class for player 1 or player 2)
//loop through the array of win objects
//if the coordinate exists in that object
//increment a counter for the current player
//check all the counters in all the objects for 4
//if no 4, play goes to next player, print message to screen that says next players turn
//if there is a 4, print message to the screen that says we have a winner

// [0, 8, 16, 24, 32, 40],
// [7, 15, 23, 31, 39],
// [14, 22, 30, 38],
// [1, 9, 17, 25, 33, 41],
// [2, 10, 18, 26, 34],
// [3, 11, 19, 27],
// [35, 29, 23, 17, 11, 5],
// [36, 30, 24, 18, 12, 6],
// [37, 31, 25, 19, 13],
// [38, 32, 26, 20],
// [28, 22, 16, 10, 4],
// [21, 15, 9, 3]
