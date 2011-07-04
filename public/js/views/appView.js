Game.Views.App = Backbone.View.extend({
	
  TREE_IMAGE: "assets/tree_br_sprite.png",
  
	events: {
		"click": "clickWorld",
    "keydown": "keypressWorld",
    "keyup": "keyupWorld",
    "mousemove": "moveWorld"
	},
	
	
	/*
		function initialize
	*/
	initialize: function() {
		
    var
      characterModel,
      playerModel,
      i, len, playerData;
    
		_.bindAll( this, "update", "updatePlayers", "initTrees" );
		
		this.initLand();
    this.initTrees();
		
    // init user's character
    characterModel = new Game.Models.Player(Game.data.character)
		this.characterView = characterModel.view = new Game.Views.Character({
      model: characterModel
    });

    // init other world players    
    this.players = new Game.Collections.Player();
    
    playerData = Game.data.players;
   
    for ( i = 0; len = playerData.length, i < len; i++ ) {
      // Create player model & view
      playerModel = new Game.Models.Player(playerData[i]);
      playerModel.view = new Game.Views.Player({
        model: playerModel
      });
      
      // Add to players collection
      this.players.add(playerModel);
    }
    
    // Initialize socket message listener
    Game.socket.on('message', this.updatePlayers);
    
	},
	
	
	/*
		function update
	*/
  update: function() {   
		this.characterView.update();
    this.players.each(function(player){
      player.view.update();
    });
	},
	
	
  /*
    function updatePlayers
    callback to socket.io message listener
  */
  updatePlayers: function(obj) {
    // Update changed player model
    var player = this.players.get(obj.userID);
    
    // New player
    if ( player === undefined ) {
      console.log("adding player");
      player = new Game.Models.Player(obj); 
      player.view = new Game.Views.Player({
        model: player
      });
      this.players.add(player);
    } else if ( obj.active === false ) {
      console.log("removing player");
      console.log(player);
      player.view.removePlayer();
      this.players.remove(player);
    }
    else {
      player.set(obj);
    }
    
  },
  
  
	/*
		function renderLand
		Renders the landscape of the world and attaches to scene
	*/
	initLand: function() {
		var
			grass,
			plane,
			uvs, i, j,
			mesh;

		// Load texture
		grass  = THREE.ImageUtils.loadTexture( "textures/grass.jpg" );
		grass.wrapT = grass.wrapS = THREE.RepeatWrapping;
    
		// Create plane
		plane = new THREE.PlaneGeometry(64, 64, 64, 64);
		plane.doubleSided = true;
		
		// Create plane texture mapping
		for ( i = 0; i < plane.faceVertexUvs[ 0 ].length; i ++ ) {

			uvs = plane.faceVertexUvs[ 0 ][ i ];

			for ( j = 0; j < uvs.length; j ++ ) {

				uvs[ j ].u *= 16;
				uvs[ j ].v *= 16;

			}
		}
		
		// Create mesh for plane
		mesh = new THREE.Mesh( plane, new THREE.MeshBasicMaterial( { map: grass, wireframe: false} ));
		mesh.rotation.x = -90 * Math.PI / 180;
		mesh.scale.x = mesh.scale.y = mesh.scale.z = 100;
		
		// Add object to scene
		Game.Controllers.App.scene.addObject( mesh );
	},
  
  
  initTrees: function() {
    var 
			texture, i,

		// Load sprite map
		texture = THREE.ImageUtils.loadTexture( this.TREE_IMAGE );
	  
    for (var i = 0; i < 50; i++) {
  
  		// Create sprite
  		this.treeSprite = new THREE.Sprite( { map: texture, 
        useScreenCoordinates: false, 
        affectedByDistance: true, 
        scaleByViewport: true } );
  		
  		// Set scale to 1/24 of image (200px)
  		this.treeSprite.scale.y = -1;
  		this.treeSprite.scale.x = -1;
  		// Add collision detection
  		//this.sprite.boundingMesh = new THREE.Mesh( new THREE.Cube(60, 60, 60, 1, 1, 1) );
  		//THREE.Collisions.colliders.push( THREE.CollisionUtils.MeshOBB(this.sprite.boundingMesh) );
  
  		// Position sprite
  		this.treeSprite.position.set(-2250 + (750 * (i % 6)), 200 , 3750 - (750 * (i % 10)));
  		
  		Game.Controllers.App.scene.addObject( this.treeSprite );
  		//Game.Controllers.App.scene.addObject( this.sprite.boundingMesh );
    }
  },
	
	/*
		function clickWorld
		Handles clicks for the entire world, since we don't really have sub-elements of the canvas
	*/
  clickWorld: function(e) {
		// Move character
		this.characterView.moveCharacter(e);
	},
  
  
  /*
    function keyPressWorld
  */
  keypressWorld: function(e) {
    if ( Game.keyDict[e.keyCode] === undefined ) {
      Game.keyDict[e.keyCode] = true;
    } else {
      Game.keyDict[e.keyCode] = !Game.keyDict[e.keyCode];
    }
  },
  
  
  /*
    function keyupWorld
  */
  keyupWorld: function(e) {
    Game.keyDict[e.keyCode] = false;
  },
  
  
  /* 
    function moveWorld
  */
	moveWorld: function(e) {
    this.characterView.moveCharacter(e);
  }
  
});