let main_out;
let ctx;
let rvb;
let fbdel;
let main_march;
let march_pedal;
let mpedal_deets = {envelope:
		    {attack: 0.03, decay: 0.02, sustain: 0.1, release: 0.25}};
let fanfare_deets = {envelope:
		    {attack: 0.03, decay: 0.02, sustain: 0.5, release: 0.25}};
let ped = "C2";
let oct = "C6";
let fifth = "G6";

let fanfare;

function fbdel_init()
{
    fbdel = new Tone.FeedbackDelay("4n", 0.5);
    fbdel.wet = 0.15;
    fbdel.connect(rvb);
}
function rvb_init()
{
    rvb = new Tone.Reverb(3);
    rvb.generate();
    rvb.toMaster();
}
function fanfare_trig(cur_seq)
{
  console.log(cur_seq);
  let  cur_fanfare = new Tone.Sequence(
	(time, note) =>
	    {
		if(note != null)
		    fanfare.triggerAttackRelease(note, "16n", time);
	    }, cur_seq,
	"8t"
    );
    cur_fanfare.loop = false;
    cur_fanfare.start("@1n");

}

function fanfare_init()
{
    fanfare = new Tone.FMSynth(fanfare_deets);
    fanfare.connect(fbdel);
}

function pedal_init()
{

    march_pedal = new Tone.FMSynth(mpedal_deets);
    march_pedal.toMaster();
}

function march_init()
{

    console.log("march_init");
    main_march = new Tone.Sequence(
	(time, note) =>
	    {
		if(note != null)
		    march_pedal.triggerAttackRelease(note, "16n", time);
	    },
	[null, null, null, ped, ped, ped, null, null, null, ped, ped, ped,
	 null, null, null, ped, ped, ped, ped, ped, ped, null, null, null],
	"8t"

    );
    main_march.loop = true;

}

function master_init()
{
    main_out = Tone.Master;
    main_out.mute = false;
    main_out.volume.rampTo(0, 0.01);
}

function synths_init()
{
    console.log("synths_init");
    pedal_init();
    rvb_init();
    fbdel_init();
    fanfare_init();
}


function parts_init()
{
    march_init();
}
function init_audio(win)
{
    if(ctx == null)
    {
	ctx = new win.AudioContext();
	if(ctx == null)
	    ctx = new win.webkitAudioContext();
	Tone.context.latencyHint = "playback";
	Tone.context.resume();
	master_init();
	synths_init();
	parts_init();
	Tone.Transport.bpm.value = 132;
    };
}
