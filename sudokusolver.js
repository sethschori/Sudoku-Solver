/* ===========================================================================================

SudokuSolver.js solves Sudoku puzzles by following the same Sudoku rules that human players
must follow (i.e. it doesn't test multiple possibilities or use brute force approaches).
The reasons for taking this approach are 1) it lets me learn how to translate rules of play 
into JavaScript functions and 2) if I evolve this program to have an actual UI then it could
demonstrate to the user how it is solving the board.

In its current form this program only solves easy and medium difficulty Sudoku puzzles. I plan
to integrate more algorithms into the program so that it will solve a greater range of puzzles
and, perhaps, someday will solve any Sudoku puzzle.

The Sudoku board is a 9x9 grid of 81 cells. At the start of a Sudoku game, numerous cells on 
the board are blank and the goal is to fill each cell with a single digit between 1 and 9. 
Each of the 9 rows and each of the 9 columns in the grid must contain each digit from 1 to 9
without duplication. Additionally, the board is subdivided into 9 nonets. A nonet is a 3x3 
quadrant within the Sudoku grid, with each nonet containing 9 cells. The final requirement 
is that each nonet must contain each digit from 1 to 9 without duplication.

An approach to solving easy Sudoku puzzles is to examine each cell on the board and to search for
a cell where 8 of the 9 possible digits are already present within that cell's row, column,
and nonet. Once that cell has been found the remaining ninth digit is the logical only result
for that cell. This is a process of elimination which can be repeated for all cells on the 
board until the entire board has been filled in.

This program uses that approach and loops through all nonets from 0 through 8. It checks to
see whether that nonet has already been solved. If it has not been solved then it loops 
through all of the cells in that nonet, testing to see whether any of them can be solved, and
repeats this process until all of the nonets have been completed.

This program can only solve one Sudoku puzzle which is hard-coded into an array variable. It 
outputs the solution to the console. 

Future upgrade plans include: displaying the puzzle on the screen instead of the console and 
allowing users to input their own puzzle which can then be solved. Another upgrade idea is to 
have the program generate random Sudoku puzzles as well.

Credit to kristanix.com for Suduko-solving techniques which I have used in this program,
along with using the techniques' names as function names in this program:
https://www.kristanix.com/sudokuepic/sudoku-solving-techniques.php

=========================================================================================== */

// The board variable holds the Sudoku puzzle that will be solved.
// Credit to websudoku.com for the three Sudoku puzzles below.

// Evil-level board from websudoku.com 
// var board = [	[8,		null,	null,	null,	null,	3,		5,		null,	null	],
// 				[null,	3,		7,		null,	null,	null,	null,	null,	null	],
// 				[null,	6,		null,	2,		9,		null,	null,	null,	1		],

// 				[null,	null,	1,		null,	2,		null,	null,	null,	null	],
// 				[null,	7,		null,	5,		null,	1,		null,	6,		null	],
// 				[null,	null,	null,	null,	6,		null,	8,		null,	null	],

// 				[7,		null,	null,	null,	3,		9,		null,	5,		null	],
// 				[null,	null,	null,	null,	null,	null,	1,		7,		null	],
// 				[null,	null,	2,		8,		null,	null,	null,	null,	9		]	];

// Hard-level board from websudoku.com
var board = [	[null,	7,		null,	null,	9,		null,	3,		null,	null	],
				[null,	null,	null,	null,	8,		2,		null,	5,		4		],
				[1,		5,		null,	null,	null,	null,	8,		null,	null	],

				[9,		null,	null,	null,	null,	4,		1,		2,		null	],
				[null,	null,	null,	null,	null,	null,	null,	null,	null	],
				[null,	3,		1,		9,		null,	null,	null,	null,	7		],

				[null,	null,	9,		null,	null,	null,	null,	3,		8		],
				[2,		1,		null,	8,		4,		null,	null,	null,	null	],
				[null,	null,	7,		null,	3,		null,	null,	6,		null	]	];

// Medium-level board from websudoku.com
// var board = [	[1,		null,	null,	null,	4,		null,	8,		null,	2		],
// 				[2,		null,	null,	null,	null,	1,		null,	null,	null	],
// 				[null,	null,	7,		3,		null,	null,	4,		1,		null	],

// 				[null,	null,	2,		null,	1,		null,	null,	null,	6		],
// 				[null,	4,		null,	null,	8,		null,	null,	5,		null	],
// 				[3,		null,	null,	null,	6,		null,	2,		null,	null	],

// 				[null,	2,		5,		null,	null,	7,		6,		null,	null	],
// 				[null,	null,	null,	6,		null,	null,	null,	null,	4		],
// 				[7,		null,	6,		null,	3,		null,	null,	null,	8		]	];

