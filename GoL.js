const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.fillRect(0, 0, canvas.width, canvas.height);

const rows = 32;
const cols = 64;
const resolution = canvas.width / cols;

let btnNextGeneration = document.getElementById("btn-nextGeneration");
let btnClearBoard = document.getElementById("btn-clearBoard");
let btnRandomize = document.getElementById("btn-randomize");
let btnSimulate = document.getElementById("btn-simulate");
let btnPause = document.getElementById("btn-pause");

let slider = document.getElementById("slider-fps");
let framesPerSecond = slider.value;
slider.oninput = function() {
  framesPerSecond = slider.value;
};

let generationIndicator = document.getElementById("generationIndicator");

let sumOfNeighbors = 0;
let generationCount = 0;
let generationInterval;

// set 2D arrays
let oldGenArr = new Array(cols);
for (let i = 0; i < cols; i++) {
  oldGenArr[i] = new Array(rows);
}
let newGenArr = new Array(cols);
for (let i = 0; i < cols; i++) {
  newGenArr[i] = new Array(rows);
}

function setCellsToZero() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      oldGenArr[i][j] = 0;
      fillCells(i, j);
    }
  }
}

function drawGrid() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      ctx.beginPath();
      ctx.strokeRect(i * resolution, j * resolution, resolution, resolution);
    }
  }
}

// count neighbors
function howManyNeighbors(oldGenArr, indexX, indexY) {
  for (let i = indexX - 1; i <= indexX + 1; i++) {
    for (let j = indexY - 1; j <= indexY + 1; j++) {
      // stay within borders
      if (i >= 0 && i <= cols - 1 && j >= 0 && j <= rows - 1) {
        // count alive neighbors and not self
        if ((i != indexX || j != indexY) && oldGenArr[i][j] == 1) {
          sumOfNeighbors++;
        }
      }
    }
  }
}

function fillCells(i, j) {
  // alive
  if (oldGenArr[i][j] == 1) {
    ctx.fillStyle = "black";
    ctx.fillRect(
      i * resolution + 1,
      j * resolution + 1,
      resolution - 2,
      resolution - 2
    );
  }
  // dead
  else if (oldGenArr[i][j] == 0) {
    ctx.fillStyle = "white";
    ctx.fillRect(
      i * resolution + 1,
      j * resolution + 1,
      resolution - 2,
      resolution - 2
    );
  }
}

function generateNextGeneration() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      sumOfNeighbors = 0;
      howManyNeighbors(oldGenArr, i, j);

      // cell is alive
      if (oldGenArr[i][j] == 1) {
        // rule 1: Any live cell with fewer than two live neighbours dies, as if by underpopulation.
        if (sumOfNeighbors < 2) {
          newGenArr[i][j] = 0;
        }
        // rule 3: Any live cell with more than three live neighbours dies, as if by overpopulation.
        else if (sumOfNeighbors > 3) {
          newGenArr[i][j] = 0;
        }
        // rule 2: Any live cell with two or three live neighbours lives on to the next generation.
        else {
          newGenArr[i][j] = 1;
        }
      }

      // cell is dead
      else if (oldGenArr[i][j] == 0) {
        // rule 4: Any dead cell with exactly three live neighbors becomes a live cell , as if by reproduction.
        if (sumOfNeighbors == 3) {
          newGenArr[i][j] = 1;
        } else {
          newGenArr[i][j] = 0;
        }
      }
    }
  }
}

// user can draw on canvas
canvas.addEventListener("click", function(evt) {
  function getMousePos(canvas, evt) {
    let rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

  let mousePos = getMousePos(canvas, evt);

  mousePos.x = Math.floor(mousePos.x / resolution) * resolution;
  mousePos.y = Math.floor(mousePos.y / resolution) * resolution;

  let cellPosX = mousePos.x / resolution;
  let cellPosY = mousePos.y / resolution;

  if (oldGenArr[cellPosX][cellPosY] == 0) {
    oldGenArr[cellPosX][cellPosY] = 1;
  } else {
    oldGenArr[cellPosX][cellPosY] = 0;
  }
  fillCells(cellPosX, cellPosY);
});

function drawNextGeneration() {
  generateNextGeneration();

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      oldGenArr[i][j] = newGenArr[i][j];
      fillCells(i, j);
    }
  }
  generationCount++;
  generationIndicator.innerHTML = generationCount;
}

function clearBoard() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      oldGenArr[i][j] = 0;
      fillCells(i, j);
    }
  }
  generationCount = 0;
  generationIndicator.innerHTML = generationCount;
  pause();
}

function randomize() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      num = Math.round(Math.random());
      oldGenArr[i][j] = num;
      fillCells(i, j);
    }
  }
  generationCount = 0;
  generationIndicator.innerHTML = generationCount;
}

function simulate() {
  generationInterval = setInterval(drawNextGeneration, 1000 / framesPerSecond);
  btnSimulate.disabled = true;
}

function pause() {
  clearInterval(generationInterval);
  btnSimulate.disabled = false;
}

btnNextGeneration.onclick = () => drawNextGeneration();
btnClearBoard.onclick = () => clearBoard();
btnRandomize.onclick = () => randomize();
btnSimulate.onclick = () => simulate();
btnPause.onclick = () => pause();

drawGrid();
setCellsToZero();
