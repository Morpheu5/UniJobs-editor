<template>
    <div>
        <b-row>
            <b-col>
                <b-form inline>
                    <b-checkbox v-model="filterCriteria.showExpired">{{ $t('scrapes_list.show_expired') }}</b-checkbox>
                    <b-btn v-show="toBeDeleted.length > 0" v-b-modal.deleteScrapeModal class="ml-3" size="sm" variant="danger">{{ $t('scrapes_list.delete_selected') }} ({{ toBeDeleted.length }})</b-btn>
                    <b-btn v-show="toBeDeleted.length > 0" class="ml-3" size="sm" @click="toBeDeleted = []">{{ $t('scrapes_list.clear_selection') }}</b-btn>
                </b-form>
            </b-col>
            <b-col cols="1">
                <b-select v-model="perPage" size="sm">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="1000000">1000000</option>
                </b-select>
            </b-col>
            <b-col cols="3">
                <b-pagination
                    v-model="currentPage"
                    :total-rows="totalRows"
                    :per-page="perPage"
                    align="fill"
                    size="sm"
                    aria-controls="scraps_table"
                ></b-pagination>
            </b-col>
        </b-row>

        <b-row>
            <b-col>
                <b-table
                    id="scraps_table"
                    hover
                    selectable
                    select-mode="range"
                    striped
                    small
                    sort-by="deadline"
                    :items="tableRows"
                    :fields="fields"
                    :filter="filterCriteria"
                    :filter-function="tableFilter"
                    :per-page="perPage"
                    :current-page="currentPage"
                    :tbody-tr-class="rowClass"
                    @filtered="onFiltered"
                    @row-selected="onSelected"
                >
                    <b-btn slot="delete" slot-scope="data" size="sm" variant="danger" @click="toBeDeleted = [data.item]">
                        <fa :icon="['far', 'trash-alt']" size="sm" />
                    </b-btn>
                    <template slot="analyzed" slot-scope="data">
                        <fa v-if="data.value" :icon="['far', 'check-square']" size="sm" />
                        <fa v-else :icon="['far', 'square']" size="sm" />
                    </template>
                    <template slot="smelly" slot-scope="data">
                        <fa v-if="data.value" :icon="['far', 'check-square']" size="sm" />
                        <fa v-else :icon="['far', 'square']" size="sm" />
                    </template>
                    <router-link slot="content_id" slot-scope="data" :to="`/contents/${data.value}/edit`">{{ data.value }}</router-link>
                    <template slot="org" slot-scope="data">{{ data.value[0] }} &raquo; {{ data.value[1] }}</template>
                    <router-link slot="description" slot-scope="data" :to="`/contents/job/import/${data.item.id}`">{{ data.value }}</router-link>
                    <template slot="deadline" slot-scope="data">{{ data.value | deadline }}</template>
                </b-table>
            </b-col>
        </b-row>

        <b-modal id="deleteScrapeModal" :title="$t('content_editor.delete_modal_title')" :ok-title="$t('yes')" :cancel-title="$t('no')" ok-variant="danger" header-text-variant="danger" @ok="deleteScrape" @cancel="toBeDeleted = []">
            <div v-html="$t('content_editor.delete_scrape_modal')" />
        </b-modal>
    </div>
</template>

<style lang="scss">
tr.expired {
    opacity: 0.5;
}
</style>

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
                { key: 'delete', label: '' },
                { key: 'analyzed', label: 'A' },
                { key: 'smelly', label: 'S' },
                { key: 'content_id', label: 'C' },
                { key: 'org', label: 'Org' },
                'description',
                { key: 'deadline', sortable: true }
            ],
            bookmark: '',
            toBeDeleted: [],
            currentPage: 1,
            totalRows: 0,
            perPage: 10,
            filterCriteria: {
                showExpired: false
            }
        };
    },

    computed: {
        tableRows() {
            return this.scraps.map(job => ({
                id: job._id,
                rev: job._rev,
                org: [ job.organization_id, job.organization_short_name ],
                description: _truncate(job.description.it, { length: 100, separator: ' ' }),
                deadline: job.deadline,
                analyzed: job.analyzed,
                smelly: job.smelly,
                imported: job.imported,
                content_id: job.content_id
            }));
        }
    },

    async created() {
        const query = {
            selector: {},
            fields: ['_id', '_rev', 'description', 'organization_id', 'organization_short_name', 'deadline', 'scraped', 'analyzed', 'smelly', 'imported', 'content_id']
        };
        let { docs, bookmark } = await this.$couchdb.post('/_find', query)
            .then(res => {
                return { docs: res.data.docs, bookmark: res.data.bookmark };
            })
            .catch(_e => {

            });
        this.scraps = [...this.scraps, ...docs];
        this.bookmark = bookmark;
        while (docs.length > 0) {
            ({ docs, bookmark } = await this.$couchdb.post('/_find', { ...query, bookmark: bookmark })
                .then(res => {
                    return { docs: res.data.docs, bookmark: res.data.bookmark };
                })
                .catch(_e => {

                }));
            this.scraps = [...this.scraps, ...docs];
            this.bookmark = bookmark;
        }
        this.totalRows = this.scraps.length;
    },

    methods: {
        deleteScrape() {
            const deleteRequests = this.toBeDeleted.map(item => this.$couchdb.delete(`${item.id}`, { params: { rev: item.rev } }));

            Promise.all(deleteRequests)
                .then(_responses => {
                    this.$root.$emit("global-notification", {
                        type: "success",
                        message: this.$t('content_editor.delete_content_success')
                    });
                    this.scraps = this.scraps.filter(scrap => !this.toBeDeleted.find((e) => e.id === scrap._id));
                })
                .catch(errors => {
                    this.$root.$emit("global-notification", {
                        type: "danger",
                        message: `${this.$t('content_editor.delete_content_fail')}<br/>${errors}`
                    });
                })
                .finally(() => {
                    this.toBeDeleted = [];
                });
        },
        rowClass(item, _type) {
            let classes = [];
            if (item) {
                if (new Date(item.deadline) < new Date()) {
                    classes.push('expired');
                }
            }
            return classes.join(' ');
        },
        tableFilter(item, filter) {
            return (new Date(item.deadline) >= new Date() || filter.showExpired);
        },
        onFiltered(filteredItems) {
            this.totalRows = filteredItems.length;
        },
        onSelected(rows) {
            this.toBeDeleted = rows;
        }
    }
});
</script>