// Easy-level board from websudoku.com
// var board = [	[5,		null,	null,	8,		null,	null,	null,	7,		1		],
// 				[1,		null,	null,	2,		null,	6,		9,		null,	4		],
// 				[2,		8,		null,	null,	1,		null,	null,	null,	null	],

// 				[null,	1,		8,		null,	null,	null,	null,	null,	7		],
// 				[null,	4,		null,	null,	null,	null,	null,	6,		null	],
// 				[9,		null,	null,	null,	null,	null,	5,		4,		null	],

// 				[null,	null,	null,	null,	4,		null,	null,	2,		5		],
// 				[4,		null,	6,		1,		null,	2,		null,	null,	9		],
// 				[7,		3,		null,	null,	null,	9,		null,	null,	6		]	];

// load the sdk functions so they can be called when needed
exportSDK();

// nonetsStatus holds the completion status of each nonet. All nonets start as false (meaning
// they are incomplete, and by the end all are true (i.e. solved).  
var nonetsStatus = [false, false, false, false, false, false, false, false, false];

// currentRow and currentCol track the coordinates of which cell is currently being evaluated.
var currentRow;
var currentCol;

// trackerObj holds the possible candidates that can be filled in for any cell.
var trackerObj = {};

// Populate trackerObj with default starting values.
sdk.trackerObjDefaults();

// Print the starting values of the board to the console.
// sdk.printBoard();

// Given a nonet and row/column pair, checks whether eight values are already present in the nonet, row,
// and column. If so, it returns the "missing" ninth value, otherwise it returns false.
function soleCandidate(nonet, currentRow, currentCol) {

	var gatheredNonetVals = sdk.extractNonetUnique(nonet);
	var gatheredRowVals = sdk.extractRow(currentRow);
	var gatheredColVals = sdk.extractCol(currentCol);

	var gatheredValues = gatheredNonetVals.concat(gatheredRowVals).concat(gatheredColVals);

	var uniqueValues = [];

	// filter the unique values from gatheredValues into uniqueValues
	for (var i = 0; i < gatheredValues.length; i++) {
		var value = gatheredValues[i];
		if (uniqueValues.indexOf(value) === -1) {
			uniqueValues.push(value);
		}
	}

	// If there are 8 values in gatheredValues, this means that the missing 9th value is the one that
	// should be written to the current cell (located at the intersection of currentRow and currentCol).
	// The 9th value equals 45 (9 + 8 + ... + 2 + 1) minus the sum of the 8 values in gatheredValues.
	if (uniqueValues.length === 8) {
		return 45 - uniqueValues.reduce(function(a, b){return a + b});
	} else {
		return false;
	}
}

// Check whether there is a number which -- by virtue of being in other columns and rows on the board --
// can only be valid in one cell. If so, it returns that value, if it can't it returns false.
function uniqueCandidate(nonet, currentRow, currentCol) {
	// build an object with properties that hold 1) the non-null values in the nonet and 2) the values
	// in each row and column that intersects the nonet
	function buildNonetProperties(nonet) {
		var obj = {}
		obj.nonetVals = sdk.extractNonetUnique(nonet);
		var nonetXY = sdk.getNonetXY(nonet);
		obj.startRow = nonetXY[0];
		obj.startCol = nonetXY[1];
		for (var i = obj.startRow; i <= obj.startRow + 2; i++) {
			obj["row"+i] = sdk.extractRow(i);
		}
		for (var j = obj.startCol; j <= obj.startCol + 2; j++) {
			obj["col"+j] = sdk.extractCol(j);
		}
		return obj;
	}
	var nonetProperties = buildNonetProperties(nonet);
	// loop each number from 1 to 9 in order to test whether that number is in other columns and rows
	for (var i = 1; i <= 9; i++) {
		var winnerFlag = true;
		// if that number is not already present in the nonet (nonetProperties.nonetVals), then...
		if (nonetProperties["nonetVals"].indexOf(i) === -1) {
			// loop each blank cell in the nonet and test whether the number is present in the row
			// OR column that intersects that cell (excluding the cell being checked for unique candidacy)
			// console.log("i: ",i, "not present in nonet");
			for (var row = nonetProperties.startRow; row <= nonetProperties.startRow + 2; row++) {
				for (var col = nonetProperties.startCol; col <= nonetProperties.startCol + 2; col++) {
					if (!board[row][col]) {
						// console.log("WE'RE EVALUATING A BLANK CELL");
						// console.log("winnerFlag:",winnerFlag);
						// console.log("row: ",row,"col: ",col,board[row][col]);
						// console.log("row"+row+" vals: ",nonetProperties["row"+row]);
						// console.log("col"+col+" vals: ",nonetProperties["col"+col]);
						// console.log("currentRow:",currentRow,"currentCol:",currentCol,"row:",row,"col:",col);
						// console.log("nonetProperties['row'+row].indexOf(i):", nonetProperties['row'+row].indexOf(i));
						// console.log("nonetProperties['col'+col].indexOf(i):", nonetProperties['col'+col].indexOf(i));
						if (nonetProperties["row"+row].indexOf(i) === -1 && nonetProperties["col"+col].indexOf(i) === -1) {
							// console.log("WE FOUND A CELL THAT DOESN'T MEET CRITERIA");
							if (!(row === currentRow && col === currentCol)) {
								// console.log("currentRow:",currentRow,"currentCol:",currentCol,"row:",row,"col:",col);
								// console.log("FAILED");
								winnerFlag = false;
								// console.log("winnerFlag",winnerFlag);
							}
						} else {
							// console.log("PASSED");
						}
					}
				}
			}
			// if a unique candidate is found, return it
			if (winnerFlag) return i;
		}
	}
	// if values 1 through 9 all failed, then return false 
	return false;
}

