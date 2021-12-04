import * as THREE                   from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import { TrackballControls }        from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/TrackballControls.js';

//VR CODE: Add VR Button and XR controllers
import { VRButton }                 from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/webxr/XRControllerModelFactory.js';

let container, camera, controls, scene, renderer;
let group;
let importFileName;
let data = [];


let pointer,raycaster,intersected,intersects;

let worldSphereRadius = 5;
var fontSize1 = 16;
var fontSize2 = 24;
const maxDataLength = 20000;

document.getElementById("csvFile").addEventListener('change', (event) => { 

    const userFile = csvFile.files[0];   
    const userFileURL = URL.createObjectURL( userFile );
    importFileName=userFile.name;
    
    let reader = new FileReader();
    reader.readAsText(userFile);
    reader.onload = loadHandler;

    
});

const link = document.createElement( 'a' );
link.style.display = 'none';
document.body.appendChild( link ); // Firefox workaround, see #6594


init();
animate();


function init() {
    
	scene = new THREE.Scene();
	scene.name = 'Scene';

	// ---------------------------------------------------------------------
	// Perspective Camera
	// ---------------------------------------------------------------------
	camera = new THREE.PerspectiveCamera( 45, 2, 1, worldSphereRadius*10);
	camera.position.set( 0,0,3 );
	camera.lookAt(new THREE.Vector3(0,0,-worldSphereRadius));
	camera.name = "PerspectiveCamera";
	scene.add( camera );

    // ---------------------------------------------------------------------
	// Renderer
    // ---------------------------------------------------------------------

    container = document.createElement( 'div' );
    container.className = "container";
    document.body.appendChild( container );


	renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true } );
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.setClearColor( '#000000', 1 );
    
    renderer.setSize( window.innerWidth, window.innerHeight  );
	container.appendChild( renderer.domElement );

    //VR CODE: Enable XR rendering
    renderer.xr.enabled = true;
    //VR CODE: Add VR Button
    document.body.appendChild( VRButton.createButton( renderer ) );
    VRButton.className = "vr-button";
    
	// ---------------------------------------------------------------------
	// Mouse Controls
	// ---------------------------------------------------------------------
	
	controls = new TrackballControls( camera, container );
    controls.autoRotate = true;
	controls.enableDamping = true; 
	controls.dampingFactor = 0.0001;
	controls.screenSpacePanning = false;
	controls.minDistance = 0;
	controls.maxDistance = worldSphereRadius*5;
    controls.rotateSpeed = 5;
	controls.maxPolarAngle = Math.PI /2;

	// ---------------------------------------------------------------------
	// mouse select
	// ---------------------------------------------------------------------

	pointer = new THREE.Vector2();
	raycaster = new THREE.Raycaster();
    document.addEventListener( 'pointermove', onPointerMove );
	document.addEventListener('dblclick', ondblclick, false);
	
	// ---------------------------------------------------------------------
	// Ambient light
	// ---------------------------------------------------------------------
	const ambientLight = new THREE.AmbientLight(  0xCCCCCC );
	ambientLight.name = 'AmbientLight';
	ambientLight.intensity = 1;
	scene.add( ambientLight );


	
	// ---------------------------------------------------------------------
	// Group to be exported
	// ---------------------------------------------------------------------
	
	group = new THREE.Group();
	scene.add( group );

	// ---------------------------------------------------------------------
	// WorldSphere
	// ---------------------------------------------------------------------
	/*
    const geometry = new THREE.SphereBufferGeometry(worldSphereRadius, 12, 12);
    const gridHelperMaterial = new THREE.LineBasicMaterial({
        opacity: 0.5,
        color: '#FF0000',
        transparent: true
    });
            
	const edgesGeometry = new THREE.EdgesGeometry( geometry );
    		
	const worldSphere = new THREE.LineSegments( edgesGeometry, gridHelperMaterial ); 
 
    scene.add(worldSphere);
    */
	// ---------------------------------------------------------------------
	// Create board
	// ---------------------------------------------------------------------
    const loadboard = createPlane('dummy','Double click to','import your data','#66aaff','#000000')
    loadboard.position.z = -4;
    loadboard.name = 'load';
    scene.add(loadboard);

    window.addEventListener( 'resize', onWindowResize() );
    
}

function onPointerMove( event ) {
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}


function ondblclick(event) {
    if ( intersects.length > 0 ) {
        const obj = intersects[ 0 ].object;
        
        if ( obj.name = 'load' ) {
            obj.visible=false;
            document.getElementById('csvFile').click();
        }
    }
}


function IntersectionControl() {
    
    raycaster.setFromCamera( pointer, camera );

	intersects = raycaster.intersectObjects( scene.children, false );

	if ( intersects.length > 0 ) {

		if ( intersected != intersects[ 0 ].object ) {

			intersected = intersects[ 0 ].object;
			//DisplayHooverInfo(intersects[ 0 ].object.userData);
		}

	} else {

		intersected = null;

	}    
}

