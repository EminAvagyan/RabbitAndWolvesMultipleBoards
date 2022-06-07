const EMPTY_CELL = 0
const WOLF = 1
const FENCE = 2
const HOUSE = 3
const RABBIT = 4
const X = 0
const Y = 1

const gallery = new Array()

gallery[1] = "images/gamewolf.png"
gallery[2] = "images/ban.png"
gallery[3] = "images/home.png"
gallery[4] = "images/rabbit.png"

function gameStart() {
  const gameAreaSize = parseInt(document.getElementById("select").value)
  const gameStateArray = createGameArray(gameAreaSize)
  setGameAreWidth(gameAreaSize)
  const gameState = {
    gameStateArray: gameStateArray,
    gameRunning: true,
    gameMessage: "",
  }
  insertAllCharacters(gameState.gameStateArray)
  hideGameMessages()
  clearGameArea()
  createGameArea(gameState.gameStateArray)
  eventListenersForRabbit(gameState, gameAreaSize)
}

function setGameAreWidth(gameAreaSize) {
  const width = gameAreaSize * 60 + 20 + "px"
  const gameAreaDiv = document.getElementById("game_area")
  gameAreaDiv.style.width = width
}
function eventListenersForRabbit(gameStatusObject) {
  window.onkeydown = (event) => {
    if (
      event.key === "ArrowUp" ||
      event.key === "ArrowDown" ||
      event.key === "ArrowLeft" ||
      event.key === "ArrowRight"
    ) {
      const eventKey = event.key
      if (gameStatusObject.gameRunning === true) {
        eventKeysFunctions(eventKey, gameStatusObject)

        changeWolvesPositions(gameStatusObject)
        clearGameArea()
        createGameArea(gameStatusObject.gameStateArray)
      } else {
        return
      }
    } else {
      return
    }
  }
}

function eventKeysFunctions(direction, gameStatusObject) {
  const rabbitCords = findCharacterCords(
    gameStatusObject.gameStateArray,
    RABBIT
  )
  const directions = getEventDirection(rabbitCords)
  var eventDirection = {
    ArrowUp: function () {
      moveRabbitUp(gameStatusObject, rabbitCords, directions)
    },
    ArrowDown: function () {
      moveRabbitDown(gameStatusObject, rabbitCords, directions)
    },
    ArrowLeft: function () {
      moveRabbitLeft(gameStatusObject, rabbitCords, directions)
    },
    ArrowRight: function () {
      moveRabbitRight(gameStatusObject, rabbitCords, directions)
    },
  }
  return eventDirection[direction]()
}

function changeWolvesPositions(gameStatusObject) {
  const wolvesCords = findCharacterCords(gameStatusObject.gameStateArray, WOLF)

  wolvesCords.forEach((singleWolf) => {
    if (gameStatusObject.gameRunning === true) {
      changeSingleWolfPosition(gameStatusObject, singleWolf)
    } else {
      showGameMessages(gameStatusObject.gameMessage)
    }
  })
}

function changeSingleWolfPosition(gameStatusObject, singleWolf) {
  const rabbitCords = findCharacterCords(
    gameStatusObject.gameStateArray,
    RABBIT
  )

  const cellsArround = findEmptyCellsArroundWolf(
    gameStatusObject.gameStateArray,
    singleWolf
  )

  const freeCells = checkCells(cellsArround, gameStatusObject)

  if (gameStatusObject.gameRunning === true) {
    const distanceArray = calculateDistanceOfCells(freeCells, rabbitCords)
    const closestCell = getClosestCell(distanceArray, freeCells)
    getClosestCell(distanceArray, freeCells)
    placeWolvesIntoNewCells(gameStatusObject.gameStateArray,closestCell,singleWolf)
  } else {
    showGameMessages(gameStatusObject.gameMessage)
  }
}

function isCharacter(gameStateArray, cellsArround, character) {
  const cellsArroundWolf = cellsArround.filter(
    ([x, y]) => gameStateArray[x][y] === character
  )
  return cellsArroundWolf
}

