import Broadcaster from './Broadcaster.js'
let connection = null
window.onload = ()=>{
    var SIGNALING_SERVER = "http://localhost";
    connection = new Broadcaster("http://localhost", io() ,null,window.id)
    connection.subscribeTo(window.channel, ()=>{
        $('body').append($('<input id="slider" type="range" min="8" max="500" value="50">').change(function(){
            connection.setAudioBitrates($(this).val())
        }))
        $('body').append($('<input id="slider1" type="range" min="50" max="500" value="256">').change(function(){
           connection.setVideoBitrates($(this).val())
        }))
        $('body').append(($('<button>').html('Mute').click(function(){
            connection.mute_audio()
        })))
        let select_mics = $('<select id="mic">')
        let select_cams = $('<select id="cam">')
        let mics = connection.getAudioDevices()
        let cameras = connection.getVideoDevices();
        for(let i=0;i < mics.length;i++){
            select_mics.append($(`<option id='${mics[i].deviceId}'>`).html(mics[i].label))
        }
        for(let i=0;i < cameras.length;i++){
            select_cams.append($(`<option id='${cameras[i].deviceId}'>`).html(cameras[i].label))
        }
        $('body').append(select_mics)
        $('body').append(select_cams)
    })
}