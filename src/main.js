import Vue from "vue";
import VueRouter from "vue-router";

import axios from "axios";

import BootstrapVue from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-vue/dist/bootstrap-vue.min.css";

import App from "./App.vue";
import store from "./store";

import Login from "@/components/Login.vue";
import MainContainer from "@/components/MainContainer.vue";
import JobsList from "@/components/JobsList.vue";
import JobEditor from "@/components/JobEditor.vue";

import NotFoundComponent from "@/components/NotFoundComponent.vue";

import TextContentBlock from "@/components/content_blocks/TextContentBlock";

Vue.config.productionTip = false;

Vue.use(BootstrapVue);
Vue.use(VueRouter);

// A bit annoying but hey...
Vue.component("TextContentBlock", TextContentBlock);

// Configure axios so we can use this.$axios
let axiosObject = axios.create({
    baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3000',
    withCredentials: true
});
axiosObject.interceptors.request.use(function(config) {
    config.headers['Content-Type'] = 'application/json';
    const t = localStorage.getItem('unijobs_magic_token');
    if (null !== t) {
        config.headers.Authorization = `Bearer ${t}`;
    }
    return config;
});
Vue.prototype.$axios = axiosObject;

const routes = [
    { path: "/login", component: Login },
    {
        path: "/", component: MainContainer,
        children: [
            { path: "jobs", component: JobsList },
            { path: "jobs/:id/edit", component: JobEditor, props: true },
        ]
    },

    { path: '*', component: NotFoundComponent }
];

const router = new VueRouter({
    mode: 'history',
    routes
});
router.beforeEach((to, from, next) => {
    if (to.matched.some(route => !['/login'].includes(route.path))) {
        let t = localStorage.getItem('unijobs_magic_token');
        if (null === t) {
            next({
                path: "/login",
                query: {
                    redirect: to.fullPath
                }
            });
        } else {
            next();
        }
    }
    next();
});

Vue.mixin({
    methods: {
        availableLocales() {
            return [ { code: "it", name: "Italiano" }, { code: "en", name: "English" } ]
        },
        spreadOverLocales(o) {
            return this.availableLocales().map(l => l.code).reduce((a, e) => ({...a, [e]: _.cloneDeep(o)}), {})
        }
    }
})

// eslint-disable-next-line
const vm = new Vue({
    store,
    router,
    render: h => h(App)
}).$mount("#app");