function checkCells(cellsArround, gameStatusObject) {
  const checkIFRabbit = isCharacter(
    gameStatusObject.gameStateArray,
    cellsArround,
    RABBIT
  )
  if (checkIFRabbit.length > 0) {
    gameStatusObject.gameRunning = false
    gameStatusObject.gameMessage = "over"
    return
  } else {
    const emptyCells = isCharacter(
      gameStatusObject.gameStateArray,
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
  const distanceArray = []
  freeVellsArray.forEach((item) => {
    const distance = calculateDistanceFromRabbit(item, rabbitCords)
    distanceArray.push(distance)
  })
  return distanceArray
}

function getClosestCell(distanceArray, freeVellsArray) {
  const max = Math.min(...distanceArray)
  const index = distanceArray.indexOf(max)
  return freeVellsArray[index]
}

const equals = (a, b) => JSON.stringify(a) === JSON.stringify(b)

function placeWolvesIntoNewCells(array, wolvesCords, item) {
  if (wolvesCords != undefined) {
    const rabbitCords = findCharacterCords(array, RABBIT)
    const [x, y] = wolvesCords
    const [k, p] = item
    if (equals([x, y], rabbitCords)) {
      gameStatusObject.gameRunning = false
      gameStatusObject.gameMessage = "over"
    } else {
      array[x][y] = WOLF
      array[k][p] = EMPTY_CELL
    }
  }
}

function calculateDistanceFromRabbit([x1, y1], [[x2, y2]]) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
}

function moveRabbitUp(gameStatusObject, rabbitCords, directions) {
  if (rabbitCords[0][X] === 0) {
    directions.up[X] = gameStatusObject.gameStateArray.length - 1
  }
  checkDirAndMove(directions.up, rabbitCords, gameStatusObject)
}

function moveRabbitDown(gameStatusObject, rabbitCords, directions) {
  if (rabbitCords[0][X] === gameStatusObject.gameStateArray.length - 1) {
    directions.down[X] = 0
  }
  checkDirAndMove(directions.down, rabbitCords, gameStatusObject)
}

function moveRabbitLeft(gameStatusObject, rabbitCords, directions) {
  if (rabbitCords[0][Y] === 0) {
    directions.left[Y] = gameStatusObject.gameStateArray.length - 1
  }
  checkDirAndMove(directions.left, rabbitCords, gameStatusObject)
}
function moveRabbitRight(gameStatusObject, rabbitCords, directions) {
  if (rabbitCords[0][Y] === gameStatusObject.gameStateArray.length - 1) {
    directions.right[Y] = 0
  }
  checkDirAndMove(directions.right, rabbitCords, gameStatusObject)
}

function checkDirAndMove(newCords, napCords, gameStatusObject) {
  const [j, k] = newCords
  const [x, y] = napCords[0]
  if (gameStatusObject.gameStateArray[j][k] == EMPTY_CELL) {
    gameStatusObject.gameStateArray[j][k] = RABBIT
    gameStatusObject.gameStateArray[x][y] = EMPTY_CELL
  } else if (gameStatusObject.gameStateArray[j][k] === HOUSE) {
    gameStatusObject.gameStateArray[x][y] = EMPTY_CELL
    gameStatusObject.gameRunning = false
    gameStatusObject.gameMessage = "win"
    return
  } else if (gameStatusObject.gameStateArray[j][k] === FENCE) {
    return
  }
  if (gameStatusObject.gameStateArray[j][k] === WOLF) {
    gameStatusObject.gameRunning = false
    gameStatusObject.gameMessage = "over"
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

function clearGameArea() {
  const containerNode = document.getElementById("game_area")
  containerNode.innerHTML = ""
}

function createInnerDivs(cellIndex) {
  const containerNode = document.getElementById("game_area")

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

function createGameArea(array) {
  array.forEach((row, i) => {
    row.forEach((column, j) => {
      const cellIndex = i.toString() + j.toString()
      if (column === EMPTY_CELL) {
        createInnerDivs(cellIndex)
      }
      if (column === RABBIT) {
        createInnerDivs(cellIndex)
        insertCharacterImage(RABBIT, cellIndex)
      }
      if (column === WOLF) {
        createInnerDivs(cellIndex)
        insertCharacterImage(WOLF, cellIndex)
      }
      if (column === FENCE) {
        createInnerDivs(cellIndex)
        insertCharacterImage(FENCE, cellIndex)
      }
      if (column === HOUSE) {
        createInnerDivs(cellIndex)
        insertCharacterImage(HOUSE, cellIndex)
      }
    })
  })
}
function hideGameMessages() {
  const mainDiv = document.getElementById("message_div")
  mainDiv.style.display = "none"
  const gameBoard = document.getElementById("wrapper")
  gameBoard.style.display = "block"
}
function showGameMessages(gameStatus) {
  const mainDiv = document.getElementById("message_div")
  const message = document.querySelector("#message_div>h2")
  const gameBoard = document.getElementById("wrapper")
  gameBoard.style.display = "none"
  if (gameStatus === "over") {
    message.innerText = "Game over"
  } else if (gameStatus === "win") {
    message.innerText = "You win"
  }
  mainDiv.style.display = "block"
}