import Vue from "vue";
import VueRouter from "vue-router";

import axios from "axios";

import BootstrapVue from "bootstrap-vue";
import "bootstrap/scss/bootstrap.scss";
import "bootstrap-vue/dist/bootstrap-vue.min.css";

import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';
import 'flatpickr/dist/themes/light.css';

import App from "./App.vue";
import store from "./store";

import Login from "@/components/Login.vue";
import Dashboard from "@/components/Dashboard.vue";
import MainContainer from "@/components/MainContainer.vue";
import ContentsList from "@/components/ContentsList.vue";
import ContentEditor from "@/components/ContentEditor.vue";

import NotFoundComponent from "@/components/NotFoundComponent.vue";

import TextContentBlock from "@/components/content_blocks/TextContentBlock";

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons/faTrashAlt';
import { faEdit } from '@fortawesome/free-regular-svg-icons/faEdit';
import { faUndo } from '@fortawesome/free-solid-svg-icons/faUndo';
import { faSquare } from '@fortawesome/free-regular-svg-icons/faSquare';
import { faCheckSquare } from '@fortawesome/free-regular-svg-icons/faCheckSquare';
import { faTachometerAlt } from '@fortawesome/free-solid-svg-icons/faTachometerAlt';
import { faFolder } from '@fortawesome/free-solid-svg-icons/faFolder';
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch';
import { faFilter } from '@fortawesome/free-solid-svg-icons/faFilter';
import { faEye } from '@fortawesome/free-regular-svg-icons/faEye';
import { faEyeSlash } from '@fortawesome/free-regular-svg-icons/faEyeSlash';
import { faClock } from '@fortawesome/free-regular-svg-icons/faClock';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons/faArrowUp';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons/faArrowDown';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons/faCalendarAlt';
import { faTimesCircle } from '@fortawesome/free-regular-svg-icons/faTimesCircle';

library.add(
    faTrashAlt, faEdit, faUndo,
    faSquare, faCheckSquare,
    faTachometerAlt, faFolder,
    faSearch, faFilter,
    faEye, faEyeSlash,
    faClock, faArrowUp, faArrowDown, faChevronLeft, faChevronRight, faCalendarAlt, faTimesCircle
);

Vue.config.productionTip = false;

Vue.use(BootstrapVue);
Vue.use(VueRouter);
Vue.use(flatPickr);

// A bit annoying but hey...
Vue.component("TextContentBlock", TextContentBlock);

Vue.component('fa', FontAwesomeIcon);

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

Vue.filter('titleCase', function(value) {
    if (!value) return '';
    return _.startCase(value);
});

const routes = [
    { path: "/login", component: Login },
    {
        path: "/", component: MainContainer, redirect: '/dashboard',
        children: [
            { path: "dashboard", component: Dashboard },
            { path: "contents", component: ContentsList },
            { path: "contents/:content_type/new", component: ContentEditor, props: { id: "new" } },
            { path: "contents/:id/edit", component: ContentEditor, props: true },
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
            return [ { code: "it", iso: "it-IT", name: "Italiano" }, { code: "en", iso: "en-UK", name: "English" } ]
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
