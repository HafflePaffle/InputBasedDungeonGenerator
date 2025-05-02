

let corridorGrid = [];
let corridorUIButtons = [];
let showDelaunay = false;
let showMST = false;
let drawCorridors = false;
let corridorState = 0;
let corridorTimer = 0;

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

function drawCorridorTile(x, y, gridSize) {
  fill(150, 100, 255);
  noStroke();
  rect(x * gridSize, y * gridSize, gridSize, gridSize);
  corridorGrid[x][y].walkable = true;
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

function snapToGridCenter(pos, gridSize) {
  return {
    x: floor(pos.x / gridSize),
    y: floor(pos.y / gridSize)
  };
}

function createCorridorDebugUI() {
  corridorUIButtons.push(createButton("1. Show Delaunay").position(10, 10).mousePressed(() => toggleStep(0)));
  corridorUIButtons.push(createButton("2. Show MST").position(10, 40).mousePressed(() => toggleStep(1)));
  corridorUIButtons.push(createButton("3. Draw Corridors").position(10, 70).mousePressed(() => toggleStep(2)));
}

function toggleStep(step) {
  corridorState = step;
  showDelaunay = (step >= 0);
  showMST = (step >= 1);
  drawCorridors = (step >= 2);
  corridorTimer = millis();
}

let _delaunay = null;
let _doorPoints = [];
let _mstEdges = [];

function connectRoomsWithCorridors(rooms, gridSize) {
  if (rooms.length < 2) return;
  _doorPoints = rooms.map(r => r.doors[0]);
  if (_doorPoints.some(d => !d)) return;

  _delaunay = Delaunator.from(_doorPoints.map(p => [p.x, p.y]));
  const edgeSet = new Set();
  for (let i = 0; i < _delaunay.triangles.length; i += 3) {
    [[0, 1], [1, 2], [2, 0]].forEach(([u, v]) => {
      let a = _delaunay.triangles[i + u];
      let b = _delaunay.triangles[i + v];
      edgeSet.add([Math.min(a, b), Math.max(a, b)].join('-'));
    });
  }
  _mstEdges = computeMST(_doorPoints, edgeSet);
  createCorridorDebugUI();
}

function drawCorridorStages(gridSize) {
  textSize(20);
  fill(255);
  noStroke();
  text("Step " + (corridorState + 1), 150, 30);

  if (showDelaunay && _delaunay && _doorPoints.length > 0) {
    stroke('blue');
    for (let i = 0; i < _delaunay.triangles.length; i += 3) {
      let pts = [0, 1, 2, 0].map(j => _doorPoints[_delaunay.triangles[i + j]]);
      for (let j = 0; j < 3; j++) {
        line(pts[j].x, pts[j].y, pts[j + 1].x, pts[j + 1].y);
      }
    }
  }

  if (showMST && _mstEdges.length > 0) {
    stroke('green');
    for (let [i, j] of _mstEdges) {
      let p1 = _doorPoints[i];
      let p2 = _doorPoints[j];
      line(p1.x, p1.y, p2.x, p2.y);
    }
  }

  if (drawCorridors && _mstEdges.length > 0) {
    for (let [i, j] of _mstEdges) {
      let a = snapToGridCenter(_doorPoints[i], gridSize);
      let b = snapToGridCenter(_doorPoints[j], gridSize);
      drawLShapedCorridor(a.x, a.y, b.x, b.y, gridSize);
    }
  }
}
