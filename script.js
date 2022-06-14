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

let gameBoardNumber = 0
const createGameArea = document.getElementById("create_new_game_area")
createGameArea.addEventListener("click", () => {
  ++gameBoardNumber
  drawNewBoard(gameBoardNumber)
})
function getTemplate(templateNumber) {
  const template = `
  <div id="${"main_area" + templateNumber}" class="main_area">
    <div class="header" id="${"header" + templateNumber}">
      <div class="game_size_buttons">
        <button class = "game_start_btn${templateNumber}" class = "button-32">Start the game</button>
        <select id="${"select" + templateNumber}">
          <option value="5">5X5</option>
          <option value="7">7X7</option>
          <option value="10">10X10</option>
        </select>
      </div>
    <div class="game_area" id="${"game_area" + templateNumber}"></div>
  </div>
  <div id="${"message_div" + templateNumber}" class="message_div">
    <h2></h2>
    <button class = "game_start_btn${templateNumber}">Start Again</button>
  </div>
  </div>
  <div class="game_buttons" id="${"game_buttons" + templateNumber}">
  <div class="up_button">
    <div id="${"up" + templateNumber}" class="up"></div>
  </div>
  <div class="side_buttons">
    <div id="${"left" + templateNumber}" class="left"></div>
    <div id="${"right" + templateNumber}" class="right"></div>
  </div>
  <div class="down_button">
    <div id="${"down" + templateNumber}" class="down"></div>
  </div>
  </div>
  `
  return template
}
function drawNewBoard(gameNumber) {
  createButtonsandBoard()
  addGameStartEventListeners(gameNumber)
}

function createButtonsandBoard() {
  const container = document.getElementById("container")
  const template = getTemplate(gameBoardNumber)
  const newWrapper = document.createElement("div")
  newWrapper.id = "wrapper" + gameBoardNumber
  newWrapper.setAttribute("class", "wrapper")
  newWrapper.innerHTML = template
  container.append(newWrapper)
}
function addGameStartEventListeners(gameNumber) {
  const startButton = document.getElementsByClassName(
    `game_start_btn${gameNumber}`
  )
  for (let btn of startButton) {
    btn.addEventListener("click", () => gameStart(gameNumber))
  }
}
const gallery = new Array()

gallery[1] = "images/gamewolf.png"
gallery[2] = "images/ban.png"
gallery[3] = "images/home.png"
gallery[4] = "images/rabbit.png"

function gameStart(gameBoardNumber) {
  const select = "select" + gameBoardNumber
  const gameAreaSize = parseInt(document.getElementById(select).value)
  const gameArray = createGameArray(gameAreaSize)
  for (k = 0; k < 1000; k++) {
    window.clearInterval(k)
  }

  
  const changeWolvesPositionsInterval = setInterval(() => {
    changeWolvesPositions(gameState)
  }, 2000+Math.random()*100)
  const changeWolvesBackgroundsInterval = setInterval(() => {
    console.log(2000+Math.random()*100)
    changeDivBackground(gameState)
  }, (2000+Math.random()*100)-200)
  const gameState = {
    gameArray,
    gameRunning: true,
    gameMessage: "",
    gameBoardNumber,
    wolvesTimeInterval: changeWolvesPositionsInterval,
    wolvesBackgrounds: changeWolvesBackgroundsInterval,
  }

  removeMovementEventListeners(gameState)
  setGameAreWidth(gameAreaSize, gameState.gameBoardNumber)
  insertAllCharacters(gameState.gameArray)

  hideGameMessages(gameState)

  clearGameArea(gameState)
  drawGameArea(gameState)
  eventListenersForRabbit(gameState, gameAreaSize)
}

function changeWolvesPositions(gameObject) {
  const wolvesCords = findCharacterCords(gameObject.gameArray, WOLF)
  if (gameObject.gameRunning === false) {
    return
  }
  wolvesCords.forEach((wolf) => {
    if (gameObject.gameRunning === false) {
      clearIntervalsAndSHowMessage(gameObject)
      return
    } else {
      changeSingleWolfPosition(gameObject, wolf)
    }
  })
  clearGameArea(gameObject)
  drawGameArea(gameObject)
}

function clearIntervalsAndSHowMessage(gameObject) {
  clearInterval(gameObject.wolvesTimeInterval)
  clearInterval(gameObject.wolvesBackgrounds)
  showGameMessages(gameObject)
}

function setGameAreWidth(gameAreaSize, gameBoardNumber) {
  const gameAreaId = "game_area" + gameBoardNumber
  const width = gameAreaSize * 60 + 20 + "px"
  const gameAreaDiv = document.getElementById(gameAreaId)
  gameAreaDiv.style.width = width
}
function eventListenersForRabbit(gameObject) {
  const moveUp = getHtmlElement(gameObject, "up")
  moveUp.addEventListener("click", function listenerUp() {
    eventKeysFunctions(gameObject, up)
  })

  const moveDown = getHtmlElement(gameObject, "down")
  moveDown.addEventListener("click", function () {
    eventKeysFunctions(gameObject, down)
  })

  const moveLeft = getHtmlElement(gameObject, "left")
  moveLeft.addEventListener("click", function () {
    eventKeysFunctions(gameObject, left)
  })

  const moveRight = getHtmlElement(gameObject, "right")
  moveRight.addEventListener("click", function () {
    eventKeysFunctions(gameObject, right)
  })
}

