'use strict'

let slider = document.getElementById("slider")
let live = document.getElementById("live")
let canvas = document.getElementById("game")
let ctx = canvas.getContext("2d")

function Box (x, y, w, h, color) {
  this.position = {x: x, y: y}
  this.size = {width: w, height: h}
  this.color = color
}

function Target (x, y) {
  this.position = {x: x, y: y} 
}

function State (boxes) {
  this.boxes = boxes || []
}

function drawBox (context, box) {
  context.fillStyle = box.color
  context.fillRect(box.position.x, box.position.y,
                   box.size.width, box.size.height)
}

function render (ctx, state) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  for (let box of state.boxes) {
    drawBox(ctx, box)
  }
}

function Job (key, subject, fn, duration) {
  let stopTime = Date.now() + duration 
  
  this.key = key
  this.subject = subject
  this.fn = fn 
  this.predFn = function (dT) { 
    let now = Date.now()
    
    return now < stopTime
  }
}

function remove (array, obj) {
  array.splice(array.indexOf(obj), 1)  
}

function runJobs (dT, jobs) {
  var i = 0 
  
  while (jobs[i]) {
    if (!jobs[i].predFn()) remove(jobs, jobs[i])
    else                   i++
  }
  
  for (let job of jobs) {
    job.fn(dT, job.subject)
  }
}

function captureHashState (dT, states) {
  var count = 0
  
  for (let job of jobs) {
    if (job.key !== "capture") count++
  }
  
  if (count > 0) {
    hashStates.push(clone(state, false))
  }
}

function moveTo (speed, destination) {
  return function (dT, subject) {
    let diffX = destination.position.x - subject.position.x
    let diffY = destination.position.y - subject.position.y
    let totalDiff = Math.sqrt(diffX * diffX + diffY * diffY)
    
    subject.position.x += (diffX / totalDiff) * totalDiff * speed
    subject.position.y += (diffY / totalDiff) * totalDiff * speed
  }  
}

let hashStates = []
let box = new Box(20, 20, 20, 20, "#FF0000")
let box2 = new Box(100, 100, 20, 20, "#111111")
let box3 = new Box(200, 20, 40, 40, "#00FB00")
let upperRight = new Target(300, 0)
let lowerLeft = new Target(0, 120)
let left = new Target(0, 40)
let center = new Target(150, 60)
let state = new State([box, box2, box3])
let hashRecorder = new Job('capture', hashStates, captureHashState, 1000)
let jobs = [
  hashRecorder,
  new Job('movebox', box, moveTo(0.1, upperRight), 2000),
  new Job('movebox2', box2, moveTo(0.05, box), 2000),
  new Job('movebox3', box3, moveTo(.2, left), 3000)
]

function copyBoxStates (trueState, stateSnapshot) {
  for (var i = 0; i < trueState.boxes.length; i++) {
    trueState.boxes[i].position = stateSnapshot.boxes[i].position  
    trueState.boxes[i].size = stateSnapshot.boxes[i].size
  }
}

let jobInterval = setInterval(function () {
  slider.max = hashStates.length - 1
  
  if (live.checked) runJobs(16, jobs)
  else              copyBoxStates(state, hashStates[slider.value])
}, 16)

let reRender = requestAnimationFrame(function makeRender () {
  render(ctx, state)
  requestAnimationFrame(makeRender) 
})

window.hashStates = hashStates
document.body.appendChild(slider)