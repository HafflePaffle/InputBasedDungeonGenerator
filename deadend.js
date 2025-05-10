function connectAndAddDeadEnds(rooms, gridSize, opts = {}) {
    const deadCorrMin = opts.deadCorrMin || 3;
    const deadCorrMax = opts.deadCorrMax || 7;
    const deadRoomMin = opts.deadRoomMin || 3;
    const deadRoomMax = opts.deadRoomMax || 6;
    const corrColor = opts.corrColor || 'blue';
    const roomColor = opts.roomColor || 'purple';
  
    const existingZones = rooms.map(r => ({ x: r.position.x, y: r.position.y, w: r.dimensions.x, h: r.dimensions.y }));
    const usedDoors = [];
  
    for (let i = 0; i < rooms.length - 1; i++) {
      const A = rooms[i], B = rooms[i + 1];
      let best = { d: Infinity, pair: [null, null] };
      A.doors.forEach(a => B.doors.forEach(b => {
        const d = dist(a.x, a.y, b.x, b.y);
        if (d < best.d) best = { d, pair: [a, b] };
      }));
      const [dA, dB] = best.pair;
      drawCorridorBetweenDoors(dA, dB, corrColor);
      const xMin = min(dA.x, dB.x), xMax = max(dA.x, dB.x);
      const yMin = min(dA.y, dB.y), yMax = max(dA.y, dB.y);
      existingZones.push({ x: xMin - gridSize/2, y: yMin - gridSize/2, w: (xMax - xMin) + gridSize, h: (yMax - yMin) + gridSize });
      usedDoors.push(dA, dB);
    }
  
    function overlaps(r1, r2) {
      return !(r1.x + r1.w <= r2.x || r2.x + r2.w <= r1.x || r1.y + r1.h <= r2.y || r2.y + r2.h <= r1.y);
    }
  
    rooms.forEach(room => {
      const cx = room.center.x, cy = room.center.y;
      room.doors.forEach(door => {
        if (usedDoors.some(d => d.x === door.x && d.y === door.y)) return;
        const dx = door.x - cx, dy = door.y - cy;
        const sx = dx > 0 ? 1 : dx < 0 ? -1 : 0;
        const sy = dy > 0 ? 1 : dy < 0 ? -1 : 0;
  
        const hLen = floor(random(deadCorrMin, deadCorrMax + 1));
        const vLen = floor(random(deadCorrMin, deadCorrMax + 1));
        const midX = door.x + sx * hLen * gridSize;
        const endX = midX;
        const endY = door.y + sy * vLen * gridSize;
  
        const wCells = floor(random(deadRoomMin, deadRoomMax + 1));
        const hCells = floor(random(deadRoomMin, deadRoomMax + 1));
        const rw = wCells * gridSize;
        const rh = hCells * gridSize;
        let rx, ry;
        if (sx !== 0) {
          rx = endX + (sx > 0 ? 0 : -rw);
          ry = endY - rh / 2;
        } else {
          rx = endX - rw / 2;
          ry = endY + (sy > 0 ? 0 : -rh);
        }
        const rRect = { x: rx, y: ry, w: rw, h: rh };
  
        if (existingZones.some(z => overlaps(z, rRect))) return;
  
        stroke(corrColor);
        strokeWeight(gridSize - 2);
        noFill();
        beginShape();
        vertex(door.x, door.y);
        vertex(midX, door.y);
        vertex(endX, endY);
        endShape();
  
        stroke(roomColor);
        noFill();
        rect(rx, ry, rw, rh);
  
        existingZones.push(rRect);
      });
    });
  }