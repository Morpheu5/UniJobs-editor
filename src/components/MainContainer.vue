<template>
    <div id="main_container">
        <b-container fluid class="bg-primary text-light sticky-top">
            <b-row class="py-2">
                <b-col cols="8">
                    <h1 class="d-inline">UniJobs.it Content Editor</h1>
                    <b-badge v-show="unsavedChanges" class="ml-4" variant="light text-danger">{{ $t('main_container.unsaved_changes') }}</b-badge>
                </b-col>
                <b-col>
                    <div class="float-right">
                        <b-button-group size="sm" class="mr-2">
                            <b-button v-for="l in availableLocales()" :key="l.iso" :variant="l.iso === $i18n.locale ? 'white' : 'dark border-white'" @click="changeLocale(l.iso)">
                                {{ l.name }}
                            </b-button>
                        </b-button-group>
                        <b-button size="lg" variant="danger border-white" class="my-1 ml-2" @click="logout">{{ $t('logout') }}</b-button>
                    </div>
                </b-col>
            </b-row>
        </b-container>
        <b-container fluid class="bg-white text-dark">
            <b-row class="pb-5">
                <b-col cols="2" class="text-dark">
                    <b-list-group class="my-3">
                        <b-list-group-item to="/dashboard"><fa :icon="['fas', 'tachometer-alt']" class="mr-3" />{{ $t('sidebar_menu.dashboard') }}</b-list-group-item>
                        <b-list-group-item to="/contents"><fa :icon="['fas', 'folder']" class="mr-3" />{{ $t('sidebar_menu.contents') }}</b-list-group-item>
                    </b-list-group>
                </b-col>
                <b-col>
                    <global-notifications/>
                    <router-view></router-view>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
import GlobalNotifications from './GlobalNotifications';

export default {
    components: {
        GlobalNotifications
    },
    data() {
        return {
            current_user: {},
            unsavedChanges: false
        };
    },
    mounted() {
        this.$root.$on('unsaved-changes', v => { this.unsavedChanges = v; });
    },
    beforeDestroy() {
        this.$root.$off('unsaved-changes');
    },
    created() {
        this.$axios
            .get('/users/whoami')
            .then(response => {
                this.current_user = response.data;
                this.$store.commit('setUser', response.data);
            })
            .catch(_error => {
                localStorage.removeItem('unijobs_magic_token');
                this.$store.commit('setUser', null);
                this.$router.push({ path: '/login' });
            });
    },
    methods: {
        logout() {
            this.$axios
                .post('/logout')
                .then(_response => {
                    localStorage.removeItem('unijobs_magic_token');
                    this.$router.push({ path: '/login' });
                })
                .catch(error => {
                    console.log('LOGOUT Error', error);
                });
        },
        changeLocale(locale) {
            this.$i18n.locale = locale;
            this.$store.commit('setLocale', locale);
        }
    }
};
</script>
