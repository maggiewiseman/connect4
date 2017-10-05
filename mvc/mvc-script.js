(function() {

    function Cell(col, row) {
        this.player = null;
        this.col = col;
        this.row = row;
    }

    Cell.prototype.markCell = function(player) {
        if(this.player){
            return false;
        }
        this.player = player;
        return true;
    };

    //model
    /* The model is responsible for managing the data of the application. It responds to the request from the view and it also responds to instructions from the controller to update itself.
    */
    var game = {
        init : function() {
            this.numMoves = 0;
            this.winner = false;
            this.currPlayer = 'player1';
            this.rowCounter = [5,5,5,5,5,5,5];
            this.gameboard = this.generateBoard();
            controller.setEventListeners();
        },
        generateBoard : function() {
            var board = [];
            //this loop makes each column and adds to array
            for(var i = 0; i < 7; i++) {
                //this loop makes each row in the column and adds to colArray
                var colArr = [];
                for(var j = 0; j < 6; j++){
                    colArr.push(new Cell(i, j));
                }
                board.push(colArr);
            }

            return board;
        },
        getDiagonals : function(col, row) {

            var diagonals = [];
            //make left to right diagonal array
            //get top left
            var topLeft = [];
            if(col <= row) {
                topLeft = [0, Math.abs(col-row)];
            } else {
                topLeft = [Math.abs(col-row), 0];
            }
            diagonals.push(this.generateDiagonal(topLeft, 1, 7));

            var topRight = [];
            if((6 - col) >= row) {
                topRight = [(col + row) , 0];
            } else {
                topRight = [6, row - (6 - col)];
            }
            diagonals.push(this.generateDiagonal(topRight, -1));
            return diagonals;

        },
        generateDiagonal : function(top, direction){
            var col = top[0];
            var row = top[1];
            var arr = [];
            if(direction > 0){
                while(col < 7 && row < 6) {
                    arr.push(game.gameboard[col][row]);
                    col += direction;
                    row++;
                }
            } else {
                while(col >= 0 && row < 6) {
                    arr.push(game.gameboard[col][row]);
                    col += direction;
                    row++;
                }
            }
            return arr;
        },
        checkWin : function(column) {

            //check the column for a win
            if(this.checkSet(this.gameboard[column])) {
                console.log('in check win! We have a winner in a column');
                return true;
            }

            //check row
            if(this.checkSet(this.getRow(column))) {
                console.log('in check win! We have a winner in a row');
                return true;
            }

            //check diagonals
            var diagonals = this.getDiagonals(column, game.rowCounter[column]);
            for(var i = 0; i < diagonals.length; i++){
                if(this.checkSet(diagonals[i])) {
                    console.log('in check win! We have a winner in a diaganol');
                    return true;
                }
            }

            return false;
        },
        getRow : function(column) {

            //build a row
            var rowOfCells = [];
            var rowNum = game.rowCounter[column];
            for(var i = 0; i < game.gameboard.length; i++) {
                rowOfCells.push(game.gameboard[i][rowNum]);
            }
            return rowOfCells;
        },
        checkSet : function(set) {
            //this function takes an array of objects.  It loops through the objects building a string that will add a w if the currentPlayer owns that cell and l if not.
            //Then it will look for the index of wwww
            var winStr = '';
            set.forEach(function(cell){
                if(cell.player == game.currPlayer) {
                    winStr += 'w';
                } else {
                    winStr += 'l';
                }
            });
            if(winStr.indexOf('wwww') > -1) {
                console.log('we have a winner!');
                return true;
            }
            return false;
        },
        tieGame : function() {
            if(this.numMoves == 42 && !this.winner) {
                return true;
            } else {
                return false;
            }

        }
    };

    //responsible for animations
    var animate = {
        showPawn : function(e) {
            $(e.target).addClass(game.currPlayer);
        },
        hidePawn : function(e) {
            $(e.target).removeClass(game.currPlayer);
        },
        drop : function(e) {
            var id = e.target.id;
            //need to get margin...
            var column = controller.getCol(id);
            var row = controller.getRow(column);
            var margin = (row + 1) * 80;
            $(e.target).animate({marginTop: margin + 'px'}, 2000, 'easeOutBounce', function(){
                //mark the spot and update the game board
                controller.play(id);

                //move the pawn back up.
                $(e.target).css({marginTop: '0'}).removeClass('player1 player2');
            });
        },
        endGame : function() {
            $('#reset').addClass('blink').html('Play Again');
            $('.message').show().animate({'font-size': '100px'}, 2000);
        },
        generatePawn : function() {
            //create a circle with class pawn and player

            var columnOffset = $gameboard.children().eq(1).children().eq(0).children().eq(0).offset().left;

            var htmlPawn = '<div id="moving-pawn" class="circle pawn '+ game.currPlayer + '" style="left:'+ columnOffset +'px;"></div>';

            $(document.body).append(htmlPawn);
            //view.movePawn();
        },
        movePawn : function() {
            //$('#moving-pawn').toggle('slide', {direction: "up", distance: 500}, 1000);
        }
    };

    //controls the interactions between the model and the view
    /*The controller is responsible for responding to user input and perform interactions on the data model objects. The controller receives the input, it validates the input and then performs the business operation that modifies the state of the data model.
    */
    var controller = {
        setEventListeners : function() {
            //this is called by game.init function
            $('.circle.pawn').on('click', function(e){
                $('.circle.pawn').off('mouseenter mouseleave');
                animate.drop(e);
            });
            $('#reset').on('click', controller.reset);
            this.addHover();
        },
        addHover : function() {
            $('.circle.pawn').hover(animate.showPawn, animate.hidePawn);
        },
        play : function(id) {
            //get the row and column
            console.log('play function called');
            var column = this.getCol(id);
            var row = this.getRow(column);
            //use the row and column to update the model & view
            if(this.rowIsValid()) {
                this.updateBoard(column,row);
            }
            if(row == 0) {
                if(game.tieGame()){
                    $message.html("It's a tie!");
                    animate.endGame();
                }
            }
        },
        // dropDone : function (id) {
        //     controller.play(id);
        // },
        rowIsValid : function(row) {
            if(row < 0) {
                $message.html('That column is full. ' + game.currPlayer + ' please choose another column.');
                return false;
            } else {
                return true;
            }
        },
        updateBoard : function(column, row) {
            //call the markCell function to update model, if successful
            //update view & check for win
            if(game.gameboard[column][row].markCell(game.currPlayer)) {
                game.numMoves++;
                //change the color on the screen
                $gameboard.children().eq(column).children().eq(row).children().eq(0).addClass(game.currPlayer);
                //check win
                if(!game.checkWin(column)) {
                    //switch players and then
                    //display a message that says whose turn it is.
                    game.currPlayer = game.currPlayer == 'player1' ? 'player2' : 'player1';

                    $('.message').html(game.currPlayer + '\'s turn!');

                    //decrement column counter so we know which is the next cell to fill.
                    game.rowCounter[column]--;
                    this.addHover();
                } else {
                    //display winning message & other animations
                    $('.message').html(game.currPlayer + ' wins!!');
                    animate.endGame();
                    game.winner = true;

                }
            } else {
                console.log('mark cell failed. Try again.');
                this.addHover();
            }
        },
        reset : function() {
            console.log('resetting');

            $message.html('').css({'font-size': '24px'});
            $gameboard.hide( "explode", {pieces: 16 }, 2000 );
            controller.clearBoard();
            $gameboard.show( "explode", {pieces: 8 }, 2000 );
            $('#reset').removeClass('blink').html('Start Over').off('click');
            $('.circle.pawn').off('click hover');

            game.init();
            console.log(game.rowCounter);
            console.log(game.gameboard);
            console.log('currPlayer', game.currPlayer);
        },
        clearBoard : function() {
            for(var i = 0; i < $gameboard.children().length; i++) {
                for(var k = 0; k < $gameboard.children().eq(i).children().length; k++){
                    $gameboard.children().eq(i).children().eq(k).children().eq(0).removeClass('player1 player2');
                }
            }
        },
        getCol: function(id) {
            var column = parseInt(id.substring(3),10);
            return column;
        },
        getRow : function(column) {
            var row = game.rowCounter[column];
            return row;
        }
    };

    var $message = $('.message');
    var $gameboard = $('.gameboard');
    game.init();


}());
