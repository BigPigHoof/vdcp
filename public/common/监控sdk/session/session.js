var rtcSession = null;
var mms = null;
Session.serviceSet = null;
Session.sessCallback = null;
Session.server = "wss://" + window.location.host + "/ws";
Session.iceServers = null;

Session.createUiEvent = function(evtID)
{
    return {"EventID":evtID,"isError":false};
};

Session.createUiEventWithObj = function(evtID, evtObj)
{
    return {"EventID":evtID, "EventObj": evtObj, "isError":false};
};

Session.createUiError = function(evtID, errReason)
{
    errReason = (errReason === null || errReason===undefined)? RtcEventReason.RTC_REASON_NORMAL:errReason;
    return {"EventID":evtID,"ErrReason":errReason, "isError":true};
};

Session.createUiErrorWithObj = function(evtID, errReason, errObj)
{
    return {"EventID":evtID,"EventObj":errObj, "ErrReason":errReason,"isError":true};
};


Session.init = function(server, callback, config){
    Session.server = server;
    let iceArray = [];
    let iceItem = {};
    if(RtcConfig.RTC_CFG_ICE_IP === "")
    {
        let startIndex = server.indexOf("//")+2;
        iceItem.urls = RtcConfig.RTC_CFG_ICE_TYPE+":"+server.substr(startIndex, server.lastIndexOf(":")-startIndex+1)+ RtcConfig.RTC_CFG_ICE_PORT;
    }
    else
    {
        iceItem.urls = RtcConfig.RTC_CFG_ICE_TYPE+":"+RtcConfig.RTC_CFG_ICE_IP + ":" + RtcConfig.RTC_CFG_ICE_PORT;
        let key = RtcSessionConfigKey.KEY_MEDIA_TRANSPORT_TYPE;
        if(config[key] === RtcTransportType.RTC_TRANSPORT_TYPE_TCP)
        {
            iceItem.urls += '?transport=tcp';
        }
    }

    iceItem.username = RtcConfig.RTC_CFG_ICE_USER;
    iceItem.credential = RtcConfig.RTC_CFG_ICE_PWD;
    iceArray.push(iceItem);
    Session.iceServers = iceArray;
    if(callback === null || callback === undefined || typeof callback !== "function")
    {
        let info = Session.createUiError(RtcCommonEventID.RTC_SESSION_INIT_FAILED,
            RtcEventReason.RTC_REASON_PARAMETER_ERROR);
        callback(info);
        return null;
    }
    rtcSession = new Session(callback, config);
    return rtcSession;
};

Session.setMediaTransportType = function(transportType){
    if(mms !== null && mms !== undefined)
    {
        for(let iceItem of Session.iceServers)
        {
            if(transportType === RtcTransportType.RTC_TRANSPORT_TYPE_TCP)
            {
                iceItem.urls += '?transport=tcp';
            }
            else
            {
                iceItem.urls = iceItem.urls.replace('?transport=tcp','');
            }

        }
        mms.setIceServers(Session.iceServers);
        if(transportType === RtcTransportType.RTC_TRANSPORT_TYPE_TCP)
        {
            mms.setIceRelay(true);
        }
        else
        {
            mms.setIceRelay(false);
        }
    }

};

function Session(callback, config)
{
    let level= [];
    this.serviceSet = new Set();
    Session.sessCallback = callback;
    let logLevel = config[RtcSessionConfigKey.KEY_LOG_LEVEL];
    if(logLevel === undefined || logLevel === null)
    {
        logLevel = RtcLogLevel.RTC_LOG_LEVEL_ERROR;
    }
    switch(logLevel)
    {
        case RtcLogLevel.RTC_LOG_LEVEL_ALL:
            level = "all";
            break;
        case RtcLogLevel.RTC_LOG_LEVEL_WARN:
            level = ["warn","error"];
            break;
        case RtcLogLevel.RTC_LOG_LEVEL_ERROR:
        case undefined:
            level = ["error"];
            break;
        case RtcLogLevel.RTC_LOG_LEVEL_NONE:
            level = [];
            break;
    }

    Mms.init({
        debug: level,
        callback: function () {
            if(mms != null)
            {
                Mms.debug("Mms instance has been created already!");
                return;
            }
            //初始化成功后，建立WebSocket连接，并创建本地用户对应的PeerConnection
            let mmsCallback = {
                server: Session.server,
                success: function() {
                    let cbResult = Session.createUiEvent(RtcCommonEventID.RTC_SESSION_INIT_SUCCESS);
                    callback(cbResult);
                },
                error: function(error) {
                    Mms.error(error);
                    if(error === MmsHint.MMS_HINT_CONNECT_TO_SERVER_FAILED)
                    {
                        let cbResult = Session.createUiError(RtcCommonEventID.RTC_SESSION_CONNECTION_FAILED);
                        callback(cbResult);
                        rtcSession.destroyServices();
                    }
                    else if(error === MmsHint.MMS_HINT_CONNECT_TO_SERVER_RETRYING)
                    {
                        mms.reconnect(this);
                        console.log("SERVER_RETRYING");
                    }
                },
                destroyed: function() {
                    rtcSession.destroyServices();
                    let cbResult = Session.createUiEvent(RtcCommonEventID.RTC_SESSION_DESTROYED);
                    callback(cbResult);
                }
            };
            if(RtcConfig.RTC_CFG_ICE_ENABLE)
            {
                mmsCallback.iceServers = Session.iceServers;

                let mediaTransportType = config[RtcSessionConfigKey.KEY_MEDIA_TRANSPORT_TYPE];
                if(RtcConfig.RTC_CFG_ICE_TYPE === "turn" && mediaTransportType === RtcTransportType.RTC_TRANSPORT_TYPE_TCP)
                {
                    mmsCallback.iceTransportPolicy = "relay";
                }
            }
            //[{urls: "turn:192.168.50.180:3478", username: "fritt", credential: "passwd"}]
            mms = new Mms(mmsCallback);
        }
    });


    this.registerService =  function (svc){
        this.serviceSet.add(svc);
    };

    this.destroyServices = function (){
        if(this.serviceSet.size === 0)
        {
            Mms.log("service set has been cleared!");
            return;
        }
        this.serviceSet.forEach(function (element, sameElement, set)
        {
            if(element!==null && element!==undefined)
            {
                element.doDestroy();
            }
        });
        this.serviceSet.clear();
    }
}



