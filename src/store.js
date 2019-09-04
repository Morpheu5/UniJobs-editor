import Vue from "vue";
import Vuex from "vuex";

import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

export default new Vuex.Store({
    plugins: [
        createPersistedState()
    ],
    state: {
        user: null,
        locale: 'it-IT',
        env: process.env.NODE_ENV || 'production'
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
