import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);
const resourceChildren=[
  {
    name:'EmergencyUnit',title:'应急单位'
  },
  {
    name:'EmergencyExpert',title:'应急专家'
  },
  {
    name:'EmergencyWarehouse',title:'应急仓库'
  },
  {
    name:'EmergencySupplies',title:'应急物资'
  },
  {
    name:'EmergencyVehicle',title:'应急车辆'
  },
  {
    name:'MobileTerminal',title:'移动终端'
  },
  {
    name:'IndividualPictures',title:'单兵图传'
  },
];

const routes = [
  {
    path: '*',
    redirect: '/Index'
  },
  {
    name: 'Index',
    redirect: '/Home',
    meta: {
      title: '系统首页',
    },
    component: () => import('./components/Index'),
    children: [
      {
        name: 'Home',
        path:'/Home',
        meta: {
          title: '系统首页',
        },
        component: () => import('./components/Home/Index'),
      },

      {
        name: 'EventDetail',
        path:'/EventDetail/:id',
        meta: {
          title: '事件详情',
        },
        component: () => import('./components/EventDetail/Index'),
      },
      {
        name: 'VideoMeeting',
        path:'/VideoMeeting',
        meta: {
          title: '视频会商',
        },
        component: () => import('./components/VideoMeeting/Index'),
      },
      {
        name: 'VideoMonitor',
        path:'/VideoMonitor',
        meta: {
          title: '视频监控',
        },
        component: () => import('./components/VideoMonitor/Index'),
      },
      {
        name: 'ResourceManagement',  
        path:'/ResourceManagement/',
        redirect: '/ResourceManagement/EmergencyUnit',
        meta: {
          title: '资源管理',
        },
        component: () => import('./components/ResourceManagement/Index'),
        children:resourceChildren.map(item=>{
          let {name,title}=item;
            return    {
              path: name,//以“/”开头的嵌套路径会被当作根路径，所以子路由上不用加“/”;在生成路由时，主路由上的path会被自动添加到子路由之前，所以子路由上的path不用在重新声明主路由上的path了。
              name,
              component: () => import('./components/ResourceManagement/'+name+'/Index'),
              meta: {
                title
              },
            }
        })
      },
      {
        name: 'SystemMaintenance',
        path:'/SystemMaintenance',
        redirect: '/SystemMaintenance/CommandAgency',
        meta: {
          title: '系统维护',
        },
        component: () => import('./components/SystemMaintenance/Index'),
        children:[
          {
            path: 'CommandAgency',//以“/”开头的嵌套路径会被当作根路径，所以子路由上不用加“/”;在生成路由时，主路由上的path会被自动添加到子路由之前，所以子路由上的path不用在重新声明主路由上的path了。
            name: 'CommandAgency',
            component: () => import('./components/SystemMaintenance/CommandAgency/Index'),
            meta: {
              title: '系统维护-指挥机构'
            },
          },
          {
            path: 'PersonnelManagement',//以“/”开头的嵌套路径会被当作根路径，所以子路由上不用加“/”;在生成路由时，主路由上的path会被自动添加到子路由之前，所以子路由上的path不用在重新声明主路由上的path了。
            name: 'PersonnelManagement',
            component: () => import('./components/SystemMaintenance/PersonnelManagement/Index'),
            meta: {
              title: '系统维护-人员管理'
            },
          },
          {
            path: 'ChangePassword',//以“/”开头的嵌套路径会被当作根路径，所以子路由上不用加“/”;在生成路由时，主路由上的path会被自动添加到子路由之前，所以子路由上的path不用在重新声明主路由上的path了。
            name: 'ChangePassword',
            component: () => import('./components/SystemMaintenance/ChangePassword'),
            meta: {
              title: '系统维护-修改密码'
            },
          },
  
        ]
      },
    ]
  },
  {
    name: 'Login',
    path:'/Login',
    meta: {
      title: '登录',
    },
    component: () => import('./components/Login'),
  },

];

// add route path
routes.forEach(route => {
  route.path = route.path || '/' + (route.name || '');
});

const router = new Router({ routes });

router.beforeEach((to, from, next) => {
  const title = to.meta && to.meta.title;
  if (title) {
    document.title = title;
  }
  next();
});

export {
  router,
  resourceChildren
};
