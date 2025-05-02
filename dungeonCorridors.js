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

function drawLShapedCorridor(x1, y1, x2, y2, gridSize) {
  // Horizontal then vertical
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

function connectRoomsWithCorridors(rooms, gridSize) {
  if (rooms.length < 2) return;

  let points = rooms.map(r => r.doors[0] ?? r.center);
  let delaunay = Delaunator.from(points.map(p => [p.x, p.y]));
  let edgeSet = new Set();

  for (let i = 0; i < delaunay.triangles.length; i += 3) {
    let a = delaunay.triangles[i];
    let b = delaunay.triangles[i + 1];
    let c = delaunay.triangles[i + 2];
    [[a, b], [b, c], [c, a]].forEach(([u, v]) => {
      let key = [Math.min(u, v), Math.max(u, v)].join('-');
      edgeSet.add(key);
    });
  }

  let mstEdges = computeMST(points, edgeSet);

  for (let [i, j] of mstEdges) {
    let a = points[i];
    let b = points[j];
    let ax = floor(a.x / gridSize);
    let ay = floor(a.y / gridSize);
    let bx = floor(b.x / gridSize);
    let by = floor(b.y / gridSize);

    drawLShapedCorridor(ax, ay, bx, by, gridSize);
  }
}
