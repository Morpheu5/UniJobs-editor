<template>
    <div id="main_container">
        <b-container fluid class="bg-primary text-light">
            <b-row class="py-2">
                <b-col>
                    <h1>Content Editor</h1>
                </b-col>
                <b-col cols="1">
                    <b-button size="lg" variant="danger" class="mt-1" @click="logout">Logout</b-button>
                </b-col>
            </b-row>
        </b-container>
        <b-container fluid class="bg-white text-dark">
            <b-row class="pb-5">
                <b-col cols="2" class="text-dark">
                    <p>Hi, {{ current_user.given_name }}</p>
                    <ul>
                        <li><router-link to="/" class="text-dark">Dashboard</router-link></li>
                        <li><router-link to="/jobs" class="text-dark">Jobs</router-link></li>
                    </ul>
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
            current_user: {}
        }
    },
    created() {
        this.$axios
            .get('/users/whoami')
            .then(response => {
                this.current_user = response.data;
            })
            .catch(error => {
                console.log(error);
            });
    },
    methods: {
        logout() {
            localStorage.removeItem('unijobs_magic_token');
            this.$router.push({ path: '/login' });
        }
    }
};
</script>