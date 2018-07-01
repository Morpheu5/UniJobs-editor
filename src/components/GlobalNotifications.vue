<template>
    <b-row id="global-notifications" class="my-3">
        <b-col cols="8">
            <b-alert
                v-for="n in notifications" :key="n.id"
                :variant="n.type || 'primary'"
                show
                dismissible
                @dismissed="removeNotification(n)"
            > <div                v-html="n.message" /> </b-alert>
        </b-col>
    </b-row>
</template>

<script>
export default {
    data() {
        return {
            notifications: []
        };
    },
    mounted() {
        this.$root.$on("global-notification", this.appendNotification);
    },
    beforeDestroy() {
        this.$root.$off("global-notification", this.appendNotification);
    },
    methods: {
        appendNotification(n) {
            if (!n.hasOwnProperty("id")) {
                n.id = Math.random().toString(36);
            }
            this.notifications = [...this.notifications, n];
        },
        removeNotification(n) {
            this.notifications = this.notifications.filter(e => n != e);
        }
    }
};
</script>
