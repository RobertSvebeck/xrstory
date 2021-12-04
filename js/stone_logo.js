import * as THREE                   from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import { TrackballControls }        from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/TrackballControls.js';
import { GLTFExporter }             from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/exporters/GLTFExporter.js';
import { ConvexGeometry }           from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/geometries/ConvexGeometry.js';

let group,container, camera, controls, scene, renderer,Containerwidth,ContainerHeight,vertices1,vertices2,offset,repeat;

let radius = 100;

//animation
let clip,clipAction,mixer,clock;

let userImageURL='./img/Logo_texture.png';

document.getElementById("texture").addEventListener('change', (event) => {
    var userImage = texture.files[0];     
    userImageURL = URL.createObjectURL( userImage );
    usematerial.checked=true;
    CreateStone();
});

document.getElementById('double').addEventListener('change', (event) => {CreateStone();});
document.getElementById('color').addEventListener('change', (event) => {CreateStone();});
document.getElementById('transparent').addEventListener('change', (event) => {CreateStone();});
document.getElementById('usematerial').addEventListener('change', (event) => {CreateStone();});
document.getElementById('usecolor').addEventListener('change', (event) => {CreateStone();});

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

document.getElementById('shape').addEventListener('change', (event) => {
    vertices1=CreateVertices();
    vertices2=CreateVertices();
    CreateStone();
});

document.getElementById('regenerate').addEventListener( 'click', function() { 
    vertices1=CreateVertices();
    vertices2=CreateVertices();
    CreateStone();
});

// add Screenshot listener
document.getElementById("shot").addEventListener('click', takeScreenshot);


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
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, radius*10);
	camera.position.set( radius*3,radius*3, radius*3 );
	camera.lookAt(new THREE.Vector3(0,0,0));
	camera.name = "PerspectiveCamera";
	scene.add( camera );

	// ---------------------------------------------------------------------
	// Mouse Controls
	// ---------------------------------------------------------------------
	
	controls = new TrackballControls( camera, container );
	controls.autoRotate = true;
	controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
	controls.dampingFactor = 0.0001;
	controls.screenSpacePanning = false;
	controls.minDistance = 0;
	controls.maxDistance = radius*10;
    controls.rotateSpeed = 5;
	controls.maxPolarAngle = Math.PI /2;

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
	const dirLight = new THREE.DirectionalLight( 0xffffff, 0.9,   );
	dirLight.lookAt( 0, 0, 0 );
	dirLight.name = 'DirectionalLight';
	dirLight.position.set(radius*10,radius*10,radius*10);
	camera.add( dirLight );

	// ---------------------------------------------------------------------
	// Stone
	// ---------------------------------------------------------------------
	group = new THREE.Group();
	scene.add( group );
	
    vertices1=CreateVertices();

    CreateStone();

	// ---------------------------------------------------------------------
	// Animation
	// ---------------------------------------------------------------------    
    updateAnimation();
    
    window.addEventListener( 'resize', onWindowResize() );

}

function RemoveStone() {
    group.remove(...group.children);
}  

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function CreateVertices() {

    const vertice = [];
    const shape = document.getElementById('shape').value;
    var x,y,z,factor,vector,radiusX,radiusY,radiusZ,roughnessFactor,rotation;
    offset=0;
    rotation=0;
    if (shape==0) { //ROUND
        roughnessFactor=1;
        repeat = 1;
        radiusX=radius;
        radiusY=radius;
        radiusZ=radius;
        
    } else if (shape==5) { //NORMAL
        roughnessFactor=50;
        repeat = THREE.MathUtils.randInt(1, 3);
        radiusX=THREE.MathUtils.randInt(radius, radius*2)/2;
        radiusY=THREE.MathUtils.randInt(radius, radius*2)/2;
        radiusZ=THREE.MathUtils.randInt(radius, radius*2)/2;
        
    } else if (shape==9) { //BIZZARRE
        roughnessFactor=100;
        repeat = THREE.MathUtils.randInt(1, 5);
        radiusX=THREE.MathUtils.randInt(radius, radius*4)/4;
        radiusY=THREE.MathUtils.randInt(radius, radius*4)/4;
        radiusZ=THREE.MathUtils.randInt(radius, radius*4)/4;
    }
    
    
    for (var point = 0; point <= 5000; point += 1) {

        radiusX += THREE.MathUtils.randInt(-radius, radius)*roughnessFactor/5000;
        radiusY += THREE.MathUtils.randInt(-radius, radius)*roughnessFactor/5000;
        radiusZ += THREE.MathUtils.randInt(-radius, radius)*roughnessFactor/5000;
        
        x = THREE.MathUtils.randInt(-100, 100)/1000;
        y = THREE.MathUtils.randInt(-100, 100)/1000;
        z = THREE.MathUtils.randInt(-100, 100)/1000;
        factor = 1/Math.sqrt(Math.pow(x,2)+Math.pow(y,2)+Math.pow(z,2));
        x=(x*factor*radiusX+perlin.get(x, point)*roughnessFactor/100);
        y=(y*factor*radiusY+perlin.get(y, point)*roughnessFactor/100);
        z=(z*factor*radiusZ+perlin.get(z, point)*roughnessFactor/100);
        vector=new THREE.Vector3(x,y,z);
        vertice.push(vector);
        
    }   
    return vertice;
    
}