// Checks whether there are two pairs of the same candidate values that appear for two different cells within a given row or column.
// If so, then those two values must be placed in those two cells and those values can be removed as possible candidate values for
// other cells within the given row or column.
function nakedSubset() {
	function nSRows() {
		// loop through each row of candidate values in trackerObj
		for (var row = 0; row <= 8; row++) {
			var potentialSubset = [];
			for (var col = 0; col <= 8; col++) {
				var currentRowCol = "r" + row + "c" + col;
				// if the number of possible candidate values is two
				if (trackerObj[currentRowCol].length === 2) {
					// see if that pair of values is the same pair of values for another cell further along in that row
					potentialSubset = trackerObj[currentRowCol];
					for (var nextCol = col + 1; nextCol <= 8; nextCol++) {
						var nextRowCol = "r" + row + "c" + nextCol;
						if (trackerObj[nextRowCol].length === 2) {
							if (trackerObj[currentRowCol][0] === trackerObj[nextRowCol][0] && trackerObj[currentRowCol][1] === trackerObj[nextRowCol][1]) {
								// if so, loop through the cells in this row again
								for (var colRemoval = 0; colRemoval <= 8; colRemoval++) {
									// and remove the potentialSubset values as candidates for other cells within that row
									var removalRowCol = "r" + row + "c" + colRemoval;
									if (trackerObj[removalRowCol].length > 2) {
										console.log("going to remove Naked Subset", potentialSubset, "at:",removalRowCol);
										trackerObj[removalRowCol] = sdk.trackerObjRemove(removalRowCol, potentialSubset);
									}
								}
							}
						}
					}
				}
			}
		}
	}
	function nSCols() {
		// loop through each column of candidate values in trackerObj
		for (var col = 0; col <= 8; col++) {
			var potentialSubset = [];
			for (var row = 0; row <= 8; row++) {
				var currentRowCol = "r" + row + "c" + col;
				// if the number of possible candidate values is two
				if (trackerObj[currentRowCol].length === 2) {
					// see if that pair of values is the same pair of values for another cell further along in that column
					potentialSubset = trackerObj[currentRowCol];
					for (var nextRow = row + 1; nextRow <= 8; nextRow++) {
						var nextRowCol = "r" + row + "c" + nextRow;
						if (trackerObj[nextRowCol].length === 2) {
							if (trackerObj[currentRowCol][0] === trackerObj[nextRowCol][0] && trackerObj[currentRowCol][1] === trackerObj[nextRowCol][1]) {
								// if so, loop through the cells in this column again
								for (var rowRemoval = 0; rowRemoval <= 8; rowRemoval++) {
									// and remove the potentialSubset values as candidates for other cells within that column
									var removalRowCol = "r" + row + "c" + rowRemoval;
									if (trackerObj[removalRowCol].length > 2) {
										console.log("going to remove Naked Subset", potentialSubset, "at:",removalRowCol);
										trackerObj[removalRowCol] = sdk.trackerObjRemove(removalRowCol, potentialSubset);
									}
								}
							}
						}
					}
				}
			}
		}
	}
	nSRows();
	nSCols();
}

