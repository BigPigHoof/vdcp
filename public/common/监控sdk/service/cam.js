let opaqueId = "sipSvc-"+ Mms.randomString(12);
let registered = false;
let instCam = null;
let globSN = 0;
let globCseq = 0;

const CallServType =
    {
        ServNone:           "",
        ServPlay:           "Play",
        ServPlayback:       "Playback"
    };

const PtzCtrlBitPos =
    {
        PAN_RIGHT: 0,
        PAN_LEFT: 1,

        TILT_DOWN: 2,
        TILT_UP: 3,

        ZOOM_IN: 4,
        ZOOM_OUT: 5
    };


function checkCamInvalid(){
    if(instCam === null || instCam.chMap === null)
    {
        let cbResult = Session.createUiError(RtcCommonEventID.RTC_API_REQUEST_FAILED,
                                            RtcEventReason.RTC_REASON_WEB_SESSION_CLOSED);
        Session.sessCallback(cbResult);
        return true;
    }
    return false;
}

Cam.init = function(session){
    if(instCam !== null) {
        return;
    }
    instCam = new Cam(session);
    session.registerService(instCam);
};

Cam.login =  function(userName, password){
    if(checkCamInvalid()) return;
    let info={ userName:userName,password:password};
    instCam.doRegister(info);
};

Cam.logout =  function(){
    if(checkCamInvalid()) return;
    instCam.doUnregister();
};

Cam.makeCall = function(handler, calleeName, mediaType){
    if(checkCamInvalid()) return;
    instCam.doMakeCall(handler, calleeName, mediaType);
};

Cam.answerCall =  function(handler, mediaType){
    if(checkCamInvalid()) return;
    instCam.doAnswerCall(handler, mediaType);
};

Cam.rejectCall =  function(handler){
    if(checkCamInvalid()) return;
    instCam.doRejectCall(handler);
};

Cam.closeCall =  function(handler){
    if(checkCamInvalid()) return;
    instCam.doHangupCall(handler);
};

Cam.ptzControl = function(handler, userName, control){
    if(checkCamInvalid()) return;
    instCam.doPtzControl(handler, userName, control);
};

Cam.listenRemoteMedia = function(handler,mediaType,listen){
    if(checkCamInvalid()) return;
    instCam.doListenRemoteMedia(handler,mediaType,listen);
};

Cam.isRemoteMediaListened = function(handler, mediaType){
    if(checkCamInvalid()) return false;
    return instCam.isRemoteMediaListened(handler, mediaType);
};

Cam.muteLocalMedia = function(mediaType, mute){
    if(checkCamInvalid()) return;
    instCam.doMuteLocalMedia(mediaType,mute);
};

Cam.isLocalMediaMuted = function(mediaType){
    if(checkCamInvalid()) return false;
    return instCam.isLocalMediaMuted(mediaType);
};


Cam.playbackControl = function(handler,control){
    if(checkCamInvalid()) return;
    return instCam.doPlaybackControl(handler,control);
};


Cam.destroyChannel = function(handler, isLocal){

    if(checkCamInvalid()) return;
    if(isLocal)
    {
        instCam.doHangup();
    }
    else if(handler)
    {
        instCam.doClose(handler);
    }

};

