<template>
    <ul id="organizations_list">
        <Organization v-for="org in organizations" :key="org.id" :organization="org" />
    </ul>
</template>

<script>
import Organization from "./Organization.vue";

export default {
    components: { Organization },
    data() {
        return {
            organizations: []
        };
    },
    mounted() {
        this.$axios.get('/organizations/tree')
        .then(result => {
            this.organizations = result.data;
        });
    }
};
</script>