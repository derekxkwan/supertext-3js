var cnv = document.getElementById("cnv");
var iptbox = document.getElementById("iptbox");
var divipt = document.getElementById("divipt");
var splash = document.getElementById("splash");

var loader = new THREE.FontLoader();
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0,0,50);

var light = new THREE.AmbientLight( 0x808080);
//light.position.set(0,0,-100);
var light2 = new THREE.PointLight(0xfffff,0.5,-100);
scene.add( light2);
scene.add( light );

var renderer = new THREE.WebGLRenderer({canvas: cnv});
renderer.setSize( window.innerWidth, window.innerHeight );
//document.body.appendChild( renderer.domElement );

let font;
let group = new THREE.Group();

let loaded = false, min_h = 0.005, dec_h = 0.002, inc_h = 1, max_h = 50;
let dec_z = 0.4, inc_z = 1.25, max_z = 200, min_z = -300, mid_z = 0;
let start_z_away = 75, start_z_fwd = -300;
let min_z_accelthresh = -100, min_z_accel = 2;
let text_geo, default_text = "SOMETIMES I DREAM ABOUT BATHROOMS";
let text_mesh;
let cur_fwd = false, is_flying = false;
let back_block =  [[oct, fifth, oct], [oct, oct, fifth], [oct, fifth, oct]];
let fwd_block = [[fifth, oct, fifth], [fifth, fifth, oct], [fifth, fifth, oct]];

load_font();


function gen_seq(fwd, cur_text)
{
    let cur_num = cur_text.split(" ").length;
    let rnd_num;
    let cur_len;
    let build_block;
    let ret_arr;

    if(fwd == true)
    {
	cur_len = fwd_block.length;
	ret_arr = [fifth, null, null];
	build_block = fwd_block;
    }
    else
    {
	cur_len = back_block.length;
	ret_arr = [oct, null, null];
	build_block = back_block;
    }
    for(let i =0; i < cur_num; i++)
    {

	let cur_block = build_block[parseInt(Math.random() * cur_len + 0.5)];
	ret_arr = ret_arr.concat(cur_block);
    };

    return ret_arr;
    
    }


function load_font() {
    loader.load( "res/Londrina Outline_Regular_rev.json", (resp) => {

	font = resp;

    });
    };

function create_text(text, cur_font, fwd) {
    let bevel_enabled = true;
    let bevel_size = 0.3;
    let bevel_thickness = 2;
    let curve_segments = 3;
    let size = 10;
    let cur_h, cur_z;
    if(fwd == true)
    {
	cur_h = min_h;
	cur_z = start_z_fwd;
	cur_fwd = true;
    }
    else
    {
	cur_h = max_h;
	cur_z = start_z_away;
	cur_fwd = false;
    };
    console.log("creating text");
    text_geo = new THREE.TextGeometry( text, {
	font: cur_font,
	size: size,
	height: cur_h,
	curveSegments: curve_segments,
	bevelThickness: bevel_thickness,
	bevelSize: bevel_size,
	bevelEnabled: bevel_enabled
    } );
    text_geo.computeBoundingBox();
    text_geo.computeVertexNormals();
    // "fix" side normals by removing z-component of normals for side faces
    // (this doesn't work well for beveled geometry as then we lose nice curvature around z-axis)
    
    var offset = - 0.5 * ( text_geo.boundingBox.max.x - text_geo.boundingBox.min.x );
    var materials = new THREE.MeshLambertMaterial({color: 0x3399ff, wireframe: false});
    materials.transparent = true;
    materials.opacity = 0.5;
   // text_geo = new THREE.BufferGeometry().fromGeometry( text_geo );
    text_mesh = new THREE.Mesh( text_geo, materials );
    text_mesh.position.x = offset;
    text_mesh.position.y = - 0.5 * ( text_geo.boundingBox.max.y - text_geo.boundingBox.min.y );
    text_mesh.position.z = cur_z;
    text_mesh.rotation.x = 0;
    text_mesh.rotation.y = Math.PI * 2;
  
    scene.add( text_mesh );
    loaded = true;
}


function refreshText(text) {


    scene.remove( text_mesh );


    create_text(text);
}

function fly_away()
{
    let cur_text = iptbox.value.toUpperCase();
    divipt.style.visibility = 'hidden';
    if(!is_flying)
    {
	let cur_seq = gen_seq(cur_fwd, cur_text);
	fanfare_trig(cur_seq);
	create_text(cur_text, font, cur_fwd);
	is_flying = true;
    }
}

function reengage()
{
    scene.remove( text_mesh );
    is_flying = false;
    cur_fwd = !cur_fwd;
    divipt.style.visibility = 'visible';
}

function animate()
{
    if(loaded)
    {
	let cur_h = text_mesh.scale.z;
	let cur_z = text_mesh.position.z;
	//console.log(cur_z);
	if(cur_fwd == false)
	{
	    if(cur_h > min_h)
		text_mesh.scale.z = cur_h - dec_h;
	    text_mesh.position.z = cur_z - dec_z;
	    if(cur_z < min_z_accelthresh)
		text_mesh.position.z = cur_z - (min_z_accel*dec_z);
	    else
		text_mesh.position.z = cur_z - dec_z;
	    if(cur_z < min_z)
		reengage();

	}
	else
	{
	    if(cur_z >= mid_z && cur_h < max_h)
		text_mesh.scale.z = cur_h + inc_h;
	    if(cur_h >= max_h ||  cur_z < mid_z)
		text_mesh.position.z = cur_z + inc_z;
	    if(cur_z > max_z)
		reengage();
	};
    };
}
function render()
{
    window.requestAnimationFrame(render);
    animate();
    renderer.render(scene, camera);
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function kickoff()
{
    splash.style.visibility = "hidden";
    divipt.style.visibility = "visible";
    init_audio(window);
    Tone.Transport.start();
    main_march.start("@1n");
}
render();
