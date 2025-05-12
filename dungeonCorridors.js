// dungeonCorridors.js
// Requires: <script src="https://unpkg.com/delaunator@5.0.0/delaunator.min.js"></script>

let corridorGrid = [];

function setupCorridorGrid(gridSize, canvasWidth, canvasHeight) {
  let cols = floor(canvasWidth / gridSize);
  let rows = floor(canvasHeight / gridSize);
  corridorGrid = Array.from({ length: cols }, (_, x) =>
    Array.from({ length: rows }, (_, y) => new Node(x, y))
  );
}

class Node {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.walkable = true;
  }
}

function markRoomsOnGrid(rooms, gridSize) {
  rooms.forEach(room => {
    const gx0 = Math.floor(room.position.x / gridSize);
    const gy0 = Math.floor(room.position.y / gridSize);
    const gx1 = Math.floor((room.position.x + room.dimensions.x) / gridSize);
    const gy1 = Math.floor((room.position.y + room.dimensions.y) / gridSize);
    for (let x = gx0; x < gx1; x++) {
      for (let y = gy0; y < gy1; y++) {
        corridorGrid[x][y].walkable = true;
      }
    }
  });
}

function drawCorridorTile(x, y, gridSize) {
  fill(150, 100, 255);
  noStroke();
  rect(x * gridSize, y * gridSize, gridSize, gridSize);
  corridorGrid[x][y].walkable = true;
}