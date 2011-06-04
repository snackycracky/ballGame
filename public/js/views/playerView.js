Game.Views.Player = Backbone.View.extend({

  // Class variables
  dirVec: new THREE.Vector3(),
  

  // Map players type to texture images
  typeTextureMap: {
    rock: {
      image: "/assets/ball_sprite_red_upper_right.png",
      speed: 10,
      imageOffset: .04167,
    }
  },


  initialize: function() {
    
    _.bindAll( this, "render", "setPosition", "update" );
  
    // attach top level options
    this.textureImage = this.typeTextureMap[ this.model.get("type") ];
    this.speed = this.textureImage.speed;
    this.IMAGE_OFFSET = this.textureImage.imageOffset;
    this.textureImage = this.textureImage.image;
    
    // Render player
    this.render();
  },
  
  
  /*
		Update character
	*/
	update: function() {
		var 
			dir;

    var moving = this.model.get("moving");
    // First, check if player is moving
		if ( this.model.get("moving") ) {
      
      // Get direction of player 
			dir = this.dirVec.copy( this.model.get("dir") );
				
			dir.normalize();
			
			// Position movement
      this.setPosition({
        x: this.sprite.position.x + this.speed * dir.x,
        y: this.sprite.position.y,
        z: this.sprite.position.z + this.speed * dir.z
      });
			
			// Texture animation
			this.sprite.uvOffset.x += this.IMAGE_OFFSET;
			if (this.sprite.uvOffset.x > 1.0) {
				this.sprite.uvOffset.x = 0.0;
			}
			
		}
	},


  /*
		Create character sprite, collision detection, and add to scene
	*/
  render: function() {
    var 
			texture,

		// Load sprite map
		texture = THREE.ImageUtils.loadTexture( this.textureImage );
	
		// Create sprite
		this.sprite = new THREE.Sprite( { map: texture, useScreenCoordinates: false, affectedByDistance: false} );
		
		// Set scale to 1/24 of image (200px)
		this.sprite.scale.y = .041667;
		this.sprite.scale.x = -0.041167;

		// Set offset to first sprite of 24 images
		this.sprite.uvOffset.x = .95834;
		this.sprite.uvScale.x = 0.041167;
		
		// Add collision detection
		this.sprite.boundingMesh = new THREE.Mesh( new THREE.Cube(60, 60, 60, 1, 1, 1) );
		THREE.Collisions.colliders.push( THREE.CollisionUtils.MeshOBB(this.sprite.boundingMesh) );

		// Center sprite at 0, 0, 0 of world
		this.setPosition(this.model.get("pos"));
		
		
		Game.Controllers.App.scene.addObject( this.sprite );
		Game.Controllers.App.scene.addObject( this.sprite.boundingMesh );
  },


  /*
		function setPosition
		utility function to set position of both boundingMesh and sprite at the same time
	*/
	setPosition: function(spec) {
		this.sprite.position.set(spec.x, spec.y, spec.z);
		this.sprite.boundingMesh.position.set(spec.x, spec.y, spec.z);
	},

});