function animate() {
    
    controls.update();

    IntersectionControl();
    
    onWindowResize();
    
    renderer.render( scene, camera );
    
	renderer.setAnimationLoop( animate );
	
}

function onWindowResize() {

	camera.aspect = ( window.innerWidth / window.innerHeight );
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function RemoveGroupObjects(group) {
    group.remove(...group.children);
}

function createCanvasTexture(text1,text2,bgColor,color) {
    var canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 100;
    ctx.fillStyle = bgColor;
    //ctx.fillstyle = 'rgba(0,127,127,' + ( Math.random() * 0.5 + 0.25 ) + ')';
    ctx.fillRect( 0,0, canvas.width,canvas.height);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle"; 
    
    ctx.font = fontSize1 + "px Arial, sans-serif";
    ctx.fillStyle = color;
    ctx.fillText(text1, canvas.width/2, (canvas.height-fontSize1)/2);
    
    ctx.font = "bold " + fontSize2 + "px Arial, sans-serif";    
    ctx.fillText(text2, canvas.width/2, (canvas.height+fontSize2)/2);
    
    var texture = new THREE.CanvasTexture(canvas);
    return texture;
};

function createPlane(data,text1,text2,bgColor,color) {

    const CanvasMaterial = new THREE.MeshPhongMaterial( {
        map: createCanvasTexture(text1,text2,bgColor,color),
        side: THREE.DoubleSide,
        //color: bgColor,
        //emissive: "#FF0000",
        //emissiveIntensity: 1,
        //shininess: 1,
        opacity: 0.5
    } );
   
    const board = new THREE.PlaneBufferGeometry(2, 1);
    const mesh = new THREE.Mesh(board,CanvasMaterial);
    
    mesh.userData=data;
    mesh.name = text1;
    return mesh;
};
function PositionObjects() {


	// ---------------------------------------------------------------------
    // Material for selections
	// ---------------------------------------------------------------------
    const line = new THREE.Line(
        new THREE.BufferGeometry(),
        new THREE.LineBasicMaterial( { opacity:0.5,transparent:true, color: '#00FF00'} )
    ); 
  
	const l = group.children.length;
	let i=0;
    const vector = new THREE.Vector3();
    let points = [];
    const distBetween = 0.4;
    group.traverse( function( obj ) {

        if ( obj.type = 'mesh' ) {

            /*
            const phi = Math.acos( - 1 + ( 2 * i ) / l );
    		const theta = Math.sqrt( l * Math.PI * 2 ) * phi;
    		obj.position.setFromSphericalCoords( worldSphereRadius, phi, theta );
    		vector.copy( obj.position ).multiplyScalar( 20 );
    		obj.rotation.x = - Math.PI / 2;
    		obj.lookAt( vector );
    		*/
    		
    		const theta = i * 0.175 + Math.PI;
    		const y = - ( i * distBetween ) + worldSphereRadius/2;
    		
    	    obj.position.setFromSphericalCoords( worldSphereRadius, theta,y );
    		
    		vector.x = obj.position.x * 0.5;
    		vector.y = obj.position.y;
    		vector.z = obj.position.z * 0.5;
    		
            points.push( obj.position );
            obj.up = new THREE.Vector3(0,0,1); 
            obj.lookAt( vector );
            obj.rotation.y = y;
            
            i++;
            
        } 
    });

    group.position.x=0;
    group.position.y=0;
    group.position.z=0;    
    
    line.geometry.setFromPoints(points);
    line.name = 'joins';
    group.add(line); 
}
function CreateMainboardes(data) {
    
    RemoveGroupObjects(group);

    for (var propName in data[0]) {
        const board = createPlane(propName,'Column',propName,'#000000','#56FC90');
        group.add(board);
        
   }
    
}

function loadHandler(event) {
    
	var csv = event.target.result;
    const readData = csvToArray(csv);
    for (var i = 0; i < readData.length; i++) {
        
        if (readData[i].id == "")
            readData.splice(i--, 1);
    } 

    // ---------------------------------------------------------------------
	// Create board
	// ---------------------------------------------------------------------
	
    const loadboard = createPlane(importFileName,'CSV File',importFileName,'#4578FF','#000000')
    loadboard.name = 'file';
    scene.add(loadboard);	
    
    CreateMainboardes(readData);
    PositionObjects(); 

}


function csvToArray(str, delimiter = ";") {
    const headers = str.slice(0, str.indexOf("\r\n")).split(delimiter);
    const rows = str.slice(str.indexOf("\n") + 1).split("\r\n");
    const arr = rows.map(function (row) {
        const values = row.split(delimiter);
        const el = headers.reduce(function (object, header, index) {
            object[header] = values[index];
            return object;
            }, {});
        return el;
    });
    return arr;
    
}


