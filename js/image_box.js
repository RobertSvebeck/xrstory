import * as THREE                   from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import { TrackballControls }        from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/TrackballControls.js';
import { GLTFExporter }             from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/exporters/GLTFExporter.js';

let group,container, camera, controls, scene, renderer,Containerwidth,ContainerHeight,boxObject;

//animation
let clip,clipAction,mixer,clock;

let userImageURL='./img/Logo_texture.png';

document.getElementById("texture").addEventListener('change', (event) => {
    var userImage = texture.files[0];     
    userImageURL = URL.createObjectURL( userImage );
    CreateBox();
});


document.getElementById('north').addEventListener('change', (event) => {CreateBox();});
document.getElementById('south').addEventListener('change', (event) => {CreateBox();});
document.getElementById('east').addEventListener('change', (event) => {CreateBox();});
document.getElementById('west').addEventListener('change', (event) => {CreateBox();});
document.getElementById('top').addEventListener('change', (event) => {CreateBox();});
document.getElementById('bottom').addEventListener('change', (event) => {CreateBox();});
document.getElementById('double').addEventListener('change', (event) => {CreateBox();});
document.getElementById('color').addEventListener('change', (event) => {CreateBox();});
document.getElementById('transparent').addEventListener('change', (event) => {CreateBox();});

document.getElementById('option_animationX').addEventListener('change', (event) => {updateAnimation();});
document.getElementById('option_animationY').addEventListener('change', (event) => {updateAnimation();});
document.getElementById('option_animationZ').addEventListener('change', (event) => {updateAnimation();});
document.getElementById('animDuration').addEventListener('change', (event) => {updateAnimation();});
document.getElementById('option_animation_dir').addEventListener('change', (event) => {updateAnimation();});

document.getElementById('screenColor').addEventListener('change', (event) => { renderer.setClearColor( document.getElementById('screenColor').value, 1 ); } );

const link = document.createElement( 'a' );
link.style.display = 'none';
document.body.appendChild( link ); // Firefox workaround, see #6594


document.getElementById( 'export_objects' ).addEventListener( 'click', function () {
	exportGLTF( group );
} );


init();
animate();

function init() {
     
    clock = new THREE.Clock();
    
	scene = new THREE.Scene();
	scene.name = 'Scene';

    // ---------------------------------------------------------------------
	// Renderer
    // ---------------------------------------------------------------------

    container = document.createElement( 'div' );
    container.className = "container";
    document.body.appendChild( container );

	renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true } );
	renderer.outputEncoding = THREE.sRGBEncoding;
	const screenColor = document.getElementById('screenColor').value;
	renderer.setClearColor( screenColor, 1 );
    
    renderer.setSize( window.innerWidth, window.innerHeight  );
	container.appendChild( renderer.domElement );
	
	// ---------------------------------------------------------------------
	// Perspective Camera
	// ---------------------------------------------------------------------
	
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set( 200, 200, 200 );
	camera.name = "PerspectiveCamera";
	scene.add( camera );

	// ---------------------------------------------------------------------
	// Mouse Controls
	// ---------------------------------------------------------------------
	
	controls = new TrackballControls( camera, container );
	controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
    controls.autoRotate = true;
	controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
	controls.dampingFactor = 0.00001;
	controls.screenSpacePanning = false;
	controls.minDistance = 0;
	controls.maxDistance = 5000;
    controls.rotateSpeed = 5;
	controls.maxPolarAngle = Math.PI / 2;
	
	// ---------------------------------------------------------------------
	// Ambient light
	// ---------------------------------------------------------------------
	
	const ambientLight = new THREE.AmbientLight(  0xCCCCCC );
	ambientLight.name = 'AmbientLight';
	ambientLight.intensity = 0.1;
//	scene.add( ambientLight );

	// ---------------------------------------------------------------------
	// DirectLight
	// ---------------------------------------------------------------------
	const dirLight = new THREE.DirectionalLight( 0xffffff, 0.8,   );
	dirLight.lookAt( 0, 0, 0 );
	dirLight.name = 'DirectionalLight';
	dirLight.position.set(1000,1000,1000);
	camera.add( dirLight );
	
	// ---------------------------------------------------------------------
	// Group to be exported
	// ---------------------------------------------------------------------
	
	group = new THREE.Group();
	scene.add( group );

    // ---------------------------------------------------------------------
	// Box
	// ---------------------------------------------------------------------

    CreateBox();

	// ---------------------------------------------------------------------
	// Animation
	// ---------------------------------------------------------------------    
    updateAnimation();
    
    window.addEventListener( 'resize', onWindowResize() );

}

function RemoveBox() {
    group.remove(...group.children);
}    

