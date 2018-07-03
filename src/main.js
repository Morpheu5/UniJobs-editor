import Vue from "vue";
import VueRouter from "vue-router";

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

const routes = [
    { path: "/", component: Dashboard },
    { path: "/jobs", component: JobsList },
    { path: "/jobs/:id/edit", component: JobEditor, props: true }
];

const router = new VueRouter({
    routes
});

// eslint-disable-next-line
let vm = new Vue({
    store,
    router,
    render: h => h(App)
}).$mount("#app");
