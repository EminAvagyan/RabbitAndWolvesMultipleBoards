const EMPTY_CELL = 0
const WOLF = 1
const FENCE = 2
const HOUSE = 3
const RABBIT = 4
const X = 0
const Y = 1

const up = 0
const down = 1
const left = 2
const right = 3



let count = 0


function getTemplate(templateNumber){
  const markup = `
  <div id="${"main_area"+ templateNumber}" class="main_area">
    <div class="header" id="${"header"+ templateNumber}">
      <div class="game_size_buttons">
        <button onclick="gameStart(${templateNumber})">Select Size</button>
        <select id="${"select"+ templateNumber}">
          <option value="5">5X5</option>
          <option value="7">7X7</option>
          <option value="10">10X10</option>
        </select>
      </div>
    <div class="game_area" id="${"game_area"+ templateNumber}"></div>
  </div>
  <div id="${"message_div"+ templateNumber}" class="message_div">
    <h2></h2>
    <button onclick="gameStart(${templateNumber})">Start Again</button>
  </div>
  </div>
  <div class="game_buttons" id="${"game_buttons"+ templateNumber}">
  <div class="up_button">
    <div id="${"up"+ templateNumber}" class="up"></div>
  </div>
  <div class="side_buttons">
    <div id="${"left"+ templateNumber}" class="left"></div>
    <div id="${"right"+ templateNumber}" class="right"></div>
  </div>
  <div class="down_button">
    <div id="${"down"+ templateNumber}" class="down"></div>
  </div>
  </div>
  `
  return markup
}
function drawNewBoard() {
  createButtonsandBoard()
}

function createButtonsandBoard() {
  ++count
  const container = document.getElementById("container")
  const template = getTemplate(count)
  const newWrapper = document.createElement("div")
  newWrapper.id = "wrapper" + count
  newWrapper.setAttribute("class", "wrapper")
  newWrapper.innerHTML = template
  container.append(newWrapper)
  
}

const gallery = new Array()

gallery[1] = "images/gamewolf.png"
gallery[2] = "images/ban.png"
gallery[3] = "images/home.png"
gallery[4] = "images/rabbit.png"

function gameStart(count) {
  const select = "select" + count
  console.log(select)
  const gameAreaSize = parseInt(document.getElementById(select).value)
  const gameArray = createGameArray(gameAreaSize)
  const gameState = {
    gameArray: gameArray,
    gameRunning: true,
    gameMessage: "",
    count: count,
  }
  setGameAreWidth(gameAreaSize, gameState.count)
  
  insertAllCharacters(gameState.gameArray)
  hideGameMessages(gameState.count)
  eventListenersForRabbit(gameState, gameAreaSize)
  clearGameArea(count)
  drawGameArea(gameState)
  
}

function setGameAreWidth(gameAreaSize, count) {
  const gameAreaId = "game_area" + count
  const width = gameAreaSize * 60 + 20 + "px"
  const gameAreaDiv = document.getElementById(gameAreaId)
  gameAreaDiv.style.width = width
}
function eventListenersForRabbit(gameObject) {
    const upId = "up"+gameObject.count
    const moveUp = document.getElementById(upId)
    moveUp.onclick = function () {
      eventKeysFunctions(gameObject, up)
    }
    const downId = "down"+gameObject.count
    const moveDown = document.getElementById(downId)
    moveDown.onclick = function () {
      eventKeysFunctions(gameObject, down)
    }
    const leftId = "left"+gameObject.count
    const moveLeft = document.getElementById(leftId)
    moveLeft.onclick = function () {
      eventKeysFunctions(gameObject, left)
    }
    const rightId = "right"+gameObject.count
    const moveRight = document.getElementById(rightId)
    moveRight.onclick = function () {
      eventKeysFunctions(gameObject, right)
    }

}

function eventKeysFunctions(gameObject, direction) {
  if(gameObject.gameRunning === true){
    const rabbitCords = findCharacterCords(gameObject.gameArray, RABBIT)[0]
    const moves = getPossibleMoves(rabbitCords)
    const allmoves = correctMoves(moves, gameObject.gameArray)
    checkDirAndMove(allmoves[direction], rabbitCords, gameObject)
    changeWolvesPositions(gameObject)
  } else {
    return
  }
  
}

