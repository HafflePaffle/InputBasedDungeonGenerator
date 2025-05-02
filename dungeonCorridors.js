
let corridorGrid = [];
let corridorUIButtons = [];
let showDelaunay = false;
let showMST = false;
let drawCorridors = false;

let _delaunay = null;
let _doorPoints = [];
let _mstEdges = [];

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
    this.g = 0;
    this.h = 0;
    this.f = 0;
    this.parent = null;
  }
}

function getNeighbors(node, grid) {
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const neighbors = [];
  for (let [dx, dy] of dirs) {
    const x = node.x + dx;
    const y = node.y + dy;
    if (grid[x]?.[y]) neighbors.push(grid[x][y]);
  }
  return neighbors;
}

function aStar(start, end, grid) {
  let openSet = [start];
  let closedSet = new Set();

  for (let col of grid)
    for (let node of col) {
      node.g = 0;
      node.h = 0;
      node.f = 0;
      node.parent = null;
    }

  while (openSet.length > 0) {
    let current = openSet.reduce((a, b) => (a.f < b.f ? a : b));
    if (current === end) {
      let path = [];
      while (current.parent) {
        path.push(current);
        current = current.parent;
      }
      return path.reverse();
    }

    openSet = openSet.filter(n => n !== current);
    closedSet.add(current);

    for (let neighbor of getNeighbors(current, grid)) {
      if (!neighbor.walkable || closedSet.has(neighbor)) continue;
      let tentativeG = current.g + 1;

      if (!openSet.includes(neighbor)) openSet.push(neighbor);
      else if (tentativeG >= neighbor.g) continue;

      neighbor.g = tentativeG;
      neighbor.h = abs(neighbor.x - end.x) + abs(neighbor.y - end.y);
      neighbor.f = neighbor.g + neighbor.h;
      neighbor.parent = current;
    }
  }

  return [];
}

function connectRoomsWithCorridors(rooms, gridSize) {
  if (rooms.length < 2) return;
  _doorPoints = rooms.map(r => r.doors[0]);
  if (_doorPoints.some(d => !d)) return;

  // Mark room area as non-walkable (plus padding)
  rooms.forEach(room => {
    let x0 = floor(room.position.x / gridSize) - 1;
    let y0 = floor(room.position.y / gridSize) - 1;
    let x1 = floor((room.position.x + room.dimensions.x) / gridSize) + 1;
    let y1 = floor((room.position.y + room.dimensions.y) / gridSize) + 1;
    for (let x = x0; x <= x1; x++) {
      for (let y = y0; y <= y1; y++) {
        if (corridorGrid[x]?.[y]) corridorGrid[x][y].walkable = false;
      }
    }
    // Mark door tiles as walkable
    room.doors.forEach(door => {
      let gx = floor(door.x / gridSize);
      let gy = floor(door.y / gridSize);
      if (corridorGrid[gx]?.[gy]) corridorGrid[gx][gy].walkable = true;
    });
  });

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
}