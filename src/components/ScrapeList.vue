<template>
    <div>
        <b-table striped hover small sort-by="deadline" :items="tableRows" :fields="fields">
            <template slot="analyzed" slot-scope="data">
                <fa v-if="data.value" :icon="['far', 'check-square']" size="lg" />
                <fa v-else :icon="['far', 'square']" size="lg" />
            </template>
            <template slot="smelly" slot-scope="data">
                <fa v-if="data.value" :icon="['far', 'check-square']" size="lg" />
                <fa v-else :icon="['far', 'square']" size="lg" />
            </template>
            <template slot="org" slot-scope="data">{{ data.value[0] }} &raquo; {{ data.value[1] }}</template>
            <router-link slot="description" slot-scope="data" :to="`/contents/job/import/${data.item.id}`">{{ data.value }}</router-link>
            <template slot="deadline" slot-scope="data">{{ data.value | deadline }}</template>
        </b-table>
    </div>
</template>

<script>
import Vue from 'vue';

import _truncate from 'lodash/truncate';
import moment from 'moment-timezone';

export default Vue.extend({
    filters: {
        deadline(d) {
            return moment(d).format('DD/MM/YYYY HH:mm ZZ');
        }
    },

    data() {
        return {
            scraps: [],
            fields: [
                { key: 'analyzed', label: 'A' },
                { key: 'smelly', label: 'Sm' },
                { key: 'org', label: 'Org' },
                'description',
                { key: 'deadline', sortable: true }
            ],
            bookmark: ''
        };
    },

    computed: {
        tableRows() {
            return this.scraps.map(job => ({
                id: job._id,
                rev: job._rev,
                org: [ job.organization_id, job.organization_short_name ],
                description: _truncate(job.description.it, { length: 140, separator: ' ' }),
                deadline: job.deadline,
                analyzed: job.analyzed,
                smelly: job.smelly
            }));
        }
    },

    async created() {
        const { docs, bookmark } = await this.$couchdb.post('/_find', { selector: {}, fields: ['_id', '_rev', 'description', 'organization_id', 'organization_short_name', 'deadline', 'scraped', 'analyzed', 'smelly', 'imported', 'imported_id'] })
            .then(res => {
                return { docs: res.data.docs, bookmark: res.data.bookmark };
            })
            .catch(e => {

            });
        this.scraps = docs;
        this.bookmark = bookmark;
    }
});
</script>