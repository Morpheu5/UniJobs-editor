<template>
    <div>
        <b-row v-for="s in scraps" :key="s.id" class="mb-3">
            <b-col cols="1">
                {{ s.organization_id }} &raquo; {{ s.organization_short_name }}
            </b-col>
            <b-col cols="9">
                <router-link :to="`/contents/job/import/${s._id}`">{{ s.description.it }}</router-link>
            </b-col>
            <b-col>
                <fa :icon="['fas', 'file-import']" fixed-width size="lg" />
            </b-col>
        </b-row>
    </div>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
    data() {
        return {
            scraps: [],
            bookmark: ''
        };
    },

    created() {
        this.$couchdb.post('/_find', { selector: {}, fields: ['_id', '_rev', 'description', 'organization_id', 'organization_short_name', 'scraped', 'analyzed', 'smelly', 'imported', 'imported_id'] })
            .then(res => {
                this.scraps = res.data.docs;
                this.bookmark = res.data.bookmark;
            })
            .catch(e => {

            });
    }
});
</script>