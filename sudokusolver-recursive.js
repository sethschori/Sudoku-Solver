/* ===========================================================================================

SudokuSolver.js solves Sudoku puzzles by following the same Sudoku rules that human players
must follow (i.e. it doesn't test multiple possibilities or use brute force approaches).

Credit to https://www.kristanix.com/sudokuepic/sudoku-solving-techniques.php for the Suduko-
solving techniques which I have used in this program, and I have used the techniques' names 
as the names for three functions in this program: Sole Candidate, Unique Candidate, and 
Naked Subset.

=========================================================================================== */

var board = [];

function solveIt() {
	
	function solveRecursive() {
		// check board for a null cell
		// if no null cells, then puzzle has been solved

		var nullRowCol = findNextNull();

		if (nullRowCol === false) {
			// return true because the last null cell was filled in correctly
			return true;
		} else {
			var currentRow = nullRowCol[0];
			var currentCol = nullRowCol[1];
		}

		// loop through values 1 to 9 for the null cell and
		// gather the values for the cell's row, column, and nonet

		for (var i = 1; i <= 9; i++) {
			var currentNonet = getNonet(currentRow, currentCol);
			var gatheredNonetVals = extractNonet(currentNonet);
			var gatheredRowVals = extractRow(currentRow);
			var gatheredColVals = extractCol(currentCol);
			var recursiveResult;
			// check whether the candidate value (1 to 9) conflicts with the gathered values
			if (gatheredNonetVals.indexOf(i) === -1 && gatheredRowVals.indexOf(i) === -1 && gatheredColVals.indexOf(i) === -1) {
				// if the candidate value doesn't conflict with the gathered values, then write the candidate value to the board
				board[currentRow][currentCol].value = i;
				// if the recursive attempt at the next null cell returns false, then continue with the remaining 1 to 9 values
				recursiveResult = solveRecursive();
				if(!recursiveResult) {
				} else {
					return true;
				}
			}
		} 
		// if 9 also conflicts, then "step back" to the previous null cell by returning false
		board[currentRow][currentCol].value = null;
		return false;
	}

	solveRecursive();
	printBoard();

	function findNextNull() {
		for (var row = 0; row <= 8; row++) {
			for (var col = 0; col <= 8; col++) {
				if (!board[row][col].value) {
					return [row, col];
				}
			}
		}
		return false;
	}

	// Extracts all values in nonet and returns the non-null values as an array.
	function extractNonet(nonet, array) {
		var returnArr = [];
		for (var row = getNonetXY(nonet)[0]; row <= getNonetXY(nonet)[0] + 2; row++) {
			for (var col = getNonetXY(nonet)[1]; col <= getNonetXY(nonet)[1] + 2; col++) {
				if (board[row][col].value !== null) { // && returnArr.indexOf(board[row][col]) === -1
					returnArr.push(board[row][col].value);
				}
			}
		}
		return returnArr;
	}

	// Extracts all non-null values in currentRow and returns them as an array.
	function extractRow(currentRow) {
		var returnArr = [];
		for (var col = 0; col <= 8; col++) {
			if (board[currentRow][col].value !== null) { // && returnArr.indexOf(board[currentRow][col]) === -1
				returnArr.push(board[currentRow][col].value);
			}
		}
		return returnArr;
	}

	// Extracts all non-null values in currentCol and returns them as an array.
	function extractCol(currentCol) {
		var returnArr = [];
		for (var row = 0; row <= 8; row++) {
			if (board[row][currentCol].value !== null) { // && returnArr.indexOf(board[row][currentCol]) === -1
				returnArr.push(board[row][currentCol].value);
			}
		}
		return returnArr;
	}

	// Returns the nonet number for a given row and column.
	function getNonet(row, col) {
		if (row < 3) {
			if (col < 3) {
				return 0;
			} else if (col < 6) {
				return 1;
			} else {
				return 2;
			}
		} else if (row < 6) {
			if (col < 3) {
				return 3;
			} else if (col < 6) {
				return 4;
			} else {
				return 5;
			}
		} else {
			if (col < 3) {
				return 6;
			} else if (col < 6) {
				return 7;
			} else {
				return 8;
			}
		}
	}

	// Returns the upper-left row/column coordinates for a given nonet. For example,
	// nonet 0 starts at row 0, column 0. 
	function getNonetXY(nonetNumber){
		switch (nonetNumber) {
			case 0:
				return [0, 0];
			case 1:
				return [0, 3];
			case 2:
				return [0, 6];
			case 3:
				return [3, 0];
			case 4:
				return [3, 3];
			case 5:
				return [3, 6];
			case 6:
				return [6, 0];
			case 7:
				return [6, 3];
			case 8:
				return [6, 6];
		}
	}
}

