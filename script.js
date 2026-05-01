// Game N: Template for any game number

let finishedLoading = false;

let sound = {
  sinkL: new Tone.Player(`sound/sinkL.mov`).toDestination(),
  sinkR: new Tone.Player(`sound/sinkR.mov`).toDestination(),
  mirror: [
    new Tone.Player(`sound/mirror0.mov`).toDestination(),
    new Tone.Player(`sound/mirror1.mov`).toDestination(),
    new Tone.Player(`sound/mirror2.mov`).toDestination(),
    new Tone.Player(`sound/mirror3.mov`).toDestination(),
  ],
};

let gameCanvas;

let canvasWidth = 550;
let canvasHeight = 400;

let originalDimensions = {
  width: 550,
  height: 400,
};
let ratio = originalDimensions.width / originalDimensions.height;

// let mirrorButton = document.querySelector("#mirrorButton");
// let sinkLButton = document.querySelector("#sinkLButton");
// let sinkRButton = document.querySelector("#sinkRButton");

let buttonContainer = document.querySelector("#buttonContainer");

let buttons = [
  // { id: "mirrorButton", width: 908, height: 275, x: 0, y: 0 },
  // { id: "sinkLButton", width: 75, height: 95, x: 170, y: 180 },
  // { id: "sinkRButton", width: 75, height: 95, x: 630, y: 180 },
];

let buttonDisplacement = 0;

let currentScene = "entrance";
let currentState = "season1door1time1";

// let currentScene = "lockerroom_main";
// let currentState = "default";

resetButtons();

// A scene is a state of the game with 3 frames, with no "animation"
// Scenes contain buttons which can trigger animations or go to other scenes
//  What is the right abstraction here?

// A scene is a state of the game...
// A scene can have multiple states (e.g. button on/off)
// A scene has buttons that move to other scenes or trigger animations
// A scene can either repeat through 3 frames (still scenes) or repeat through many frames (e.g. looping fish animation)
// A scene can also trigger a timed animation which may run for a finite amount of loops..... it might contain multiple looping sections, not just one frame after another...
// A scene generally shares the same button actions. If it triggers something that would need different buttons (e.g. Clicking on a vending machine item, then going to the closeup), it would switch to a different scene.
// An single playing animation is a state of a scene that only loops once, then returns to another state....

let bathhouse_scenes = [];
// 0: Main View
// 1: Shower view
// 2: Sauna view
// 3: Exit view
// 4: Shower Zoom

let scenes = {
  entrance: {},
  lobby_main: {},
  lobby_lockerroom: {},
  lobby_vending: {},
  vendingOptions: {},
  vendingResults: {},
  lobby_exit: {},
  fishtank: {},
  shoelocker: {},
  shoelockerCloseup: {},
  lockerroom_main: {},
  lockerroom_lockers: {},
  lockerroom_sinks: {},
  lockerroom_exit: {},
  lockers: {},
  lockerCloseup: {},
  laundryCloseup: {},
  sinks: {},
  bathhouse_main: {},
  bathhouse_showers: {},
  bathhouse_sauna: {},
  bathhouse_exit: {},
  shower: {},
  jacuzzi: {},
  coldbath: {},
  mural: {},
  sauna: {},
};

function goToScene(sceneName, stateName) {
  console.log("going to scene");
  console.log(sceneName);
  console.log(stateName);
  if (stateName == null) {
    stateName = "default";
  }
  // Account for leaving one scene to another and clearing timeout queue
  if (currentScene != sceneName) {
    jacuzziFinished = true;
    timeoutQueue.forEach(function (timeout) {
      clearTimeout(timeout);
    });
  }
  currentScene = sceneName;
  currentState = stateName;
  // Refresh clickable/visible buttons  to the current scene
  resetButtons();

  let isSequenceAniamtion = scenes[sceneName][stateName].isSequenceAnimation;
  startAnimation(currentScene, currentState, isSequenceAniamtion);
}

// starts the animation given a current scene and state
function startAnimation(scene, state, isSequenceAnimation) {
  clearInterval(animationInterval);
  let numOfFrames = scenes[scene][state].length;
  animationIndex = 0;
  animationInterval = setInterval(function () {
    animationIndex = (animationIndex + 1) % numOfFrames;

    // Redirect to other scene if sequence animation
    if (animationIndex == numOfFrames - 1 && isSequenceAnimation) {
      let destinationScene = scenes[scene][state].destinationScene;
      let destinationState = scenes[scene][state].destinationState;
      goToScene(destinationScene, destinationState);
    }
  }, 100);
}

