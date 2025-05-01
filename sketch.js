index = 0;
painting = false;
painted = false;

function setup() {
  createCanvas(960, 540);
  background(220);
  scribble = new Scribble();
}

function draw() {
  if(painted)
  {
    walker.Step();
  }

  if(painting)
    scribble.paint();

}

function mousePressed()
{
  if(!painted)
    painting = true;
}

function mouseReleased()
{
  if(!painted)
  {
    painting = false;
    scribble.array = scribble.CleanArray();
    walker = new Walker(scribble.array[0].position, scribble, 1.5, 'red');
    painted = true;
  }

}


class Scribble{
  constructor()
  {
    this.array = [];
    this.index = 0;
  }

  paint()
  {
    stroke(0)
    this.array[this.index] = new Dot(createVector(mouseX, mouseY));
    this.index++
  }

  CleanArray()
  {
    let arr = this.array;
    this.array.forEach(dot => {
      if(!arr.includes(dot))
        arr.add(dot);
    })
    return arr;
  }
}

class Dot{
  constructor(position)
  {
    this.position = position;
    point(this.position);
  }
}

class Room{
  constructor(x, y, w, h)
  {
    this.position = createVector(x, y);
    this.dimensions = createVector(w, h);
    this.rCorner = createVector(x + w, y + h);
    rect(x, y, w, h);
  }
}

class Walker{
  constructor(vector, array, u, c)
  {
    this.position = vector;
    this.scribble = array;
    this.index = 0;
    this.uncertainty = u;
    this.color = c;

    this.rooms = [];
    this.roomIndex = 0;
    this.steps = 0;
    this.maxSteps = 0;
    this.offset1 = 1;
    this.offset2 = 2;
    this.hSeed = floor(random(0, 1000));
    this.vSeed = floor(random(0, 1000));
    this.CreateRoom(0);
  }

  Show()
  {
      stroke(this.color);
      point(this.position.x, this.position.y);
  }

  Step()
  {
    let direction = this.PickDirection();
    let choiceX = floor(random(3 + (direction.x / this.uncertainty))) - 1;
    let choiceY = floor(random(3 + (direction.y / this.uncertainty))) - 1;

    this.position.x += choiceX;
    this.position.y += choiceY;

    this.Show();

    this.steps++;

    if(this.steps == this.maxSteps)
    {
      let r = floor(random(1, 5))
      for(let i = 0; i < r; i++)
      {
        this.CreateRoom(75);
      }
 
    }
          
  }

  PickDirection()
  {
    this.index++;

    if(this.index == this.scribble.index)
      this.CreateRoom(0);

    let vectorX = this.scribble.array[this.index].position.x - this.position.x;
    let vectorY = this.scribble.array[this.index].position.y - this.position.y;
    let vector = createVector(vectorX, vectorY);

    let disX = this.scribble.array[this.index].position.x - this.scribble.array[this.index - 1].position.x;
    let disY = this.scribble.array[this.index].position.y - this.scribble.array[this.index - 1].position.y;
    let distance = createVector(disX, disY);

    if(p5.Vector.mag(vector) > p5.Vector.mag(distance))
    {
      this.index--;

      vectorX = this.scribble.array[this.index].position.x - this.position.x;
      vectorY = this.scribble.array[this.index].position.y - this.position.y;
      vector = createVector(vectorX, vectorY);
    }

    vector = p5.Vector.normalize(vector);
    return vector;
  }

  CreateRoom(range)
  {
    let h = randomGaussian(55, 15);
    let w = randomGaussian(55, 15);
    // let offset1 = random(-1, 1);
    // offset1 = offset1 > 0 ? -1: 1;
    // let offset2 = random(-1, 1);
    // offset2 = offset2 > 0 ? -1: 1;

    let hOffset = this.offset1 * noise(this.hSeed) * range;
    let vOffset = this.offset2 * noise(this.vSeed) * range;

    if(this.roomIndex % 2 == 0)
    {
      this.offset1 *= -1;
    }
    else
    {
      this.offset2 *= -1;
    }

    stroke(this.color);
    this.rooms[this.roomIndex] = new Room(this.position.x - w / 2 + hOffset, this.position.y - h / 2 + vOffset, w, h);
    this.roomIndex++;
    this.maxSteps = floor(randomGaussian(500, 100));
    this.steps = 0;
    this.hSeed += 1;
    this.vSeed += 1;
  }

  RemoveOverlap()
  {

  }


  //Kept for the report. Not used anymore
  PickUncertainDirection()
  {
    this.index++;
    
    let vectorX = this.uArray[this.index].position.x - this.position.x;
    let vectorY = this.uArray[this.index].position.y - this.position.y;
    let vector = createVector(vectorX, vectorY);

    let disX = this.uArray[this.index].position.x - this.uArray[this.index - 1].position.x;
    let disY = this.uArray[this.index].position.y - this.uArray[this.index - 1].position.y;
    let distance = createVector(disX, disY);

    if(p5.Vector.mag(vector) > p5.Vector.mag(distance))
    {
      this.index--;

      vectorX = this.uArray[this.index].position.x - this.position.x;
      vectorY = this.uArray[this.index].position.y - this.position.y;
      vector = createVector(vectorX, vectorY);
    }

    vector = p5.Vector.normalize(vector);
    return vector;
  }

  CreateUncertainty()
  {
    let newArray = [];
    let j = 0;

    for(let i = 0; i < this.scribble.array.length; i++)
    {
      if(i % this.uncertainty == 0)
      {
        newArray[j] = this.scribble.array[i];
        j++
      }
    }
    return newArray;
  }
}