// printBoard prints the board to the screen.
function printBoard() {
    var output;
    var rowColQuery;
    var valueToOutput;
	for (var row = 0; row <= 8; row++) {
		for (var col = 0; col <= 8; col++) {
			valueToOutput = board[row][col].value;
			rowColQuery = "#recur_r" + row + "c" + col;
			output = document.querySelector(rowColQuery);
			output.textContent = valueToOutput;
			if (board[row][col].given) {
				output.className = "given";
			} else {
				output.className = "notgiven";
			}
		}
	}
}

// printBoardConsole prints the board to the console. It's only used for testing and development of the program.
function printBoardConsole() {
	for (var i = 0; i <= 8; i++) {
		console.log(board[i].join("\t"));
	}
}


function resetPlaySpace() {
	boardSubmitted = [];
	board = [
			 [null,null,null,null,null,null,null,null,null,],
			 [null,null,null,null,null,null,null,null,null,],
			 [null,null,null,null,null,null,null,null,null,],
			 [null,null,null,null,null,null,null,null,null,],
			 [null,null,null,null,null,null,null,null,null,],
			 [null,null,null,null,null,null,null,null,null,],
			 [null,null,null,null,null,null,null,null,null,],
			 [null,null,null,null,null,null,null,null,null,],
			 [null,null,null,null,null,null,null,null,null,],
			];
	submitPuzzle.disabled = false;
	boardToDisplay.style.display = "none";
}

var form = document.querySelector("form");
var boardToDisplay = document.getElementById("recur_board");
var cellSubmitted;
var cellValue;
var submitPuzzle = document.getElementById("recur_submitPuzzle");
submitPuzzle.addEventListener("click", function(event) {
	var boardSubmitted = [];
	for (var formRow = 0; formRow <= 8; formRow++) {
		var rowSubmitted = [];
		for (var formCol = 0; formCol <= 8; formCol++) {
			cellSubmitted = "recur_input" + formRow + formCol;
			cellValue = form.elements[cellSubmitted].value;
			if (cellValue.length === 0) {
				cellValue = null;
			} else {
				cellValue = parseInt(cellValue, 10);
			}
			rowSubmitted.push({given: (cellValue ? true : false), value: cellValue});
		}
		boardSubmitted.push(rowSubmitted);
	}
	// event.preventDefault(); // This line was only needed when the button was a "submit" button. It has been changed to a "button" button.
	board = boardSubmitted.slice();
	boardToDisplay.style.display = "block";
	solveIt();
	submitPuzzle.disabled = true;
}, false); // close the form.addEventListener anonymous function

var resetPuzzle = document.getElementById("recur_resetPuzzle");
resetPuzzle.addEventListener("click", function(event) {
	resetPlaySpace();
	form.elements.recur_input00.focus();
	printBoard();
});

var recurFillInPuzzleEasy = document.getElementById("recur_fillInPuzzleEasy");
recurFillInPuzzleEasy.addEventListener("click", function(event) {
	resetPlaySpace();
	recurFillInSpecifiedPuzzle("easy");
});

var recurFillInPuzzleMedium = document.getElementById("recur_fillInPuzzleMedium");
recurFillInPuzzleMedium.addEventListener("click", function(event) {
	resetPlaySpace();
	recurFillInSpecifiedPuzzle("medium");
});

