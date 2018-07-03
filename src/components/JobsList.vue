<template>
    <div id="jobs-list">
        <h2 class="mb-3">List of jobs</h2>
        <b-row class="header mb-1">
            <b-col cols="1">Actions</b-col>
            <b-col>Title</b-col>
            <b-col cols="1">Published</b-col>
        </b-row>
        <b-row v-for="job in jobs" :key="job.uuid" class="mb-1">
            <b-col cols="1">
                <b-button class="mr-1" variant="danger" size="sm">x</b-button>
                <b-button :to="`/jobs/${job.id}/edit`" class="mr-1" variant="primary" size="sm">e</b-button>
            </b-col>
            <b-col>
                <p v-for="(v, k) in job.title" :key="`${job.uuid}-${k}`">{{k}}: {{ v }}</p>
            </b-col>
            <b-col cols="1">{{ job.metadata.published ? 'y' : 'n' }}</b-col>
        </b-row>
    </div>
</template>

<style lang="scss">
#jobs-list {
  .header {
    font-weight: bold;
  }
}
</style>


<script>
import axios from "axios";

export default {
    data() {
        return {
            jobs: []
        };
    },
    created() {
        axios
            .get("http://localhost:3000/contents?content_type=job")
            .then(response => {
                this.jobs = response.data;
            })
            .catch(error => {
                this.jobs = [];
                this.$root.$emit("global-notification", {
                    type: "danger",
                    message: `There was a problem retrieving the list of jobs.<br/>${error}`
                });
        });
    }
};
</script>
