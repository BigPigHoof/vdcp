import axios from 'axios';
import {router} from '../router';
import {Message} from 'element-ui';
// axios.defaults.baseURL = window.config.apiIp;
//返回状态判断(添加响应拦截器)
axios.interceptors.response.use((res) =>{
    //对响应数据做些事
    if(typeof(res.data)=='string' ){

        router.push({path: '/Login'})
    }else{
        return Promise.resolve(res);
    }
    return Promise.resolve(res);
    // return res;
}, (error) => {
    // console.log(typeof(error));
    Message.error('网络或服务器内部错误');
    return Promise.reject(error);
});
export function get(url, params){    
    return new Promise((resolve, reject) =>{        
        axios.get(url, {            
            params: params        
        }).then(res => {
            resolve(res.data);
        }).catch(err =>{
            reject(err)        
    })    
});}
export function post(url, params) {
    return new Promise((resolve, reject) => {
         axios.post(url, params)
        .then(res => {
            resolve(res.data);
        })
        .catch(err =>{
            reject(err)
        })
    });
}