// Scene specific data and handlers

//Vending machine logic
let drinkVending = false;
function pressVendingButton(num) {
  console.log("mouse enter event");
  if (!drinkVending) {
    drinkVending = true;
    goToScene("vendingOptions", num);
    let resultNum;
    if (num == 1 || num == 2) {
      resultNum = 1;
    } else if (num == 3 || num == 4) {
      resultNum = 2;
    } else if (num == 5) {
      resultNum = 3;
    } else if (num == 6) {
      resultNum = 4;
    } else if (num == 7 || num == 8) {
      resultNum = 5;
    }
    setTimeout(function () {
      goToScene("vendingResults", resultNum);
      drinkVending = false;
    }, 2000);
  }
}

function leaveVendingButton(num) {
  // goToScene("vendingOptions", "default");
}

function handleDrinkButton() {
  goToScene("vendingResults", 0);
}

// Shoelocker logic
let assignedShoelocker = Math.floor(Math.random() * 4) + 1;
let shoelockerFilled = false;
let shoesState = 0;

function handleShoelockerVisit() {
  let destinationState = shoelockerFilled ? "default" : assignedShoelocker;
  goToScene("shoelocker", destinationState);
}

function handleShoelockerCloseupVisit(lockerNum) {
  // Show locker filled if it is, otherwise empty
  if (lockerNum == assignedShoelocker) {
    let destinationState = shoelockerFilled ? shoesState : 0;
    goToScene("shoelockerCloseup", destinationState);
  }
}

function handleShoesButton() {
  // Show locker filled if it is, otherwise empty
  let destinationState = shoelockerFilled ? shoesState : "default";
  shoesState = (shoesState + 1) % 10;
  // locker is filled unless clothesState is zero
  shoelockerFilled = shoesState != 0;
  goToScene("shoelockerCloseup", shoesState);
}

function handleGoToLockerroom() {
  if (shoelockerFilled) {
    goToScene("lockerroom_main");
  } else {
    window.alert(
      "Please put leave your shoes in the shoe locker before entering the locker room",
    );
  }
}

// Cloths locker logic
let assignedClothesLocker = Math.floor(Math.random() * 3);
let lockerFilled = false;

let clothesState = 0;

function handleLockersVisit() {
  let destinationState = lockerFilled ? "default" : assignedClothesLocker;
  goToScene("lockers", destinationState);
}

function handleLockerCloseupVisit(lockerNum) {
  // Show locker filled if it is, otherwise empty
  if (lockerNum == assignedClothesLocker) {
    let destinationState = lockerFilled ? clothesState : 0;
    goToScene("lockerCloseup", destinationState);
  }
}

function handleClothesButton() {
  // Show locker filled if it is, otherwise empty
  let destinationState = lockerFilled ? clothesState : "default";
  clothesState = (clothesState + 1) % 4;
  // locker is filled unless clothesState is zero
  lockerFilled = clothesState != 0;
  goToScene("lockerCloseup", clothesState);
}

// Sink logic
let sinkState = {
  mirror: 3,
  sinkL: false,
  sinkR: false,
};
let mirrorInterval;
function handleSinkButton(sink) {
  console.log("handle sink button");
  if (sink == "L") {
    sinkState.sinkL = !sinkState.sinkL;
  } else if (sink == "R") {
    sinkState.sinkR = !sinkState.sinkR;
  }
  goToScene(
    "sinks",
    `mirror${sinkState.mirror}sinkL${sinkState.sinkL}sinkR${sinkState.sinkR}`,
  );
}

function handleMirrorButton() {
  // Allow mirror wipe if foggy enough
  if (sinkState.mirror >= 3) {
    sinkState.mirror = (sinkState.mirror + 1) % 7;
    goToScene(
      "sinks",
      `mirror${sinkState.mirror}sinkL${sinkState.sinkL}sinkR${sinkState.sinkR}`,
    );
    //Animate fogging animation
    if (sinkState.mirror == 0) {
      mirrorInterval = setInterval(function () {
        sinkState.mirror += 1;
        goToScene(
          "sinks",
          `mirror${sinkState.mirror}sinkL${sinkState.sinkL}sinkR${sinkState.sinkR}`,
        );
        if (sinkState.mirror == 3) {
          clearInterval(mirrorInterval);
        }
      }, 2000);
    }
  }
}

function handleGoToBathhouse() {
  if (lockerFilled) {
    goToScene("bathhouse_main");
  } else {
    window.alert("Please remove all clothing before entering the baths");
  }
}

