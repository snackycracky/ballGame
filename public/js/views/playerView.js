Game.Views.Player = Backbone.View.extend({

  // Class variables
  dirVec: new THREE.Vector3(),
  

  // Map players type to texture images
  typeTextureMap: {
    rock: {
      image: "/assets/troll_sprite_bl_tl_tr_br.png",
      speed: 10,
      imageOffset: .10,
    }
  },


  initialize: function() {
    
    _.bindAll( this, "render", "setPosition", "update", "removePlayer" );
  
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

    // Update position to account for lag
    this.setPosition( this.model.get("pos") );

    // First, check if player is moving
		if ( this.model.get("moving") ) {
      // Get direction of player 
			dir = this.dirVec.copy( this.model.get("dir") );
				
			//dir.normalize();
      
      var posInd = dir.x / dir.z;
      
      // Set texture
      if ( (dir.x < 0 && posInd < 1.0 && posInd > 0) || (dir.x > 0 && posInd > -1.0 && posInd < 0) ) { // quadrant 1
        this.sprite.uvOffset.y = .50;
      } else if ( (dir.x > 0 && posInd < -1.0 && posInd < 0) || (dir.x > 0 && posInd > 1.0 && posInd > 0) ) { // quadrant 2
        this.sprite.uvOffset.y = 0.75;
      } else if ( (dir.x > 0 && posInd < 1.0 && posInd > 0) || (dir.x < 0 && posInd > -1.0 && posInd < 0)  ) { // quadrant 3
        this.sprite.uvOffset.y = 0;
      } else if ( (dir.x < 0 && posInd < -1.0 && posInd < 0) || (dir.x < 0 && posInd > 1.0 && posInd > 0) ) { // qudrant 4
        this.sprite.uvOffset.y = 0.25;
      }
			
			// Position movement
      this.setPosition({
        x: this.sprite.position.x + this.speed * dir.x,
        y: this.sprite.position.y,
        z: this.sprite.position.z + this.speed * dir.z
      });
      this.model.set({pos: {
        x: this.sprite.position.x,
        y: this.sprite.position.y,
        z: this.sprite.position.z
      }});
			
			// Texture animation
			this.sprite.uvOffset.x += this.IMAGE_OFFSET;
      this.sprite.uvOffset.x = parseFloat( this.sprite.uvOffset.x.toPrecision(1) );
			if (this.sprite.uvOffset.x >= 1.0) {
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
		this.sprite = new THREE.Sprite( { map: texture, 
      useScreenCoordinates: false, 
      affectedByDistance: true,
      scaleByViewport: true
    } );
		
		// Set scale to 1/24 of image (200px)
		this.sprite.scale.y = -0.4;
		this.sprite.scale.x = .10;

		// Set offset to first sprite of 24 images
		this.sprite.uvOffset.x = 0;
		this.sprite.uvScale.x = .10;
    
    this.sprite.uvOffset.y = 0;
    this.sprite.uvScale.y = 0.4;
    
		// Add collision detection
		this.sprite.boundingMesh = new THREE.Mesh( new THREE.CubeGeometry(60, 60, 60, 1, 1, 1) );//, new THREE.MeshBasicMaterial( { wireframe: false } ) );
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
  
  
  /*
    function removePlayer
  */
  removePlayer: function() {
    Game.Controllers.App.scene.removeChild( this.sprite.boundingMesh );
    Game.Controllers.App.scene.removeChild( this.sprite );
  }

});