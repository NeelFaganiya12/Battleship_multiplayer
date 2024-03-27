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

// document.getElementById("loading").style.display = "none";
// document.getElementById("svg-container").style.display = "none";

const boat = [boat_one, boat_two, boat_three, boat_four, boat_five];

function battleShipGame() {
  // const socket = new WebSocket("ws://localhost:3000");
  // socket.onmessage = handleServerMessage;
  // const socket = io();
  let name;

  // document.getElementById("find").addEventListener("click", function () {
  //   name = document.getElementById("name").value;
  //   if (name == "" || name == null) {
  //     alert("Please enter a valid name");
  //   } else {
  //     socket.emit("find", { name: name });

  //     document.getElementById("loading").style.display = "block";
  //     document.getElementById("find").disabled = true;
  //     document.getElementById("playerName").innerText = name;
  //   }
  // });

  // socket.on("find", (e) => {
  //   let allPlayersArray = e.allPlayers;
  //   console.log(allPlayersArray);

  //   document.getElementById("svg-container").style.display = "block";
  //   document.getElementById("loading").style.display = "none";
  //   document.getElementById("find").style.display = "none";

  //   let oppName;
  //   let value;

  //   const foundObj = allPlayersArray.find(
  //     (obj) => obj.p1.p1name == `${name}` || obj.p2.p2name == `${name}`
  //   );

  //   foundObj.p1.p1name == `${name}`
  //     ? (oppName = foundObj.p2.p2name)
  //     : (oppName = foundObj.p1.p1name);
  //   foundObj.p1.p1name == `${name}`
  //     ? (value = foundObj.p2.p2value)
  //     : (value = foundObj.p1.p1value);

  //   console.log(value);
  //   document.getElementById("oppName").innerText = oppName;
  //   document.getElementById("value").innerText = value;
  // });

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
  const canvas = document.getElementById("player"); //Player Grid
  const canvas1 = document.getElementById("computer"); //Computer Grid
  const startGame = document.getElementById("Start-game"); //Start button
  const ctx = canvas.getContext("2d"); //Handles all the boxes inside the Player's grid
  const ctx1 = canvas1.getContext("2d"); //Handles all the boxes inside the Computer's grid
  const allAvailableBoatsGrid = document.querySelector(".boats-container");
  const gridSize = 10;
  const cellSize = canvas.width / gridSize;
  const cellSize1 = canvas1.width / gridSize;
  let ships = []; // Ship placement position for Computer (Randomly generated)
  let shipsPlayer = []; // Ship placement position for Player (Player chooses)
  let hits = []; //Handles the hits
  let playerShipIDUsed = []; //Keeps track of which ships the player has placed in the grid
  let shipsHitByPlayer = []; //Contains name of the ships that have been hit by the player
  let shipsHitByComputer = []; //Contains name of the ships that have been hit by the computer
  const infoDisplay = document.querySelector("#info");
  let hitsByComputer = [];
  let droppedSequence = [];
  let cntShip = 0;
  let cntComputer = 0;
  let player_miss = 0;
  let player_hit = 0;
  let computer_miss = 0;
  let computer_hit = 0;
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

      console.log(playerNumber);
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
    console.log(shipsPlayer);
  });

  let ff = 0;

  canvas1.addEventListener("click", (event) => {
    if (
      currentPlayer == "user" &&
      isReady &&
      isEnemyReady &&
      Turn.innerHTML === "Turn: Your turn"
    ) {
      const rect = canvas1.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const gridX = Math.floor(x / cellSize);
      const gridY = Math.floor(y / cellSize);
      // ctx1.fillStyle = "red";
      // ctx1.fillRect(gridX * cellSize, gridY * cellSize, cellSize, cellSize);
      shotFired = { gridX: gridX, gridY: gridY };
      // handleCanvasClick1(event);
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
      const rect = canvas1.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const gridX = Math.floor(x / cellSize);
      const gridY = Math.floor(y / cellSize);
      // ctx1.fillStyle = "red";
      // ctx1.fillRect(gridX * cellSize, gridY * cellSize, cellSize, cellSize);
      shotFired = { gridX: gridX, gridY: gridY };
      // handleCanvasClick1(event);
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
    console.log(event.shipss);
    let val;
    const gridX = event.shotFired.gridX;
    const gridY = event.shotFired.gridY;

    if (findsIndex(hits, [gridX, gridY]) == -1) {
      hits.push([gridX, gridY]);
      if (checkArray(shipsPlayer, [gridX, gridY]) == -1) {
        ctx.fillStyle = "blue";
        ctx.fillRect(gridX * cellSize, gridY * cellSize, cellSize, cellSize);
        socket.emit("reply-fire", { msg: "miss", gridX: gridX, gridY: gridY });
      } else if (checkArray(shipsPlayer, [gridX, gridY]) == 0) {
        ctx.fillStyle = "red";
        ctx.fillRect(gridX * cellSize, gridY * cellSize, cellSize, cellSize);
        socket.emit("reply-fire", { msg: "hit", gridX: gridX, gridY: gridY });

        const indShipPlayer = findsIndex(shipsPlayer, [gridX, gridY]);
        const val = droppedSequence2[indShipPlayer];
        shipsHitByComputer.push(val);
        const countShipHit = checkShipHitOccurence(shipsHitByComputer, val);
        if (countShipHit == val + 1) {
          cntComputer++;
          console.log("I'm in");
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
            alert("You Lost!!!!");
            socket.emit("full-boat-destroyed", { msg: "finished" });
          } else {
            socket.emit("full-boat-destroyed", { msg: "destroyed" });
          }
        }
      }
    } else {
      socket.emit("reply-fire", { msg: "already-hit" });
    }

    // canvas1.removeEventListener("click", () => console.log("removed"));
    // startPlaying(socket);
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
      alert("You Won!!!");
    }
  });

  socket.on("reply-fire", (m) => {
    if (m.msg == "hit") {
      // shipsHitByPlayer.push([m.gridX, m.gridY]);
      ctx1.fillStyle = "black";
      ctx1.fillRect(m.gridX * cellSize, m.gridY * cellSize, cellSize, cellSize);

      // if (shipsHitByPlayer.length == 15) {
      //   if (confirm("You won!")) {
      //     location.reload();
      //   }
      //   socket.emit("game-over");
      // }
    } else if (m.msg == "miss") {
      ctx1.fillStyle = "red";
      ctx1.fillRect(m.gridX * cellSize, m.gridY * cellSize, cellSize, cellSize);
    } else {
      alert("Spot already bombed, please bomb another spot");
      // Turn.innerHTML = "Your turn";
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
    ctx.clearRect(100, 10, canvas.width, canvas.height);
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        ctx.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
      }
    }
  }

  function drawBoard1() {
    //Draws Computer board
    ctx1.clearRect(120, 120, canvas1.width, canvas1.height);
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        ctx1.strokeRect(i * cellSize1, j * cellSize1, cellSize1, cellSize1);
      }
    }
  }

  function randomComputerBoats() {
    //Handles random placements of ships for computer
    boat_one_computer();
    boat_two_computer();
    boat_three_computer();
    boat_four_computer();
    boat_five_computer();
  }

  function boat_one_computer() {
    //Generates a random position, checks if the position is valid for one boat, checks if the posiition is not already filled in
    let randomTF = Math.random() < 0.5;
    let x = Math.floor(Math.random() * 10);
    let y = Math.floor(Math.random() * 10);

    if (checkArray(ships, [x, y]) == -1) {
      ships.push([x, y]);
    } else {
      boat_one_computer();
    }
  }

  function boat_one_player(x, y) {
    //checks if the given position is valid for one boat, checks if the position is not already filled in
    if (checkArray(shipsPlayer, [x, y]) == -1) {
      shipsPlayer.push([x, y]);
      playerShipIDUsed.push("one");
      ctx.fillStyle = "#FED8B1";
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      return 0;
    } else {
      window.alert(
        "The ship cannot be placed here, please select another Space"
      );
      return -1;
    }
  }

  function boat_two_computer() {
    //Generates a random position, checks if the start position can fill two positions, checks if the position is not already filled in
    let randomTF = Math.random() < 0.5;
    let ran1 = Math.floor(Math.random() * 10);
    let ran2 = Math.floor(Math.random() * 10);

    let x = Number(ran1);
    let y = Number(ran2);

    if (randomTF) {
      if (
        checkArray(ships, [x, y]) == -1 &&
        checkArray(ships, [x, y + 1]) == -1 &&
        y + 1 < 10
      ) {
        ships.push([x, y]);
        ships.push([x, y + 1]);
      } else {
        boat_two_computer();
      }
    } else {
      if (
        checkArray(ships, [x, y]) == -1 &&
        checkArray(ships, [x + 1, y]) == -1 &&
        x + 1 < 10
      ) {
        ships.push([x, y]);
        ships.push([x + 1, y]);
      } else {
        boat_two_computer();
      }
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
        ctx.fillStyle = "#007C80";
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        ctx.fillRect(x * cellSize, (y + 1) * cellSize, cellSize, cellSize);
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
        ctx.fillStyle = "#007C80";
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        ctx.fillRect((x + 1) * cellSize, y * cellSize, cellSize, cellSize);
        return 0;
      } else {
        window.alert(
          "The ship cannot be placed here, please select another Space"
        );
        return -1;
      }
    }
  }

  function boat_three_computer() {
    //Generates a random position, checks if the start position can fill three positions, checks if the position is not already filled in
    let randomTF = Math.random() < 0.5;
    let x = Math.floor(Math.random() * 10);
    let y = Math.floor(Math.random() * 10);

    if (randomTF) {
      if (
        checkArray(ships, [x, y]) == -1 &&
        checkArray(ships, [x, y + 1]) == -1 &&
        checkArray(ships, [x, y + 2]) == -1 &&
        y + 2 < 10
      ) {
        for (let i = 0; i < 3; i++) {
          ships.push([x, y + i]);
        }
      } else {
        boat_three_computer();
      }
    } else {
      if (
        checkArray(ships, [x, y]) == -1 &&
        checkArray(ships, [x + 1, y]) == -1 &&
        checkArray(ships, [x + 2, y]) == -1 &&
        x + 2 < 10
      ) {
        for (let i = 0; i < 3; i++) {
          ships.push([x + i, y]);
        }
      } else {
        boat_three_computer();
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
        ctx.fillStyle = "rgb(43, 226, 159)";

        for (let i = 0; i < 3; i++) {
          shipsPlayer.push([x, y + i]);
          ctx.fillRect(x * cellSize, (y + i) * cellSize, cellSize, cellSize);
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
        ctx.fillStyle = "rgb(43, 226, 159)";

        for (let i = 0; i < 3; i++) {
          shipsPlayer.push([x + i, y]);
          ctx.fillRect((x + i) * cellSize, y * cellSize, cellSize, cellSize);
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

  function boat_four_computer() {
    //Generates a random position, checks if the start position can fill four positions, checks if the position is not already filled in
    let randomTF = Math.random() < 0.5;
    let x = Math.floor(Math.random() * 10);
    let y = Math.floor(Math.random() * 10);

    if (randomTF) {
      if (
        checkArray(ships, [x, y]) == -1 &&
        checkArray(ships, [x, y + 1]) == -1 &&
        checkArray(ships, [x, y + 2]) == -1 &&
        checkArray(ships, [x, y + 3]) == -1 &&
        y + 3 < 10
      ) {
        for (let i = 0; i < 4; i++) {
          ships.push([x, y + i]);
        }
      } else {
        boat_four_computer();
      }
    } else {
      if (
        checkArray(ships, [x, y]) == -1 &&
        checkArray(ships, [x + 1, y]) == -1 &&
        checkArray(ships, [x + 2, y]) == -1 &&
        checkArray(ships, [x + 3, y]) == -1 &&
        x + 3 < 10
      ) {
        for (let i = 0; i < 4; i++) {
          ships.push([x + i, y]);
        }
      } else {
        boat_four_computer();
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
        ctx.fillStyle = "rgb(226, 177, 43)";

        for (let i = 0; i < 4; i++) {
          shipsPlayer.push([x, y + i]);
          ctx.fillRect(x * cellSize, (y + i) * cellSize, cellSize, cellSize);
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
        ctx.fillStyle = "rgb(226, 177, 43)";

        for (let i = 0; i < 4; i++) {
          shipsPlayer.push([x + i, y]);
          ctx.fillRect((x + i) * cellSize, y * cellSize, cellSize, cellSize);
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

  function boat_five_computer() {
    //Generates a random position, checks if the start position can fill five positions, checks if the position is not already filled in
    let randomTF = Math.random() < 0.5;
    let x = Math.floor(Math.random() * 10);
    let y = Math.floor(Math.random() * 10);

    if (randomTF) {
      if (
        checkArray(ships, [x, y]) == -1 &&
        checkArray(ships, [x, y + 1]) == -1 &&
        checkArray(ships, [x, y + 2]) == -1 &&
        checkArray(ships, [x, y + 3]) == -1 &&
        checkArray(ships, [x, y + 4]) == -1 &&
        y + 4 < 10
      ) {
        for (let i = 0; i < 5; i++) {
          ships.push([x, y + i]);
        }
      } else {
        boat_five_computer();
      }
    } else {
      if (
        checkArray(ships, [x, y]) == -1 &&
        checkArray(ships, [x + 1, y]) == -1 &&
        checkArray(ships, [x + 2, y]) == -1 &&
        checkArray(ships, [x + 3, y]) == -1 &&
        checkArray(ships, [x + 4, y]) == -1 &&
        x + 4 < 10
      ) {
        for (let i = 0; i < 5; i++) {
          ships.push([x + i, y]);
        }
      } else {
        boat_five_computer();
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
        ctx.fillStyle = "#808080";

        for (let i = 0; i < 5; i++) {
          shipsPlayer.push([x, y + i]);
          ctx.fillRect(x * cellSize, (y + i) * cellSize, cellSize, cellSize);
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
        ctx.fillStyle = "#808080";

        for (let i = 0; i < 5; i++) {
          shipsPlayer.push([x + i, y]);
          ctx.fillRect((x + i) * cellSize, y * cellSize, cellSize, cellSize);
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

  function restartGame() {
    //Restarts the game
    document.head.innerHTML =
      document.head.innerHTML + `<link rel="stylesheet" href="./styles.css">`;

    // location.reload();
    document.body.innerHTML = `
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Black+Ops+One&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Black+Ops+One&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Lobster&family=Sixtyfour&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Sixtyfour&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Honk&display=swap" rel="stylesheet">
        <h1 style="display:flex; justify-content: center; font-family: 'Honk', system-ui; font-size: 80px;">Battleship</h1>
        <div class="information-container">
            <svg width="100" height="50" xmlns="http://www.w3.org/2000/svg">
            <rect x="60" y="10" width="80" height="50" style="fill:red;" />
            <span style="font-size: 30px; font-style:italic; font-weight:bold">-->Hit</span>
            </svg>
            <svg width="100" height="50" xmlns="http://www.w3.org/2000/svg">
            <rect x="60" y="10" width="80" height="50" style="fill:blue;" />
            <span style="font-size: 30px; font-style:italic; font-weight:bold">-->Miss</span>
            </svg>
            
        </div>
        <title>Battleship Game</title>
        <link rel="stylesheet" href="./styles.css">
        <video width="320" height="240" autoplay style="opacity: 0.1;position: fixed;right: 0;bottom: 0;min-width: 100%; min-height: 100%;object-fit: fill; z-index: 0;" id="myVideo">
            <source src="explosion_video.mp4" type="video/mp4">
            Your browser does not support the audio element.
        </video>
        <div id="svg-container" style="position:relative;z-index: 1;">
        <div id="turn-container">
          <p style="text-align: center; font-size: 30px; font-family: 'Black Ops One', system-ui;; margin-bottom: 50px;">Turn:</p>
        </div>
        <div id="restart-game"></div>
        <div class="score-container">
          <p style="text-align: center; font-size: 30px; font-family: 'Sixtyfour', sans-serif; display: inline-block;">Score:</p>
          <span style="float: right; font-size: 30px; font-style:italic; font-weight:bold; display: inline-block;"><a href="./battleship-how-to-play.html" target="_blank">How to play?</a></span>
          <p id="print-player-boats" style="font-family: 'Lobster', sans-serif;">No. of boats Player destroyed: </p>
          <p id="print-computer-boats" style="font-family: 'Lobster', sans-serif;">No. of boats Comp destroyed: </p>
          
        </div>
      
    
        <div class="gameboard" style="display: inline-block;">
          <p style="font-size: xxx-large  ">Player</p>
          <canvas id="player" width="500" height="500" style="margin:50px; "></canvas>
          
        </div>
    
        <div class="gameboard" style="display: inline-block;">
          <p style="font-size: xxx-large ">Computer</p>
          <canvas id="computer" width="500" height="500" style="margin:50px;"></canvas>
        </div>
        <br>
        
        <br>
    
        <div style="justify-content: center;">
          <button id="Start-game">Start Game</button> 
        </div>
    
        <audio id="myAudio">
          <source src="explosion_sound.mp3" type="audio/mpeg">
          Your browser does not support the audio element.
        </audio>
        
        <div class="boats-container">
          <div id="one" class="boat-one one" style="cursor:pointer" draggable="true"></div>
          <div id="two" class="boat-two two" style="cursor:pointer" draggable="true"></div>
          <div id="three" class="boat-three three" style="cursor:pointer" draggable="true"></div>
          <div id="four" class="boat-four four" style="cursor:pointer" draggable="true"></div>
          <div id="five" class="boat-five five" style="cursor:pointer" draggable="true"></div>
        </div>
    
        <button id="button-flip" onclick="rotateShips();">Flip boats</button>
     
      </div>`;

    battleShipGame();
  }

  function handleCanvasClick() {
    //Handles click on the computer side grid
    let gridX = Math.floor(Math.random() * 10);
    let gridY = Math.floor(Math.random() * 10);

    if (checkArray(hitsByComputer, [gridX, gridY]) == -1) {
      if (!hitsByComputer.some((hit) => hit[0] === gridX && hit[1] === gridY)) {
        if (
          shipsPlayer.some((ship) => ship[0] === gridX && ship[1] === gridY)
        ) {
          ctx.fillStyle = "red";
          ctx.fillRect(gridX * cellSize, gridY * cellSize, cellSize, cellSize);
          hitsByComputer.push([gridX, gridY]);
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
              //If all 5 ships have been destroyed, the game ends
              canvas.removeEventListener("click", handleCanvasClick);
              canvas1.removeEventListener("click", handleCanvasClick1);
              document.getElementById("turn-container").innerHTML =
                "<p style=\"text-align: center; font-size: 60px; color: yellow; font-family: 'Black Ops One', system-ui; margin-bottom: 50px;\">Winner: COMPUTER WINS</p>";
              document.getElementById("restart-game").innerHTML =
                '<button id="restart-button">Restart Game</button>';
              document
                .getElementById("restart-button")
                .addEventListener("click", restartGame);
              return; //helps in exitin the function after the computer wins.
            }
          }
          computer_hit++;
          document.getElementById("turn-container").innerHTML =
            "<p style=\"text-align: center; font-size: 30px; font-family: 'Black Ops One', system-ui;; margin-bottom: 50px;\">Player Hit: " +
            player_hit +
            " || Player Miss: " +
            player_miss +
            " || Turn: Computer's turn || Computer Hit: " +
            computer_hit +
            " || Computer Miss: " +
            computer_miss +
            "</p>";
          setTimeout(handleCanvasClick, 1250);
        } else {
          ctx.fillStyle = "blue";
          ctx.fillRect(gridX * cellSize, gridY * cellSize, cellSize, cellSize);
          hitsByComputer.push([gridX, gridY]);
          canvas1.addEventListener("click", handleCanvasClick1);
          computer_miss++;
          document.getElementById("turn-container").innerHTML =
            "<p style=\"text-align: center; font-size: 30px; font-family: 'Black Ops One', system-ui;; margin-bottom: 50px;\">Player Hit: " +
            player_hit +
            " || Player Miss: " +
            player_miss +
            " || Turn: Player's turn || Computer Hit: " +
            computer_hit +
            " || Computer Miss: " +
            computer_miss +
            "</p>";
        }
      }
    } else handleCanvasClick();
  }

  function handleCanvasClick1(event) {
    //Handles click on the player side grid
    const rect = canvas1.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const gridX = Math.floor(x / cellSize);
    const gridY = Math.floor(y / cellSize);
    let val;
    if (findsIndex(hits, [gridX, gridY]) == -1) {
      if (!hits.some((hit) => hit[0] === gridX && hit[1] === gridY)) {
        if (ships.some((ship) => ship[0] === gridX && ship[1] === gridY)) {
          ctx1.fillStyle = "red";
          ctx1.fillRect(gridX * cellSize, gridY * cellSize, cellSize, cellSize);
          hits.push([gridX, gridY]);
          const ind = findsIndex(ships, [gridX, gridY]);
          if (ind == 0) {
            val = 0;
            shipsHitByPlayer.push(0);
          } else if (ind == 1 || ind == 2) {
            val = 1;
            shipsHitByPlayer.push(1);
          } else if (ind >= 3 && ind <= 5) {
            val = 2;
            shipsHitByPlayer.push(2);
          } else if (ind >= 6 && ind <= 9) {
            val = 3;
            shipsHitByPlayer.push(3);
          } else {
            val = 4;
            shipsHitByPlayer.push(4);
          }
          const countShipHit = checkShipHitOccurence(shipsHitByPlayer, val);
          if (countShipHit == val + 1) {
            cntShip++;
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
            if (cntShip == 5) {
              //If all 5 ships have been destroyed, the game ends
              canvas.removeEventListener("click", handleCanvasClick);
              canvas1.removeEventListener("click", handleCanvasClick1);
              document.getElementById("turn-container").innerHTML =
                "<p style=\"text-align: center; font-size: 60px; color: yellow; font-family: 'Black Ops One', system-ui; margin-bottom: 50px;\">Winner: PLAYER WINS</p>";
              document.getElementById("restart-game").innerHTML =
                '<button id="restart-button">Restart Game</button>';
              document
                .getElementById("restart-button")
                .addEventListener("click", restartGame);
              return;
            }
          }
          player_hit++;
          document.getElementById("turn-container").innerHTML =
            "<p style=\"text-align: center; font-size: 30px; font-family: 'Black Ops One', system-ui;; margin-bottom: 50px;\">Player Hit: " +
            player_hit +
            " || Player Miss: " +
            player_miss +
            " || Turn: Player's turn || Computer Hit: " +
            computer_hit +
            " || Computer Miss: " +
            computer_miss +
            "</p>";
          handleCanvasClick1();
        } else {
          ctx1.fillStyle = "blue";
          ctx1.fillRect(gridX * cellSize, gridY * cellSize, cellSize, cellSize);
          hits.push([gridX, gridY]);
          canvas1.removeEventListener("click", handleCanvasClick1);
          // setTimeout(handleCanvasClick, 1250);
          player_miss++;
          document.getElementById("turn-container").innerHTML =
            "<p style=\"text-align: center; font-size: 30px; font-family: 'Black Ops One', system-ui;; margin-bottom: 50px;\">Player Hit: " +
            player_hit +
            " || Player Miss: " +
            player_miss +
            " || Turn: Computer's turn || Computer Hit: " +
            computer_hit +
            " || Computer Miss: " +
            computer_miss +
            "</p>";
        }
      }
    } else {
      window.alert(
        "Please bomb a different spot, you have already placed a bomb here."
      );
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

  canvas.addEventListener("dragover", dragging);
  canvas.addEventListener("drop", draggingStop);

  function draggingStart(e) {
    //This function is called when the ship starts dragging
    shipDragged = e.target;
  }

  function dragging(e) {
    //This function is called when the ship is being dragged
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const gridX = Math.floor(x / cellSize);
    const gridY = Math.floor(y / cellSize);
  }

  let randomT;
  let droppedNumber = 0;

  function draggingStop(e) {
    //This function is called when the ship dragginng stops, so that we can know the location of where the ship is to be placed
    const rect = canvas.getBoundingClientRect();
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
      console.log(shipsPlayer);
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
  }

  function isPlayerReady(number) {
    let player = `.p${parseInt(number) + 1}`;
    document.querySelector(`${player} .ready span`).classList.toggle("green");
  }

  function playStarts() {
    //This function is called when "Start Game" button is clicked
    if (playerShipIDUsed.length == 5) {
      startGame.remove();
      canvas1.addEventListener("click", handleCanvasClick1);
      document.getElementById("turn-container").innerHTML =
        "<p style=\"text-align: center; font-size: 30px; font-family: 'Black Ops One', system-ui; margin-bottom: 50px;\">Player Hit: 0 || Player Miss: 0 || Turn: Player's turn || Computer Hit: 0 || Computer Miss: 0</p>";
      findIndexDroppedSeq();
      randomComputerBoats();
    } else {
      window.alert("Please first place all the ships in the grid");
    }
  }

  function initGame() {
    //This function draws the Player and Computer board and calls the playStarts function to start the game
    drawBoard();
    drawBoard1();
    // startGame.addEventListener("click", playStarts);
  }

  // TODO
  // function handleServerMessage(event) {
  //   console.log("Message from server:", event.data);
  // }

  // TODO
  // function sendMessageToServer(message) {
  //   socket.send(message);
  // }

  initGame();
  document.getElementById("button-flip").addEventListener("click", rotateShips);
}
document.addEventListener("DOMContentLoaded", battleShipGame);