function changeWolvesPositions(gameObject) {
  const wolvesCords = findCharacterCords(gameObject.gameArray, WOLF)

  wolvesCords.forEach((singleWolf) => {
    if (gameObject.gameRunning === true) {
      changeSingleWolfPosition(gameObject, singleWolf)
      clearGameArea(gameObject.count)
      drawGameArea(gameObject)
    } else {
      showGameMessages(gameObject)
    }
  })
}

function changeSingleWolfPosition(gameObject, singleWolf) {
  const rabbitCords = findCharacterCords(gameObject.gameArray, RABBIT)

  const cellsArround = findEmptyCellsArroundWolf(
    gameObject.gameArray,
    singleWolf
  )

  const freeCells = checkCells(cellsArround, gameObject)

  if (gameObject.gameRunning === true) {
    const distanceArray = calculateDistanceOfCells(freeCells, rabbitCords)
    const closestCell = freeCells[getClosestIndex(distanceArray)]
    placeWolvesIntoNewCells(gameObject.gameArray, closestCell, singleWolf)
  } else {
    showGameMessages(gameObject)
  }
}

function isCharacter(gameArray, cellsArround, character) {
  const cellsArroundWolf = cellsArround.filter(
    ([x, y]) => gameArray[x][y] === character
  )
  return cellsArroundWolf
}

function checkCells(cellsArround, gameObject) {
  const checkIFRabbit = isCharacter(gameObject.gameArray, cellsArround, RABBIT)
  if (checkIFRabbit.length > 0) {
    gameObject.gameRunning = false
    gameObject.gameMessage = "over"
    return
  } else {
    const emptyCells = isCharacter(
      gameObject.gameArray,
      cellsArround,
      EMPTY_CELL
    )
    return emptyCells
  }
}

function checkEmptyCells([x, y], array) {
  return x >= 0 && x < array.length && y >= 0 && y < array.length
}

function findEmptyCellsArroundWolf(array, [x, y]) {
  let movementDirections = [
    [x, y],
    [x - 1, y],
    [x + 1, y],
    [x, y - 1],
    [x, y + 1],
  ]
  const emptyCells = movementDirections.filter((cell) =>
    checkEmptyCells(cell, array)
  )
  return emptyCells
}

function calculateDistanceOfCells(freeVellsArray, rabbitCords) {
  return freeVellsArray.map((cord) =>
    calculateDistanceFromRabbit(cord, rabbitCords)
  )
}

function getClosestIndex(distanceArray) {
  const max = Math.min(...distanceArray)
  return distanceArray.indexOf(max)
}

const equals = (a, b) => JSON.stringify(a) === JSON.stringify(b)

function placeWolvesIntoNewCells(array, wolvesCords, item) {
  if (wolvesCords != undefined) {
    const rabbitCords = findCharacterCords(array, RABBIT)
    const [x, y] = wolvesCords
    const [k, p] = item
    if (equals([x, y], rabbitCords)) {
      gameObject.gameRunning = false
      gameObject.gameMessage = "over"
    } else {
      array[x][y] = WOLF
      array[k][p] = EMPTY_CELL
    }
  }
}

function calculateDistanceFromRabbit([x1, y1], [[x2, y2]]) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
}

function checkDirAndMove(newCords, napCords, gameObject) {
  const [j, k] = newCords
  const [x, y] = napCords
  if (gameObject.gameArray[j][k] == EMPTY_CELL) {
    gameObject.gameArray[j][k] = RABBIT
    gameObject.gameArray[x][y] = EMPTY_CELL
  } else if (gameObject.gameArray[j][k] === HOUSE) {
    gameObject.gameArray[x][y] = EMPTY_CELL
    gameObject.gameRunning = false
    gameObject.gameMessage = "win"
    return
  } else if (gameObject.gameArray[j][k] === FENCE) {
    return
  }
  if (gameObject.gameArray[j][k] === WOLF) {
    gameObject.gameRunning = false
    gameObject.gameMessage = "over"
    return
  }
}

function getEventDirection([[x, y]]) {
  const direction = {
    up: [x - 1, y],
    down: [x + 1, y],
    right: [x, y + 1],
    left: [x, y - 1],
  }
  return direction
}

function findCharacterCords(array, character) {
  const findInMatrix = function (accumulator, row, x) {
    row.forEach((element, y) => {
      if (element === character) {
        accumulator.push([x, y])
      }
    })
    return accumulator
  }
  return array.reduce(findInMatrix, [])
}

