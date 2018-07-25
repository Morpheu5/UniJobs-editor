<template>
    <div id="main_container">
        <b-container fluid class="bg-primary text-light">
            <b-row class="py-2">
                <b-col>
                    <h1>Content Editor</h1>
                </b-col>
            </b-row>
        </b-container>
        <b-container fluid class="bg-white text-dark">
            <b-row class="pb-5">
                <b-col cols="2" class="text-dark">
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
export default {
    methods: {}
};
</script>
