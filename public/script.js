class Boat {
  //Constructors for each boats
  constructor(name, length) {
    this.name = name;
    this.length = length;
  }
}

const boat_one = new Boat("boat_one", 1);
const boat_two = new Boat("boat_two", 2);
const boat_three = new Boat("boat_three", 3);
const boat_four = new Boat("boat_four", 4);
const boat_five = new Boat("boat_five", 5);

const boat = [boat_one, boat_two, boat_three, boat_four, boat_five];

function battleShipGame() {
  cnt = 0;
  var videoEffect = document.getElementById("myVideo");
  // videoEffect.pause();

  function rotateShips() {
    //This function rotates the ship to 90/0 degrees
    if (cnt % 2 == 0) {
      const boats = document.querySelector(".boats-container");
      const boatsArray = Array.from(boats.children);
      boatsArray.forEach(
        (boatsArray) => (boatsArray.style.transform = "rotate(90deg)")
      );
      cnt += 1;
    } else {
      const boats = document.querySelector(".boats-container");
      const boatsArray = Array.from(boats.children);
      boatsArray.forEach(
        (boatsArray) => (boatsArray.style.transform = "rotate(0deg)")
      );
      cnt += 1;
    }
  }
  const containerA = document.getElementById("player"); //Player Grid
  const containerB = document.getElementById("computer"); //Computer Grid
  const startGame = document.getElementById("Start-game"); //Start button
  const playerA_grid = containerA.getContext("2d"); //Handles all the boxes inside the Player's grid
  const playerB_grid = containerB.getContext("2d"); //Handles all the boxes inside the Computer's grid
  const allAvailableBoatsGrid = document.querySelector(".boats-container");
  const gridSize = 10;
  const cellSize = containerA.width / gridSize;
  const cellSize1 = containerB.width / gridSize;
  let shipsPlayer = []; // Ship placement position for Player (Player chooses)
  let hits = []; //Handles the hits
  let playerShipIDUsed = []; //Keeps track of which ships the player has placed in the grid
  let shipsHitByComputer = []; //Contains name of the ships that have been hit by the computer
  const infoDisplay = document.querySelector("#info");
  const connection_turn_container = document.querySelector(
    "#connection-turn-container"
  );
  let droppedSequence = [];
  let cntComputer = 0;
  let currentPlayer = "user";
  const Turn = document.querySelector("#turn-container");

  let playerNumber = 0;
  let isReady = false;
  let isEnemyReady = false;
  let allShipsPlaced = false;
  let shotFired = -1;

  const socket = io();

  socket.on("player-number", (number) => {
    if (number === -1) {
      infoDisplay.innerHTML = "Server full";
    } else {
      playerNumber = parseInt(number);
      if (playerNumber === 1) currentPlayer = "enemy";

      socket.emit("check-players");
    }
  });

  function checkArray(shipArray, findValue) {
    //Checks if findValue exists in shipArray Array
    for (let i = 0; i < shipArray.length; i++) {
      if (JSON.stringify(shipArray[i]) == JSON.stringify(findValue)) {
        return 0;
      }
    }
    return -1;
  }

  function findsIndex(arr1, elem) {
    //finds the index of the elem in arr1
    for (let i = 0; i < arr1.length; i++) {
      if (JSON.stringify(arr1[i]) == JSON.stringify(elem)) return i;
    }
    return -1;
  }

  function checkShipHitOccurence(arr1, ind) {
    //Checks which ship is hit
    let cnt = 0;
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] == ind) cnt++;
    }
    return cnt;
  }

  let droppedSequence2 = []; //This array stores the equivalent of droppedSequence, if the droppedSequence is [2,4,1,3,5] this array will contain [1,1,3,3,3,3,0,2,2,2,4,4,4,4] which will help me in finding the index of the ship placed

  function findIndexDroppedSeq() {
    //This function checks the sequence in which the ships were dropped, and accordingly pushes the ship number in the array droppedSequence2 so that when the user clicks we can find the index of that grid in shipsPlayer and then on getting the value of that index from droppedSequence2, we can find the ship that has been hit
    for (let i = 0; i < droppedSequence.length; i++) {
      if (droppedSequence[i] == 1) {
        droppedSequence2.push(0);
      } else if (droppedSequence[i] == 2) {
        for (let j = 0; j < 2; j++) {
          droppedSequence2.push(1);
        }
      } else if (droppedSequence[i] == 3) {
        for (let j = 0; j < 3; j++) {
          droppedSequence2.push(2);
        }
      } else if (droppedSequence[i] == 4) {
        for (let j = 0; j < 4; j++) {
          droppedSequence2.push(3);
        }
      } else {
        for (let j = 0; j < 5; j++) {
          droppedSequence2.push(4);
        }
      }
    }
  }

  startGame.addEventListener("click", () => {
    if (allShipsPlaced) startPlaying(socket);
    else infoDisplay.innerHTML = "Please place ships first";
    findIndexDroppedSeq();
  });

  let ff = 0;

  containerB.addEventListener("click", (event) => {
    if (
      currentPlayer == "user" &&
      isReady &&
      isEnemyReady &&
      Turn.innerHTML === "Turn: Your turn"
    ) {
      const rect = containerB.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const gridX = Math.floor(x / cellSize);
      const gridY = Math.floor(y / cellSize);
      shotFired = { gridX: gridX, gridY: gridY };
      currentPlayer = "enemy";
      Turn.innerHTML = "Turn: Enemy's turn";
      socket.emit("fire", { shotFired: shotFired, shipss: shipsPlayer });
    }
    if (
      currentPlayer == "enemy" &&
      isReady &&
      isEnemyReady &&
      Turn.innerHTML === "Turn: Your turn"
    ) {
      const rect = containerB.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const gridX = Math.floor(x / cellSize);
      const gridY = Math.floor(y / cellSize);
      shotFired = { gridX: gridX, gridY: gridY };
      currentPlayer = "user";
      Turn.innerHTML = "Turn: Enemy's Turn";
      socket.emit("fire", { shotFired: shotFired, shipss: shipsPlayer });
    }
  });

  //Runs when the enemy shoots
  socket.on("fire", (event) => {
    f = 1;
    Turn.innerHTML = "Turn: Your turn";
    let val;
    const gridX = event.shotFired.gridX;
    const gridY = event.shotFired.gridY;

    if (findsIndex(hits, [gridX, gridY]) == -1) {
      hits.push([gridX, gridY]);
      if (checkArray(shipsPlayer, [gridX, gridY]) == -1) {
        playerA_grid.fillStyle = "blue";
        playerA_grid.fillRect(
          gridX * cellSize,
          gridY * cellSize,
          cellSize,
          cellSize
        );
        socket.emit("reply-fire", { msg: "miss", gridX: gridX, gridY: gridY });
      } else if (checkArray(shipsPlayer, [gridX, gridY]) == 0) {
        playerA_grid.fillStyle = "red";
        playerA_grid.fillRect(
          gridX * cellSize,
          gridY * cellSize,
          cellSize,
          cellSize
        );
        socket.emit("reply-fire", { msg: "hit", gridX: gridX, gridY: gridY });

        const indShipPlayer = findsIndex(shipsPlayer, [gridX, gridY]);
        const val = droppedSequence2[indShipPlayer];
        shipsHitByComputer.push(val);
        const countShipHit = checkShipHitOccurence(shipsHitByComputer, val);
        if (countShipHit == val + 1) {
          cntComputer++;
          var img = new Image();
          var div1 = document.getElementById("print-computer-boats");

          img.onload = function () {
            div1.appendChild(img);

            var soundEffect = document.getElementById("myAudio");
            soundEffect.play();

            var videoEffect = document.getElementById("myVideo");
            videoEffect.pause();
            videoEffect.play();
          };

          img.src = "./battleship.svg";
          if (cntComputer == 5) {
            connection_turn_container.innerHTML = "You Lost!!";
            Turn.innerHTML = "";
            setTimeout(function () {
              window.location.reload();
            }, 10000);
            socket.emit("full-boat-destroyed", { msg: "finished" });
          } else {
            socket.emit("full-boat-destroyed", { msg: "destroyed" });
          }
        }
      }
    } else {
      socket.emit("reply-fire", { msg: "already-hit" });
    }
  });

  socket.on("full-boat-destroyed", (msg) => {
    if (msg.msg === "destroyed") {
      var img = new Image();
      var div1 = document.getElementById("print-player-boats");

      img.onload = function () {
        div1.appendChild(img);

        var soundEffect = document.getElementById("myAudio");
        soundEffect.play();

        var videoEffect = document.getElementById("myVideo");
        videoEffect.pause();
        videoEffect.play();
      };

      img.src = "./battleship.svg";
    } else if (msg.msg === "finished") {
      var img = new Image();
      var div1 = document.getElementById("print-player-boats");

      img.onload = function () {
        div1.appendChild(img);

        var soundEffect = document.getElementById("myAudio");
        soundEffect.play();

        var videoEffect = document.getElementById("myVideo");
        videoEffect.pause();
        videoEffect.play();
      };

      img.src = "./battleship.svg";
      connection_turn_container.innerHTML = "You Won!!";
      Turn.innerHTML = "";
      setTimeout(function () {
        window.location.reload();
      }, 10000);
    }
  });

  socket.on("reply-fire", (m) => {
    if (m.msg == "hit") {
      playerB_grid.fillStyle = "red";
      playerB_grid.fillRect(
        m.gridX * cellSize,
        m.gridY * cellSize,
        cellSize,
        cellSize
      );
    } else if (m.msg == "miss") {
      playerB_grid.fillStyle = "blue";
      playerB_grid.fillRect(
        m.gridX * cellSize,
        m.gridY * cellSize,
        cellSize,
        cellSize
      );
    } else {
      alert("Spot already bombed, please bomb another spot");
    }
  });

  socket.on("game-over", () => {
    if (confirm("You lose!")) {
      location.reload();
    }
  });

  socket.on("player-connection", (number) => {
    console.log(`Player number ${number} has connected`);
    connectedPlayer(number);
  });

  socket.on("enemy-ready", (number) => {
    isEnemyReady = true;
    isPlayerReady(number);
    if (isReady) startPlaying(socket);
  });

  socket.on("check-players", (players) => {
    players.forEach((p, i) => {
      if (p.connected) connectedPlayer(i);
      if (p.ready) {
        isPlayerReady(i);
        if (i != playerNumber) isEnemyReady = true;
      }
    });
  });

  function connectedPlayer(number) {
    let player = `.p${parseInt(number) + 1}`;
    document
      .querySelector(`${player} .connected span`)
      .classList.toggle("green");
    if (parseInt(number) === playerNumber)
      document.querySelector(player).style.fontWeight = "bold";
  }

  function drawBoard() {
    //Draws Player board
    playerA_grid.clearRect(100, 10, containerA.width, containerA.height);
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        playerA_grid.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
      }
    }
  }

  function drawBoard1() {
    //Draws Computer board
    playerB_grid.clearRect(120, 120, containerB.width, containerB.height);
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        playerB_grid.strokeRect(
          i * cellSize1,
          j * cellSize1,
          cellSize1,
          cellSize1
        );
      }
    }
  }

  function boat_one_player(x, y) {
    //checks if the given position is valid for one boat, checks if the position is not already filled in
    if (checkArray(shipsPlayer, [x, y]) == -1) {
      shipsPlayer.push([x, y]);
      playerShipIDUsed.push("one");
      playerA_grid.fillStyle = "#FED8B1";
      playerA_grid.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      return 0;
    } else {
      window.alert(
        "The ship cannot be placed here, please select another Space"
      );
      return -1;
    }
  }

  function boat_two_player(x, y, randomTF) {
    //checks if the start position has 2 consecutive available blocks, checks if the ships is to be places vertically or horizontally
    if (randomTF) {
      if (
        checkArray(shipsPlayer, [x, y]) == -1 &&
        checkArray(shipsPlayer, [x, y + 1]) == -1 &&
        y + 1 < 10
      ) {
        shipsPlayer.push([x, y]);
        shipsPlayer.push([x, y + 1]);
        playerShipIDUsed.push("two");
        playerA_grid.fillStyle = "#007C80";
        playerA_grid.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        playerA_grid.fillRect(
          x * cellSize,
          (y + 1) * cellSize,
          cellSize,
          cellSize
        );
        return 0;
      } else {
        window.alert(
          "The ship cannot be placed here, please select another Space"
        );
        return -1;
      }
    } else {
      if (
        checkArray(shipsPlayer, [x, y]) == -1 &&
        checkArray(shipsPlayer, [x + 1, y]) == -1 &&
        x + 1 < 10
      ) {
        shipsPlayer.push([x, y]);
        shipsPlayer.push([x + 1, y]);
        playerShipIDUsed.push("two");
        playerA_grid.fillStyle = "#007C80";
        playerA_grid.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        playerA_grid.fillRect(
          (x + 1) * cellSize,
          y * cellSize,
          cellSize,
          cellSize
        );
        return 0;
      } else {
        window.alert(
          "The ship cannot be placed here, please select another Space"
        );
        return -1;
      }
    }
  }

  function boat_three_player(x, y, randomTF) {
    //checks if the start position has 3 consecutive available blocks, checks if the ships is to be places vertically or horizontally
    if (randomTF) {
      if (
        checkArray(shipsPlayer, [x, y]) == -1 &&
        checkArray(shipsPlayer, [x, y + 1]) == -1 &&
        checkArray(shipsPlayer, [x, y + 2]) == -1 &&
        y + 2 < 10
      ) {
        playerA_grid.fillStyle = "rgb(43, 226, 159)";

        for (let i = 0; i < 3; i++) {
          shipsPlayer.push([x, y + i]);
          playerA_grid.fillRect(
            x * cellSize,
            (y + i) * cellSize,
            cellSize,
            cellSize
          );
        }
        playerShipIDUsed.push("three");
        return 0;
      } else {
        window.alert(
          "The ship cannot be placed here, please select another Space"
        );
        return -1;
      }
    } else {
      if (
        checkArray(shipsPlayer, [x, y]) == -1 &&
        checkArray(shipsPlayer, [x + 1, y]) == -1 &&
        checkArray(shipsPlayer, [x + 2, y]) == -1 &&
        x + 2 < 10
      ) {
        playerA_grid.fillStyle = "rgb(43, 226, 159)";

        for (let i = 0; i < 3; i++) {
          shipsPlayer.push([x + i, y]);
          playerA_grid.fillRect(
            (x + i) * cellSize,
            y * cellSize,
            cellSize,
            cellSize
          );
        }
        playerShipIDUsed.push("three");
        return 0;
      } else {
        window.alert(
          "The ship cannot be placed here, please select another Space"
        );
        return -1;
      }
    }
  }

  function boat_four_player(x, y, randomTF) {
    //checks if the start position has 4 consecutive available blocks, checks if the ships is to be places vertically or horizontally
    if (randomTF) {
      if (
        checkArray(shipsPlayer, [x, y]) == -1 &&
        checkArray(shipsPlayer, [x, y + 1]) == -1 &&
        checkArray(shipsPlayer, [x, y + 2]) == -1 &&
        checkArray(shipsPlayer, [x, y + 3]) == -1 &&
        y + 3 < 10
      ) {
        playerA_grid.fillStyle = "rgb(226, 177, 43)";

        for (let i = 0; i < 4; i++) {
          shipsPlayer.push([x, y + i]);
          playerA_grid.fillRect(
            x * cellSize,
            (y + i) * cellSize,
            cellSize,
            cellSize
          );
        }
        playerShipIDUsed.push("four");
        return 0;
      } else {
        window.alert(
          "The ship cannot be placed here, please select another Space"
        );
        return -1;
      }
    } else {
      if (
        checkArray(shipsPlayer, [x, y]) == -1 &&
        checkArray(shipsPlayer, [x + 1, y]) == -1 &&
        checkArray(shipsPlayer, [x + 2, y]) == -1 &&
        checkArray(shipsPlayer, [x + 3, y]) == -1 &&
        x + 3 < 10
      ) {
        playerA_grid.fillStyle = "rgb(226, 177, 43)";

        for (let i = 0; i < 4; i++) {
          shipsPlayer.push([x + i, y]);
          playerA_grid.fillRect(
            (x + i) * cellSize,
            y * cellSize,
            cellSize,
            cellSize
          );
        }
        playerShipIDUsed.push("four");
        return 0;
      } else {
        window.alert(
          "The ship cannot be placed here, please select another Space"
        );
        return -1;
      }
    }
  }

  function boat_five_player(x, y, randomTF) {
    //checks if the start position has 5 consecutive available blocks, checks if the ships is to be places vertically or horizontally
    if (randomTF) {
      if (
        checkArray(shipsPlayer, [x, y]) == -1 &&
        checkArray(shipsPlayer, [x, y + 1]) == -1 &&
        checkArray(shipsPlayer, [x, y + 2]) == -1 &&
        checkArray(shipsPlayer, [x, y + 3]) == -1 &&
        checkArray(shipsPlayer, [x, y + 4]) == -1 &&
        y + 4 < 10
      ) {
        playerA_grid.fillStyle = "#808080";

        for (let i = 0; i < 5; i++) {
          shipsPlayer.push([x, y + i]);
          playerA_grid.fillRect(
            x * cellSize,
            (y + i) * cellSize,
            cellSize,
            cellSize
          );
        }
        playerShipIDUsed.push("five");
        return 0;
      } else {
        window.alert(
          "The ship cannot be placed here, please select another Space"
        );
        return -1;
      }
    } else {
      if (
        checkArray(shipsPlayer, [x, y]) == -1 &&
        checkArray(shipsPlayer, [x + 1, y]) == -1 &&
        checkArray(shipsPlayer, [x + 2, y]) == -1 &&
        checkArray(shipsPlayer, [x + 3, y]) == -1 &&
        checkArray(shipsPlayer, [x + 4, y]) == -1 &&
        x + 4 < 10
      ) {
        playerA_grid.fillStyle = "#808080";

        for (let i = 0; i < 5; i++) {
          shipsPlayer.push([x + i, y]);
          playerA_grid.fillRect(
            (x + i) * cellSize,
            y * cellSize,
            cellSize,
            cellSize
          );
        }
        playerShipIDUsed.push("five");
        return 0;
      } else {
        window.alert(
          "The ship cannot be placed here, please select another Space"
        );
        return -1;
      }
    }
  }

  let shipDragged;
  const boatsPlayed = Array.from(
    document.getElementsByClassName("boats-container")
  );
  boatsPlayed.forEach((boatsPlay) =>
    boatsPlay.addEventListener("dragstart", draggingStart)
  );

  const playerCanvas = document.querySelectorAll("#player");

  containerA.addEventListener("dragover", dragging);
  containerA.addEventListener("drop", draggingStop);

  function draggingStart(e) {
    //This function is called when the ship starts dragging
    shipDragged = e.target;
  }

  function dragging(e) {
    //This function is called when the ship is being dragged
    e.preventDefault();
    const rect = containerA.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const gridX = Math.floor(x / cellSize);
    const gridY = Math.floor(y / cellSize);
  }

  let randomT;
  let droppedNumber = 0;

  function draggingStop(e) {
    //This function is called when the ship dragginng stops, so that we can know the location of where the ship is to be placed
    const rect = containerA.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const gridX = Math.floor(x / cellSize);
    const gridY = Math.floor(y / cellSize);
    if (cnt % 2 == 0) {
      randomT = false;
    } else {
      randomT = true;
    }

    if (shipDragged.id == "one" && checkArray(playerShipIDUsed, "one") == -1) {
      const isDropped = boat_one_player(gridX, gridY);
      if (isDropped == 0) {
        droppedNumber++;
        shipDragged.remove();
        droppedSequence.push(1);
      }
    } else if (
      shipDragged.id == "two" &&
      checkArray(playerShipIDUsed, "two") == -1
    ) {
      const isDropped = boat_two_player(gridX, gridY, randomT);
      if (isDropped == 0) {
        droppedNumber++;
        shipDragged.remove();
        droppedSequence.push(2);
      }
    } else if (
      shipDragged.id == "three" &&
      checkArray(playerShipIDUsed, "three") == -1
    ) {
      const isDropped = boat_three_player(gridX, gridY, randomT);
      if (isDropped == 0) {
        droppedNumber++;
        shipDragged.remove();
        droppedSequence.push(3);
      }
    } else if (
      shipDragged.id == "four" &&
      checkArray(playerShipIDUsed, "four") == -1
    ) {
      const isDropped = boat_four_player(gridX, gridY, randomT);
      if (isDropped == 0) {
        droppedNumber++;
        shipDragged.remove();
        droppedSequence.push(4);
      }
    } else if (
      shipDragged.id == "five" &&
      checkArray(playerShipIDUsed, "five") == -1
    ) {
      const isDropped = boat_five_player(gridX, gridY, randomT);
      if (isDropped == 0) {
        droppedNumber++;
        shipDragged.remove();
        droppedSequence.push(5);
      }
    } else {
      window.alert("This ship is already placed");
    }

    if (!allAvailableBoatsGrid.querySelector(".ship")) {
      allShipsPlaced = true;
    }

    // socket.emit("playing", { value });
  }

  function startPlaying(socket) {
    if (!isReady) {
      socket.emit("player-ready");
      isReady = true;
      isPlayerReady(playerNumber);
    }

    if (isEnemyReady) {
      if (currentPlayer === "user") {
        Turn.innerHTML = "Turn: Your turn";
      }
      if (currentPlayer === "enemy") {
        Turn.innerHTML = "Turn: Enemy's turn";
      }
    }

    if (isReady) {
      if (currentPlayer === "user") {
        Turn.innerHTML = "Turn: Enemy's Turn";
      }
      if (currentPlayer === "enemy") {
        Turn.innerHTML = "Turn: Your turn";
      }
    }

    document.getElementById("Start-game").style.display = "none";
  }

  function isPlayerReady(number) {
    let player = `.p${parseInt(number) + 1}`;
    document.querySelector(`${player} .ready span`).classList.toggle("green");
  }

  function initGame() {
    //This function draws the Player and Computer board and calls the playStarts function to start the game
    drawBoard();
    drawBoard1();
  }

  initGame();
  document.getElementById("button-flip").addEventListener("click", rotateShips);
}
document.addEventListener("DOMContentLoaded", battleShipGame);
