/* ===========================================================================================

SudokuSolver.js solves Sudoku puzzles by following the same Sudoku rules that human players
must follow (i.e. it doesn't test multiple possibilities or use brute force approaches).

Credit to https://www.kristanix.com/sudokuepic/sudoku-solving-techniques.php for the Suduko-
solving techniques which I have used in this program, and I have used the techniques' names 
as the names for three functions in this program: Sole Candidate, Unique Candidate, and 
Naked Subset.

=========================================================================================== */

var elimBoard = [];

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
	// build an object with properties that hold 1) the non-null values in the nonet and 2) the non-
	// null values in each row and column that intersects the nonet
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
		if (nonetProperties["nonetVals"].indexOf(i) === -1 && nonetProperties["row"+currentRow].indexOf(i) === -1 && nonetProperties["col"+currentCol].indexOf(i) === -1) {
			// loop each blank cell in the nonet and test whether the number is present in the row
			// OR column that intersects that cell (excluding the cell being checked for unique candidacy)
			// console.log("i: ",i, "not present in nonet");
			for (var row = nonetProperties.startRow; row <= nonetProperties.startRow + 2; row++) {
				for (var col = nonetProperties.startCol; col <= nonetProperties.startCol + 2; col++) {
					if (!elimBoard[row][col]) {
						// console.log("WE'RE EVALUATING A BLANK CELL: r"+row+"c"+col);
						// console.log("winnerFlag:",winnerFlag);
						// console.log("row: ",row,"col: ",col,elimBoard[row][col]);
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
			if (winnerFlag) {
				// console.log("winner is", i,"", nonetProperties);
				return i;
			}
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
								// console.log("trackerObj[currentRowCol:"+currentRowCol+"][0]:", trackerObj[currentRowCol][0],"trackerObj[nextRowCol:"+nextRowCol+"][0]:",trackerObj[nextRowCol][0], "trackerObj[currentRowCol:"+currentRowCol+"][1]:",trackerObj[currentRowCol][1], "trackerObj[nextRowCol:"+nextRowCol+"][1]:",trackerObj[nextRowCol][1]);
								// if so, loop through the cells in this row again
								for (var colRemoval = 0; colRemoval <= 8; colRemoval++) {
									// and remove the potentialSubset values as candidates for other cells within that row
									var removalRowCol = "r" + row + "c" + colRemoval;
									// first, find a cell that has more than two possible candidate values
									if (trackerObj[removalRowCol].length > 2) {
										// then check that both values in potentialSubset are present in removalRowCol
										if (trackerObj[removalRowCol].indexOf(potentialSubset[0]) !== -1 && trackerObj[removalRowCol].indexOf(potentialSubset[1]) !== -1 ) {
											// sdk.printTrackerObj();
											// console.log("nSRows is going to remove Naked Subset", potentialSubset, "at:",removalRowCol);
											trackerObj[removalRowCol] = sdk.trackerObjRemove(removalRowCol, potentialSubset);
											// console.log("nSRows is going to run trackerObjUpdate because candidates were removed");
											sdk.trackerObjUpdate();
										}
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
						var nextRowCol = "r" + nextRow + "c" + col;
						if (trackerObj[nextRowCol].length === 2) {
							if (trackerObj[currentRowCol][0] === trackerObj[nextRowCol][0] && trackerObj[currentRowCol][1] === trackerObj[nextRowCol][1]) {
								// console.log("nSCols found 2 candidate values at",currentRowCol,"and",nextRowCol)
								// console.log("trackerObj[currentRowCol:"+currentRowCol+"][0]:", trackerObj[currentRowCol][0],"trackerObj[nextRowCol:"+nextRowCol+"][0]:",trackerObj[nextRowCol][0], "trackerObj[currentRowCol:"+currentRowCol+"][1]:",trackerObj[currentRowCol][1], "trackerObj[nextRowCol:"+nextRowCol+"][1]:",trackerObj[nextRowCol][1]);
								// if so, loop through the cells in this column again
								for (var rowRemoval = 0; rowRemoval <= 8; rowRemoval++) {
									// and remove the potentialSubset values as candidates for other cells within that column
									var removalRowCol = "r" + rowRemoval + "c" + col;
									// first, find a cell that has more than two possible candidate values
									if (trackerObj[removalRowCol].length > 2) {
										// then check that both values in potentialSubset are present in removalRowCol
										if (trackerObj[removalRowCol].indexOf(potentialSubset[0]) !== -1 && trackerObj[removalRowCol].indexOf(potentialSubset[1]) !== -1 ) {
											// sdk.printTrackerObj();
											// console.log("nSCols is going to remove Naked Subset", potentialSubset, "at:",removalRowCol);
											trackerObj[removalRowCol] = sdk.trackerObjRemove(removalRowCol, potentialSubset);
											// console.log("nSCols is going to run trackerObjUpdate because candidates were removed");
											sdk.trackerObjUpdate();
										}
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
function elimSolveIt() {
	var passes = 0;
	while (nonetsStatus.indexOf(false) !== -1 && passes < 6) {
		// console.log("Trying Sole Candidate approach.")
		sdk.loopNonets(soleCandidate);
		// sdk.printBoardConsole();
		sdk.loopNonets(uniqueCandidate);
		// sdk.printBoardConsole();
		sdk.trackerObjUpdate();
		nakedSubset();
		// console.log("finished nakedSubset");
		// sdk.printBoardConsole();
		// console.log("starting trackerObjCheck");
		sdk.trackerObjCheck();
		// console.log("finished trackerObjCheck");
		// sdk.printBoardConsole();
		passes++;
	}
	sdk.printBoardConsole();
	sdk.printBoard();
	function errorCheckBoard() {
		var nonetErrorFlag = false;
		for (var i = 0; i <= 8; i++) {
			var nonetValuesGathered = sdk.extractNonetUnique(i);
			for (var j = 1; j <= 9; j++) {
				if (nonetValuesGathered.indexOf(j) === -1) {
					console.log("Error found in nonet", i + " (missing "+ j + "):", nonetValuesGathered);
					nonetErrorFlag = true;
				}
			}
		}
		if (nonetErrorFlag === false) console.log("No errors found in nonets.");
		var rowErrorFlag = false;
		for (var k = 0; k <= 8; k++) {
			var rowValuesGathered = sdk.extractRow(k);
			for (var l = 1; l <= 9; l++) {
				if (rowValuesGathered.indexOf(l) === -1) {
					console.log("Error found in row", k + " (missing "+ l + "):", rowValuesGathered);
					rowErrorFlag = true;
				}
			}
		}
		if (rowErrorFlag === false) console.log("No errors found in rows.");
		var colErrorFlag = false;
		for (var m = 0; m <= 8; m++) {
			var colValuesGathered = sdk.extractCol(m);
			for (var n = 1; n <= 9; n++) {
				if (colValuesGathered.indexOf(n) === -1) {
					console.log("Error found in col", m + " (missing "+ n + "):", colValuesGathered);
					colErrorFlag = true;
				}
			}
		}
		if (colErrorFlag === false) console.log("No errors found in columns.");
	}
	errorCheckBoard();
}

/* ====================================================================================================================

Define sdk "helper" functions.

sdk holds functions which are useful to the global scope, I'm putting them here to avoid
polluting the global scope. Eventually I may consider moving them to a seperate file, although
I'm not sure how to do that yet. "sdk" is a play on Sudoku and Software Development Kit.

==================================================================================================================== */

var sdk = {};

function exportSDK() {

	sdk = { 

		// printBoard prints the board to the screen.
		printBoard: function() {
		    var output;
		    var rowColQuery;
		    var valueToOutput;
			for (var row = 0; row <= 8; row++) {
				for (var col = 0; col <= 8; col++) {
					valueToOutput = elimBoard[row][col];
					rowColQuery = "#elim_r" + row + "c" + col;
					output = document.querySelector(rowColQuery);
					output.textContent = valueToOutput;
					var input = elimForm.elements["elim_input" + row + col].value
					if (input == valueToOutput) {
						output.className = "given";
					} else {
						output.className = "notgiven";
					}
				}
			}
		},

		// printBoardConsole prints the board to the console. It's only used for testing and development of the program.
		printBoardConsole: function() {
			for (var i = 0; i <= 8; i++) {
				console.log(elimBoard[i].join("\t"));
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
						if (elimBoard[row][col] !== null) {
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
					// console.log("going to write",valueToWrite,"to row",row,"col",col,"because there was a single candidate value there");
					elimBoard[row][col] = valueToWrite;
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
			// console.log("in loopNonets with parameter func =",func);
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
					if (elimBoard[row][col] === null) {
						var funcVal = func(nonet,row,col);
						if (funcVal) {
							// console.log("going to insert",funcVal,"at row",row,"col",col,"using func =",func.name);
							elimBoard[row][col] = funcVal;
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
					if (elimBoard[row][col] !== null) { // && returnArr.indexOf(elimBoard[row][col]) === -1
						returnArr.push(elimBoard[row][col]);
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
					returnArr.push(elimBoard[row][col]);
				}
			}
			return returnArr;
		},

		// Extracts all non-null values in currentRow and returns them as an array.
		extractRow: function(currentRow) {
			var returnArr = [];
			for (var col = 0; col <= 8; col++) {
				if (elimBoard[currentRow][col] !== null) { // && returnArr.indexOf(elimBoard[currentRow][col]) === -1
					returnArr.push(elimBoard[currentRow][col]);
				}
			}
			return returnArr;
		},

		// Extracts all non-null values in currentCol and returns them as an array.
		extractCol: function(currentCol) {
			var returnArr = [];
			for (var row = 0; row <= 8; row++) {
				if (elimBoard[row][currentCol] !== null) { // && returnArr.indexOf(elimBoard[row][currentCol]) === -1
					returnArr.push(elimBoard[row][currentCol]);
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

function elimResetPlaySpace() {
	exportSDK();
	var currentRow;
	var currentCol;
	boardSubmitted = [];
	nonetsStatus = [false, false, false, false, false, false, false, false, false];
	trackerObj = {};
	sdk.trackerObjDefaults();
	elimBoard = [
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
	elimSubmitPuzzle.disabled = false;
	// console.log("going to disable elimBoardToDisplay ",elimBoardToDisplay);
	elimBoardToDisplay.style.display = "none";
}

var elimForm = document.getElementById("elim_form");
var elimBoardToDisplay = document.getElementById("elim_board");
var cellSubmitted;
var cellValue;
var elimSubmitPuzzle = document.getElementById("elim_submitPuzzle");
elimSubmitPuzzle.addEventListener("click", function(event) {
	boardSubmitted = [];
	exportSDK();
	for (var formRow = 0; formRow <= 8; formRow++) {
		var rowSubmitted = [];
		for (var formCol = 0; formCol <= 8; formCol++) {
			cellSubmitted = "elim_input" + formRow + formCol;
			cellValue = elimForm.elements[cellSubmitted].value;
			if (cellValue.length === 0) {
				cellValue = null;
			} else {
				cellValue = parseInt(cellValue, 10);
			}
			rowSubmitted.push(cellValue);
		}
		boardSubmitted.push(rowSubmitted);
	}
	// event.preventDefault(); // This line was only needed when the button was a "submit" button. It has been changed to a "button" button.
	elimBoard = boardSubmitted.slice();
	elimBoardToDisplay.style.display = "block";
	elimSolveIt();
	elimSubmitPuzzle.disabled = true;
}, false); // close the form.addEventListener anonymous function

var elimResetPuzzle = document.getElementById("elim_resetPuzzle");
elimResetPuzzle.addEventListener("click", function(event) {
	// console.log("elimResetPuzzle has been clicked");
	elimResetPlaySpace();
	elimForm.elements.elim_input00.focus();
	sdk.printBoard();
});

var elimFillInPuzzleEasy = document.getElementById("elim_fillInPuzzleEasy");
elimFillInPuzzleEasy.addEventListener("click", function(event) {
	elimResetPlaySpace();
	elimFillInSpecifiedPuzzle("easy");
});

var elimFillInPuzzleMedium = document.getElementById("elim_fillInPuzzleMedium");
elimFillInPuzzleMedium.addEventListener("click", function(event) {
	elimResetPlaySpace();
	elimFillInSpecifiedPuzzle("medium");
});

var elimFillInPuzzleHard = document.getElementById("elim_fillInPuzzleHard");
elimFillInPuzzleHard.addEventListener("click", function(event) {
	elimResetPlaySpace();
	elimFillInSpecifiedPuzzle("hard");
});

function elimFillInSpecifiedPuzzle(puzzleType) {
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
			formRowCol = "elim_input" + formRow + formCol;
			elimForm.elements[formRowCol].value = sampleBoard[formRow][formCol];
		}
	}
}