function handleGoToBath(bathType) {
  if (showered) {
    goToScene(bathType);
  } else {
    window.alert("Please shower before entering baths.");
  }
}

function handleGoToLobbyFromLockerroom() {
  if (lockerFilled) {
    window.alert("Please get dressed before returning to the lobby.");
  } else {
    goToScene("lobby_vending");
  }
}

let muralState = {
  s: 1,
  fg: 1,
  bg: 1,
};
function handleMuralChange(elementType) {
  //Update mural state
  if (elementType == "s") {
    muralState.s = ((muralState.s + 1) % 3) + 1;
  } else if (elementType == "fg") {
    muralState.fg = ((muralState.fg + 1) % 3) + 1;
  } else if (elementType == "bg") {
    muralState.bg = ((muralState.bg + 1) % 3) + 1;
  }

  goToScene("mural", `s${muralState.s}fg${muralState.fg}bg${muralState.bg}`);
}

let saunaInterval;
let saunaState = 1;
function handleSaunaEntrance() {
  saunaInterval = setInterval(function () {
    if (saunaState + 1 < 16) {
      saunaState += 1;
      goToScene("sauna", saunaState);
    } else {
      clearInterval(saunaInterval);
    }
  }, 500);
}

function handleSaunaExit() {
  clearInterval(saunaInterval);
  saunaState = 1;
}

let entranceState = {
  season: 1,
  door: 1,
  time: 1,
};

// let entranceDoor = document.querySelector("#toLobbyFromEntrance");
// entranceDoor.addEventListener("mouseenter", function (e) {
//   e.stopPropagation();
//   console.log("mouse enter event");
//   entranceState.door = 2;
//   goToScene(
//     "entrance",
//     `season${entranceState.season}door${entranceState.door}time${entranceState.time}`,
//   );
// });

function openDoor() {
  console.log("mouse enter event");
  entranceState.door = 2;
  goToScene(
    "entrance",
    `season${entranceState.season}door${entranceState.door}time${entranceState.time}`,
  );
}

function closeDoor() {
  console.log("close door event");
  if (currentScene == "entrance") {
    entranceState.door = 1;
    goToScene(
      "entrance",
      `season${entranceState.season}door${entranceState.door}time${entranceState.time}`,
    );
  }
}

let showerState = 0;

let animatingSequence = false;
let sequenceAnimationInterval;
let currentAnimationFrames;

let animationInterval;
let animationIndex = 0;

let timeoutQueue = [];

let spritesheets = {
  entrance: { url: "img_compressed/entrance_spritesheet.png", imgObj: {} },
  lobby: { url: "img_compressed/lobby_spritesheet.png", imgObj: {} },
  shoelocker: { url: "img_compressed/shoelocker_spritesheet.png", imgObj: {} },
  vending: { url: "img_compressed/vending_spritesheet.png", imgObj: {} },
  fishtank: { url: "img_compressed/fish_spritesheet.png", imgObj: {} },
  lockerroom: { url: "img_compressed/lockerroom_spritesheet.png", imgObj: {} },
  sinks: { url: "img_compressed/sink_spritesheet.png", imgObj: {} },
  bathhouse: { url: "img_compressed/bathhouse_spritesheet.png", imgObj: {} },
  faucet: { url: "img_compressed/faucet_spritesheet.png", imgObj: {} },
  shower: { url: "img_compressed/shower_spritesheet.png", imgObj: {} },
  jacuzzi: { url: "img_compressed/jacuzzi_spritesheet.png", imgObj: {} },
  jacuzzi_animation: {
    url: "img_compressed/jacuzzi_animation.png",
    imgObj: {},
  },
  coldbath: { url: "img_compressed/coldbath_spritesheet.png", imgObj: {} },
  coldbath_animation: {
    url: "img_compressed/coldbath_animation.png",
    imgObj: {},
  },
  mural: { url: "img_compressed/mural_spritesheet.png", imgObj: {} },
  sauna: { url: "img_compressed/sauna_spritesheet.png", imgObj: {} },
};

function resetButtons() {
  buttonContainer.querySelectorAll("button").forEach(function (button) {
    // console.log(button.getAttribute("data-scene"));
    if (button.getAttribute("data-scene") == currentScene) {
      button.style.display = "block";
    } else {
      button.style.display = "none";
    }
  });
}

// Button actions

let showered = false;

