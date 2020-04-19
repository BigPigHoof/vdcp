"use strict";
(function (root) {
    var tsdkJsInitParam = {
        invokeMode: 1,
        svrAddr: "localhost.cloudec.huaweicloud.com",
        svrPort: "7684",
        ssl: 1
    };
    root.isNoLogin = false;
    var listeners = {
        OnEvtAuthSuccess: (ret) => {
            console.debug('auth success!');
            console.log("auth success!" + JSON.stringify(ret))
        },
        OnEvtLoginSuccess: (ret) => {
            console.info('login success!' + JSON.stringify(ret));
            root.isNoLogin = true;
            console.log("login success!")
        },
        OnEvtAuthFailed: (ret) => {
            root.isNoLogin = false;
            console.log("OnEvtAuthFailed!")
        },
        OnEvtLogoutSuccess: (ret) => {
            alert("logout Sucesss!")
        },
        OnEvtLogoutFailed: (ret) => {
            alert('logout failed!')          
        },
        OnEvtCallOutgoing: (ret) => {
            root.callOutGoingId = ret.param.callId
            console.log("Call out success!")
        },
        OnEvtCallIncoming: (ret) => {
            root.callInComingId = ret.param.callId
            // alert("Please answer" + JSON.stringify(ret));
            debugger;
            var callId = callInComingId;
            call_Id = callInComingId;
            console.log(callId)
            // var isVideo = document.getElementById("isVideoCall").checked;
            var callbacks = function () { };
            tsdkClient.acceptCall(callId, true, callbacks);
        },
        OnEvtOpenVideoReq: (ret) => {
            alert("Audio to video")
        },
        OnEvtCloseVideoInd: (ret) => {
            alert("video to audio")
        },
        OnEvtOpenVideoInd: (ret) => {
            alert("video to audio")
        },
        OnEvtRefuseOpenVideoInd: (ret) => {
            alert("rejected!!!")
        },
        OnEvtCallEnded: (ret) => {
            console.log("call end success!");
            root.callEndId = ret.param.callId
            console.log(JSON.stringify(ret))
        },
        OnEvtBookConfResult: (ret) => {
            console.log("book join successs" + JSON.stringify(ret))
        },
        OnEvtQueryConfListResult: (ret) => {
            root.consfList = ret
        },
        OnEvtJoinConfResult: (ret) => {
            console.log("join sunccess" + JSON.stringify(ret))
            root.handle = ret.param.handle
        },
        OnEvtQueryConfListResult: (ret) => {
            root.callbackDatas = ret
        },
        OnError: function(ret) {
            if (390000003 == ret.info.errorCode) {
                console.warn("Memory usage over 80%, please close the unrelated program.");
            } else {
                alert(JSON.stringify(ret));
            }
        },
    };
   // terminalSDK.createTsdkClient(tsdkJsInitParam, listeners, (data)=>{
   //     root.tsdkClient = data
   // });
   root.tsdkClient=terminalSDK.createTsdkClient(tsdkJsInitParam, listeners);
    if (root.tsdkClient == null) {
        console.log("createTsdkClient");
    }
})(this);