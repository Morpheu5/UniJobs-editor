<template>
    <div id="app">
        <router-view></router-view>
    </div>    
</template>

<style lang="scss">
@import 'assets/custom';
</style>


<script>
import GlobalNotifications from "./components/GlobalNotifications.vue";

export default {
    name: "app",
    components: {
        GlobalNotifications
    }
};
</script>