function updateShowerState() {
  showerState = (showerState + 1) % 3;
  if (showerState == 1) {
    goToScene("shower", "faucetOn");
  } else if (showerState == 2) {
    showered = true;
    goToScene("shower", "showerOn");
  } else {
    console.log("go to scene");
    goToScene("shower", "default");
  }
}

let faucetButton = document.querySelector("#showerHandle");
faucetButton.addEventListener("click", function () {
  updateShowerState();
});

let jacuzziButtonPressed = false;
let jacuzziFinished = true;
let jacuzziButton = document.querySelector("#jacuzziButton");
jacuzziButton.addEventListener("mousedown", function () {
  if (jacuzziFinished) {
    jacuzziButtonPressed = true;
    goToScene("jacuzzi", "buttonPress");
  }
});

let coldbathButton = document.querySelector("#coldbathPool");

coldbathButton.addEventListener("click", function () {
  //Trigger cold bath animation
  goToScene("coldbath", "animation");
});

document.addEventListener("mouseup", function () {
  // Detect Jacuzzi animation event
  if (jacuzziButtonPressed) {
    jacuzziButtonPressed = false;
    jacuzziFinished = false;
    animateJacuzzi();
  }
});

function animateJacuzzi() {
  goToScene("jacuzzi", "default");
  timeoutQueue.push(
    setTimeout(function () {
      goToScene("jacuzzi", "bubble1");
    }, 4000),
  );
  timeoutQueue.push(
    setTimeout(function () {
      goToScene("jacuzzi", "bubble2");
    }, 8000),
  );
  timeoutQueue.push(
    setTimeout(function () {
      goToScene("jacuzzi", "bubble3");
    }, 12000),
  );
  timeoutQueue.push(
    setTimeout(function () {
      goToScene("jacuzzi", "bubble2");
    }, 16000),
  );
  timeoutQueue.push(
    setTimeout(function () {
      goToScene("jacuzzi", "bubble1");
    }, 20000),
  );
  timeoutQueue.push(
    setTimeout(function () {
      goToScene("jacuzzi", "default");
      jacuzziFinished = true;
    }, 24000),
  );
  // to do: make sure we can leave the scene without these messing up..
}