var recurFillInPuzzleHard = document.getElementById("recur_fillInPuzzleHard");
recurFillInPuzzleHard.addEventListener("click", function(event) {
	resetPlaySpace();
	recurFillInSpecifiedPuzzle("hard");
});

function recurFillInSpecifiedPuzzle(puzzleType) {
	if (puzzleType === "easy") {
		var sampleBoard =
			// Easy-level sample board from websudoku.com
			[
			[5,		null,	null,	8,		null,	null,	null,	7,		1		],
			[1,		null,	null,	2,		null,	6,		9,		null,	4		],
			[2,		8,		null,	null,	1,		null,	null,	null,	null	],

			[null,	1,		8,		null,	null,	null,	null,	null,	7		],
			[null,	4,		null,	null,	null,	null,	null,	6,		null	],
			[9,		null,	null,	null,	null,	null,	5,		4,		null	],

			[null,	null,	null,	null,	4,		null,	null,	2,		5		],
			[4,		null,	6,		1,		null,	2,		null,	null,	9		],
			[7,		3,		null,	null,	null,	9,		null,	null,	6		]
			];
	} else if (puzzleType === "medium") {
		var sampleBoard =
			// Medium-level sample board from websudoku.com
			[	
			[1,		null,	null,	null,	4,		null,	8,		null,	2		],
			[2,		null,	null,	null,	null,	1,		null,	null,	null	],
			[null,	null,	7,		3,		null,	null,	4,		1,		null	],

			[null,	null,	2,		null,	1,		null,	null,	null,	6		],
			[null,	4,		null,	null,	8,		null,	null,	5,		null	],
			[3,		null,	null,	null,	6,		null,	2,		null,	null	],

			[null,	2,		5,		null,	null,	7,		6,		null,	null	],
			[null,	null,	null,	6,		null,	null,	null,	null,	4		],
			[7,		null,	6,		null,	3,		null,	null,	null,	8		]	
			];
	} else if (puzzleType === "hard") {
		var sampleBoard =
			// Hard-level sample board from websudoku.com
			[
			[null,	7,		null,	null,	9,		null,	3,		null,	null	],
			[null,	null,	null,	null,	8,		2,		null,	5,		4		],
			[1,		5,		null,	null,	null,	null,	8,		null,	null	],

			[9,		null,	null,	null,	null,	4,		1,		2,		null	],
			[null,	null,	null,	null,	null,	null,	null,	null,	null	],
			[null,	3,		1,		9,		null,	null,	null,	null,	7		],

			[null,	null,	9,		null,	null,	null,	null,	3,		8		],
			[2,		1,		null,	8,		4,		null,	null,	null,	null	],
			[null,	null,	7,		null,	3,		null,	null,	6,		null	]
			];
	} else if (puzzleType === "evil") {
		var sampleBoard =
			// Evil-level sample board from websudoku.com
			[
				[8,		null,	null,	null,	null,	3,		5,		null,	null	],
				[null,	3,		7,		null,	null,	null,	null,	null,	null	],
				[null,	6,		null,	2,		9,		null,	null,	null,	1		],

				[null,	null,	1,		null,	2,		null,	null,	null,	null	],
				[null,	7,		null,	5,		null,	1,		null,	6,		null	],
				[null,	null,	null,	null,	6,		null,	8,		null,	null	],

				[7,		null,	null,	null,	3,		9,		null,	5,		null	],
				[null,	null,	null,	null,	null,	null,	1,		7,		null	],
				[null,	null,	2,		8,		null,	null,	null,	null,	9		]
			];
	}

	for (var formRow = 0; formRow <= 8; formRow++) {
		for (var formCol = 0; formCol <= 8; formCol++) {
			formRowCol = "recur_input" + formRow + formCol;
			form.elements[formRowCol].value = sampleBoard[formRow][formCol];
		}
	}
}