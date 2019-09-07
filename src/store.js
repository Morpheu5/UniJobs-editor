import Vue from "vue";
import Vuex from "vuex";

import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

const scrapesList = {
    namespaced: true,
    state: {
        showExpired: false,
        perPage: 10
    },
    mutations: {
        setShowExpired(state, showExpired) {
            state.showExpired = showExpired;
        },
        setPerPage(state, perPage) {
            state.perPage = perPage;
        }
    }
};

export default new Vuex.Store({
    plugins: [
        createPersistedState()
    ],
    state: {
        user: null,
        locale: 'it-IT',
        env: process.env.NODE_ENV || 'production'
    },
    modules: {
        scrapesList
    },
    mutations: {
        setUser(state, user) {
            state.user = user;
        },
        setLocale(state, locale) {
            state.locale = locale;
        }
    },
    actions: {}
});