// This is the heart of the program. Continue looping through all of the nonets until all of
// them have been filled in.
function solveIt() {
	var passes = 0;
	while (nonetsStatus.indexOf(false) !== -1 && passes < 5) {
		console.log("Trying Sole Candidate approach.")
		sdk.loopNonets(soleCandidate);
		sdk.wait(200);
		sdk.printBoard();
		sdk.printBoardConsole();
		console.log("Trying Unique Candidate approach.")
		sdk.loopNonets(uniqueCandidate);
		sdk.wait(200);
		sdk.printBoard();
		sdk.printBoardConsole();
		console.log("Trying Naked Subset approach.")
		sdk.trackerObjUpdate();
		nakedSubset();
		sdk.trackerObjCheck();
		sdk.wait(200);
		sdk.printBoard();
		sdk.printBoardConsole();
		passes++;
	}
}


console.log("\n\n");

// Print the solved puzzle to the console.
// sdk.printBoard();


/* ====================================================================================================================

Define sdk "helper" functions.

sdk holds functions which are useful to the global scope, I'm putting them here to avoid
polluting the global scope. Eventually I may consider moving them to a seperate file, although
I'm not sure how to do that yet. "sdk" is a play on Sudoku and Software Development Kit.

==================================================================================================================== */

var sdk = {};

