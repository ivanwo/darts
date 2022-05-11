import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
// import * as CANNON from "https://unpkg.com/cannon@0.6.2/build/cannon.js";
// we don't need physics until we get the POC stood up
// EDIT: physics engine give precise arc and direction data for dart (S)

class GAEM {
  constructor() {
    // TODO : think of a better way to do this junk
    this._MODE = "constructing";
    this._MODECHANGED = false;
    // gotta come up with a way to watch the value of mode that isnt' this

    console.log("under construction lol");
    // set up webgl renderer
    this._three = new THREE.WebGLRenderer({ antiAlias: true });
    this._three.setPixelRatio(window.devicePixelRatio);
    this._three.setSize(window.innerWidth, window.innerHeight);
    // set up three scene junk
    this._scene = new THREE.Scene();
    this._scene.background = new THREE.Color(0xffffff);
    this._scene.fog = new THREE.FogExp2(0x89b2eb, 0.002);
    // set up three camera garbage
    const fov = 60;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 1.0;
    const far = 10000.0;
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this._camera.position.set(50, 15, 0);
    this._camera.lookAt(0, 0, 0);
    // add junk to the page
    document.body.append(this._three.domElement);
    // handle user input
    // initialize controllers
    window.addEventListener("resize", (_) => this._OnWindowResize(), false);
    window.addEventListener(
      "keyup",
      (keyEvent) => {
        this._HandleKey(keyEvent);
      },
      false
    );
    window.addEventListener(
      "wheel",
      (scrollEvent) => this._HandleScroll(scrollEvent),
      false
    );
    // add game junk to world
    // grid helper (to help you position things)
    let grid = new THREE.GridHelper(100, 30);
    grid.name = "grid";
    this._scene.add(grid);
    // WALL (the wall that the dart will be thrown at)
    // TODO: probably should split the board from the wall . . .
    let wall = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 30, 10, 10),
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("dartboard.jpg"),
      })
    );
    wall.name = "plane";
    wall.position.y = 15;
    wall.rotation.y = Math.PI / 2;
    this._scene.add(wall);
    // NOTE sticky note on the board
    //create image from text
    // THASSA GONNA NEED A FOREACH EYYYY
    var stickyNoteElement = document.createElement("canvas");
    var stickyNoteTexture = stickyNoteElement.getContext("2d");
    stickyNoteElement.width = 100;
    stickyNoteElement.height = 100;
    stickyNoteTexture.font = "20px Arial";
    // slap background color on
    stickyNoteTexture.fillStyle = "#D1D100";
    stickyNoteTexture.fillRect(
      0,
      0,
      stickyNoteElement.width,
      stickyNoteElement.height
    );

    // add text to the equation
    stickyNoteTexture.fillStyle = "black";
    stickyNoteTexture.fillText("  bad idea.", 0, 20);
    // if a second line is needed
    stickyNoteTexture.fillText("  and yet...", 0, 40);
    // g.strokeStyle = "white";
    // g.strokeText("  bad idea", 0, 20);

    // canvas contents will be used for a texture
    var texture = new THREE.Texture(stickyNoteElement);
    texture.needsUpdate = true;

    let note = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10, 10, 10),
      new THREE.MeshBasicMaterial({ map: texture })
    );
    note.position.x = 0.01;
    note.position.y = 10;
    note.position.z = -15;
    note.rotation.y = Math.PI / 2;
    this._scene.add(note);
    // DART (the dart that get to throw)
    let dart = new THREE.Mesh(
      new THREE.ConeGeometry(0.25, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0x808080 })
    );
    dart.name = "dart";
    dart.rotation.y = -Math.PI / 2;
    dart.position.set(47, 14, -2);
    // dart.lookAt(0,10,0);
    // ? ? ?
    dart.rotation.y = -Math.PI / 2;
    // TODO : look up positioning chart for three js directions
    this._scene.add(dart);
    // initialize UI element junk
    // animate
    this._MODE = "AIM";
    document.getElementById("game-mode-indicator").innerText = this._MODE;
    this._Animate();
  }

  /*
   *    track and change state
   */
  _BreakDown() {
    // remove everything from the scene and physics world
  }
  _SetupDartBoard() {
    // add dart board,
    // dart
    // sticky note grid 
  }
  /*
   *    state segment concluded
   */

  /*
   *    BEGINPUT TO HANDLE THE INPUT
   *    TODO:  move all this stuff to a new class for input handling
   */
  _HandleKey(keyEvent) {
    console.log(keyEvent);
    // this has AAAAAALLLLL gotta get replaced lol
    let dart = this._scene.getObjectByName("dart");
    console.log(dart);
    switch (keyEvent.keyCode) {
      case 39: // right arrow
      case 68: // d key
        dart.rotation.z += Math.PI / 20;
        break;
      case 37: // left arrow
      case 65: // a key
        dart.rotation.z -= Math.PI / 20;
        break;
      case 38: // up arrow
      case 87: // w key
        dart.rotation.x += Math.PI / 20;
        break;
      case 40: // down arrow
      case 83: // s key
        dart.rotation.x -= Math.PI / 20;
        break;
      case 32: // space
        // IF last dart is landed (_MODE == "HIT") then create new dart and put us in "AIM" mode again
        break;
    }
  }
  _HandleClick() {
    //
  }
  _HandleScroll(scrollEvent) {
    // if the state of the application is ready to throw the dart and the mouse is over the dart's radius
    // then detect the scrollEvent.deltaY, normalize the delta, and once a number is applied,
    // apply that amount of force to the dart's physics phantom

    // one option i just thought of, to have an array of scroll deltas
    // while the new delta is larger than the old one, keep adding
    // when it starts to slow down, avg them and throw the dart

    // although... we may want to reward consistent scroll speeds?
    // from a game design standpoint that would be more like actual darts right

    // and it would be a fun feature to have slow movements simply move the dart
    // forward and backwards to reward careful decision makers for their pensive actions and care
    console.log(scrollEvent.wheelDelta);
    switch (this._MODE) {
      case "AIM": // if we're aiming
        // if(mouse position intersects with dart object) // AKA only throw dart if they're touching the dart when they start the throw
        //
        this._ThrowDart();
        break;
    }
    // ⇩⇩⇩⇩ beginning of an ECS right there lmao ⇩⇩⇩⇩
    // entity componentn system.struct(x );
  }
  /*
    END METHODS TO BE PORTED TO THE INPUT CLASS
  */
  /*
   *    DART GAME SPECIFIC METHODS
   */
  _TurnDart() {
    // change direction of dart based on WASD or ARROW input
  }
  _ThrowDart() {
    console.log("throwing dart");
    this._MODE = "THROW";
    this._MODECHANGED = true;
    // apply force of scroll wheel speed
    // in direction the dart is aimed
    // change game mode
    //
  }
  _DartHit() {
    // detect what the dart hit
  }
  _OnWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._three.setSize(window.innerWidth, window.innerHeight);
  }

  _Animate() {
    requestAnimationFrame((t) => {
      // call next animation frame
      this._Animate();
      switch (this._MODE) {
        case "THROW":
          // if throwing, move the dart forward towards the dart board
          let dart = this._scene.getObjectByName("dart");
          const direction = new THREE.Vector3();
          dart.getWorldDirection(direction);
          dart.position.add(direction.multiplyScalar(1));
          // dart.rotation.x += Math.PI / 360;
          // if the dart has hit the origin (board position, change game state to HIT)
          if (dart.position.x < 0) {
            this._MODE = "HIT";
            this._MODECHANGED = true;
          }
          break;
      }
      // if the game mode has changed, change the status indicator
      if (this._MODECHANGED) {
        document.getElementById("game-mode-indicator").innerText = this._MODE;
        this._MODECHANGED = false;
      }
      // render the scene
      this._three.render(this._scene, this._camera);
    });
  }
}
// TODO:  change this from content loaded to form sumbitted [ie: image, sticky notes, rapid fire, drunk spinny, modes]
window.addEventListener("DOMContentLoaded", (_) => {
  window.GAEM = new GAEM();
});
