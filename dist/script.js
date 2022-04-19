"use strict";
class DrawingApp {
    constructor() {
        this.getMousePosition = (e) => {
            return {
                x: e.clientX - this.rect.left + scrollX,
                y: e.clientY - this.rect.top + scrollY
            };
        };
        this.toggleCell = (e) => {
            let mousePosition = this.getMousePosition(e);
            let cellPositionX, cellPositionY;
            mousePosition.x = Math.floor(mousePosition.x / this.resolution) * this.resolution;
            mousePosition.y = Math.floor(mousePosition.y / this.resolution) * this.resolution;
            cellPositionX = mousePosition.x / this.resolution;
            cellPositionY = mousePosition.y / this.resolution;
            let currentCell = this.oldGeneration[cellPositionX][cellPositionY];
            if (currentCell === 0)
                this.oldGeneration[cellPositionX][cellPositionY] = 1;
            if (currentCell === 1)
                this.oldGeneration[cellPositionX][cellPositionY] = 0;
            this.fillCells(cellPositionX, cellPositionY);
        };
        this.drawGrid = () => {
            for (let i = 0; i < this.cols; i++) {
                for (let j = 0; j < this.rows; j++) {
                    this.context.beginPath();
                    this.context.strokeRect(i * this.resolution, j * this.resolution, this.resolution, this.resolution);
                }
            }
        };
        this.generateNextGeneration = () => {
            for (let i = 0; i < this.cols; i++) {
                for (let j = 0; j < this.rows; j++) {
                    this.sumOfNeighbours = 0;
                    this.countNeighbours(i, j);
                    // cell is alive
                    if (this.oldGeneration[i][j] == 1) {
                        // rule 1: Any live cell with fewer than two live neighbours dies, as if by underpopulation.
                        if (this.sumOfNeighbours < 2) {
                            this.newGeneration[i][j] = 0;
                        }
                        // rule 3: Any live cell with more than three live neighbours dies, as if by overpopulation.
                        else if (this.sumOfNeighbours > 3) {
                            this.newGeneration[i][j] = 0;
                        }
                        // rule 2: Any live cell with two or three live neighbours lives on to the next generation.
                        else {
                            this.newGeneration[i][j] = 1;
                        }
                    }
                    // cell is dead
                    else if (this.oldGeneration[i][j] == 0) {
                        // rule 4: Any dead cell with exactly three live neighbors becomes a live cell , as if by reproduction.
                        if (this.sumOfNeighbours == 3) {
                            this.newGeneration[i][j] = 1;
                        }
                        else {
                            this.newGeneration[i][j] = 0;
                        }
                    }
                }
            }
        };
        this.countNeighbours = (x, y) => {
            // check all neighbours including self
            // [   ][   ][   ]
            // [   ][x,y][   ]
            // [   ][   ][   ]
            for (let i = x - 1; i <= x + 1; i++) {
                for (let j = y - 1; j <= y + 1; j++) {
                    // stay within canvas borders
                    if (i >= 0 && i <= this.cols - 1 && j >= 0 && j <= this.rows - 1) {
                        // count alive neighbours
                        // this.oldGeneration[i][j] === 1   => cell is alive
                        // (i != x || j != y)               => do not count itself
                        if ((i != x || j != y) && this.oldGeneration[i][j] === 1) {
                            this.sumOfNeighbours++;
                        }
                    }
                }
            }
        };
        this.drawNextGeneration = () => {
            this.generateNextGeneration();
            for (let i = 0; i < this.cols; i++) {
                for (let j = 0; j < this.rows; j++) {
                    this.oldGeneration[i][j] = this.newGeneration[i][j];
                    this.fillCells(i, j);
                }
            }
            this.generationCount++;
        };
        this.fillCells = (i, j) => {
            if (this.oldGeneration[i][j] === 1) {
                this.context.fillStyle = "black";
            }
            else if (this.oldGeneration[i][j] === 0) {
                this.context.fillStyle = "white";
            }
            this.context.fillRect(i * this.resolution + 1, j * this.resolution + 1, this.resolution - 2, this.resolution - 2);
        };
        this.clearBoard = () => {
            for (let i = 0; i < this.cols; i++) {
                for (let j = 0; j < this.rows; j++) {
                    this.oldGeneration[i][j] = 0;
                    this.fillCells(i, j);
                }
            }
            this.generationCount = 0;
            this.pause();
        };
        this.pause = () => {
            clearInterval(this.generationInterval);
            this.btnSimulate.disabled = false;
        };
        this.randomize = () => {
            for (let i = 0; i < this.cols; i++) {
                for (let j = 0; j < this.rows; j++) {
                    let deadOrAlive = Math.round(Math.random());
                    this.oldGeneration[i][j] = deadOrAlive;
                    this.fillCells(i, j);
                }
            }
        };
        this.simulate = () => {
            this.generationInterval = setInterval(this.drawNextGeneration, 1000 / this.framesPerSecond);
            this.btnSimulate.disabled = true;
        };
        const canvas = document.getElementById("canvas");
        const context = canvas.getContext("2d");
        context === null || context === void 0 ? void 0 : context.fillRect(0, 0, canvas.width, canvas.height);
        this.canvas = canvas;
        this.context = context;
        this.rect = canvas.getBoundingClientRect();
        this.rows = 32;
        this.cols = 64;
        this.resolution = canvas.width / this.cols;
        this.btnNextGeneration = document.getElementById("btn-nextGeneration");
        this.btnClearBoard = document.getElementById("btn-clearBoard");
        this.btnRandomize = document.getElementById("btn-randomize");
        this.btnSimulate = document.getElementById("btn-simulate");
        this.btnPause = document.getElementById("btn-pause");
        this.oldGeneration = new Array(this.cols);
        for (let i = 0; i < this.cols; i++) {
            this.oldGeneration[i] = new Array(this.rows);
        }
        this.newGeneration = new Array(this.cols);
        for (let i = 0; i < this.cols; i++) {
            this.newGeneration[i] = new Array(this.rows);
        }
        this.sumOfNeighbours = 0;
        this.generationCount = 0;
        this.generationInterval = 0;
        this.slider = document.getElementById("slider-fps");
        this.framesPerSecond = parseInt(this.slider.value);
        this.createUserEvents();
        this.setCellsToZero();
        this.drawGrid();
    }
    createUserEvents() {
        var _a, _b, _c, _d, _e, _f;
        (_a = this.canvas) === null || _a === void 0 ? void 0 : _a.addEventListener("click", this.toggleCell);
        (_b = this.btnNextGeneration) === null || _b === void 0 ? void 0 : _b.addEventListener("click", this.drawNextGeneration);
        (_c = this.btnClearBoard) === null || _c === void 0 ? void 0 : _c.addEventListener("click", this.clearBoard);
        (_d = this.btnRandomize) === null || _d === void 0 ? void 0 : _d.addEventListener("click", this.randomize);
        (_e = this.btnSimulate) === null || _e === void 0 ? void 0 : _e.addEventListener("click", this.simulate);
        (_f = this.btnPause) === null || _f === void 0 ? void 0 : _f.addEventListener("click", this.pause);
    }
    setCellsToZero() {
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                this.oldGeneration[i][j] = 0;
                this.fillCells(i, j);
            }
        }
    }
}
new DrawingApp();
