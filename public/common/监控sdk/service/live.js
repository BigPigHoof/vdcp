let opaqueId = "conference-"+ Mms.randomString(12);
let instLive = null;
let liveRoomId = 0;
let videoProfile = null;

function checkLiveInvalid() {
    if(instLive === null || instLive.memberMap === null)
    {
        let cbResult = Session.createUiError(RtcCommonEventID.RTC_API_REQUEST_FAILED, RtcEventReason.RTC_REASON_WEB_SESSION_CLOSED);
        Session.sessCallback(cbResult);
        return true;
    }
    return false;
}

function checkNotInRoom() {
    if(liveRoomId === 0)
    {
        let cbResult = Session.createUiError(RtcCommonEventID.RTC_API_REQUEST_FAILED, RtcEventReason.RTC_REASON_NOT_IN_LIVE_ROOM);
        Session.sessCallback(cbResult);
        return true;
    }
    return false;
}

function checkAlreadyInRoom() {
    if(liveRoomId !== 0)
    {
        let cbResult = Session.createUiError(RtcCommonEventID.RTC_API_REQUEST_FAILED, RtcLiveEventID.RTC_REASON_ALREADY_IN_ROOM);
        Session.sessCallback(cbResult);
        return true;
    }
    return false;
}

Live.init = function(session){
    if(instLive !== null) {
        return;
    }
    instLive = new Live(session);
    session.registerService(instLive);
};

Live.destroy = function(){
    if(instLive === null) {
        return;
    }
    instLive.doDestroy();
};


Live.joinRoom = function(roomId, myName)
{
    if(checkLiveInvalid() || checkAlreadyInRoom()) return;
    instLive.doJoinRoom(roomId, myName);
};

Live.leaveRoom = function(roomId)
{
    if(checkLiveInvalid() || checkNotInRoom()) return;
    instLive.doLeaveRoom(roomId);
};


Live.publishMe = function(mediaType, captureProfile)
{
    if(checkLiveInvalid() || checkNotInRoom()) return;
     instLive.doPublishMe(mediaType, captureProfile);
};

Live.unpublishMe = function()
{
    if(checkLiveInvalid() || checkNotInRoom()) return;
    instLive.doUnpublishMe();
};

Live.unSubscribe = function(handler)
{
    if(checkLiveInvalid() || checkNotInRoom()) return;
    instLive.doUnSubscribe(handler);
};


Live.destroyChannel = function(handler, isLocal){

    if(checkLiveInvalid()) return;
    if(isLocal)
    {
        instLive.doHangup();
    }
    else if(handler)
    {
        instLive.doClose(handler);
    }

};

Live.switchCamera  = function(){
    if(checkLiveInvalid()) return;
    instLive.doSwitchCamera();
};

Live.listenRemoteMedia = function(handler, mediaType, mute){

    if(checkLiveInvalid()) return false;
    return instLive.doListenRemoteMedia(handler,mediaType,mute);

};

Live.muteLocalMedia = function(mediaType, mute){

    if(checkLiveInvalid()) return false;
    return instLive.doMuteLocalMedia(mediaType,mute);
};

Live.isListeningRemoteMedia = function(handler, mediaType){
    let isListening = false;
    switch(mediaType)
    {
        case RtcMediaType.RTC_MEDIA_TYPE_AUDIO:
            isListening = handler.audioListening;
            break;
        case RtcMediaType.RTC_MEDIA_TYPE_VIDEO:
            isListening = handler.videoListening;
            break;
    }
    return isListening;
};

Live.isLocalMediaMuted = function(mediaType){
    let isMuted = false;
    switch(mediaType)
    {
        case RtcMediaType.RTC_MEDIA_TYPE_AUDIO:
            isMuted = instLive.localHandler.isAudioMuted();
            break;
        case RtcMediaType.RTC_MEDIA_TYPE_VIDEO:
            isMuted = instLive.localHandler.isVideoMuted();
            break;
    }
    return isMuted;
};

function getMemberInfo(id)
{
    let map = instLive.memberMap;
    if(map !== null && map.has(id))
    {
        return map.get(id);
    }
    return null;
}

function setMemberSubsHandler(id, subsHandler)
{
    let map = instLive.memberMap;
    if(map!==null && map.has(id))
    {
        let memberInfo = map.get(id);
        memberInfo.subsHandler = subsHandler;
    }
}

