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
// call this *before* you compute paths so the cells under rooms become obstacles
function markRoomsOnGrid(rooms, gridSize) {
  rooms.forEach(room => {
    const gx0 = Math.floor(room.position.x / gridSize);
    const gy0 = Math.floor(room.position.y / gridSize);
    const gx1 = Math.floor((room.position.x + room.dimensions.x) / gridSize);
    const gy1 = Math.floor((room.position.y + room.dimensions.y) / gridSize);
    for (let x = gx0; x < gx1; x++) {
      for (let y = gy0; y < gy1; y++) {
        corridorGrid[x][y].isRoom     = true;
        corridorGrid[x][y].walkable   = true;
      }
    }
  });
}

function drawLShapedCorridor(x1, y1, x2, y2, gridSize) {
  let midX = x2;
  let midY = y1;
  for (let x = min(x1, midX); x <= max(x1, midX); x++) {
    drawCorridorTile(x, y1, gridSize);
  }
  for (let y = min(y1, y2); y <= max(y1, y2); y++) {
    drawCorridorTile(midX, y, gridSize);
  }
}

function drawCorridorTile(x, y, gridSize) {
  fill(150, 100, 255);
  noStroke();
  rect(x * gridSize, y * gridSize, gridSize, gridSize);
  corridorGrid[x][y].walkable = true;
}

function computeMST(points, delaunayEdges) {
  const parent = Array(points.length).fill(0).map((_, i) => i);
  const find = x => (parent[x] === x ? x : parent[x] = find(parent[x]));
  let edges = [...delaunayEdges].map(str => {
    let [a, b] = str.split('-').map(Number);
    let dx = points[a].x - points[b].x;
    let dy = points[a].y - points[b].y;
    return { a, b, dist: dx * dx + dy * dy };
  }).sort((e1, e2) => e1.dist - e2.dist);
  const mst = [];
  for (const { a, b } of edges) {
    if (find(a) !== find(b)) {
      parent[find(a)] = find(b);
      mst.push([a, b]);
    }
  }
  return mst;
}

function connectRoomsWithCorridors(rooms) {
  for (let i = 0; i < rooms.length - 1; i++) {
    let roomA = rooms[i];
    let roomB = rooms[i + 1];

    let closestDist = Infinity;
    let bestPair = [null, null];

    roomA.doors.forEach(doorA => {
      roomB.doors.forEach(doorB => {
        let d = dist(doorA.x, doorA.y, doorB.x, doorB.y);
        if (d < closestDist) {
          closestDist = d;
          bestPair = [doorA, doorB];
        }
      });
    });

    drawCorridorBetweenDoors(bestPair[0], bestPair[1]);
  }
}

function drawCorridorStages(gridSize) {

}

let mstEdges = computeMST(doorPoints, edgeSet);

for (let [i, j] of mstEdges) {
  let a = doorPoints[i];
  let b = doorPoints[j];

 
  let ax = Math.round(a.x / gridSize);
  let ay = Math.round(a.y / gridSize);
  let bx = Math.round(b.x / gridSize);
  let by = Math.round(b.y / gridSize);

  drawLShapedCorridor(ax, ay, bx, by, gridSize);
}