function eventKeysFunctions(gameObject, direction) {
  if (gameObject.gameRunning === false) {
    clearIntervalsAndSHowMessage(gameObject)
    return
  } else {
    const rabbitCords = findCharacterCords(gameObject.gameArray, RABBIT)[0]
    const rabbitPossibleMoves = getPossibleMoves(rabbitCords)
    const rabbitLegalMoves = correctMoves(
      rabbitPossibleMoves
    )
    checkDirAndMove(rabbitLegalMoves[direction], rabbitCords, gameObject)
    clearGameArea(gameObject)
    drawGameArea(gameObject)
  }
}

function changeSingleWolfPosition(gameObject, wolf) {
  const rabbitCords = findCharacterCords(gameObject.gameArray, RABBIT)
  const cellsArround = findEmptyCellsArroundWolf(gameObject.gameArray, wolf)
  const freeCells = rabbitOrEmptyCells(cellsArround, gameObject)
  if (gameObject.gameRunning === false) {
    clearIntervalsAndSHowMessage(gameObject)
  } else {
    const distanceArray = calculateDistanceOfCells(freeCells, rabbitCords)
    const closestCell = freeCells[getClosestIndex(distanceArray)]
    placeWolvesIntoNewCells(gameObject.gameArray, closestCell, wolf)
  }
}

function findCharacter(gameArray, cellsArround, character) {
  return cellsArround.filter(
    ([x, y]) => gameArray[x][y] === character
  )
}

function findRabbit(gameArray, cellsArround) {
  const rabbitCoords = findCharacter(gameArray, cellsArround, RABBIT)
  return rabbitCoords.length > 0
}

function findEmptyCells(gameArray, cellsArround) {
  return findCharacter(gameArray, cellsArround, EMPTY_CELL) 
}

function rabbitOrEmptyCells(cellsArround, gameObject) {
  const checkIFRabbit = findRabbit(gameObject.gameArray, cellsArround)
  if (checkIFRabbit) {
    changeGameStatus(gameObject, "over")
    return
  } else {
    return findEmptyCells(gameObject.gameArray, cellsArround) 
  }
}

const isInRange = (gameArray) => ([x, y]) => x >= 0 && x < gameArray.length && y >= 0 && y < gameArray.length

function findEmptyCellsArroundWolf(gameArray, [x, y]) {
  let movementDirections = [
    [x, y],
    [x - 1, y],
    [x + 1, y],
    [x, y - 1],
    [x, y + 1],
  ]
  return movementDirections.filter(isInRange(gameArray)  )
  
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

const equals = (firstArray, secondArray) =>
  JSON.stringify(firstArray) === JSON.stringify(secondArray)

function placeWolvesIntoNewCells(gameArray, wolvesCords, item) {
  if (wolvesCords.length > 0) {
    const rabbitCords = findCharacterCords(gameArray, RABBIT)
    const [x, y] = wolvesCords
    const [k, p] = item
    if (equals([x, y], rabbitCords)) {
      changeGameStatus(gameObject, "over")
    } else {
      gameArray[x][y] = WOLF
      gameArray[k][p] = EMPTY_CELL
    }
  }
}

function calculateDistanceFromRabbit([x1, y1], [[x2, y2]]) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
}