function removeMemberSubsHandler(id)
{
    let map = instLive.memberMap;
    if(map!==null && map.has(id))
    {
        let memberInfo = map.get(id);
        memberInfo.subsHandler = null;
    }
}

function existMemberSubsHandler(id){
    let map = instLive.memberMap;
    if(map!==null && map.has(id))
    {
        let memberInfo = map.get(id);
        return (memberInfo.subsHandler !== null && memberInfo.subsHandler !== undefined);
    }
    return false;
}

function setMemberPublished(id)
{
    let map = instLive.memberMap;
    if(map !==null && map.has(id))
    {
        let memberInfo = map.get(id);
        memberInfo.isPub = true;
    }
    else
    {
        Mms.error("member not exist in memberMap, id="+id);
    }
}

function setMemberUnPublished(id)
{
    let map = instLive.memberMap;
    if(map !==null && map.has(id))
    {
        let memberInfo = map.get(id);
        memberInfo.isPub = false;
    }

}

Live.createChannel = function(memberId, isLocal, chCallback) {

        if(checkLiveInvalid()) return;
        chCallback = (chCallback !== null)?chCallback:function(){};
        if (existMemberSubsHandler(memberId)) {
            let cbResult = Session.createUiError(RtcLiveEventID.RTC_CHANNEL_BUILD_FAILED,
                RtcEventReason.RTC_REASON_USER_REOPENED);
            Session.sessCallback(cbResult);
            return;
        }
        let memberInfo = null;
        if(!isLocal)
        {
            memberInfo = getMemberInfo(memberId);
        }
        let handler = null;

        mms.attach(
            {
                service: "service.conference",
                opaqueId: opaqueId,
                success: function (serviceHandle) {
                    handler = serviceHandle;
                    Mms.log("Service attached! (" + handler.getService() + ", id=" + handler.getId() + ")");
                    if (isLocal) {
                        instLive.setLocalHandler(handler, chCallback);
                        let serviceType = RtcServiceType.RTC_SERVICE_TYPE_LIVE;
                        let cbResult = Session.createUiEventWithObj(RtcCommonEventID.RTC_SERVICE_APPLY_SUCCESS, serviceType);
                        Session.sessCallback(cbResult);
                        let cbResult1 = Session.createUiEvent(RtcLiveEventID.RTC_CHANNEL_BUILD_SUCCESS);
                        chCallback(handler, cbResult1);
                    }
                    else {
                        setMemberSubsHandler(memberId, handler);
                        handler.simulcastStarted = false;
                        Mms.log("Service attached! (" + handler.getService() + ", id=" + handler.getId() + ")");
                        Mms.log("  -- This is a subscriber");
                        // We wait for the service to send us an offer
                        instLive.doSubscribe(handler, memberId, memberInfo.audio ,memberInfo.video);
                        let cbResult = Session.createUiEvent(RtcLiveEventID.RTC_CHANNEL_BUILD_SUCCESS);
                        chCallback(handler, cbResult);
                    }
                },
                error: function (error) {
                    Mms.error("  -- Error attaching service...", error);
                    if (isLocal) {
                        let cbResult = Session.createUiError(RtcCommonEventID.RTC_SERVICE_APPLY_FAILED,
                            RtcEventReason.RTC_REASON_WEB_SESSION_CLOSED);
                        Session.sessCallback(cbResult);
                    }
                    else
                    {
                        let cbResult = Session.createUiError(RtcLiveEventID.RTC_CHANNEL_BUILD_FAILED,
                            RtcEventReason.RTC_REASON_WEB_SESSION_CLOSED);
                        Session.sessCallback(cbResult);
                    }
                },
                consentDialog: function (on) {
                    if (!isLocal)
                        return;
                    Mms.debug("Consent dialog should be " + (on ? "on" : "off") + " now");
                    if (on) {
                        let cbResult = Session.createUiEvent(RtcCommonEventID.RTC_QUERY_DEVICE_PERMISSION);
                        Session.sessCallback(cbResult);
                    } else {
                        // Restore screen
                        let cbResult = Session.createUiEvent(RtcCommonEventID.RTC_GRANT_DEVICE_PERMISSION);
                        Session.sessCallback(cbResult);
                    }
                },
                mediaState: function (medium, on) {
                    Mms.log("Mms " + (on ? "started" : "stopped") + " receiving our " + medium);
                },
                webrtcState: function (on) {
                    Mms.log("Mms says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
                    if (on) {
                        let cbResult = Session.createUiEvent(RtcCommonEventID.RTC_CONNECTION_STATUS_UP);
                        chCallback(handler, cbResult);
                    }
                    else {
                        let cbResult = Session.createUiEvent(RtcCommonEventID.RTC_CONNECTION_STATUS_DOWN);
                        chCallback(handler, cbResult);
                    }

                },
                onmessage: function (msg, jsep) {
                    Mms.debug("Recv message: ", msg);
                    Mms.debug("Recv message (publisher): ", msg);
                    if(isLocal)
                    {
                        instLive.onLocalMessage(handler,msg,jsep,chCallback);
                    }
                    else
                    {
                        instLive.onRemoteMessage(handler,msg,jsep,chCallback);
                    }

                },
                onlocalstream: function (stream) {
                    if(!isLocal)
                        return;
                    Mms.debug(stream);
                    let videoTracks = stream.getVideoTracks();
                    let audioTracks = stream.getAudioTracks();
                    let noAudioTrack = (audioTracks === null || audioTracks === undefined || audioTracks.length === 0);
                    let noVideoTrack = (videoTracks === null || videoTracks === undefined || videoTracks.length === 0);
                    if(noAudioTrack)
                    {
                        let cbResult1 = Session.createUiEvent(RtcLiveEventID.RTC_CHANNEL_LOCAL_NO_MICROPHONE);
                        chCallback(handler, cbResult1);
                    }
                    if(noVideoTrack)
                    {
                        let cbResult1 = Session.createUiEvent(RtcLiveEventID.RTC_CHANNEL_LOCAL_NO_CAMERA);
                        chCallback(handler, cbResult1);
                    }
                    let cbResult = Session.createUiEventWithObj(RtcLiveEventID.RTC_CHANNEL_LOCAL_STREAM_INCOMING, stream);
                    chCallback(handler, cbResult);
                },
                onremotestream: function (stream) {
                    if (isLocal)
                        return;
                    Mms.debug("Remote stream : " + stream);
                    let videoTracks = stream.getVideoTracks();
                    let audioTracks = stream.getAudioTracks();
                    let noAudioTrack = (audioTracks === null || audioTracks === undefined || audioTracks.length === 0);
                    let noVideoTrack = (videoTracks === null || videoTracks === undefined || videoTracks.length === 0);
                    if(noAudioTrack)
                    {
                        let cbResult1 = Session.createUiEvent(RtcLiveEventID.RTC_CHANNEL_REMOTE_NO_AUDIO_STREAM);
                        chCallback(handler, cbResult1);
                    }
                    if(noVideoTrack)
                    {
                        let cbResult1 = Session.createUiEvent(RtcLiveEventID.RTC_CHANNEL_REMOTE_NO_VIDEO_STREAM);
                        chCallback(handler, cbResult1);
                    }
                    let cbResult = Session.createUiEventWithObj(RtcLiveEventID.RTC_CHANNEL_REMOTE_STREAM_INCOMING, stream);
                    chCallback(handler, cbResult);
                    handler.stream = stream;
                },
                oncleanup: function () {
                    Mms.log("Recv cleanup notification");
                    let cbResult = Session.createUiEvent(RtcLiveEventID.RTC_CHANNEL_CLOSED);
                    chCallback(handler, cbResult);
                    removeMemberSubsHandler(memberId);
                }
            });

};
// Helper to parse query string
function getQueryStringValue(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    let regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function Live(session)
{
    if(session === null)
    {
        return;
    }

    this.memberMap  = new Map();
    this.localHandler = null;
    this.localCallback = null;
    let myid = null;
    let mypvtid = null;
    let mystream = null;
    let reqCtx = {};
    let cameraList = new Array(0);
    let micList = new Array(0);
    let speakerList = new Array(0);
    let curCameraId = null;
    Mms.listDevices(setCurCameraDevice);

    function setCurCameraDevice(devices){
        let cameraIndex = 0;
        devices.forEach(function(device) {
            if(device !== null && device !== undefined)
            {
                if(device.kind === 'audioinput') {
                    micList.push(device);
                } else if(device.kind === 'videoinput') {
                    cameraList.push(device);
                    curCameraId = device.deviceId;
                    cameraIndex++;
                } else if(device.kind === 'audiooutput') {
                    speakerList.push(device);
                }
            }
        });
    }

    function getNewCameraDeviceId() {
        if(cameraList=== null || cameraList === undefined || cameraList.length === 0)
        {
            Mms.error("camera devices not found");
            return undefined;
        }
        for(let camera of cameraList)
        {
            if(camera.deviceId !== curCameraId)
            {
                curCameraId = camera.deviceId;
                break;
            }
        }
        return curCameraId;

    }
    function getCurCameraDeviceId() {
        return curCameraId;
    }

    this.doSwitchCamera = function()
    {
        let body = { "audio": true, "video": true };
        Mms.debug("Sending message (" + JSON.stringify(body) + ")");
        instLive.localHandler.send({"message": body});
        Mms.debug("Trying a createOffer too (audio/video sendrecv)");
        videoProfile.deviceId = getNewCameraDeviceId();
        instLive.localHandler.createOffer(
            {
                // We provide a specific device ID for both audio and video
                media: {
                    video: videoProfile,
                    replaceVideo: true,	// This is only needed in case of a renegotiation
                    data: true,	// Let's negotiate data channels as well
                },
                // If you want to test simulcasting (Chrome and Firefox only), then
                // pass a ?simulcast=true when opening this demo page: it will turn
                // the following 'simulcast' property to pass to mms.js to true
                simulcast: doSimulcast,
                success: function(jsep) {
                    Mms.debug("Got SDP!");
                    Mms.debug(jsep);
                    instLive.localHandler.send({"message": body, "jsep": jsep});
                },
                error: function(error) {
                    Mms.error("WebRTC error:", error);
                    //bootbox.alert("WebRTC error... " + JSON.stringify(error));
                }
            });
    };

    this.getMyPrivateId = function(){
        return mypvtid;
    };

    this.setLocalHandler = function(handler, callback){
        this.localHandler = handler;
        this.localCallback = callback;
    };

    let doSimulcast = (getQueryStringValue("simulcast") === "yes" || getQueryStringValue("simulcast") === "true");
    let doSimulcast2 = (getQueryStringValue("simulcast2") === "yes" || getQueryStringValue("simulcast2") === "true");


    //roomId=0 表示离开当前的room
    this.doLeaveRoom = function(roomId) {
        if(roomId !== 0 && roomId !== liveRoomId)
        {
            Mms.error("doLeaveRoom roomId error !!!");
            return;
        }
        this.doUnpublishMe();
        this.doClearRemotes();

        let leaveRoom = { "request": "leave"};
        let reqId = this.localHandler.send({"message": leaveRoom});
        reqCtx[reqId] = leaveRoom;
        liveRoomId = 0;
    };

    this.doJoinRoom = function(roomId, myName) {
        let joinRoom = { "request": "join", "conf": roomId, "ptype": "publisher", "display": myName };
        let reqId = this.localHandler.send({"message": joinRoom});
        reqCtx[reqId] = joinRoom;
    };

    this.doSubscribe = function(handler, memberId, audio, video) {
        let mypvtid = instLive.getMyPrivateId();
        let subscribe = { "request": "join", "conf": liveRoomId, "ptype": "subscriber", "feed": memberId, "private_id": mypvtid };
        if(Mms.browser === "safari" &&
            (video === "vp9" || (video === "vp8" && !Mms.safariVp8))) {
            if(video)
                video = video.toUpperCase();
            toastr.warning("Publisher is using " + video + ", but Safari doesn't support it: disabling video");
            subscribe["offer_video"] = false;
        }
        handler.videoCodec = video;
        let reqId = handler.send({"message": subscribe});
        reqCtx[reqId] = subscribe;
    };

    this.doUnSubscribe = function(handler) {
        let unsub = { "request": "leave"};
        let reqId = handler.send({"message": unsub});
        reqCtx[reqId] = unsub;
    };


    this.doPublishMe = function(mediaType, captureProfile) {

        let publishAudio = false;
        let publishVideo = false;
        switch(mediaType)
        {
            case RtcMediaType.RTC_MEDIA_TYPE_AUDIO:
                publishAudio = true;
                publishVideo = false;
                break;
            case RtcMediaType.RTC_MEDIA_TYPE_VIDEO:
                publishAudio = false;
                publishVideo = true;
                break;
            case RtcMediaType.RTC_MEDIA_TYPE_AUDIO_VIDEO:
                publishAudio = true;
                publishVideo = true;
                break;
        }
        let handler = this.localHandler;
        let callback = this.localCallback;
        let reqId = null;
        let mediaProfile = { audioRecv: false, videoRecv: false,
            audioSend: publishAudio, videoSend: publishVideo };

        if(captureProfile !== null && captureProfile !== undefined)
        {
            videoProfile = {
                deviceId: {
                    exact: getCurCameraDeviceId()
                },
                height: {
                    ideal:captureProfile.width
                },
                width: {
                    ideal:captureProfile.height
                }
            };
            mediaProfile.video = videoProfile;
        }

        handler.createOffer(
            {
                // Add data:true here if you want to publish datachannels as well
                media: mediaProfile,
            	// Publishers are sendonly
                // If you want to test simulcasting (Chrome and Firefox only), then
                // pass a ?simulcast=true when opening this demo page: it will turn
                // the following 'simulcast' property to pass to mms.js to true
                simulcast: doSimulcast,
                simulcast2: doSimulcast2,
                success: function(jsep) {
                    Mms.debug("Recv publisher SDP!");
                    Mms.debug(jsep);
                    let publish = { "request": "configure", "audio": publishAudio, "video": publishAudio };
                    // You can force a specific codec to use when publishing by using the
                    // audiocodec and videocodec properties, for instance:
                    // 		publish["audiocodec"] = "opus"
                    // to force Opus as the audio codec to use, or:
                    // 		publish["videocodec"] = "vp9"
                    // to force VP9 as the videocodec to use. In both case, though, forcing
                    // a codec will only work if: (1) the codec is actually in the SDP (and
                    // so the browser supports it), and (2) the codec is in the list of
                    // allowed codecs in a conf. With respect to the point (2) above,
                    // refer to the text in service.conference.cfg for more details
                    reqId = handler.send({"message": publish, "jsep": jsep});
                    reqCtx[reqId] = publish;
                },
                error: function(error) {
                    Mms.error("WebRTC error:", error);
                    // if (publishAudio) {
                    //     instLive.doPublishMe(RtcMediaType.RTC_MEDIA_TYPE_VIDEO);
                    // } else {
                    //     let cbResult = Session.createUiError(RtcLiveEventID.RTC_CHANNEL_LOCAL_PUBLISH_FAILED, error);
                    //     callback(handler, cbResult);
                    // }
                    let cbResult = Session.createUiError(RtcLiveEventID.RTC_CHANNEL_LOCAL_PUBLISH_FAILED, error);
                    callback(handler, cbResult);
                }
            });
    };

    this.doUnpublishMe = function() {
        let unpublish = { "request": "unpublish" };
        this.localHandler.send({"message": unpublish});
        this.localHandler.hangup(false);
    };


    function notifyUserPublished(handle, msg, chCallback){
        let list = msg["publishers"];
        Mms.debug("Got a list of available publishers/feeds:");
        Mms.debug(list);
        for(let publisher of list) {
            let id = publisher["id"];
            let display = publisher["display"];
            let audio = publisher["audio_codec"];
            let video = publisher["video_codec"];
            Mms.debug("  >> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
            let memberInfo = publisher;
            if(!instLive.memberMap.has(id))
            {
                instLive.memberMap.set(id, memberInfo);
            }
            setMemberPublished(id);

            let cbResult = Session.createUiEventWithObj(RtcLiveEventID.RTC_CHANNEL_REMOTE_PUBLISHED, memberInfo);
            chCallback(handle, cbResult);
        }
    }

    function notifyLocalPublished(handler, msg, chCallback){
        let cbResult = Session.createUiEvent(RtcLiveEventID.RTC_CHANNEL_LOCAL_PUBLISHED);
        chCallback(handler, cbResult);
    }

    function notifyLocalLeft(handler, msg, chCallback){
        let cbResult = Session.createUiEvent(RtcLiveEventID.RTC_CHANNEL_LOCAL_LEFT_ROOM);
        chCallback(handler, cbResult);
    }

    function detachSubscribe(memberInfo)
    {
        let subsHandler = memberInfo.subsHandler;
        if(subsHandler !== null && subsHandler !== undefined)
        {
            subsHandler.detach();
            memberInfo.subsHandler = null;
        }
    }

    function notifyUserLeft(handler, msg, chCallback){
        let leaving = msg["leaving"];
        Mms.log("Publisher left: " + leaving);
        instLive.memberMap.forEach(function (value, key, map)
        {
            if(value!==null && value!==undefined && key === leaving)
            {
                setMemberUnPublished(key);
                detachSubscribe(value);
                let cbResult = Session.createUiEventWithObj(RtcLiveEventID.RTC_CHANNEL_REMOTE_LEFT, value);
                chCallback(handler, cbResult);
                instLive.memberMap.delete(key);
            }
        });
    }

    function notifyUserUnPublished(handler, msg, chCallback){
        let unpublished = msg["unpublished"];
        Mms.log("Publisher unpublished: " + unpublished);
        if(unpublished === 'ok') {
            // That's us
            let cbResult = Session.createUiEventWithObj(RtcLiveEventID.RTC_CHANNEL_LOCAL_UNPUBLISHED);
            chCallback(handler, cbResult);
            return;
        }
        if(!instLive.memberMap.has(unpublished))
            return;
        setMemberUnPublished(unpublished);
        let memberInfo = instLive.memberMap.get(unpublished);
        detachSubscribe(memberInfo);
        let cbResult = Session.createUiEventWithObj(RtcLiveEventID.RTC_CHANNEL_REMOTE_UNPUBLISHED, memberInfo);
        chCallback(handler, cbResult);
    }

    function clearRequestCtx(msg)
    {
        let reqId = msg["transaction"];
        let request = null;
        if (reqId !== undefined && reqId !== null) {
            request = reqCtx[reqId];
            if(request !== null && request !== undefined)
            {
                delete reqCtx[reqId];
            }
        }

    }

    function handleErrorMsg(handler, msg, chCallback){
        let reqId = msg["transaction"];
        let request = null;
        if (reqId !== undefined && reqId !== null) {
            request = reqCtx[reqId];
        }
        if(msg["error"] !== undefined && msg["error"] !== null) {
            Mms.error(msg["error"]);
            if (request !== null && request !== undefined) {
                let errReason = getRtcErrorFromServerReason(msg["error_code"], msg["error"]);
                let errObj = {request:request.request};
                let cbResult = Session.createUiErrorWithObj(RtcCommonEventID.RTC_API_REQUEST_FAILED,errReason, errObj);
                chCallback(handler, cbResult);
            }
            else {
                let cbResult = Session.createUiError(RtcLiveEventID.RTC_CHANNEL_NORMAL_ERROR);
                chCallback(handler, cbResult);
            }
            return true;
        }

        return false;
    }

    this.onLocalMessage = function(handler, msg, jssep, chCallback) {
        let event = msg["conference"];
        Mms.debug("Event: " + event);
        let isError = handleErrorMsg(handler, msg, chCallback);
        if (isError) {
            clearRequestCtx(msg);
            return;
        }
        if(event !== undefined && event != null) {
            if(event === "joined") {
                // Publisher/manager created, negotiate WebRTC and attach to existing feeds, if any
                myid = msg["id"];
                mypvtid = msg["private_id"];
                Mms.log("Successfully joined conf " + msg["conf"] + " with ID " + myid);
                liveRoomId = msg["conf"];
                let cbResult = Session.createUiEvent(RtcLiveEventID.RTC_CHANNEL_LOCAL_JOINED_ROOM);
                chCallback(handler, cbResult);
                notifyUserPublished(handler, msg, chCallback);
            } else if(event === "destroyed") {
                // The conf has been destroyed
                Mms.warn("The conf has been destroyed!");
                let cbResult = Session.createUiEvent(RtcLiveEventID.RTC_CHANNEL_ROOM_DESTROYED);
                chCallback(handler, cbResult);
            } else if(event === "event") {
                // Any new feed to attach to?
                if(msg["publishers"] !== undefined && msg["publishers"] !== null) {
                    notifyUserPublished(handler, msg, chCallback);
                } else if(msg["leaving"] !== undefined && msg["leaving"] !== null) {
                    if(msg["leaving"] === "ok")
                    {
                        notifyLocalLeft(handler, msg, chCallback);
                    }
                    else
                    {
                        notifyUserLeft(handler, msg, chCallback);
                    }
                } else if(msg["unpublished"] !== undefined && msg["unpublished"] !== null) {
                    notifyUserUnPublished(handler, msg, chCallback);
                } else if(msg["configured"] === "ok") {
                    notifyLocalPublished(handler, msg, chCallback);
                } else if(msg["error"] !== undefined && msg["error"] !== null) {
                    if(msg["error_code"] === 426) {
                        // This is a "no such conf" error: give a more meaningful description
                        let cbResult = Session.createUiError(RtcLiveEventID.RTC_CHANNEL_ROOM_NOT_EXIST);
                        chCallback(handler, cbResult);
                    } else {
                        let cbResult = Session.createUiError(RtcLiveEventID.RTC_CHANNEL_NORMAL_ERROR, msg["error"]);
                        chCallback(handler, cbResult);
                    }
                }
            }
        }

        if(jssep !== undefined && jssep !== null) {
            Mms.debug("Handling SDP as well...");
            Mms.debug(jssep);
            handler.handleRemoteJsep({jsep: jssep});
            // Check if any of the media we wanted to publish has
            // been rejected (e.g., wrong or unsupported codec)
            let audio = msg["audio_codec"];
            if(mystream && mystream.getAudioTracks() && mystream.getAudioTracks().length > 0 && !audio) {
                // Audio has been rejected
                toastr.warning("Our audio stream has been rejected, viewers won't hear us");
                let cbResult = Session.createUiEvent(RtcLiveEventID.RTC_CHANNEL_REMOTE_REJECT_AUDIO);
                chCallback(handler, cbResult);
            }
            let video = msg["video_codec"];
            if(mystream && mystream.getVideoTracks() && mystream.getVideoTracks().length > 0 && !video) {
                // Video has been rejected
                toastr.warning("Our video stream has been rejected, viewers won't see us");
                let cbResult = Session.createUiEvent(RtcLiveEventID.RTC_CHANNEL_REMOTE_REJECT_VIDEO);
                chCallback(handler, cbResult);
            }
        }

        clearRequestCtx(msg);
    };

    this.onRemoteMessage = function(handler, msg, jssep, chCallback)
    {
        Mms.debug("Recv message (subscriber): ", msg);
        let event = msg["conference"];
        Mms.debug("Event: " + event);
        let memberInfo = {};
        let isError = handleErrorMsg(handler, msg, chCallback);
        if(isError)
        {
            clearRequestCtx(msg);
            return;
        }

        if(event !== undefined && event != null) {
            if(event === "attached") {
                let memberId= msg["id"];
                if(this.memberMap.has(memberId))
                {
                    let memberInfo = this.memberMap.get(memberId);
                    let cbResult = Session.createUiEventWithObj(RtcLiveEventID.RTC_CHANNEL_SUBSCRIBE_SUCCESS, memberInfo);
                    chCallback(handler, cbResult);
                    handler.audioListening = true;
                    handler.videoListening = true;
                    let info = {audioListening: handler.audioListening, videoListening: handler.videoListening};
                    let cbResult1 = Session.createUiEventWithObj(RtcLiveEventID.RTC_CHANNEL_REMOTE_STREAM_LISTEN_NOTIFY, info);
                    chCallback(handler,cbResult1);
                }
                else
                {
                    Mms.warn("memberId ["+memberId+"] has left ");
                }
            } else if(event === "event") {

                if(msg["configured"] === "ok") {
                    let reqId = msg["transaction"];
                    let request = null;
                    if (reqId !== undefined && reqId !== null) {
                        request = reqCtx[reqId];
                        if(request !== null && request !== undefined)
                        {
                            handler.audioListening = request.audio;
                            handler.videoListening = request.video;
                            let info = {audioListening: handler.audioListening, videoListening: handler.videoListening};
                            let cbResult = Session.createUiEventWithObj(RtcLiveEventID.RTC_CHANNEL_REMOTE_STREAM_LISTEN_NOTIFY, info);
                            chCallback(handler,cbResult);
                        }
                    }
                }
                else
                {
                    // Check if we got an event on a simulcast-related event from this publisher
                    let substream = msg["substream"];
                    let temporal = msg["temporal"];
                    memberInfo["substream"]=substream;
                    memberInfo["temporal"]=temporal;
                    let cbResult = Session.createUiEventWithObj(RtcLiveEventID.RTC_CHANNEL_REMOTE_SUBSTREAM_EVENT, memberInfo);
                    chCallback(handler, cbResult);
                }

            } else {
                // What has just happened?
            }
        }
        if(jssep !== undefined && jssep !== null) {
            Mms.debug("Handling SDP as well...");
            Mms.debug(jssep);
            // Answer and attach
            handler.createAnswer(
                {
                    jsep: jssep,
                    // Add data:true here if you want to subscribe to datachannels as well
                    // (obviously only works if the publisher offered them in the first place)
                    media: { audioSend: false, videoSend: false },	// We want recvonly audio/video
                    success: function(jsep) {
                        Mms.debug("Got SDP!");
                        Mms.debug(jsep);
                        let body = { "request": "start", "conf": liveRoomId };
                        handler.send({"message": body, "jsep": jsep});
                    },
                    error: function(error) {
                        Mms.error("WebRTC error:", error);
                       // bootbox.alert("WebRTC error... " + JSON.stringify(error));
                    }
                });
        }
        clearRequestCtx(msg);
    };

    this.doMuteLocalMedia = function(mediaType, mute){
        let success = false;
        switch(mediaType)
        {
            case RtcMediaType.RTC_MEDIA_TYPE_AUDIO:
                if(mute)
                {
                    success = this.localHandler.muteAudio();
                }
                else
                {
                    success = this.localHandler.unmuteAudio();
                }
                break;
            case RtcMediaType.RTC_MEDIA_TYPE_VIDEO:
                if(mute)
                {
                    success = this.localHandler.muteVideo();
                }
                else
                {
                    success = this.localHandler.unmuteVideo();
                }
                break;
            default:
                break;
        }
        return success;
    };

    this.doListenRemoteMedia = function(handler, mediaType, listen){
        let success  = false;
        let body = null;

        if(mediaType === RtcMediaType.RTC_MEDIA_TYPE_AUDIO)
        {
            let stream = handler.stream;
            let audioTracks = stream.getAudioTracks();
            if(audioTracks === null || audioTracks === undefined)
            {
                Mms.warn("no audio tracks!!");
                return false;
            }
            if(!listen && audioTracks[0].enabled)
            {
                audioTracks[0].enabled = false;
                success = true;
            }
            else if(listen && !audioTracks[0].enabled)
            {
                audioTracks[0].enabled = true;
                success = true;
            }
        }
        else if(mediaType === RtcMediaType.RTC_MEDIA_TYPE_VIDEO)
        {
            let stream = handler.stream;
            let videoTracks = stream.getVideoTracks();
            if(videoTracks === null || videoTracks === undefined)
            {
                Mms.warn("no video tracks!!");
                return false;
            }
            if(!listen && videoTracks[0].enabled)
            {
                videoTracks[0].enabled = false;
                success = true;
            }
            else if(listen && !videoTracks[0].enabled)
            {
                videoTracks[0].enabled = true;
                success = true;
            }
        }

        if(success)
        {
            switch(mediaType)
            {
                case RtcMediaType.RTC_MEDIA_TYPE_AUDIO:
                    body = {request:"configure", audio:listen, video: handler.videoListening};
                    break;
                case RtcMediaType.RTC_MEDIA_TYPE_VIDEO:
                    body = {request:"configure", audio:handler.audioListening, video: listen};
                    break;
                default:
                    break;
            }
            let reqId = handler.send({"message": body});
            reqCtx[reqId] = body;
        }
        return success;
    };

    this.doHangup= function(){
        // Hangup a call
        let hangup = { "request": "hangup" };
        instLive.localHandler.send({"message": hangup});
        instLive.localHandler.hangup();
    };

    this.doClose = function(handler){
        handler.detach();
    };

    this.doClearRemotes = function() {
        if(this.memberMap !== null && this.memberMap !== undefined)
        {
            this.memberMap.forEach(function (value, key, map)
            {
                if(value!==null && value!==undefined)
                {
                    detachSubscribe(value);
                }
            });
            this.memberMap.clear();
        }
    };

    this.doDestroy = function(){

        this.doClearRemotes();
        delete this.memberMap;
        this.memberMap = null;
        this.localHandler.detach();
        instLive = null;
    }
}



