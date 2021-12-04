import * as THREE                   from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';

import { TWEEN } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/libs/tween.module.min.js';
import { TrackballControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/TrackballControls.js';
import { CSS3DRenderer, CSS3DObject } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/renderers/CSS3DRenderer.js';

let container, camera, scene, renderer;
let controls;
let pointer,raycaster,intersected,intersects;
let FieldContentGroup,FieldGroup,FileGroup,StartGroup;
let readData,delimiter;
let settingsLoader=false;
let capturer, recordingGIF = false, timerCapturer;

let data = [];
let objects = [];
let targets = { flat: [], sphere: [], helix: [], grid: [] };

let importFileName,noOfFields,noOfRows,rowsAndCols,rowsAndColAndDepth;
document.getElementById('resetView').addEventListener('click', resetView );

document.getElementById("csvFile").addEventListener('change', (event) => { 

    const userFile = csvFile.files[0];   
    const userFileURL = URL.createObjectURL( userFile );
    importFileName=userFile.name;
    
    let reader = new FileReader();
    reader.readAsText(userFile);
    reader.onload = loadHandler;

});


init();
animate();

function init() {

	camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = 1000;

	scene = new THREE.Scene();

    StartGroup = new THREE.Group();
    scene.add( StartGroup );

    FileGroup = new THREE.Group();
    scene.add( FileGroup );

    FieldGroup = new THREE.Group();
    scene.add( FieldGroup );
    
    FieldContentGroup = new THREE.Group();
    scene.add( FieldContentGroup );
    
    container = document.createElement( 'div' );
    container.className = "container";
    document.body.appendChild( container );
    
	renderer = new CSS3DRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	controls = new TrackballControls( camera, renderer.domElement );
	controls.minDistance = 0;
	controls.maxDistance = 6000;
    controls.autoRotate = true;
	controls.enableDamping = true; 
	controls.dampingFactor = 0.0001;
	controls.screenSpacePanning = false;
    controls.rotateSpeed = 5;
	controls.maxPolarAngle = Math.PI /2;
	controls.addEventListener( 'change', render );

	const buttonFlat = document.getElementById( 'flat' );
	buttonFlat.addEventListener( 'click', function () {

		transform( targets.flat, 1000 );

	} );

	const buttonSphere = document.getElementById( 'sphere' );
	buttonSphere.addEventListener( 'click', function () {

		transform( targets.sphere, 1000 );

	} );

	const buttonHelix = document.getElementById( 'helix' );
	buttonHelix.addEventListener( 'click', function () {

		transform( targets.helix, 1000 );

	} );

	const buttonGrid = document.getElementById( 'grid' );
	buttonGrid.addEventListener( 'click', function () {

		transform( targets.grid, 1000 );

	} );

	window.addEventListener( 'resize', onWindowResize );
	
    createStartObject('Start by importing a text-file<br>Adjust import settings in the menu','Click Here to Import','Then navigate the file by clicking and double clicking on objects');
    
    render();
}


function positionObjects () {

	createSpehere();

    createHelix();

	createGrid();
}

function createGrid () {
    
    const vector = new THREE.Vector3();
    const distanceBetween = 500;
    
	for ( let i = 0; i < objects.length; i ++ ) {

		const object = new THREE.Object3D();

		object.position.x = ( ( i % rowsAndColAndDepth ) * distanceBetween ) - rowsAndCols*180/2;
		object.position.y = ( ( - Math.floor( i / rowsAndColAndDepth ) % rowsAndColAndDepth ) * distanceBetween ) + rowsAndCols*140/2;
		object.position.z = ( ( - Math.floor( i / (rowsAndColAndDepth*rowsAndColAndDepth) ) ) * distanceBetween ) - (rowsAndColAndDepth*400);

		targets.grid.push( object );

	}
}

function createHelix () {
    
    const vector = new THREE.Vector3();
    
	for ( let i = 0, l = objects.length; i < l; i ++ ) {

		const theta = i * 0.175 + Math.PI;
		const y = - ( i * 8 ) + 450;

		const object = new THREE.Object3D();

		object.position.setFromCylindricalCoords( 900, theta, y );

		vector.x = object.position.x * 2;
		vector.y = object.position.y;
		vector.z = object.position.z * 2;

		object.lookAt( vector );

		targets.helix.push( object );

	}
}


function createSpehere () {
    
	const vector = new THREE.Vector3();

	for ( let i = 0, l = objects.length; i < l; i ++ ) {

		const phi = Math.acos( - 1 + ( 2 * i ) / l );
		const theta = Math.sqrt( l * Math.PI ) * phi;

		const object = new THREE.Object3D();

		object.position.setFromSphericalCoords( 800, phi, theta );

		vector.copy( object.position ).multiplyScalar( 2 );

		object.lookAt( vector );

		targets.sphere.push( object );

	}
}


function createStartObject (text1,text2,text3) {

	const element = document.createElement( 'div' );
	element.className = 'start';

	const info1 = document.createElement( 'div' );
	info1.className = 'info1';
	info1.innerHTML = text1;
	element.appendChild( info1 );
	
	const info2 = document.createElement( 'div' );
	info2.className = 'info2';
	info2.innerHTML = text2;
	element.appendChild( info2 );

	const info3 = document.createElement( 'div' );
	info3.className = 'info3';
	info3.innerHTML = text3;
	element.appendChild( info3 );		
	
	const objectCSS = new CSS3DObject( element );

	objectCSS.position.x = 0;
	objectCSS.position.y = 0;
	objectCSS.rotation.x = - Math.PI / 4;
    element.parent = objectCSS;
	objectCSS.element.onclick = function() {
	    
	    document.getElementById('csvFile').click(); 
	    
	};
	
	StartGroup.add( objectCSS );

}


function createFileObject (FileName,details) {

	const element = document.createElement( 'div' );
	element.className = 'file';
	element.style.backgroundColor = 'rgba(0,0,0,0.5)';
    element.style.width = 200;
    element.style.height = 200;
	element.style.border = '2px solid rgba(50,50,50,1)';
	element.style.fontsize = '80px';
    
    const rowNumber = document.createElement( 'div' );
	rowNumber.className = 'header';
	rowNumber.textContent = 'FileName';
	element.appendChild( rowNumber );

	const fieldName = document.createElement( 'div' );
	fieldName.className = 'fileName';
	fieldName.textContent = FileName;
	element.appendChild( fieldName );

	const detailsElement = document.createElement( 'div' );
	detailsElement.className = 'details';
	detailsElement.innerHTML = details;
	element.appendChild( detailsElement );

	const objectCSS = new CSS3DObject( element );
	
	FileGroup.add( objectCSS );

	objectCSS.position.x = 0;
	objectCSS.position.y = -500;
	objectCSS.rotation.x = - Math.PI / 4;
	
	element.parent = objectCSS;
	objectCSS.element.ondblclick = function() {

	    document.getElementById('csvFile').click(); 
	    
	};

}
function createFieldObject (rowNumber,fieldName,details) {

	const element = document.createElement( 'div' );
	element.className = 'element';
	element.style.backgroundColor = 'rgba(0,127,127,' + ( Math.random() * 0.5 + 0.25 ) + ')';

	const rowNumberElement = document.createElement( 'div' );
	rowNumberElement.className = 'rowNumber';
	rowNumberElement.textContent = 'Column: ' + rowNumber;
	element.appendChild( rowNumberElement );

	const fieldNameElement = document.createElement( 'div' );
	fieldNameElement.className = 'fieldName';
	fieldNameElement.textContent = fieldName;
	element.appendChild( fieldNameElement );

	const detailsElement = document.createElement( 'div' );
	detailsElement.className = 'details';
	detailsElement.innerHTML = details;
	element.appendChild( detailsElement );

	const objectCSS = new CSS3DObject( element );
	
	FieldGroup.add( objectCSS );

	objectCSS.position.x = 0;
	objectCSS.position.y = -500;
	objectCSS.rotation.x = - Math.PI / 4;
	element.parent = objectCSS;
	objectCSS.element.ondblclick = function() {

	    BuildObjects(readData);
	    
	};

}

function createFieldObjects (rowNumber,fieldName,details,row,col) {

	const element = document.createElement( 'div' );
	element.className = 'element';
	element.style.backgroundColor = 'rgba(0,127,127,' + ( Math.random() * 0.5 + 0.25 ) + ')';

	const rowNumberElement = document.createElement( 'div' );
	rowNumberElement.className = 'rowNumber';
	rowNumberElement.textContent = 'Column: ' + rowNumber;
	element.appendChild( rowNumberElement );

	const fieldNameElement = document.createElement( 'div' );
	fieldNameElement.className = 'fieldName';
	fieldNameElement.textContent = fieldName;
	element.appendChild( fieldNameElement );

	const detailsElement = document.createElement( 'div' );
	detailsElement.className = 'details';
	detailsElement.innerHTML = details;
	element.appendChild( detailsElement );

	const objectCSS = new CSS3DObject( element );
	objectCSS.position.x = Math.random() * 4000 - 2000;
	objectCSS.position.y = Math.random() * 4000 - 2000;
	objectCSS.position.z = Math.random() * 4000 - 2000;
	
	FieldGroup.add( objectCSS );

	objects.push( objectCSS );

	const object = new THREE.Object3D();
	object.position.x = ( row * 180 ) - rowsAndCols*180/2;
	object.position.y = - ( col * 140 ) + rowsAndCols*140/2;
    object.position.z = -200;

	
	targets.flat.push( object );
	
	element.parent = objectCSS;
	element.parent.userData.rowNumber = rowNumber;
	element.parent.userData.fieldName = fieldName;
	element.parent.userData.details = details;
	element.parent.userData.clicked = false;
	
	objectCSS.element.ondblclick = function() {

	    loadHandlerRowDetails(element.parent.userData.rowNumber, element.parent.userData.fieldName, element.parent.userData.details);

	};

	objectCSS.element.onclick = function() {
	    
	    if ( this.parent.userData.clicked ) { 
	        
	        this.parent.userData.clicked = false; // this.parent.position.z =+ 10;
	        this.style.backgroundColor = 'rgba(0,127,127,' + ( Math.random() * 0.5 + 0.25 ) + ')';
	        
	    } else {
	        
	        this.parent.userData.clicked = true;
	        this.style.backgroundColor = 'rgba(0,0,127,' + ( Math.random() * 0.5 + 0.25 ) + ')';
	        
	    }
	    
	    render();
	    
	};    
	
}

function createFieldValueObjects (fieldName,rowNumber,fieldValue,row,col) {
    

	const element = document.createElement( 'div' );
	element.className = 'element';
	element.style.backgroundColor = 'rgba(127,127,0,' + ( Math.random() * 0.5 + 0.25 ) + ')';

	const rowNumberElement = document.createElement( 'div' );
	rowNumberElement.className = 'rowNumber';
	rowNumberElement.textContent = fieldName;
	element.appendChild( rowNumberElement );

	const fieldNameElement = document.createElement( 'div' );
	fieldNameElement.className = 'fieldName';
	fieldNameElement.textContent = fieldValue;
	element.appendChild( fieldNameElement );

	const detailsElement = document.createElement( 'div' );
	detailsElement.className = 'details';
	detailsElement.innerHTML = 'Row: ' + rowNumber;
	element.appendChild( detailsElement );

	const objectCSS = new CSS3DObject( element );
	objectCSS.position.x = Math.random() * 4000 - 2000;
	objectCSS.position.y = Math.random() * 4000 - 2000;
	objectCSS.position.z = Math.random() * 4000 - 2000;
	
	FieldContentGroup.add( objectCSS );

	objects.push( objectCSS );

	const object = new THREE.Object3D();
	object.position.x = ( row * 180 ) - rowsAndCols*180/2;
	object.position.y = - ( col * 140 ) + rowsAndCols*140/2;
    object.position.z = -200;

	
	targets.flat.push( object );
	
	element.parent = objectCSS;
	element.parent.userData.fieldName = fieldName;
	element.parent.userData.rowNumber = rowNumber;
	element.parent.userData.fieldValue = fieldValue;
	element.parent.userData.clicked = false;
	objectCSS.element.click = function() {
	    
	    if ( this.parent.userData.clicked ) { 
	        this.parent.userData.clicked = false; // this.parent.position.z =+ 10;
	        this.style.backgroundColor = 'rgba(0,127,0,' + ( Math.random() * 0.5 + 0.25 ) + ')';
	    } else {
	        this.parent.userData.clicked = true;
	        element.style.backgroundColor = 'rgba(127,127,0,' + ( Math.random() * 0.5 + 0.25 ) + ')';
	        
	    }
	    
	    render();
    };

}



function loadHandlerRowDetails (rowNumber,fieldName,details) {
    objects = [];
    targets = { flat: [], sphere: [], helix: [], grid: [] };   
    StartGroup.remove(...StartGroup.children); 
    FileGroup.remove(...FileGroup.children); 
    FieldGroup.remove(...FieldGroup.children); 
    FieldContentGroup.remove(...FieldContentGroup.children);
    var row=0,col=0;
    
    const uniqueValues = [ ... new Set(readData.map((o) => o[fieldName]))];
    
    noOfRows = uniqueValues.length;
    
    rowsAndCols = 1;
    rowsAndColAndDepth = 1;
    
    if ( noOfRows > 3 ) {
        
        rowsAndCols = Math.ceil(Math.sqrt(noOfRows))-1;
        rowsAndColAndDepth = Math.ceil(Math.cbrt(noOfRows))-1;                    
    }  
    
    for ( let i = 0; i < uniqueValues.length; i ++ ) {

        createFieldValueObjects (fieldName,i,uniqueValues[i],col,row)

        if( col == rowsAndCols  ) { col = 0; row++; } else {col++;}

    }      
    
    createFieldObject (rowNumber,fieldName,details);
    
    positionObjects ();
    
    render();
    
    transform( targets.flat, 1000 );
    
}
function numbersOnly(value) {
if ( typeof (value) === 'number' ) {
return value;
}
}
function emptyOnly(value) {
if ( value === '' || value === undefined || value === null || value.length <= 0 ) {
return value;
}
}
function BuildObjects(data) {
    
    camera.position.z = 3000;
    
    objects = [];
    targets = { flat: [], sphere: [], helix: [], grid: [] };
    
    StartGroup.remove(...StartGroup.children); 
    FileGroup.remove(...FileGroup.children); 
    FieldGroup.remove(...FieldGroup.children); 
    FieldContentGroup.remove(...FieldContentGroup.children);

    noOfFields = Object.keys(data[0]).length;
    noOfRows = data.length;

    rowsAndCols = 1;
    rowsAndColAndDepth = 1;
    
    if ( noOfFields > 3 ) {
        
        rowsAndCols = Math.ceil(Math.sqrt(noOfFields))-1;
        rowsAndColAndDepth = Math.ceil(Math.cbrt(noOfFields))-1;                    
    }                

    var row=0,col=0;
    var fields={ keys: [], empty: [], unique: [], numeric: [], max: [], min: [] };
    
    for (var key in data[0]) {
        if (data[0].hasOwnProperty(key)) {
            fields.keys.push(key);

            const myArray = data.map( (o) => o[key] );
            const myUniqueArray = [ ... new Set( myArray ) ]
            const myNumericArray = myArray.filter( Number );
            const myNotNumericArray = myArray.filter(function(item) {  return !myNumericArray.includes(item); });
            const myEmptyArray = myArray.filter(emptyOnly);
            //console.log( myNumericArray );
            
            fields.unique.push( myUniqueArray.length );
            fields.numeric.push( myNumericArray.length );
            fields.empty.push( myEmptyArray.length );
            fields.min.push(  Math.min(null, ... myNumericArray ) );
            fields.max.push(  Math.max(null, ... myNumericArray ) );
        }
    }

    for ( let i = 0; i < fields.keys.length; i ++ ) {
        const detailInfo = 
              'No of unique values: ' + fields.unique[i] 
            + '<br>Empty: ' + fields.empty[i] 
            + '<br>Numeric: ' + fields.numeric[i] 
            + '<br>Min: ' + fields.min[i]
            + '<br>Max: ' + fields.max[i]
            
        createFieldObjects (i,fields.keys[i],detailInfo,col,row);

        if( col == rowsAndCols  ) { col = 0; row++; } else {col++;}
    }
    
    
    createFileObject (importFileName, 'Delimiter is ' + delimiter + '<br>' + noOfFields + ' fields<br>' + noOfRows + ' rows');
    
    positionObjects ();

    render();
    
    transform( targets.flat, 1000 );                

}

function loadHandler(event) {

	var csv = event.target.result;
	
	const tab = csv.slice(0, csv.indexOf("\r\n")).split("\t");
	const pipe = csv.slice(0, csv.indexOf("\r\n")).split('|');
	const semicolon = csv.slice(0, csv.indexOf("\r\n")).split(';');
	const comma = csv.slice(0, csv.indexOf("\r\n")).split(',');

	if ( tab.length > 1 ) { delimiter = "\t" } else {
	    
	    
	    if ( pipe.length > semicolon.length &&  semicolon.length > 1 )  { delimiter = '|' } else {
	        
	        
	        if ( semicolon.length > comma.length && semicolon.length > 1 )  { delimiter = ';' } else {   
	            
	            
	            if ( comma.length > 1 )  { delimiter = ',' } else { delimiter = ' ' } } } };
	
    readData = csvToArray(csv,delimiter);
    
    BuildObjects(readData);
    
    
    

}


function csvToArray(str, delimiter = ";") {
    
    const uniqueLineBreak = '/%@£∞|'
    const str_fixed = str.replace(/(?:\r\n|\r|\n)/g, uniqueLineBreak);

    const headers = str_fixed.slice(0, str_fixed.indexOf(uniqueLineBreak)).split(delimiter);
    const rows = str_fixed.slice(str_fixed.indexOf(uniqueLineBreak) + uniqueLineBreak.length).split(uniqueLineBreak);
    
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


function onPointerMove( event ) {
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}


function transform( targets, duration ) {

	TWEEN.removeAll();

	for ( let i = 0; i < objects.length; i ++ ) {

		const object = objects[ i ];
		const target = targets[ i ];

		new TWEEN.Tween( object.position )
			.to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
			.easing( TWEEN.Easing.Elastic.In )
			.start();

		new TWEEN.Tween( object.rotation )
			.to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
			.easing( TWEEN.Easing.Back.Out )
			.start();

	}

	new TWEEN.Tween( this )
		.to( {}, duration * 2 )
		.onUpdate( render )
		.start();

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
    
	render();

}

function animate() {

	requestAnimationFrame( animate );

	TWEEN.update();

	controls.update();

}

function render() {
    
	renderer.render( scene, camera );

}

function resetView() {
    
	camera.position.set( 0,0,1000);
	camera.lookAt(new THREE.Vector3(0,0,0));  
	controls.reset();
	if ( readData.length > 0 ) { BuildObjects(readData); }
	
}