var game = function (p) {
  let thisCanvas;
  let canvasRatio = canvasWidth / canvasHeight;
  let mouse_x;
  let mouse_y;
  let rightButton;
  let leftButton;
  let cursor;
  let cursorState = "default";
  let sceneState = "story";

  let button_r_up, button_r_down, button_l_up, button_l_down;

  let currentlyAnimating = false;
  let timedAnimationIndex = 0;
  let currentlyDragging = false;

  let clickedObjects = [];

  let gameEntered = false;
  let gameStarted = false;

  let bathhouse_spritesheet;
  let faucet_spritesheet;
  let shower_spritesheet;

  let jacuzzi_spritesheet;

  let faucetAnimation = [];
  let showerAnimation = [];

  let jacuzzi_animations = [];

  // let sceneStates = {
  //   mirror: 0,
  //   sinkL: 0,
  //   sinkR: 0,
  // };
  // How will we map states to sprites?

  // let sinkImages = [];

  // let statesToIndex = {
  //   mirror0sinkL0sinkR0: 0,
  //   mirror0sinkL1sinkR0: 1,
  //   mirror0sinkL0sinkR1: 2,
  //   mirror0sinkL1sinkR1: 3,
  //   mirror1sinkL0sinkR0: 4,
  //   mirror1sinkL1sinkR0: 5,
  //   mirror1sinkL0sinkR1: 6,
  //   mirror1sinkL1sinkR1: 7,
  //   mirror2sinkL0sinkR0: 8,
  //   mirror2sinkL1sinkR0: 9,
  //   mirror2sinkL0sinkR1: 10,
  //   mirror2sinkL1sinkR1: 11,
  //   mirror3sinkL0sinkR0: 12,
  //   mirror3sinkL1sinkR0: 13,
  //   mirror3sinkL0sinkR1: 14,
  //   mirror3sinkL1sinkR1: 15,
  //   mirror4sinkL0sinkR0: 16,
  //   mirror4sinkL1sinkR0: 17,
  //   mirror4sinkL0sinkR1: 18,
  //   mirror4sinkL1sinkR1: 19,
  // };

  let animationSequenceIndex = 0;

  p.preload = function () {
    //Preload a background here
    //Preload whatever needs to be preloaded

    for (const [key, value] of Object.entries(spritesheets)) {
      value.imgObj = p.loadImage(value.url);
    }

    // spritesheets.forEach(function(spritesheet){
    //   spritesheet.imgObj =  p.loadImage(spritesheet.url);
    // });
  };

  function populateFrames(spriteSheet, row, sceneName, stateName, numOfFrames) {
    scenes[sceneName][stateName] = [];
    //Iterate through columns
    for (var j = 0; j < numOfFrames; j++) {
      let xPos = j * originalDimensions.width;
      let yPos = (row - 1) * originalDimensions.height;
      let thisImg = spriteSheet.get(
        xPos,
        yPos,
        originalDimensions.width,
        originalDimensions.height,
      );
      scenes[sceneName][stateName].push(thisImg);
    }
  }

  function defineSequenceAnimation(
    scene,
    state,
    destinationScene,
    destinationState,
  ) {
    scenes[scene][state].isSequenceAnimation = true;
    scenes[scene][state].destinationScene = destinationScene;
    scenes[scene][state].destinationState = destinationState;
  }

  function initializeGame() {
    let buttonContainer = document.querySelector("#buttonContainer");
    let buttons = document.querySelectorAll("#buttonContainer button");
    finishedLoading = true;
    buttonContainer.style.opacity = 0;
    buttonContainer.style.pointerEvents = "all";
    buttons.forEach(function (button) {
      button.style.pointerEvents = "all";
    });
  }

  p.setup = function () {
    // put setup code here
    // p.pixelDensity(1);
    // calculateCanvasDimensions(p);
    gameCanvas = p.createCanvas(canvasWidth, canvasHeight).elt;
    gameCanvas.classList.add("gameCanvas");

    thisCanvas = gameCanvas;
    p.noSmooth();

    // setupNavigation();

    // Split up spritesheet
    //Iterate through rows

    // Initialize entrance
    populateFrames(
      spritesheets.entrance.imgObj,
      1,
      "entrance",
      "season1door1time1",
      3,
    );
    populateFrames(
      spritesheets.entrance.imgObj,
      2,
      "entrance",
      "season1door2time1",
      3,
    );
    populateFrames(
      spritesheets.entrance.imgObj,
      3,
      "entrance",
      "season1door1time2",
      3,
    );
    populateFrames(
      spritesheets.entrance.imgObj,
      4,
      "entrance",
      "season1door2time2",
      3,
    );

    // Initialize lobby rooms

    populateFrames(spritesheets.lobby.imgObj, 1, "lobby_main", "default", 3);
    populateFrames(spritesheets.lobby.imgObj, 10, "lobby_exit", "default", 3);
    populateFrames(
      spritesheets.lobby.imgObj,
      11,
      "lobby_vending",
      "default",
      3,
    );
    populateFrames(
      spritesheets.lobby.imgObj,
      12,
      "lobby_lockerroom",
      "default",
      3,
    );

    populateFrames(spritesheets.fishtank.imgObj, 1, "fishtank", "default", 14);

    populateFrames(
      spritesheets.vending.imgObj,
      1,
      "vendingOptions",
      "default",
      2,
    );
    populateFrames(spritesheets.vending.imgObj, 2, "vendingOptions", "1", 2);
    populateFrames(spritesheets.vending.imgObj, 3, "vendingOptions", "2", 2);
    populateFrames(spritesheets.vending.imgObj, 4, "vendingOptions", "3", 2);
    populateFrames(spritesheets.vending.imgObj, 5, "vendingOptions", "4", 2);
    populateFrames(spritesheets.vending.imgObj, 6, "vendingOptions", "5", 2);
    populateFrames(spritesheets.vending.imgObj, 7, "vendingOptions", "6", 2);
    populateFrames(spritesheets.vending.imgObj, 8, "vendingOptions", "7", 2);
    populateFrames(spritesheets.vending.imgObj, 9, "vendingOptions", "8", 2);

    populateFrames(spritesheets.vending.imgObj, 10, "vendingResults", "0", 2);
    populateFrames(spritesheets.vending.imgObj, 11, "vendingResults", "1", 2);
    populateFrames(spritesheets.vending.imgObj, 12, "vendingResults", "2", 2);
    populateFrames(spritesheets.vending.imgObj, 13, "vendingResults", "3", 2);
    populateFrames(spritesheets.vending.imgObj, 14, "vendingResults", "4", 2);
    populateFrames(spritesheets.vending.imgObj, 15, "vendingResults", "5", 2);

    // Shoelocker

    populateFrames(
      spritesheets.shoelocker.imgObj,
      1,
      "shoelocker",
      "default",
      3,
    );
    populateFrames(spritesheets.shoelocker.imgObj, 2, "shoelocker", "1", 3);
    populateFrames(spritesheets.shoelocker.imgObj, 3, "shoelocker", "2", 3);
    populateFrames(spritesheets.shoelocker.imgObj, 4, "shoelocker", "3", 3);
    populateFrames(spritesheets.shoelocker.imgObj, 5, "shoelocker", "4", 3);
    populateFrames(
      spritesheets.shoelocker.imgObj,
      6,
      "shoelockerCloseup",
      "0",
      3,
    );
    populateFrames(
      spritesheets.shoelocker.imgObj,
      7,
      "shoelockerCloseup",
      "1",
      3,
    );
    populateFrames(
      spritesheets.shoelocker.imgObj,
      8,
      "shoelockerCloseup",
      "2",
      3,
    );
    populateFrames(
      spritesheets.shoelocker.imgObj,
      9,
      "shoelockerCloseup",
      "3",
      3,
    );
    populateFrames(
      spritesheets.shoelocker.imgObj,
      10,
      "shoelockerCloseup",
      "4",
      3,
    );
    populateFrames(
      spritesheets.shoelocker.imgObj,
      11,
      "shoelockerCloseup",
      "5",
      3,
    );
    populateFrames(
      spritesheets.shoelocker.imgObj,
      12,
      "shoelockerCloseup",
      "6",
      3,
    );
    populateFrames(
      spritesheets.shoelocker.imgObj,
      13,
      "shoelockerCloseup",
      "7",
      3,
    );
    populateFrames(
      spritesheets.shoelocker.imgObj,
      14,
      "shoelockerCloseup",
      "8",
      3,
    );
    populateFrames(
      spritesheets.shoelocker.imgObj,
      15,
      "shoelockerCloseup",
      "9",
      3,
    );

    // Initialize locker rooms
    populateFrames(
      spritesheets.lockerroom.imgObj,
      1,
      "lockerroom_main",
      "default",
      3,
    );
    populateFrames(
      spritesheets.lockerroom.imgObj,
      2,
      "lockerroom_lockers",
      "default",
      3,
    );
    populateFrames(
      spritesheets.lockerroom.imgObj,
      3,
      "lockerroom_sinks",
      "default",
      3,
    );
    populateFrames(
      spritesheets.lockerroom.imgObj,
      4,
      "lockerroom_exit",
      "default",
      3,
    );

    populateFrames(spritesheets.lockerroom.imgObj, 5, "lockers", "default", 3);
    populateFrames(spritesheets.lockerroom.imgObj, 6, "lockers", "1", 3);
    populateFrames(spritesheets.lockerroom.imgObj, 7, "lockers", "2", 3);
    populateFrames(spritesheets.lockerroom.imgObj, 8, "lockers", "3", 3);
    populateFrames(spritesheets.lockerroom.imgObj, 9, "lockerCloseup", "0", 3);
    populateFrames(spritesheets.lockerroom.imgObj, 10, "lockerCloseup", "1", 3);
    populateFrames(spritesheets.lockerroom.imgObj, 11, "lockerCloseup", "2", 3);
    populateFrames(spritesheets.lockerroom.imgObj, 12, "lockerCloseup", "3", 3);
    populateFrames(spritesheets.lockerroom.imgObj, 13, "lockerCloseup", "4", 3);
    populateFrames(
      spritesheets.lockerroom.imgObj,
      14,
      "laundryCloseup",
      "default",
      3,
    );
    populateFrames(
      spritesheets.lockerroom.imgObj,
      15,
      "laundryCloseup",
      "added",
      3,
    );

    // initialize sink stuff
    // Sink states:
    // - Sink L : false/true
    // - Sink R : false/true
    // - Mirror state: 0,1,2,3 -> Fog levels.... 4,5,6 -> writing levels

    for (var i = 0; i < 28; i++) {
      let mirrorState, l_state, r_state;
      mirrorState = Math.floor(i / 4);
      if (i % 4 == 0) {
        l_state = false;
        r_state = false;
      } else if (i % 4 == 1) {
        l_state = true;
        r_state = false;
      } else if (i % 4 == 2) {
        l_state = true;
        r_state = true;
      } else if (i % 4 == 3) {
        l_state = false;
        r_state = true;
      }
      populateFrames(
        spritesheets.sinks.imgObj,
        i + 1,
        "sinks",
        `mirror${mirrorState}sinkL${l_state}sinkR${r_state}`,
        3,
      );
    }

    // initialize bathhouse main scene

    populateFrames(
      spritesheets.bathhouse.imgObj,
      1,
      "bathhouse_main",
      "default",
      3,
    );
    populateFrames(
      spritesheets.bathhouse.imgObj,
      2,
      "bathhouse_showers",
      "default",
      3,
    );
    populateFrames(
      spritesheets.bathhouse.imgObj,
      3,
      "bathhouse_sauna",
      "default",
      3,
    );
    populateFrames(
      spritesheets.bathhouse.imgObj,
      4,
      "bathhouse_exit",
      "default",
      3,
    );
    populateFrames(spritesheets.bathhouse.imgObj, 5, "shower", "default", 3);

    // Initialize faucet and shower animation
    populateFrames(spritesheets.faucet.imgObj, 1, "shower", "faucetOn", 5);
    populateFrames(spritesheets.shower.imgObj, 1, "shower", "showerOn", 5);

    // Initialize jacuzzi
    populateFrames(spritesheets.jacuzzi.imgObj, 1, "jacuzzi", "default", 3);
    populateFrames(spritesheets.jacuzzi.imgObj, 2, "jacuzzi", "buttonPress", 3);

    //Initialize jacuzzi animation
    populateFrames(
      spritesheets.jacuzzi_animation.imgObj,
      1,
      "jacuzzi",
      "bubble1",
      4,
    );
    populateFrames(
      spritesheets.jacuzzi_animation.imgObj,
      2,
      "jacuzzi",
      "bubble2",
      4,
    );
    populateFrames(
      spritesheets.jacuzzi_animation.imgObj,
      3,
      "jacuzzi",
      "bubble3",
      4,
    );

    // Initialize coldbath
    populateFrames(spritesheets.coldbath.imgObj, 1, "coldbath", "default", 3);
    populateFrames(
      spritesheets.coldbath_animation.imgObj,
      1,
      "coldbath",
      "animation",
      14,
    );
    defineSequenceAnimation("coldbath", "animation", "coldbath", "default");

    //Populate mural spritesheet (every combo is a state e.g. s1, fg1, bg1)
    // How to translate 1-27 to these states???
    for (var i = 0; i < 27; i++) {
      let bg, fg, s;
      if (i < 9) {
        bg = 1;
      } else if (i < 18) {
        bg = 2;
      } else if (i < 27) {
        bg = 3;
      }
      if (i % 3 == 0) {
        fg = 1;
      } else if (i % 3 == 1) {
        fg = 2;
      } else if (i % 3 == 2) {
        fg = 3;
      }
      if (Math.floor(i / 3) % 3 == 0) {
        s = 1;
      } else if (Math.floor(i / 3) % 3 == 1) {
        s = 2;
      } else if (Math.floor(i / 3) % 3 == 2) {
        s = 3;
      }
      populateFrames(
        spritesheets.mural.imgObj,
        i + 1,
        "mural",
        `s${s}fg${fg}bg${bg}`,
        3,
      );
    }

    // Initialize sauna
    for (var i = 1; i < 16; i++) {
      populateFrames(spritesheets.sauna.imgObj, i, "sauna", i, 3);
    }

    //Initialize Game N Sprites
    calculateCanvasDimensions();
    // resizeButtons();
    // resizeButtonContainer();

    startAnimation(currentScene, currentState);
    initializeGame();
  };

  p.draw = function () {
    mouse_x = p.mouseX;
    mouse_y = p.mouseY;
    //Cursor is default unless otherwise specified
    cursorState = "default";
    displayGame();
    // cursor.display();
  };

  ////////////////////////////////////////////
  // -------------- SCENES --------------- //
  //////////////////////////////////////////

  // Game 1
  function displayGame() {
    //Do things we need to do when entered minigame
    if (gameEntered && !gameStarted) {
      console.log("GAME ENTERED!");
      gameStarted = true;
    }
    // p.image(bg, 0, 0, canvasWidth, canvasHeight);
    // p.background("blue");
    p.clear();

    // let imageToDraw =
    //   sinkImages[
    //     statesToIndex[
    //       `mirror${sceneStates.mirror}sinkL${sceneStates.sinkL}sinkR${sceneStates.sinkR}`
    //     ]
    //   ];

    // drawImageToScale(sceneToDraw[animationIndex], 0, 0);

    // Note: How to draw the current state of the scene???
    // console.log(scenes);
    let stateToDraw = scenes[currentScene][currentState];

    p.image(stateToDraw[animationIndex], 0, 0);

    // p.image(spritesheets.mural.imgObj, 0, 0);

    // if (animatingSequence) {
    //   console.log("drawing animating sequence");
    //   p.image(currentAnimationFrames[animationSequenceIndex], 0, 0);
    // } else {
    //   console.log("drawing scene");
    //   let sceneToDraw = bathhouse_scenes[currentScene];
    //   p.image(sceneToDraw[animationIndex], 0, 0);
    // }
  }

  // Starts a sequence animation (based on frames)
  function startSequenceAnimation(animationFrames, looping) {
    clearInterval(sequenceAnimationInterval);
    console.log("staring sequence animation");
    animatingSequence = true;
    let length = animationFrames.length;
    currentAnimationFrames = animationFrames;
    animationSequenceIndex = 0;
    sequenceAnimationInterval = setInterval(function () {
      animationSequenceIndex = (animationSequenceIndex + 1) % length;
    }, 100);
  }

  function stopSequenceAnimation() {
    clearInterval(sequenceAnimationInterval);
    animationSequenceIndex = 0;
    animatingSequence = false;
  }

  // mirrorButton.addEventListener("click", function () {
  //   sceneStates.mirror = (sceneStates.mirror + 1) % 5;
  //   sound.mirror[sceneStates.mirror % 4].start();
  // });
  // sinkLButton.addEventListener("click", function () {
  //   sceneStates.sinkL = (sceneStates.sinkL + 1) % 2;

  //   if (sceneStates.sinkL == 0) {
  //     sound.sinkL.stop();
  //   } else {
  //     sound.sinkL.start();
  //   }
  // });
  // sinkRButton.addEventListener("click", function () {
  //   sceneStates.sinkR = (sceneStates.sinkR + 1) % 2;
  //   if (sceneStates.sinkR == 0) {
  //     sound.sinkR.stop();
  //   } else {
  //     sound.sinkR.start();
  //   }
  // });

  // HELPERS

  // p.windowResized = function () {
  //   calculateCanvasDimensions();
  //   p.resizeCanvas(canvasWidth, canvasHeight);
  //   resizeButtons();
  //   //Adjust button container
  //   resizeButtonContainer();
  // };

  function resizeButtonContainer() {
    buttonContainer.style.width = canvasWidth + "px";
    buttonContainer.style.height = canvasHeight + "px";
  }

  function resizeButtons() {
    // windowWidth = window.innerWidth;
    // windowHeight = window.innerHeight;
    // let currentRatio = windowHeight / 720;

    // let widthToHeight = windowWidth / windowHeight;

    buttons.forEach(function (button) {
      let buttonEl = document.querySelector("#" + button.id);
      let newButtonWidth = scaleRatio * button.width;
      let newButtonHeight = newButtonWidth * (button.height / button.width);
      buttonEl.style.width = `${newButtonWidth}px`;
      buttonEl.style.height = `${newButtonHeight}px`;
      let new_yPos = scaleRatio * button.y;
      let new_xPos = scaleRatio * button.x;
      buttonEl.style.left = `${new_xPos}px`;
      buttonEl.style.top = `${new_yPos}px`;
    });
  }

  // Animates a sprite given the images as frames, based on a certain interval, with optional callback
  function intervalAnimation(sprite, frames, interval, callback) {
    currentlyAnimating = true;
    let original = sprite.buttonDefault;
    frames.forEach(function (img, index) {
      setTimeout(function () {
        timedAnimationIndex = (index + 1) % frames.length;
        sprite.buttonDefault = img;
      }, interval * index);
    });
    // Another for the last frame
    setTimeout(function () {
      currentlyAnimating = false;
      sprite.buttonDefault = original;
      if (callback) {
        callback();
      }
    }, interval * frames.length);
  }

  function drawImageToScale(img, x, y) {
    p.image(
      img,
      x * scaleRatio,
      y * scaleRatio,
      img.width * scaleRatio,
      img.height * scaleRatio,
    );
  }

  function calculateCanvasDimensions() {
    //Page is wider
    if (p.windowWidth / p.windowHeight > canvasRatio) {
      canvasWidth = p.windowHeight * canvasRatio;
      canvasHeight = p.windowHeight;
      //Page is narrower
    } else {
      canvasWidth = p.windowWidth;
      canvasHeight = p.windowWidth / canvasRatio;
    }
    scaleRatio = canvasWidth / originalDimensions.width;
  }
};

new p5(game, "canvas-gameN");
