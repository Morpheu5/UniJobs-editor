<template>
    <div id="jobs-list">
        <h2 class="mb-3">Job offers</h2>
        <b-row class="header mb-1">
            <b-col cols="2"></b-col>
            <b-col><div><span class="lang"></span>Title</div></b-col>
            <b-col cols="1">Published</b-col>
            <b-col cols="1"></b-col>
        </b-row>
        <b-row v-for="(job, index) in jobs" :key="job.uuid" :class="{ even: (index%2), odd: !(index%2), first: !index, last: index == jobs.length-1 }" class="py-2 job" >
            <b-col cols="2">
                <div class="float-right mt-2">
                    <b-button variant="link text-danger">
                        <fa :icon="['far', 'trash-alt']" fixed-width size="lg" />
                    </b-button>
                    <b-button :to="`/jobs/${job.id}/edit`" variant="link text-primary">
                        <fa :icon="['far', 'edit']" fixed-width size="lg" />
                    </b-button>
                </div>
            </b-col>
            <b-col>
                <div v-for="(v, k) in job.title" :key="`${job.uuid}-${k}`"><span class="lang">{{k}}</span>{{ v }}</div>
            </b-col>
            <b-col cols="1">
                <div class="mt-3 text-center">
                    <fa v-if="job.metadata.published" :icon="['far', 'check-square']" size="lg" />
                    <fa v-else :icon="['far', 'square']" size="lg" />
                </div>
            </b-col>
            <b-col cols="1"></b-col>
        </b-row>
    </div>
</template>

<style lang="scss">
@import "../../node_modules/bootstrap/scss/bootstrap.scss";

#jobs-list {
    .header {
        font-weight: bold;

        &:hover {
            background: none !important;
        }
    }

    .row {
        &:hover {
            background: $light;
        }

        div > span.lang {
            min-width: 2em;
            display: inline-block;
            text-align: right;
            margin-right: 1em;
            font-family: $font-family-monospace;
        }
    }
}
</style>


<script>
export default {
    data() {
        return {
            jobs: []
        };
    },
    created() {
        this.$axios
            .get("/contents?content_type=job")
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