function CreateBox() {
    RemoveBox();
    
    const geometry = new THREE.BoxGeometry( 100, 100, 100 );
    var tex = new THREE.TextureLoader().load(userImageURL, (tex) => {
      boxObject.scale.set(1, tex.image.height / tex.image.width, 1);
    });
    
    let withMat;
    
    if (document.getElementById('double').checked) {
        withMat = new THREE.MeshStandardMaterial( { side: THREE.DoubleSide, map: tex} );
    } else
    {
        withMat = new THREE.MeshStandardMaterial( {  map: tex} );
    }
    
    const color = document.getElementById('color').value;
    let withouthMat = new THREE.MeshStandardMaterial( {color:color} );
    
    
    if(document.getElementById('transparent').checked) {
        withMat.opacity=1;
        withMat.transparent = true; 
        withouthMat.opacity=1;
        withouthMat.transparent = true;
    }
    
    var materials = [
        (document.getElementById('north').checked) ? withMat : withouthMat,
        (document.getElementById('south').checked) ? withMat : withouthMat,
        (document.getElementById('top').checked) ? withMat : withouthMat,
        (document.getElementById('bottom').checked) ? withMat : withouthMat,
        (document.getElementById('east').checked) ? withMat : withouthMat,
        (document.getElementById('west').checked) ? withMat : withouthMat
    ];
    
    if(document.getElementById('transparent').checked) {
 
        materials.opacity=1;
        materials.transparent = true;
    }
    
    
    boxObject = new THREE.Mesh(geometry, materials);
    boxObject.name = 'box';

    group.add( boxObject );	
}

function takeScreenshot() {
    renderer.render(scene, camera);
    renderer.domElement.toBlob(function(blob){
    	var a = document.createElement('a');
      var url = URL.createObjectURL(blob);
      a.href = url;
      a.download = 'XRSTORY_ScreenShot.png';
      a.click();
    }, 'image/png', 1.0);

}

function onWindowResize() {

	camera.aspect = (window.innerWidth / window.innerHeight);
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {
   const delta = clock.getDelta();
    if ( mixer ) {
        mixer.update( delta );
    }
    
	requestAnimationFrame( animate );
    controls.update();
    onWindowResize();
	renderer.render( scene, camera );
}

function updateAnimation () {
    // ---------------------------------------------------------------------
	// Animation (Rotation)
	// ---------------------------------------------------------------------
	
    const rotX = (document.getElementById( 'option_animationX' ).checked) ? 1 : 0;
    const rotY = (document.getElementById( 'option_animationY' ).checked) ? 1 : 0;
    const rotZ = (document.getElementById( 'option_animationZ' ).checked) ? 1 : 0;
    const animDuration = document.getElementById( 'animDuration' ).value;
    const direction = (document.getElementById( 'option_animation_dir' ).checked) ? 1 : -1;
	const axis = new THREE.Vector3( rotX,rotY,rotZ );
    axis.normalize();
	const qInitial = new THREE.Quaternion().setFromAxisAngle( axis, -Math.PI*direction );
	const qMiddle= new THREE.Quaternion().setFromAxisAngle( axis, 0 );
	const qFinal = new THREE.Quaternion().setFromAxisAngle( axis, Math.PI*direction);
	const quaternionKF = new THREE.QuaternionKeyframeTrack( '.quaternion', [ 0, animDuration/2, animDuration ], [ qInitial.x, qInitial.y, qInitial.z, qInitial.w, qMiddle.x, qMiddle.y, qMiddle.z, qMiddle.w, qFinal.x, qFinal.y, qFinal.z, qFinal.w ] );
	clip = new THREE.AnimationClip( 'Action', animDuration, [ quaternionKF ] );
    mixer = new THREE.AnimationMixer( group );
    clipAction = mixer.clipAction( clip );
    clipAction.play();

}


function render() {
	renderer.render( scene, camera );
}


function exportGLTF( input ) {
    
    updateAnimation();
	
	
	const gltfExporter = new GLTFExporter();
	const options = {
		trs: true, //document.getElementById( 'option_trs' ).checked,
		onlyVisible: true, //document.getElementById( 'option_visible' ).checked,
		truncateDrawRange: true, //document.getElementById( 'option_drawrange' ).checked,
		binary: (document.getElementById( 'exportFormat' ).value==1) ? (true) : false,
		animations: ((document.getElementById( 'option_animationX' ).checked || document.getElementById( 'option_animationY' ).checked || document.getElementById( 'option_animationZ' ).checked) ? ([clip]) : ([])),
		forceIndices:true
		//maxTextureSize: Number( document.getElementById( 'option_maxsize' ).value ) || Infinity // To prevent NaN value
	};
	

	gltfExporter.parse( input, function ( result ) {
	    let gltfFileName = (document.getElementById('gltfFileName').value=="") ? "box" : document.getElementById('gltfFileName').value;
		if ( result instanceof ArrayBuffer ) {
			saveArrayBuffer( result, gltfFileName + '.glb' );
		} else {
			const output = JSON.stringify( result, null, 2 );
			saveString( output, gltfFileName + '.gltf' );
		}
	}, options );
}




function save( blob, filename ) {
	link.href = URL.createObjectURL( blob );
	link.download = filename;
	link.click();
}

function saveString( text, filename ) {
	save( new Blob( [ text ], { type: 'text/plain' } ), filename );
}

function saveArrayBuffer( buffer, filename ) {
	save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );
}


function exportSceneToJSON(input){

    scene.updateMatrixWorld();
    var result=scene.toJSON();
    var output =JSON.stringify(result);
    download(output, 'scene.json', 'application/json');
}

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

function importScene(inp){

  if (inp.files && inp.files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var loader = new THREE.ObjectLoader();
     loader.load(e.target.result,
        function ( json ) {
          console.log(json);
          scene = json;
        }
      );
    }
    reader.readAsDataURL(inp.files[0]);
  }
 }