Cam.createChannel = function(userName, isLocal, info, chCallback) {

        if(checkCamInvalid()) return;

        chCallback = (chCallback !== null)?chCallback:function(){};
        if (instCam.chMap.has(userName)) {
            let cbResult = Session.createUiError(RtcCamEventID.RTC_CHANNEL_BUILD_FAILED,
                                                RtcEventReason.RTC_REASON_USER_REOPENED);
            Session.sessCallback(cbResult);
            return;
        }
        let handler = null;
        let callInfo = info;
        mms.attach(
            {
                service: "service.sip",
                opaqueId: opaqueId,
                success: function (serviceHandle) {
                    handler = serviceHandle;
                    handler.isAccepted = false;
                    handler.chCallback = chCallback;
                    handler.isLocal = isLocal;
                    Mms.log("Service attached! (" + handler.getService() + ", id=" + handler.getId() + ")");
                    if (isLocal) {
                        //本地connection申请成功后先注册帐号
                        instCam.setLocalHandler(handler, chCallback);
                        //registered = true;
                        //暂时先在注册成功后，返回UI事件告知服务申请成功
                        let serviceType = RtcServiceType.RTC_SERVICE_TYPE_CAM;
                        let cbResult = Session.createUiEventWithObj(RtcCommonEventID.RTC_SERVICE_APPLY_SUCCESS, serviceType);
                        Session.sessCallback(cbResult);
                    }
                    else {
                        instCam.chMap.set(userName, handler);
                        let obj = {userName: userName};
                        handler.userName = userName;
                        let cbResult = Session.createUiEventWithObj(RtcCamEventID.RTC_CHANNEL_BUILD_SUCCESS, obj);
                        chCallback(handler, cbResult);
                        instCam.doCall(handler, userName, callInfo, chCallback);
                    }
                },
                error: function (error) {
                    Mms.error("  -- Error attaching service...", error);
                    if (!isLocal) {
                        let cbResult = Session.createUiError(RtcCamEventID.RTC_CHANNEL_BUILD_FAILED,
                            RtcEventReason.RTC_REASON_WEB_SESSION_CLOSED);
                        Session.sessCallback(cbResult);
                    }
                    else
                    {
                        let cbResult = Session.createUiError(RtcCommonEventID.RTC_SERVICE_APPLY_FAILED,
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
                    // Any error?
                    let error = msg["error"];
                    if (error != null && error !== undefined) {
                        if (!registered) {
                            if(error.indexOf("already registered")>0)
                            {
                                let cbResult = Session.createUiError(RtcCamEventID.RTC_CHANNEL_LOGIN_FAILED, RtcEventReason.RTC_REASON_ALREADY_REGISTERED);
                                chCallback(handler,cbResult);
                            }
                            else
                            {
                                let cbResult = Session.createUiError(RtcCommonEventID.RTC_NORMAL_ERROR, error);
                                chCallback(handler,cbResult);
                            }

                        } else {
                            // Reset status
                            let cbResult = Session.createUiError(RtcCamEventID.RTC_CHANNEL_NORMAL_ERROR, error);
                            chCallback(handler, cbResult);
                        }
                        return;
                    }
                    let result = msg;
                    if (result !== null && result !== undefined && result["sip"] !== undefined && result["sip"] !== null) {
                        let event = result["sip"];
                        switch(event)
                        {
                            case "registration_failed":
                            {
                                Mms.warn("Registration failed: " + result["code"] + " " + result["reason"]);
                                registered = false;
                                if(handler.isCallPeerCreated)
                                {
                                    instCam.doHangupCall(handler);
                                }
                                let cbResult = Session.createUiEvent(RtcCamEventID.RTC_CHANNEL_LOGIN_FAILED);
                                chCallback(handler, cbResult);

                            }
                                break;
                            case "registered":
                            {
                                //Mms.log("Register Success!");
                                Mms.log("Successfully registered as " + result["user_id"] + "!");
                                registered = true;
                                instCam.localUserName = result["user_id"];
                                let cbResult = Session.createUiEvent(RtcCamEventID.RTC_CHANNEL_LOGIN_SUCCESS);
                                chCallback(handler, cbResult);
                            }
                                break;
                            case "unregistered":
                            {
                                Mms.log("Successfully unregistered ");
                                registered = false;
                                instCam.localUserName = "";
                                if(handler.isCallPeerCreated)
                                {
                                    instCam.doHangupCall(handler);
                                }
                                let cbResult = Session.createUiEvent(RtcCamEventID.RTC_CHANNEL_LOGOUT_SUCCESS);
                                chCallback(handler, cbResult);

                            }
                                break;
                            case "incomingcall":
                            {
                                Mms.log("Incoming call from " + result["peer"] + "!");
                                handler.incomingCall = {};
                                if(jsep !== null && jsep !== undefined) {
                                    let hasAudio = (jsep.sdp.indexOf("m=audio ") > -1);
                                    let hasVideo = (jsep.sdp.indexOf("m=video ") > -1);
                                    let mediaType = (hasAudio && hasVideo)?
                                        RtcMediaType.RTC_MEDIA_TYPE_AUDIO_VIDEO:
                                        (hasAudio?RtcMediaType.RTC_MEDIA_TYPE_AUDIO:
                                            (hasVideo?RtcMediaType.RTC_MEDIA_TYPE_VIDEO:RtcMediaType.RTC_MEDIA_TYPE_NULL));

                                    handler.incomingCall.jsep = jsep;
                                    handler.incomingCall.hasAudio = hasAudio;
                                    handler.incomingCall.hasVideo = hasVideo;
                                    handler.incomingCall.callerId = result.peer;
                                    let callInfo = {peerName: result.peer, mediaType:mediaType};
                                    let cbResult = Session.createUiEventWithObj(RtcCamEventID.RTC_CHANNEL_CALL_INCOMING, callInfo);
                                    chCallback(handler, cbResult);
                                }
                            }
                                break;
                            case "calling":
                            {
                                Mms.log("Waiting for the peer to answer...");
                                if(isLocal)
                                {
                                    let cbResult = Session.createUiEventWithObj(RtcCamEventID.RTC_CHANNEL_CALL_OUTGOING);
                                    chCallback(handler, cbResult);
                                }
                                else
                                {
                                    let cbResult = Session.createUiEvent(RtcCamEventID.RTC_CHANNEL_REMOTE_OUTGOING);
                                    chCallback(handler, cbResult);
                                }

                            }
                                break;
                            case "accepting":
                            {
                                // Response to an offerless INVITE, let's wait for an 'accepted'
                                if(isLocal)
                                {
                                    let cbResult = Session.createUiEvent(RtcCamEventID.RTC_CHANNEL_CALL_ACCEPTING);
                                    chCallback(handler, cbResult);
                                }
                                else
                                {
                                    let cbResult = Session.createUiEvent(RtcCamEventID.RTC_CHANNEL_REMOTE_ACCEPTING);
                                    chCallback(handler, cbResult);
                                }
                            }
                                break;
                            case "progress":
                            {
                                Mms.log("There's early media from " + result["peer"] + ", wairing for the call!");
                                Mms.log(jsep);
                                // Call can start already: handle the remote answer
                                if (jsep !== null && jsep !== undefined) {
                                    handler.handleRemoteJsep({
                                        jsep: jsep, error: function () {
                                            instCam.doHangupCall(handler);
                                        }
                                    });
                                }
                                //toastr.info("Early media...");
                            }
                                break;
                            case "accepted":
                            {
                                Mms.log(result["peer"] + " accepted the call!");
                                Mms.log(jsep);
                                handler.isAccepted = true;
                                // Call can start, now: handle the remote answer
                                if (jsep !== null && jsep !== undefined) {
                                    handler.handleRemoteJsep({
                                        jsep: jsep, error: function () {
                                            instCam.doHangupCall(handler);
                                        }
                                    });
                                }
                                if(isLocal)
                                {
                                    let callInfo = {peerName:result.peer};
                                    let cbResult = Session.createUiEventWithObj(RtcCamEventID.RTC_CHANNEL_CALL_ACCEPTED,callInfo);
                                    chCallback(handler, cbResult);
                                }
                                else
                                {
                                    let cbResult = Session.createUiEvent(RtcCamEventID.RTC_CHANNEL_REMOTE_ACCEPTED);
                                    chCallback(handler, cbResult);
                                }


                            }
                                break;
                            case "updatingcall":
                            {
                                // We got a re-INVITE: while we may prompt the user (e.g.,
                                // to notify about media changes), to keep things simple
                                // we just accept the update and send an answer right away
                                Mms.log("Got re-INVITE");
                                var doAudio = (jsep.sdp.indexOf("m=audio ") > -1),
                                    doVideo = (jsep.sdp.indexOf("m=video ") > -1);
                                handler.createAnswer(
                                    {
                                        jsep: jsep,
                                        media: {audio: doAudio, video: doVideo},
                                        success: function (jsep) {
                                            Mms.debug("Got SDP " + jsep.type + "! audio=" + doAudio + ", video=" + doVideo);
                                            Mms.debug(jsep);
                                            let body = {request: "update"};
                                            handler.send({"message": body, "jsep": jsep});
                                        },
                                        error: function (error) {
                                            Mms.error("WebRTC error:", error);
                                            let cbResult = Session.createUiError(RtcCommonEventID.RTC_NORMAL_ERROR, error);
                                            chCallback(handler, cbResult);
                                        }
                                    });
                            }
                                break;
                            case "hangup":
                            {
                                Mms.log("Call hung up (" + result["code"] + " " + result["reason"] + ")!");
                                // Response to an offerless INVITE, let's wait for an 'accepted'
                                let callInfo = {peerName:result["peer"]};
                                if (handler.isAccepted) {
                                    let cbResult = Session.createUiEventWithObj(isLocal?RtcCamEventID.RTC_CHANNEL_CALL_DISCONNECT:RtcCamEventID.RTC_CHANNEL_REMOTE_DISCONNECT, callInfo);
                                    chCallback(handler, cbResult);
                                    handler.isAccepted = false;
                                }
                                else {
                                    let cbResult = Session.createUiEventWithObj(isLocal?RtcCamEventID.RTC_CHANNEL_CALL_FAIL:RtcCamEventID.RTC_CHANNEL_REMOTE_CONNECT_FAIL, callInfo);
                                    chCallback(handler, cbResult);
                                }
                                // Reset status
                                handler.hangup();
                                handler.isCallPeerCreated = false;

                            }
                                break;

                        }

                    }
                },
                onlocalstream: function (stream) {
                    Mms.log("SERVICE_SIP_CAMERA_STREAM: no need to rendor local video");
                    if(!isLocal)
                        return;
                    Mms.debug(stream);
                    let videoTracks = stream.getVideoTracks();
                    let audioTracks = stream.getAudioTracks();
                    let noAudioTrack = (audioTracks === null || audioTracks === undefined || audioTracks.length === 0);
                    let noVideoTrack = (videoTracks === null || videoTracks === undefined || videoTracks.length === 0);
                    if(noAudioTrack)
                    {
                        let cbResult1 = Session.createUiEvent(RtcCamEventID.RTC_CHANNEL_LOCAL_NO_MICROPHONE);
                        chCallback(handler, cbResult1);
                    }
                    if(noVideoTrack)
                    {
                        let cbResult1 = Session.createUiEvent(RtcCamEventID.RTC_CHANNEL_LOCAL_NO_CAMERA);
                        chCallback(handler, cbResult1);
                    }
                    let cbResult = Session.createUiEventWithObj(RtcCamEventID.RTC_CHANNEL_LOCAL_STREAM_INCOMING, stream);
                    chCallback(handler, cbResult);
                },
                onremotestream: function (stream) {
                    Mms.debug("Remote stream : " + stream);
                    let videoTracks = stream.getVideoTracks();
                    let audioTracks = stream.getAudioTracks();
                    let noAudioTrack = (audioTracks === null || audioTracks === undefined || audioTracks.length === 0);
                    let noVideoTrack = (videoTracks === null || videoTracks === undefined || videoTracks.length === 0);
                    if(noAudioTrack)
                    {
                        let cbResult1 = Session.createUiEvent(RtcCamEventID.RTC_CHANNEL_REMOTE_STREAM_NO_AUDIO);
                        chCallback(handler, cbResult1);
                    }
                    if(noVideoTrack)
                    {
                        Mms.debug("noVideoTrack!!!");
                        let cbResult1 = Session.createUiEvent(RtcCamEventID.RTC_CHANNEL_REMOTE_STREAM_NO_VIDEO);
                        chCallback(handler, cbResult1);
                    }
                    let cbResult = Session.createUiEventWithObj(RtcCamEventID.RTC_CHANNEL_REMOTE_STREAM_INCOMING, stream);
                    chCallback(handler, cbResult);
                    handler.stream = stream;
                },
                oncleanup: function () {
                    Mms.log("Recv cleanup notification");
                    let cbResult = Session.createUiEvent(RtcCamEventID.RTC_CHANNEL_CLOSED);
                    chCallback(handler, cbResult);
                    if(!isLocal)
                    {
                        instCam.chMap.delete(userName);
                    }
                }
            });

};

function Cam(session)
{
    if(session === null)
    {
        return;
    }
    this.chMap= new Map();
    this.localUserName = "";
    this.localHandler = null;
    this.localCallback = null;

    this.setLocalHandler = function(handler, callback){
        this.localHandler = handler;
        this.localCallback = callback;
    };

    // this.getSipUserFullName = function(userName) {
    //     if(this.sipServer==null)
    //     {
    //         return null;
    //     }
    //     return "sip:"+userName+"@"+this.sipServer.ip;
    // };


    this.doRegister = function(para) {

        let info={ userName:"",password:""};
        if(para!=null)
            info=para;

        //let username = this.getSipUserFullName(info.userName);
        let username = info.userName;
        let password = info.password;
        if(password === "") {
            Mms.error("Error , register need password !!!");
            return;
        }
        let register = {
            "request" : "register",
            "user_id" : username
        };
        register["secret"] = password;
        console.log("register string:"+ register.toString());
        this.localHandler.send({"message": register});
    };

    this.doUnregister = function() {

        let unregister = {
            "request" : "unregister",
        };
        console.log("unregister string:"+ unregister.toString());
        this.localHandler.send({"message": unregister});
    };

    this.doMakeCall = function(handler, calleeName, mediaType) {
        navigator.mediaDevices.enumerateDevices().then(function(devices) {
        let audioExist = devices.some(function(device) {
            return device.kind === 'audioinput';
        });
        let videoExist = devices.some(function(device) {
            return device.kind === 'videoinput';
        });
        let isAudioCall =  (mediaType === RtcMediaType.RTC_MEDIA_TYPE_AUDIO)
            || (mediaType ===  RtcMediaType.RTC_MEDIA_TYPE_AUDIO_VIDEO);
        let isVideoCall =  (mediaType === RtcMediaType.RTC_MEDIA_TYPE_VIDEO)
            || (mediaType === RtcMediaType.RTC_MEDIA_TYPE_AUDIO_VIDEO);

        let audioSend, audioRecv, videoSend, videoRecv;
        audioSend = (isAudioCall && audioExist);
        audioRecv = isAudioCall;
        videoSend = (isVideoCall && videoExist);
        videoRecv = isVideoCall;
        if(!audioExist)
        {
            let cbResult= Session.createUiEvent(RtcCamEventID.RTC_CHANNEL_LOCAL_NO_MICROPHONE);
            instCam.localCallback(handler, cbResult);
        }
        if(!videoExist)
        {
            let cbResult= Session.createUiEvent(RtcCamEventID.RTC_CHANNEL_LOCAL_NO_CAMERA);
            instCam.localCallback(handler, cbResult);
        }
        makeCall(handler, calleeName, audioSend, audioRecv, videoSend, videoRecv);
    }).catch(function(error) {
        let cbResult= Session.createUiError(RtcCamEventID.RTC_CHANNEL_LOCAL_NO_MEDIA_DEVICES, error);
        instCam.localCallback(handler, cbResult);
    });
    };

    function makeCall(handler, calleeName, audioSend, audioRecv, videoSend, videoRecv) {

        if(handler.isCallPeerCreated)
        {
            let cbResult= Session.createUiEvent(RtcCamEventID.RTC_CHANNEL_CALL_BUSY);
            instCam.localCallback(handler, cbResult);
            return;
        }
        handler.isCallPeerCreated = true;
        handler.createOffer(
            {
                media: {
                    audioSend: audioSend, audioRecv: audioRecv,		// We DO want audio
                    videoSend: videoSend, videoRecv: videoRecv	   // We MAY want video
                },
                success: function(jsep) {
                    Mms.debug("Got SDP!");
                    Mms.debug(jsep);
                    let body = { request: "call", callee: calleeName };
                    handler.send({"message": body, "jsep": jsep});
                },
                error: function(error) {
                    Mms.log("rtc_error:"+error);
                    let cbResult= Session.createUiError(RtcCamEventID.RTC_CHANNEL_NORMAL_ERROR, error);
                    instCam.localCallback(handler, cbResult);
                }
            });
    }

    this.doAnswerCall = function(handler, mediaType) {
        let incomingCall = handler.incomingCall;
        if( incomingCall === null ||
            incomingCall.jsep=== null ||
            incomingCall.jsep=== undefined)
        {
            Mms.error("Incoming call has no sdp info !!!");
            return;
        }

        navigator.mediaDevices.enumerateDevices().then(function(devices) {
            let audioExist = devices.some(function(device) {
                return device.kind === 'audioinput';
            });
            let videoExist = devices.some(function(device) {
                return device.kind === 'videoinput';
            });


            let isAudioCall = false;
            let isVideoCall = false;
            switch(mediaType)
            {
                case RtcMediaType.RTC_MEDIA_TYPE_AUDIO:
                    isAudioCall = incomingCall.hasAudio;
                    break;
                case RtcMediaType.RTC_MEDIA_TYPE_VIDEO:
                    isVideoCall = incomingCall.hasVideo;
                    break;
                case RtcMediaType.RTC_MEDIA_TYPE_AUDIO_VIDEO:
                    isAudioCall = incomingCall.hasAudio;
                    isVideoCall = incomingCall.hasVideo;
                    break;
            }

            let audioSend, audioRecv, videoSend, videoRecv;
            audioSend = (isAudioCall && audioExist);
            audioRecv = isAudioCall;
            videoSend = (isVideoCall && videoExist);
            videoRecv = isVideoCall;
            if(!audioExist)
            {
                let cbResult= Session.createUiEvent(RtcCamEventID.RTC_CHANNEL_LOCAL_NO_MICROPHONE);
                instCam.localCallback(handler, cbResult);
            }
            if(!videoExist)
            {
                let cbResult= Session.createUiEvent(RtcCamEventID.RTC_CHANNEL_LOCAL_NO_CAMERA);
                instCam.localCallback(handler, cbResult);
            }
            answerCall(handler, audioSend, audioRecv,videoSend,videoRecv);
        }).catch(function(error) {
            let cbResult= Session.createUiError(RtcCamEventID.RTC_CHANNEL_LOCAL_NO_MEDIA_DEVICES, error);
            instCam.localCallback(handler, cbResult);
        });
    };


    function answerCall(handler, audioSend, audioRecv,videoSend,videoRecv){
        let incomingCall = handler.incomingCall;
        if(handler.isCallPeerCreated)
        {
            let cbResult= Session.createUiEvent(RtcCamEventID.RTC_CHANNEL_CALL_BUSY);
            instCam.localCallback(handler, cbResult);
            return;
        }
        handler.isCallPeerCreated = true;
        handler.createAnswer(
            {
                jsep: incomingCall.jsep,
                media: {
                    // audioSend: audioSend, audioRecv: audioRecv,		// We DO want audio
                    // videoSend: videoSend, videoRecv: videoRecv	   // We MAY want video
                   audio: audioRecv, video: videoRecv
                },
                success: function(jsep) {
                    Mms.debug(jsep);
                    let body = { request: "accept" };
                    handler.send({"message": body, "jsep": jsep});
                },
                error: function(error) {
                    Mms.error("WebRTC error:", error);
                    let body = { "request": "decline", "code": 480 };
                    handler.send({"message": body});
                }
            });

    };

    this.doRejectCall = function(handler){
        let body = { "request": "decline" };
        handler.send({"message": body});
    };

/**
 * {
 *     视频编码统一采用H.264
 *
 *      mediaQuality:
 *      {
 *          video:
 *          {
 *              quality:  RtcVideoQuality  QCIF/CIF/4CIF/D1/720P/720P_HQ/1080P/1080P_HQ/1080P_SHQ
 *
 *                  QCIF      (176x144)  码率(288kbps)       sdp_f: v/2/1/x/y/288 a///
 *                  CIF       (352x288)  码率(576kbps)       sdp_f: v/2/2/x/y/576 a///
 *                  4CIF      (704x576)  码率(1088kbps)      sdp_f: v/2/3/x/y/1088 a///
 *                  D1        (720x576)  码率(1088kbps)      sdp_f: v/2/4/x/y/1088 a///
 *
 *                  720P      (1280x720) 码率(2496kbps)      sdp_f: v/2/5/x/y/2496 a///
 *                  720P_HQ   (1280x720) 码率(3072kbps)      sdp_f: v/2/5/x/y/3072 a///
 *
 *                  1080P     (1920x1080) 码率(4992kbps)     sdp_f: v/2/6/x/y/4992 a///
 *                  1080P_HQ  (1920x1080) 码率(7552kbps)     sdp_f: v/2/6/x/y/7552 a///
 *                  1080P_SHQ (1920x1080) 码率(20000kbps)    sdp_f: v/2/6/x/y/20000 a///
 *
 *
 *              frameRate: (0~99)       对应上面 sdp_f中的x
 *
 *              bitRateType: RtcVideoBitRateType.Constant/Variable:
 *                 Constant: 固定码率， Variable: 可变码率
 *          }
 *
 *
 *          audio:
 *          {
 *              quality: RtcAudioQuality HQ_HBR/HQ_MBR/MQ_MBR1/MQ_MBR2/LQ_LBR/LQ_LBR1/LQ_LBR2
 *
 *                  HQ_HBR：    G711    码率(64kbps) 采样率(8kHz)        sdp_f: v///// a/1/8/1     高质量高码率
 *                  HQ_MBR:     G722.1  码率(48kbps) 采样率(32kHz)       sdp_f: v///// a/4/7/4     较高质量较高码率
 *                  MQ_MBR1:      G722.1  码率(32kbps) 采样率(16kHz)      sdp_f: v///// a/4/6/3    中等质量中等码率
 *                  MQ_MBR2：     G722.1  码率(16kbps)  采样率(8kHz)      sdp_f: v///// a/4/4/1    中等质量较低码率
 *                  LQ_LBR:      G729    码率(8kbps)   采样率(8kHz)      sdp_f: v///// a/3/3/1     低质量低码率
 *                  LQ_LBR1:     G723.1  码率(6.3kbps) 采样率(8kHz)     sdp_f: v///// a/2/2/2      低质量很低码率
 *                  LQ_LBR2:     G723.1  码率(5.3kbps) 采样率(8kHz)     sdp_f: v///// a/2/1/2      低质量超低码率
 *          }
 * }
 */
    function encodeSdpFline(callInfo)
    {
        let mediaType = callInfo.mediaType;
        let mediaQuality = callInfo.detailInfo.mediaQuality;
        let videoQuality = mediaQuality.video.quality;
        let frameRate = mediaQuality.video.frameRate;
        let bitrateType = mediaQuality.video.bitRateType;
        let audioQuality = mediaQuality.audio.quality;
        let middlePart = frameRate+'/'+ ((bitrateType===RtcVideoBitrateType.RTC_VIDEO_BITRATE_TYPE_CONSTANT)?1:2);
        let sdp_f_v = null;
        let sdp_f_a = null;
        if(mediaType === RtcMediaType.RTC_MEDIA_TYPE_VIDEO || mediaType === RtcMediaType.RTC_MEDIA_TYPE_AUDIO_VIDEO)
        {
            switch(videoQuality)
            {
                case RtcVideoQuality.RTC_VIDEO_QUALITY_QCIF:
                    sdp_f_v = 'v/2/1/xy/288 a///';
                    break;
                case RtcVideoQuality.RTC_VIDEO_QUALITY_CIF:
                    sdp_f_v = 'v/2/2/xy/576 a///';
                    break;
                case RtcVideoQuality.RTC_VIDEO_QUALITY_4CIF:
                    sdp_f_v = 'v/2/3/xy/1088 a///';
                    break;
                case RtcVideoQuality.RTC_VIDEO_QUALITY_D1:
                    sdp_f_v = 'v/2/4/xy/1088 a///';
                    break;
                case RtcVideoQuality.RTC_VIDEO_QUALITY_720P:
                    sdp_f_v = 'v/2/5/xy/2496 a///';
                    break;
                case RtcVideoQuality.RTC_VIDEO_QUALITY_720P_HQ:
                    sdp_f_v = 'v/2/5/xy/3072 a///';
                    break;
                case RtcVideoQuality.RTC_VIDEO_QUALITY_1080P:
                    sdp_f_v = 'v/2/6/xy/4992 a///';
                    break;
                case RtcVideoQuality.RTC_VIDEO_QUALITY_1080P_HQ:
                    sdp_f_v = 'v/2/6/xy/7552 a///';
                    break;
                case RtcVideoQuality.RTC_VIDEO_QUALITY_1080P_SHQ:
                    sdp_f_v = 'v/2/6/xy/20000 a///';
                    break;
            }
            sdp_f_v= sdp_f_v.replace(/xy/,middlePart);
        }
        if(mediaType === RtcMediaType.RTC_MEDIA_TYPE_AUDIO || mediaType === RtcMediaType.RTC_MEDIA_TYPE_AUDIO_VIDEO) {
            switch (audioQuality) {
                case RtcAudioQuality.RTC_AUDIO_QUALITY_HQ_HBR:
                    sdp_f_a = 'v///// a/1/8/1';
                    break;
                case RtcAudioQuality.RTC_AUDIO_QUALITY_HQ_MBR:
                    sdp_f_a = 'v///// a/4/7/4';
                    break;
                case RtcAudioQuality.RTC_AUDIO_QUALITY_MQ_MBR1:
                    sdp_f_a = 'v///// a/4/6/3';
                    break;
                case RtcAudioQuality.RTC_AUDIO_QUALITY_MQ_MBR2:
                    sdp_f_a = 'v///// a/4/4/1';
                    break;
                case RtcAudioQuality.RTC_AUDIO_QUALITY_LQ_LBR:
                    sdp_f_a = 'v///// a/3/3/1';
                    break;
                case RtcAudioQuality.RTC_AUDIO_QUALITY_LQ_LBR1:
                    sdp_f_a = 'v///// a/2/2/2';
                    break;
                case RtcAudioQuality.RTC_AUDIO_QUALITY_LQ_LBR2:
                    sdp_f_a = 'v///// a/2/1/2';
                    break;
            }
        }
        return {sdp_f_v:sdp_f_v, sdp_f_a:sdp_f_a};

    }
    /**
     *  playInfo:
     *  {
     *      [for SIP Header]
     *
     *      streamSN:           {String}  录制媒体流序列号 （实际上应该是录制媒体文件ID， 总长度不超过20位的字符串，以"1" 开头）
     *      --- receiverStreamSN:   {String}  接收端媒体流序列号 (接收窗口的handler)
     *
     *      [for SDP]
     *
     *      fileUri:            {String}  sdp u行，简洁方式： 摄像头ID+参数(序号)； 普通方式： http://存储设备ID/文件夹/../文件 （见 GBT28281 Page 41  附录F ， 详见IETF RFC 4566-2006 5.5）
     *
     *      startTime:          {Number}  sdp t行  回放起始时间 (t行) （见 GBT28281 Page 41 ，详见 IETF RFC 4566-2006 5.9）
     *      endTime:            {Number}  sdp t行  回放结束时间 (t行) （见 GBT28281 Page 41 ，详见 IETF RFC 4566-2006 5.9）
     *
     *  }
     */
    function encodeCallExtraInfo(handler,calleeName, callInfo) {
        let para = {    servType:   CallServType.ServNone,
                        mediaType:  RtcMediaType.RTC_MEDIA_TYPE_NULL,
                        detailInfo: {streamSN:"", fileUri:"", startTime:0, endTime:0, mediaQuality:{}} };
        if(callInfo !== null || callInfo !== undefined)
        {
            para = callInfo;
        }
        let extraInfo = null;

        if(para.servType === CallServType.ServPlayback)
        {
            let info  = para.detailInfo;
            let sip_header_subject = calleeName+":"+info.streamSN+","+ instCam.localUserName+":"+ handler.getId();
            let sdp_u = info.fileUri;
            let sdp_t = info.startTime+" "+info.endTime;
            extraInfo = { sip_headers:{ Subject:sip_header_subject }, sdp_extra:{ global:{s:para.servType,u:sdp_u,t:sdp_t}} };
        }
        else if(para.servType === CallServType.ServPlay)
        {
            extraInfo = { sdp_extra:{ global:{s:para.servType} }};
        }

        let sdp_f_obj = encodeSdpFline(para);
        if(sdp_f_obj.sdp_f_v !== null)
            extraInfo.sdp_extra.video = { f:sdp_f_obj.sdp_f_v };
        if(sdp_f_obj.sdp_f_a !== null)
            extraInfo.sdp_extra.audio = { f:sdp_f_obj.sdp_f_a };
        return extraInfo;
    }

    this.doCall = function(handler, calleeName, callInfo, chCallback) {
        let isAudioRecv = true;
        let isVideoRecv = true;
        if(callInfo.mediaType!==null && callInfo.mediaType!==undefined)
        {
            if(callInfo.mediaType=== RtcMediaType.RTC_MEDIA_TYPE_AUDIO)
            {
                isVideoRecv  = false;
            }
            else if(callInfo.mediaType === RtcMediaType.RTC_MEDIA_TYPE_VIDEO)
            {
                isAudioRecv = false;
            }
        }

        handler.createOffer(
            {
                media: {
                    audioSend: false, audioRecv: isAudioRecv,		// We DO want audio
                    videoSend: false, videoRecv: isVideoRecv	   // We MAY want video
                },
                success: function(jsep) {
                    Mms.debug("Got SDP!");
                    Mms.debug(jsep);
                    let body = null;
                    if(callInfo === null)
                    {
                        body = {request: "call", callee: calleeName};
                    }
                    else
                    {
                        let extraInfo = encodeCallExtraInfo(handler,calleeName, callInfo);
                        body = {request: "call", callee: calleeName, sip_headers: extraInfo.sip_headers, sdp_extra: extraInfo.sdp_extra};
                    }
                    handler.send({"message": body, "jsep": jsep});
                },
                error: function(error) {
                    Mms.log("rtc_error:"+error);
                    let cbResult= Session.createUiError(RtcCamEventID.RTC_CHANNEL_NORMAL_ERROR, error);
                    chCallback(handler, cbResult);
                }
            });
    };


    function encodePtzCmd(userName, control)
    {
        globSN += 1;
        let ptzCmd = "";
        let xmlContent;
        let byteArray = new Array(8);
        var buffer = new ArrayBuffer(8);
        for (let i=0;i<8;i++)
        {
            byteArray[i] = new Uint8Array(buffer,i,1);
            switch(i)
            {
                case 0:
                    byteArray[i] = 165;
                    break;
                case 1:
                {
                    let version = RtcConfig.RTC_CFG_VER_PTZ;
                    let byte0_h = (byteArray[0]>>4);
                    let byte0_l = (byteArray[0]&15);
                    let byte1 = (byte0_h+byte0_l+version)%16 + (version<<4);
                    byteArray[i] = byte1;
                }
                    break;
                case 2:
                    //not care
                    byteArray[i] = 0;
                    break;
                case 3:
                {
                    byteArray[i] = 0;
                    let tmp = 0;
                    if(control.pan!== undefined && !checkNumberParamFailed(control.pan))
                    {
                        //tmp = tmp & ~(3 << PtzCtrlBitPos.PAN_RIGHT);//清除位
                        if(control.pan >0 ) {
                            tmp = tmp | (1 << PtzCtrlBitPos.PAN_RIGHT);
                        }
                        else if(control.pan < 0)
                        {
                            tmp = tmp | (1 << PtzCtrlBitPos.PAN_LEFT);
                        }
                    }
                    if(control.tilt!== undefined && !checkNumberParamFailed(control.tilt))
                    {
                        //tmp = tmp & ~(3 << PtzCtrlBitPos.TILT_DOWN);
                        if(control.tilt >0 ) {
                            tmp = tmp | (1 << PtzCtrlBitPos.TILT_DOWN);
                        }
                        else if(control.tilt < 0)
                        {
                            tmp = tmp | (1 << PtzCtrlBitPos.TILT_UP);
                        }
                    }

                    if(control.zoom!== undefined &&!checkNumberParamFailed(control.zoom))
                    {
                        //tmp = tmp & ~(3 << PtzCtrlBitPos.ZOOM_IN);
                        if(control.zoom >0 ) {
                            tmp = tmp | (1 << PtzCtrlBitPos.ZOOM_IN);
                        }
                        else if(control.zoom < 0)
                        {
                            tmp = tmp | (1 << PtzCtrlBitPos.ZOOM_OUT);
                        }
                    }
                    byteArray[i] = tmp;
                }
                    break;
                case 4:
                    byteArray[i] = 0;
                    if(control.pan!== undefined && !checkNumberParamFailed(control.pan))
                    {
                        let val = Math.abs(control.pan);
                        val = (val >256)?255:val-1;
                        byteArray[i] = val;
                    }
                    break;
                case 5:
                    byteArray[i] = 0;
                    if(control.tilt!== undefined && !checkNumberParamFailed(control.tilt))
                    {
                        let val = Math.abs(control.tilt);
                        val = (val >256)?255:val-1;
                        byteArray[i] = val;
                    }
                    break;
                case 6:
                    byteArray[i] = 0;
                    if(control.zoom!== undefined && !checkNumberParamFailed(control.zoom))
                    {
                        let val = Math.abs(control.zoom);
                        val = (val >16)?15:val-1;
                        byteArray[i] = val << 4;
                    }
                    break;
                case 7:
                    let total = byteArray[0]+byteArray[1]+byteArray[2]+byteArray[3]+byteArray[4]+byteArray[5]+byteArray[6];
                    byteArray[i] = total%256;
                    break;
            }
            let hexStr = byteArray[i].toString(16).toUpperCase();
            if(hexStr.length === 1) {
                hexStr = '0' + hexStr;
            }
            ptzCmd = ptzCmd + hexStr;
            Mms.debug("ptzCmd:"+ptzCmd);
        }
        xmlContent = '<?xml version="1.0"?>\r\n'+
            '<Control>\r\n'+
            '<CmdType>DeviceControl</CmdType>\r\n'+
            '<SN>'+globSN+'</SN>\r\n'+
            '<DeviceId>'+ userName +'</DeviceId>\r\n' +
            '<PTZCmd>'+ptzCmd+'</PTZCmd>\r\n'+
            '<Info>\r\n'+
            '<ControlPriority>'+control.priority+'</ControlPriority>\r\n'+
            '</Info>\r\n'+
            '</Control>\r\n';
        return xmlContent;
    }

    this.doPtzControl = function(handler, username, control){
        let  content= encodePtzCmd(username, control);
        let body = {"request" : "message",
                    "peer" : username,
                    "type": "Application/MANSCDP+xml",
                    "content": content };
        handler.send({"message": body});
    };

    function encodePlaybackControl(control){
        globCseq += 1;
        let content ='';
        if(control.type === RtcCamPlaybackCtrlType.RTC_PLAYBACK_CTRL_PLAY)
        {
            let endStr = '';
            if(control.startTime === undefined)
            {
                if(control.scale !== undefined)
                {
                    endStr = 'Scale:'+ control.scale +'\r\n';
                }
                else
                {
                    endStr = 'Range:npt=now-\r\n';
                }
            }
            else
            {
                endStr = 'Range:npt='+control.startTime+'-\r\n';
            }
            content = control.type+' RTSP/'+RtcConfig.RTC_CFG_VER_RTSP+'\r\n'+
                'CSeq:'+globCseq+'\r\n'+ endStr;

        }
        else if(control.type === RtcCamPlaybackCtrlType.RTC_PLAYBACK_CTRL_PAUSE)
        {
            content = control.type+' RTSP/'+RtcConfig.RTC_CFG_VER_RTSP+'\r\n'+
                'CSeq:'+globCseq+'\r\n'+
                'PauseTime:now\r\n';
        }
        else if(control.type === RtcCamPlaybackCtrlType.RTC_PLAYBACK_CTRL_TEARDOWN)
        {
            content = control.type+' RTSP/'+ RtcConfig.RTC_CFG_VER_RTSP+'\r\n'+
                'CSeq:'+globCseq+'\r\n';
        }

        content = content+'\r\n';
        return content;
    }

    this.doPlaybackControl = function(handler, control){
        let  content= encodePlaybackControl(control);
        let body = {"request" : "info",
            "type": "Application/MANSRTSP",
            "content": content };
        handler.send({"message": body});
    };

    this.doMuteLocalMedia = function(mediaType, mute){
        if(mediaType === RtcMediaType.RTC_MEDIA_TYPE_AUDIO)
        {
            if(mute)
                this.localHandler.muteAudio();
            else
                this.localHandler.unmuteAudio();
        }
        else if(mediaType === RtcMediaType.RTC_MEDIA_TYPE_VIDEO)
        {
            if(mute)
                this.localHandler.muteVideo();
            else
                this.localHandler.unmuteVideo();

        }
    };

    this.isLocalMediaMuted = function(mediaType){
        if(mediaType === RtcMediaType.RTC_MEDIA_TYPE_AUDIO)
        {
            return this.localHandler.isAudioMuted();
        }
        else if(mediaType === RtcMediaType.RTC_MEDIA_TYPE_VIDEO)
        {
            return this.localHandler.isVideoMuted();
        }
    };

    this.doListenRemoteMedia = function(handler, mediaType, listen){
        let success  = false;
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

        return success;

    };

    this.isRemoteMediaListened = function(handler, mediaType){
        if(mediaType === RtcMediaType.RTC_MEDIA_TYPE_AUDIO)
        {
            let stream = handler.stream;
            let audioTracks = stream.getAudioTracks();
            if(audioTracks === null || audioTracks === undefined)
            {
                Mms.warn("no audio tracks!!");
                return false;
            }
            else
            {
                return audioTracks[0].enabled;
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
            else
            {
                return videoTracks[0].enabled;
            }
        }
    };

    this.doHangupCall= function(handler){
        let hangup = { "request": "hangup" };
        handler.send({"message": hangup});
        handler.hangup();
    };


    this.doHangup= function(){
        let hangup = { "request": "hangup" };
        this.localHandler.send({"message": hangup});
        this.localHandler.hangup();
        this.localHandler.detach();
    };

    this.doClose = function(handler){
        let hangup = { "request": "hangup" };
        handler.send({"message": hangup});
        handler.hangup();
        handler.detach({
            success:function(){
                if (handler.isAccepted) {
                    let cbResult = Session.createUiEvent(handler.isLocal?RtcCamEventID.RTC_CHANNEL_CALL_DISCONNECT:RtcCamEventID.RTC_CHANNEL_REMOTE_DISCONNECT);
                    handler.chCallback(handler, cbResult);
                    handler.isAccepted = false;
                }
                else {
                    let cbResult = Session.createUiEvent(handler.isLocal?RtcCamEventID.RTC_CHANNEL_CALL_FAIL:RtcCamEventID.RTC_CHANNEL_REMOTE_CONNECT_FAIL);
                    handler.chCallback(handler, cbResult);
                }
            },
            error: function(){
                Mms.log("server is down !!!");
                if (handler.isAccepted) {
                    let cbResult = Session.createUiEvent(handler.isLocal?RtcCamEventID.RTC_CHANNEL_CALL_DISCONNECT:RtcCamEventID.RTC_CHANNEL_REMOTE_DISCONNECT);
                    handler.chCallback(handler, cbResult);
                    handler.isAccepted = false;
                }
                else {
                    let cbResult = Session.createUiEvent(handler.isLocal?RtcCamEventID.RTC_CHANNEL_CALL_FAIL:RtcCamEventID.RTC_CHANNEL_REMOTE_CONNECT_FAIL);
                    handler.chCallback(handler, cbResult);
                }
            }
        });
    };

    this.doDestroy = function(){
        if(checkCamInvalid()) return;
        if(this.chMap !== null && this.chMap !== undefined )
        {
            this.chMap.forEach(function (handler, key, map)
            {
                if(handler!==null && handler!==undefined)
                {
                    instCam.doClose(handler);
                }
            });
            this.chMap.clear();
            delete this.chMap;
        }
        instCam.doClose(instCam.localHandler);
        instCam = null;
    }

}



