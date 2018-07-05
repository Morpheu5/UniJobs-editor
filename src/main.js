import Vue from "vue";
import VueRouter from "vue-router";

import axios from "axios";

import BootstrapVue from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

import App from "./App.vue";
import store from "./store";

import Dashboard from "@/components/Dashboard.vue";
import JobsList from "@/components/JobsList.vue";
import JobEditor from "@/components/JobEditor.vue";

import TextContentBlock from "@/components/content_blocks/TextContentBlock";

Vue.config.productionTip = false;

Vue.use(BootstrapVue);
Vue.use(VueRouter);

// A bit annoying but hey...
Vue.component("TextContentBlock", TextContentBlock);

// Configure axios so we can use this.$axios
Vue.prototype.$axios = axios.create({
    baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3000'
})

const routes = [
    { path: "/", component: Dashboard },
    { path: "/jobs", component: JobsList },
    { path: "/jobs/:id/edit", component: JobEditor, props: true }
];

const router = new VueRouter({
    routes
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