function CreateUVs(geometry) {
    //uvs
    let pos = geometry.attributes.position;
    let spherical = new THREE.Spherical();
    let v3 = new THREE.Vector3();
    let uvs = [];
    for (let i = 0; i < pos.count; i++) {
        v3.fromBufferAttribute(pos, i);
        spherical.setFromVector3(v3);
        let theta = spherical.theta > 0.0 ? spherical.theta : Math.PI * 2 + spherical.theta;
        uvs.push(
            ((theta + Math.PI) % (Math.PI * 2)) / (Math.PI * 2),
            ((-spherical.phi + Math.PI) % (Math.PI)) / (Math.PI)
        );
    }
    geometry.setAttribute(
    "uv",
    new THREE.BufferAttribute(new Float32Array(uvs), 2)
    );
}

function CreateStone() {
    RemoveStone();
     
    const geometry1 = new ConvexGeometry( vertices1 );

    CreateUVs(geometry1);


    const shape = document.getElementById('shape').value;
    if (shape==5) {
        geometry1.rotateX(Math.PI*THREE.MathUtils.randInt(-15, 15)/180);
        geometry1.rotateY(Math.PI*THREE.MathUtils.randInt(-15, 15)/180);
        geometry1.rotateZ(Math.PI*THREE.MathUtils.randInt(-15, 15)/180);
    } else if (shape==9) {
        geometry1.rotateX(Math.PI*THREE.MathUtils.randInt(-90, 90)/180);
        geometry1.rotateY(Math.PI*THREE.MathUtils.randInt(-90, 90)/180);
        geometry1.rotateZ(Math.PI*THREE.MathUtils.randInt(-90, 90)/180);
    } 
    
    const stoneTexture =  new THREE.TextureLoader().load('./img/stone.jpg');

    const materialStone1 = new THREE.MeshStandardMaterial( );

    materialStone1.map = stoneTexture;
    //materialStone1.specular=0x333333;
    materialStone1.roughness= 1;
    materialStone1.metalness= 0.125;
    if (document.getElementById('usecolor').checked) {
        materialStone1.color.set(color);
    }

    materialStone1.opacity = 0.8;
    materialStone1.transparent= false;
    
    const StoneObject1 = new THREE.Mesh(geometry1, materialStone1);
    StoneObject1.name = 'Stone1';
    //StoneObject2.scale.setScalar(1.001);
    group.add( StoneObject1 );	

    const logoTexture= new THREE.TextureLoader().load(userImageURL);
    
    const materialLogo = new THREE.MeshStandardMaterial( );

    if (document.getElementById('usematerial').checked) {
       const texture = logoTexture
       //texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
       texture.offset.set( offset, offset );
       texture.repeat.set( repeat, repeat );
       materialLogo.map = texture;
        materialLogo.opacity= 0.7;
        materialLogo.transparent=true;
    }
    
    if (document.getElementById('double').checked) {
        materialLogo.side=THREE.DoubleSide;
    }

    const StoneLogo1 = new THREE.Mesh(geometry1, materialLogo);
    StoneLogo1.name = 'Logo';
    
    group.add( StoneLogo1 );	

    
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


function exportGLTF( input ) {
    
    updateAnimation();
	
	
	const gltfExporter = new GLTFExporter();
	const options = {
		trs: true, //document.getElementById( 'option_trs' ).checked,
		onlyVisible: true, //document.getElementById( 'option_visible' ).checked,
		truncateDrawRange: true, //document.getElementById( 'option_drawrange' ).checked,
		binary: (document.getElementById( 'exportFormat' ).value==1) ? (true) : false,
		animations: ((document.getElementById( 'option_animationX' ).checked || document.getElementById( 'option_animationY' ).checked || document.getElementById( 'option_animationZ' ).checked) ? ([clip]) : ''),
		forceIndices:true
		//maxTextureSize: Number( document.getElementById( 'option_maxsize' ).value ) || Infinity // To prevent NaN value
	};
	

	gltfExporter.parse( input, function ( result ) {
	    let gltfFileName = (document.getElementById('gltfFileName').value=="") ? "stone" : document.getElementById('gltfFileName').value;
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
