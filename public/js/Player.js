export default class Player{
    
    constructor(options, columns){
        this.columns = columns
        this.media = options.media;
        this.options = options
        this.reso = options.reso
        this.video_controls = true;
        this.iselement = this.isElement()
        this.constrains = options.constrains
        if(!this.iselement ){
            this.media.onMediaNegotion(()=>{
                this.negotiatePlayer(this.media.getConstrains(this.options.socket_id), this.media);
            })
            this.media.onChannelLeft(()=>{
                this.col.remove();
            })
        }
        
        this.body =  $('<div class="card-body">')
        
    }
    addStream(mEl){
        if($(mEl).is('video')){
            this.body.prepend(this.getVideoContext(mEl))

        }else{
            this.body.append(this.getAudioContext(mEl))
        }
    }
    negotiatePlayer(constrains,mEl){
        this.constrains = constrains
        this.media = mEl;
        this.changeContext() 
        
    }
    removePlayer(){
        this.col.remove();
    }
    changeContext(){
        this.constrains.video ?
            $(`#${this.id}`).replaceWith(this.getVideoPlayer()) :  $(`#${this.id}`).replaceWith(this.getAudioPlayer())
    }
    buildBase(){
        if(!this.options.socket_id){
            this.id = 'local'
        }else{
            this.id = this.options.socket_id.replace('#', '').replace('/','');
        }
        this.col = $(`<div id = ${this.id} class="card border-dark col-${this.columns} pr-0 pl-0 mr-5 mb-5">`)
        this.col.append($('<h5 class="card-header white-text text-center py-4">').html("steaming"))
    }
    getPlayer(){
        return this.constrains.video ? this.getVideoPlayer() : this.getAudioPlayer()
    }
    isElement(){
        return this.media instanceof HTMLElement;
    }
    getVideoPlayer(){
        this.buildBase();
        this.body.empty();
        if(!this.iselement){
            return this.col.append(this.body
                    .append(this.getVideoContext())
                    .append(this.getAudioBitrateControl())
                    .append(this.getAudioMuteControl())
                    .append(this.getVideoMuteControl())
                    .append(this.getScreenControl())
                    .append(this.getVideoBitrateControl())
                    .append(this.getAudioInputsControl())
                    .append(this.getVideoInputsControl()))
        }
        return this.col.append(this.body.append(this.getVideoContext()))
    }
    getAudioPlayer(){
        if(this.col){
            this.col.empty();
        }
        this.buildBase();
        this.body.empty();
        if(!this.iselement){
            this.col.append(this.body
                .append(this.getAudioContext())
                .append(this.getAudioBitrateControl())
                .append(this.getAudioInputsControl()))
                .append(this.getAudioMuteControl())
                .append(this.getScreenControl())
            if(this.media.hasVideo(this.options.socket_id)){
                this.col.append(this.getVideoMuteControl());
            }
            return this.col

        }
        return this.col.append(this.body.append(this.getAudioContext()))
    }

    getAudioContext(media){
        let div_cont = $(`<div id=${this.id} class="text-center embed-responsive embed-responsive-item" mb-2">`)
        if(media){
            div_cont.append(this.iselement ? $(media).attr("style", "width:80%"):  $(media.getMediaElement(this.options.socket_id)).attr("style", "width:80%"));

        }else{
            div_cont.append(this.iselement ? $(this.media).attr("style", "width:80%"):  $(this.media.getMediaElement(this.options.socket_id)).attr("style", "width:80%"));
        }
        return div_cont
    }
    getVideoContext(media){
        
        let div_cont = $(`<div id=${this.id} class="embed-responsive embed-responsive-${this.reso}", style="position: relative;">`)
        if(media){
            div_cont.append(this.iselement ? $(media): $(media.getMediaElement(this.options.socket_id)))

        }else{
            div_cont.append(this.iselement ? $(this.media): $(this.media.getMediaElement(this.options.socket_id)))
        }
        return div_cont
    }
    getAudioMuteControl(){
        if(this.media.hasActiveAudio(this.options.socket_id) || this.media.hasMutedAudio(this.options.socket_id)){
            
            if(!this.media.hasMutedAudio(this.options.socket_id)){
                return $('<button id="audio_mute" class="btn btn-danger">').html('Mute').click(()=>{
                    this.media.muteAudio(this.options.socket_id)  
                })
            }

            return $('<button id="audio_mute" class="btn btn-success">').html('Unmute').click(()=>{
                this.media.muteAudio(this.options.socket_id)  
            })
        }
    }
    getScreenControl(){
        let screen = null;
        if(!this.media.isScreen(this.options.socket_id)){
            screen = $('<button class="btn btn-success" id="screen_mute">').html('Share screen')
                
            screen.click(()=>{
                if(!this.media.isScreen(this.options.socket_id) && this.media.hasActiveCamera(this.options.socket_id)){
                    this.media.mixVideoSources({audio: true, video: true}, true, Number($('#startX').val()),Number($('#startY').val()),Number($('#width').val()),Number($('#height').val()), this.options.socket_id)
                }else if(!this.media.hasActiveCamera(this.options.socket_id)){
                    this.media.requestScreen({audio:true, video:true}, this.options.socket_id);
                }
                
            })
        }
        return screen;
    }
    getVideoMuteControl(){
        if(this.media.hasVideo(this.options.socket_id)){
            let camera = $('<button class="btn btn-success" id="video_mute">').html('Start Video')

            camera.click(()=>{
                this.video_controls = !this.video_controls

                if(this.media.isScreen(this.options.socket_id) && !this.media.hasActiveCamera(this.options.socket_id)){
                    if($('input[name="video"]').filter(function(){return $(this).val().length==0}).length == 0){                        
                        this.media.mixVideoSources({audio:true, video:true},false,Number($('#startX').val()),Number($('#startY').val()),Number($('#width').val()),Number($('#height').val()),this.options.socket_id);
                    }
                }else if(this.media.hasActiveCamera(this.options.socket_id) || this.media.hasMutedCamera(this.options.socket_id)){
                    this.media.muteVideo(this.options.socket_id)
                    if(!this.media.hasActiveVideo(this.options.socket_id)){
                        $('#video_input').remove()
                        $('#video_bitrate').remove()
                    }
                }else{
                    this.media.requestVideo(this.options.socket_id);
                }
                this.body.append(this.getVideoInputsControl()).append(this.getVideoBitrateControl())
                
            })
            if(!this.media.hasActiveCamera(this.options.socket_id)){
                camera.html('Start video')
                camera.removeClass('btn-danger').addClass('btn-success')
            }else{
                camera.html('Stop Video')
                camera.removeClass('btn-success').addClass('btn-danger')
            }
            return camera;
        }
    }
    getAudioBitrateControl(){
        if(this.media.hasActiveAudio(this.options.socket_id)){
            if(!$('#audio_bitrate').length){
                let div_audio = $('<div id="audio_bitrate" class="border border-dark py-4">')
                let slider_audio = $('<input type="range" min="8" max="50" name="audioBit" class="border border-dark">')
                slider_audio.change(()=>{
                    this.media.setAudioBitrates(slider_audio.val(),this.options.socket_id)
                })
                let label_audio = $('<label for="audioBit">').html("Audio bitrate:")
                div_audio.append(label_audio).append(slider_audio)
                return div_audio;
            }
        }
    }
    getVideoBitrateControl(){
        if(this.media.hasActiveVideo(this.options.socket_id)){
            if( !$('#video_bitrate').length){
                let div_video = $('<div id="video_bitrate" class="border border-dark py-4">')
                let slider_video = $('<input type="range" min="10" max="2000" name="videoBit" class="border border-dark">')
                slider_video.change(()=>{
                    this.media.setVideoBitrates(slider_video.val(),this.options.socket_id)
                })
                let label_video = $('<label for="videoBit">').html("Video bitrate:")
            
                return div_video.append(label_video).append(slider_video);
            }
        }
    }
    getAudioInputsControl(){
        if(this.media.hasActiveAudio(this.options.socket_id) && !$('#audio_input').length){
            let mics = this.media.getAudioDevices(this.options.socket_id)
            let div = $('<div id="audio_input" class="border border-dark">')

            if(mics.length != 0){
                let label_mic = $('<label for="mics">').html("Select microphone:")
                let select_mics = $('<select name="mics" id="mic" class="form-control">').on('change', ()=>{
                    this.media.changeAudioTrack($(select_mics).children(":selected").attr("id"), this.options.socket_id)
                })

                for(let i=0;i < mics.length;i++){
                    select_mics.append($(`<option id='${mics[i].deviceId}'>`).html(mics[i].label))
                }
                div.append(label_mic).append(select_mics)
            }
            return div;
        }
    }
    getVideoInputsControl(){
        if(this.media.hasActiveVideo(this.options.socket_id) && !$('#video_input').length){
            let cameras = this.media.getVideoDevices(this.options.socket_id);
            let div = $('<div id="video_input" class="border border-dark">')
            if(cameras.length != 0){
                let label_cam = $('<label for="cams">').html("Select camera:")
                let select_cams = $('<select id="cams" class="form-control">').on('change', ()=>{
                    this.media.changeVideoTrack($(select_cams).children(":selected").attr("id"), this.options.socket_id)
                })
                select_cams.append($('<option disabled selected value>').html('Select an cam'))      
                for(let i=0;i < cameras.length;i++){
                    select_cams.append($(`<option id='${cameras[i].deviceId}'>`).html(cameras[i].label))
                }
                let options = null;
                //if(this.media.isScreen(this.options.socket_id)){
                    options = $('<div class="input-group">')
                        .append('<span class="input-group-text">Start x:</span>').append($('<input type="text" id="startX" class="form-control" name="video">'))
                        .append('<span class="input-group-text">Start y:</span>').append($('<input type="text" id="startY" class="form-control" name="video">'))
                        .append('<span class="input-group-text">Width:</span>').append($('<input type="text" id="width" class="form-control" name="video">'))
                        .append('<span class="input-group-text">Heigth:</span>').append($('<input type="text" id="height" class="form-control" name="video">'))
                    div.append(options)
                //}
                div.append(label_cam).append(select_cams)
                
            }
            return div;
        }
    }

}