function exportSDK() {

	sdk = { 

		// Credit for pausecomp goes to http://www.sean.co.uk/a/webdesign/javascriptdelay.shtm
		// I copy/pasted it from that webpage when I was looking for a way to delay "writing" to the webpage.
		pausecomp: function(ms)  {
			ms += new Date().getTime();
			while (new Date() < ms){}
		},

		wait: function(countTo) {
			console.log("waiting for",countTo);
			for (var i = 0; i <= countTo; i++) {
			}
		},

		// printBoard prints the board to the screen.
		printBoard: function() {
		    var output;
		    var rowColQuery;
		    var valueToOutput;
			for (var row = 0; row <= 8; row++) {
				for (var col = 0; col <= 8; col++) {
					valueToOutput = board[row][col];
					rowColQuery = "#r" + row + "c" + col;
					output = document.querySelector(rowColQuery);
					output.textContent = valueToOutput;
				}
			}
		},

		// // printBoardConsole prints the board to the console.
		printBoardConsole: function() {
			for (var i = 0; i <= 8; i++) {
				console.log(board[i].join("\t"));
			}
		},

		// trackerObjDefaults populates trackerObj with default candidate values at the program's inception.
		trackerObjDefaults: function() {
			for (var row = 0; row <= 8; row++) {
				for (var col = 0; col <= 8; col++) {
					trackerObj["r" + row + "c" + col] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
				}
			}
		},

		// trackerObjUpdate removes invalid candidate values from trackerObj
		trackerObjUpdate: function() {
			// loop all cells
			for (var nonet = 0; nonet <= 8; nonet++) {
				var startRow = this.getNonetXY(nonet)[0];
				var startCol = this.getNonetXY(nonet)[1];
				for (var row = startRow; row <= startRow + 2; row++) {
					for (var col = startCol; col <= startCol + 2; col++) {
						// if cell has a value, set trackerObj key/value pair to []
						if (board[row][col] !== null) {
							trackerObj["r" + row + "c" + col] = [];
						} else {
							// if cell is null, gather row/col/nonet values into uniqueValues
							var gatheredNonetVals = this.extractNonetUnique(nonet);
							var gatheredRowVals = this.extractRow(row);
							var gatheredColVals = this.extractCol(col);

							var gatheredValues = gatheredNonetVals.concat(gatheredRowVals).concat(gatheredColVals);

							var uniqueValues = [];

							// filter the unique values from gatheredValues into uniqueValues
							for (var i = 0; i < gatheredValues.length; i++) {
								var value = gatheredValues[i];
								if (uniqueValues.indexOf(value) === -1) {
									uniqueValues.push(value);
								}
							}
							// then remove uniqueValues from trackerObj key/value pair
							var thisRowCol = "r" + row + "c" + col;
							var filtered = this.trackerObjRemove(thisRowCol, uniqueValues);
							trackerObj[thisRowCol] = filtered;
						}
					}
				}
			}
		},

		// Removes an array of values from trackerObj key/value pair at rcRowColPair.
		trackerObjRemove: function(rcRowColPair, arr) {
			var returnArr = trackerObj[rcRowColPair].filter(function(candidate) {
				return arr.indexOf(candidate) === -1;
			});
			return returnArr;
		},

		// Check to see if any trackerObj key/value pairs have a single candidate value.
		// If so, write that value to board, then update trackerObj upon completion.
		trackerObjCheck: function() {
			for (var keys in trackerObj) {
				if (trackerObj[keys].length === 1) {
					var valueToWrite = trackerObj[keys][0];
					var row = keys[1];
					var col = keys[3];
					board[row][col] = valueToWrite;
				}
			}
			this.trackerObjUpdate();
		},

		// printTrackerObj prints trackerObj to the console.
		printTrackerObj: function() {
			for (var keys in trackerObj) {
				console.log(keys, trackerObj[keys]);
			}
		},

		// loopNonets loops sequentially through all 9 nonets.
		loopNonets: function(func) {
			console.log("in loopNonets with parameter func =",func);
			for (var nonet = 0; nonet <= 8; nonet++) {
				if (nonetsStatus[nonet] === false) {
					this.loopNonetCells(nonet, func);
					this.updateNonetStatus(nonet);
				}
			}
		},

		// Loop through all 9 cells in given nonet. If the value in a cell is empty then run callback function (func) and if it 
		// returns a number, place that number into the corresponding cell on board. 
		loopNonetCells: function(nonet, func) {
			var startRow = this.getNonetXY(nonet)[0];
			var startCol = this.getNonetXY(nonet)[1];
			for (var row = startRow; row <= startRow + 2; row++) {
				for (var col = startCol; col <= startCol + 2; col++) {
					if (board[row][col] === null) {
						var funcVal = func(nonet,row,col);
						if (funcVal) {
							board[row][col] = funcVal;
						}
					}
				}
			}
		},

		// Extracts all values in nonet and returns the non-null values as an array.
		extractNonetUnique: function(nonet, array) {
			var returnArr = [];
			for (var row = this.getNonetXY(nonet)[0]; row <= this.getNonetXY(nonet)[0] + 2; row++) {
				for (var col = this.getNonetXY(nonet)[1]; col <= this.getNonetXY(nonet)[1] + 2; col++) {
					if (board[row][col] !== null) { // && returnArr.indexOf(board[row][col]) === -1
						returnArr.push(board[row][col]);
					}
				}
			}
			return returnArr;
		},

		// Extracts all values in nonet and returns all of them as an array.
		extractNonetAll: function(nonet) {
			var returnArr = [];
			for (var row = this.getNonetXY(nonet)[0]; row <= this.getNonetXY(nonet)[0] + 2; row++) {
				for (var col = this.getNonetXY(nonet)[1]; col <= this.getNonetXY(nonet)[1] + 2; col++) {
					returnArr.push(board[row][col]);
				}
			}
			return returnArr;
		},

		// Extracts all non-null values in currentRow and returns them as an array.
		extractRow: function(currentRow) {
			var returnArr = [];
			for (var col = 0; col <= 8; col++) {
				if (board[currentRow][col] !== null) { // && returnArr.indexOf(board[currentRow][col]) === -1
					returnArr.push(board[currentRow][col]);
				}
			}
			return returnArr;
		},

		// Extracts all non-null values in currentCol and returns them as an array.
		extractCol: function(currentCol) {
			var returnArr = [];
			for (var row = 0; row <= 8; row++) {
				if (board[row][currentCol] !== null) { // && returnArr.indexOf(board[row][currentCol]) === -1
					returnArr.push(board[row][currentCol]);
				}
			}
			return returnArr;
		},

		// Checks whether all of a nonet's cells have been filled in by testing whether
		// the sum of the nine cells equals 45 (the sum of 9 + 8 ... + 2 + 1).
		updateNonetStatus: function(nonet) {
			var nonetValues = this.extractNonetAll(nonet);
			if (nonetValues.reduce(function(a, b){return a + b}) === 45) {
				nonetsStatus[nonet] = true;
			}
		},

		// Returns the upper-left row/column coordinates for a given nonet. For example,
		// nonet 0 starts at row 0, column 0. 
		getNonetXY: function(nonetNumber){
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

	};

};


var form = document.querySelector("form");
var cellSubmitted;
var cellValue;
form.addEventListener("submit", function(event) {
	boardSubmitted = [];
	exportSDK();
	console.log(sdk);
	for (var formRow = 0; formRow <= 8; formRow++) {
		var rowSubmitted = [];
		for (var formCol = 0; formCol <= 8; formCol++) {
			cellSubmitted = "input" + formRow + formCol;
			cellValue = form.elements[cellSubmitted].value;
			if (cellValue.length === 0) {
				cellValue = null;
			} else {
				cellValue = parseInt(cellValue, 10);
			}
			rowSubmitted.push(cellValue);
		}
		boardSubmitted.push(rowSubmitted);
	}
	event.preventDefault();
	console.log("boardSubmitted:", boardSubmitted);
	board = boardSubmitted.slice();
	console.log("board:",board);
	console.log("trackerObj:",trackerObj);
	solveIt();
}); // close the form.addEventListener anonymous function