function checkDirAndMove(newCords, napCords, gameObject) {
  const [j, k] = newCords
  const [x, y] = napCords
  const gameArray = gameObject.gameArray
  if (gameArray[j][k] == EMPTY_CELL) {
    gameArray[j][k] = RABBIT
    gameArray[x][y] = EMPTY_CELL
  } else if (gameArray[j][k] === HOUSE) {
    changeGameStatus(gameObject, "win")
    clearIntervalsAndSHowMessage(gameObject)
    return
  } else if (gameArray[j][k] === FENCE) {
    return
  }
  if (gameArray[j][k] === WOLF) {
    changeGameStatus(gameObject, "over")
    clearIntervalsAndSHowMessage(gameObject)
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

function findCharacterCords(gameArray, character) {
  const findInMatrix = function (accumulator, row, x) {
    row.forEach((element, y) => {
      if (element === character) {
        accumulator.push([x, y])
      }
    })
    return accumulator
  }
  return gameArray.reduce(findInMatrix, [])
}

function insertAllCharacters(gameArray) {
  const wolvesgameBoardNumber = ((gameArray.length - 1) / 100) * 60
  const fencegameBoardNumber = ((gameArray.length - 1) / 100) * 40
  insertCharactersIntoArray(gameArray, WOLF, wolvesgameBoardNumber)
  insertCharactersIntoArray(gameArray, FENCE, fencegameBoardNumber)
  insertCharactersIntoArray(gameArray, HOUSE, 1)
  insertCharactersIntoArray(gameArray, RABBIT, 1)
}

function createGameArray(gameAreaSize) {
  const gameCondition = new Array(gameAreaSize)
    .fill(EMPTY_CELL)
    .map(() => new Array(gameAreaSize).fill(EMPTY_CELL))

  return gameCondition
}

function insertSingleCharacter(cord, gameArray, character) {
  const x = cord[X]
  const y = cord[Y]
  gameArray[x][y] = character
}

function findEmptyCell(gameArray) {
  const randomX = Math.floor(Math.random() * gameArray.length)
  const randomY = Math.floor(Math.random() * gameArray.length)
  if (gameArray[randomX][randomY] === EMPTY_CELL) {
    return [randomX, randomY]
  } else {
    return findEmptyCell(gameArray)
  }
}

function insertCharactersIntoArray(gameArray, character, gameBoardNumber) {
  for (let i = 0; i < gameBoardNumber; i++) {
    const cords = findEmptyCell(gameArray)
    insertSingleCharacter(cords, gameArray, character)
  }
  return gameArray
}

function clearGameArea(gameObject) {
  const containerNode = getHtmlElement(gameObject, "game_area")
  containerNode.innerHTML = ""
}

function createInnerDivs(gameObject) {
  const containerNode = getHtmlElement(gameObject, "game_area")
  const div = document.createElement("div")
  containerNode.append(div)
}

function changeDivBackground(gameObject) {
  let divNumber = 0
  gameArray = gameObject.gameArray
  gameArray.forEach((row) => {
    row.forEach((column) => {
      if (column === WOLF) {
        setColorToBackground(gameObject, divNumber, "red")
      }
      divNumber++
    })
  })
}

function setColorToBackground(gameObject, divNumber, color) {
  const div = getHtmlElement(gameObject, "game_area").children
  div.item(divNumber).style.backgroundColor = color
}

function insertCharacterImage(character, divNumber, gameObject) {
  const div = getHtmlElement(gameObject, "game_area").children
  const img = document.createElement("img")
  img.src = gallery[character]
  img.style.width = "50px"
  div.item(divNumber).append(img)
}

function drawGameArea(gameObject) {
  let divNumber = 0
  gameArray = gameObject.gameArray
  gameArray.forEach((row) => {
    row.forEach((column) => {
      createInnerDivs(gameObject)
      if (column === RABBIT) {
        insertCharacterImage(RABBIT, divNumber, gameObject)
      }
      if (column === WOLF) {
        insertCharacterImage(WOLF, divNumber, gameObject)
      }
      if (column === FENCE) {
        insertCharacterImage(FENCE, divNumber, gameObject)
      }
      if (column === HOUSE) {
        insertCharacterImage(HOUSE, divNumber, gameObject)
      }
      divNumber++
    })
  })
}

function hideGameMessages(gameObject) {
  const mainDiv = getHtmlElement(gameObject, "message_div")
  mainDiv.style.display = "none"

  const gameBoard = getHtmlElement(gameObject, "header")
  gameBoard.style.display = "block"
}

function showGameMessages(gameObject) {
  const message_div = getHtmlElement(gameObject, "message_div")
  const message_div_h2 = "#message_div" + gameObject.gameBoardNumber + ">h2"
  const message = document.querySelector(message_div_h2)
  const gameBoard = getHtmlElement(gameObject, "header")
  gameBoard.style.display = "none"
  if (gameObject.gameMessage === "over") {
    message.innerText = "Game over"
  } else if (gameObject.gameMessage === "win") {
    message.innerText = "You win"
  }
  message_div.style.display = "block"
}

function getPossibleMoves([x, y]) {
  return [
    [x - 1, y],
    [x + 1, y],
    [x, y - 1],
    [x, y + 1],
  ]
}
function teleport([x, y]) {
  const maxValue = gameArray.length
  x = (x + maxValue) % maxValue
  y = (y + maxValue) % maxValue
  return [x, y]
}
function correctMoves(cordsArray) {
  return correctedArray = cordsArray.map(([x, y]) => teleport([x, y]))
}

function changeGameStatus(gameObject, gameStatus) {
  gameObject.gameRunning = false
  gameObject.gameMessage = gameStatus
}

function removeListener(element) {
  const newBtnElement = element.cloneNode(true)
  element.parentNode.replaceChild(newBtnElement, element)
}

function getHtmlElement(gameObject, elementId) {
  return document.getElementById(elementId + gameObject.gameBoardNumber)
}

function removeMovementEventListeners(gameObject) {
  removeListener(getHtmlElement(gameObject, "up"))
  removeListener(getHtmlElement(gameObject, "down"))
  removeListener(getHtmlElement(gameObject, "right"))
  removeListener(getHtmlElement(gameObject, "left"))
}
