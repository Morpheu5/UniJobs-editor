<template>
    <div id="main_container">
        <b-container fluid class="bg-primary text-light sticky-top">
            <b-row class="py-2">
                <b-col>
                    <h1 class="d-inline">UniJobs.it Content Editor</h1>
                    <b-badge v-show="unsavedChanges" class="ml-4" variant="light text-danger">There are unsaved changes in this page.</b-badge>
                </b-col>
                <b-col cols="2">
                    <div class="float-right">
                        <!-- <b-button size="lg" variant="light" class="my-1">Profile</b-button> -->
                        <b-button size="lg" variant="danger" class="my-1 ml-2" @click="logout">Logout</b-button>
                    </div>
                </b-col>
            </b-row>
        </b-container>
        <b-container fluid class="bg-white text-dark">
            <b-row class="pb-5">
                <b-col cols="2" class="text-dark">
                    <b-list-group class="my-3">
                        <b-list-group-item to="/dashboard"><fa :icon="['fas', 'tachometer-alt']" class="mr-3" />Dashboard</b-list-group-item>
                        <b-list-group-item to="/contents"><fa :icon="['fas', 'folder']" class="mr-3" />Your contents</b-list-group-item>
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
            })
            .catch(error => {
                console.log(error);
                localStorage.removeItem('unijobs_magic_token');
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
        }
    }
};
</script>
