// Game N: Template for any game number

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

let currentScene = "bathhouse_main";
let currentState = "default";

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
  bathhouse_main: {},
  bathhouse_showers: {},
  bathhouse_sauna: {},
  bathhouse_exit: {},
  shower: {},
  jacuzzi: {},
  coldbath: {},
};

function goToScene(sceneName, stateName) {
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

let showerState = 0;

let animatingSequence = false;
let sequenceAnimationInterval;
let currentAnimationFrames;

let animationInterval;
let animationIndex = 0;

let timeoutQueue = [];

let spritesheets = {
  bathhouse: { url: "img/bathhouse_spritesheet.png", imgObj: {} },
  faucet: { url: "img/faucet_spritesheet.png", imgObj: {} },
  shower: { url: "img/shower_spritesheet.png", imgObj: {} },
  jacuzzi: { url: "img/jacuzzi_spritesheet.png", imgObj: {} },
  jacuzzi_animation: { url: "img/jacuzzi_animation.png", imgObj: {} },
  coldbath: { url: "img/coldbath_spritesheet.png", imgObj: {} },
  coldbath_animation: { url: "img/coldbath_animation.png", imgObj: {} },
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

function updateShowerState() {
  showerState = (showerState + 1) % 3;
  if (showerState == 1) {
    goToScene("shower", "faucetOn");
  } else if (showerState == 2) {
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

  let sceneStates = {
    mirror: 0,
    sinkL: 0,
    sinkR: 0,
  };
  // How will we map states to sprites?

  let sinkImages = [];

  let statesToIndex = {
    mirror0sinkL0sinkR0: 0,
    mirror0sinkL1sinkR0: 1,
    mirror0sinkL0sinkR1: 2,
    mirror0sinkL1sinkR1: 3,
    mirror1sinkL0sinkR0: 4,
    mirror1sinkL1sinkR0: 5,
    mirror1sinkL0sinkR1: 6,
    mirror1sinkL1sinkR1: 7,
    mirror2sinkL0sinkR0: 8,
    mirror2sinkL1sinkR0: 9,
    mirror2sinkL0sinkR1: 10,
    mirror2sinkL1sinkR1: 11,
    mirror3sinkL0sinkR0: 12,
    mirror3sinkL1sinkR0: 13,
    mirror3sinkL0sinkR1: 14,
    mirror3sinkL1sinkR1: 15,
    mirror4sinkL0sinkR0: 16,
    mirror4sinkL1sinkR0: 17,
    mirror4sinkL0sinkR1: 18,
    mirror4sinkL1sinkR1: 19,
  };

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

    //Initialize Game N Sprites
    calculateCanvasDimensions();
    // resizeButtons();
    // resizeButtonContainer();

    startAnimation(currentScene, currentState);
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