function insertAllCharacters(array) {
  const wolvesCount = ((array.length - 1) / 100) * 60
  const fenceCount = ((array.length - 1) / 100) * 40
  insertCharactersIntoArray(array, WOLF, wolvesCount)
  insertCharactersIntoArray(array, FENCE, fenceCount)
  insertCharactersIntoArray(array, HOUSE, 1)
  insertCharactersIntoArray(array, RABBIT, 1)
}

function createGameArray(gameAreaSize) {
  const gameCondition = new Array(gameAreaSize)
    .fill(EMPTY_CELL)
    .map(() => new Array(gameAreaSize).fill(EMPTY_CELL))

  return gameCondition
}

function insertSingleCharacter(cord, myArray, character) {
  const x = cord[X]
  const y = cord[Y]
  myArray[x][y] = character
}

function findEmptyCell(myArray) {
  const randomX = Math.floor(Math.random() * myArray.length)
  const randomY = Math.floor(Math.random() * myArray.length)
  if (myArray[randomX][randomY] === EMPTY_CELL) {
    return [randomX, randomY]
  } else {
    return findEmptyCell(myArray)
  }
}

function insertCharactersIntoArray(myArray, character, count) {
  for (let i = 0; i < count; i++) {
    const cords = findEmptyCell(myArray)
    insertSingleCharacter(cords, myArray, character)
  }
  return myArray
}

function clearGameArea(count) {
  const gameAreaId = "game_area" + count
  const containerNode = document.getElementById(gameAreaId)
  containerNode.innerHTML = ""
}

function createInnerDivs(cellIndex, count) {
  const gameAreaId = "game_area" + count
  console.log(gameAreaId)
  console.log(cellIndex)
  const containerNode = document.getElementById(gameAreaId)
  const div = document.createElement("div")
  div.setAttribute("id", cellIndex)
  containerNode.append(div)
}
function insertCharacterImage(character, cellIndex) {
  const div = document.getElementById(cellIndex)
  const img = document.createElement("img")
  img.src = gallery[character]
  img.style.width = "60px"
  div.append(img)
}

function drawGameArea(gameObject) {
  gameArray = gameObject.gameArray
  gameArray.forEach((row, i) => {
    row.forEach((column, j) => {
      const cellIndex = gameObject.count.toString() + i.toString() + j.toString()
      createInnerDivs(cellIndex, gameObject.count)
      if (column === RABBIT) {
        insertCharacterImage(RABBIT, cellIndex)
      }
      if (column === WOLF) {
        insertCharacterImage(WOLF, cellIndex)
      }
      if (column === FENCE) {
        insertCharacterImage(FENCE, cellIndex)
      }
      if (column === HOUSE) {
        insertCharacterImage(HOUSE, cellIndex)
      }
    })
  })
}

function hideGameMessages(count) {
  const message_div ="message_div" + count
  const mainDiv = document.getElementById(message_div)
  mainDiv.style.display = "none"
  const header = "header" + count
  const gameBoard = document.getElementById(header)
  gameBoard.style.display = "block"
}

function showGameMessages(gameObject) {
  const message_div = "message_div" + gameObject.count
  const mainDiv = document.getElementById(message_div)
  const message_div_h2 = "message_div" + gameObject.count + ">h2"
  const message = document.querySelector(message_div_h2)
  const header = "header" + gameObject.count
  const gameBoard = document.getElementById(header)
  gameBoard.style.display = "none"
  if (gameObject.gameStatus === "over") {
    message.innerText = "Game over"
  } else if (gameObject.gameStatus === "win") {
    message.innerText = "You win"
  }
  mainDiv.style.display = "block"
}

function getPossibleMoves([x, y]) {
  return [
    [x - 1, y],
    [x + 1, y],
    [x, y - 1],
    [x, y + 1],
  ]
}

function correctMoves(cordsArray, array) {
  const correctedArray = cordsArray.map(([x, y]) => {
    if (x < 0) {
      x = array.length - 1
    }
    if (x > array.length - 1) {
      x = 0
    }
    if (y < 0) {
      y = array.length - 1
    }
    if (y > array.length - 1) {
      y = 0
    }
    return [x, y]
  })
  return correctedArray
}
