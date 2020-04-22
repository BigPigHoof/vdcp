function checkNumberParamFailed(param)
{
    if(param === null || param === undefined || typeof param !== "number")
    {
        let error = RtcErrorType.RTC_ERROR_BAD_PARAMETER_TYPE_NUMBER;
        console.error(error);
        alert(error);
        return true;
    }
    return false;
}

function checkStringParamFailed(param)
{
    if(param === null || param === undefined || typeof param !== "string")
    {
        let error = RtcErrorType.RTC_ERROR_BAD_PARAMETER_TYPE_STRING;
        console.error(error);
        alert(error);
        return true;
    }
    return false;
}

function checkObjectParamFailed(param)
{
    if(param === null || param === undefined || typeof param !== "object")
    {
        let error = RtcErrorType.RTC_ERROR_BAD_PARAMETER_TYPE_OBJECT;
        console.error(error);
        alert(error);
        return true;
    }
    return false;
}

function checkBooleanParamFailed(param)
{
    if(param === null || param === undefined || typeof param !== "boolean")
    {
        let error = RtcErrorType.RTC_ERROR_BAD_PARAMETER_TYPE_BOOLEAN;
        console.error(error);
        alert(error);
        return true;
    }
    return false;
}

function filteredFuncParam(param)
{
    if(param === null || param === undefined || typeof param !== "function")
    {
        let error = RtcErrorType.RTC_ERROR_BAD_PARAMETER_TYPE_FUNCTION;
        console.warn(error);
        return Mms.noop;
    }
    return param;
}

function checkServerAddressParamFailed(server)
{
    if(checkStringParamFailed(server))
        return;

    // if((!server.startsWith("wss://") && !server.endsWith("/ws"))
    //     && (!server.startsWith("ws://")))
    // {
    //     let error = RtcErrorType.RTC_ERROR_BAD_PARAMETER_FORMAT_SERVER;
    //     console.error(error);
    //     alert(error);
    //     return true;
    // }
    return false;
}


function getRtcErrorFromServerReason(errCode, errDesc)
{
    let error = errDesc;
    switch(errCode)
    {
        case 416:
            error =  RtcEventReason.RTC_REASON_ROOM_NOT_EXIST;
            break;
    }
    return error;
}

function buf2hex(buffer) { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}
