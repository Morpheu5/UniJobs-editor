<template>
    <div>
        <b-card no-body class="mt-3">
            <template slot="header">
                <h6 class="m-0">Job title</h6>
            </template>
            <b-tabs card>
                <b-tab v-for="l in availableLocales()" :key="l.name">
                    <template slot="title">
                        {{ l.name }} <span v-show="!metadata.job_title[l.code] || metadata.job_title[l.code].content == ''" class="missing">*</span>
                    </template>
                    <b-form-input v-model="metadata.job_title[l.code].content"></b-form-input>
                </b-tab>
            </b-tabs>
        </b-card>

        <b-card class="mt-3">
            <template slot="header">
                <h6 class="m-0">Salary (&euro;)</h6>
            </template>
            <b-form-input v-model="metadata.salary" placeholder="e.g., 20000, 24000-30000…"></b-form-input>
            <b-radio-group id="tax_status" v-model="metadata.tax_status" class="mt-3">
                <b-radio value="gross">Gross</b-radio>
                <b-radio value="tax-exempt">Tax exempt</b-radio>
            </b-radio-group>
        </b-card>

        <b-card class="mt-3">
            <template slot="header">
                <h6 class="m-0">Organisation</h6>
            </template>
            
            <b-input v-model="organizationSearchQuery" placeholder="Type to search Organizations…"></b-input>
            <div class="mt-3">
                <p v-show="organizationSearchQueryFetching || organizationSearchQueryDirty">Searching…</p>
                <div v-if="organizationSearchResults.length">
                    {{ organizationSearchResults }}
                </div>
                <div v-else-if="organizationSearchQuery && !organizationSearchQueryDirty">
                    No organizations found.
                </div>
            </div>
        </b-card>

        <b-card no-body class="mt-3">
            <template slot="header">
                <h6 class="m-0">Application URL</h6>
            </template>
            <b-tabs card>
                <b-tab v-for="l in availableLocales()" :key="l.name">
                    <template slot="title">
                        {{ l.name }} <span v-show="!metadata.url[l.code] || metadata.url[l.code].content == ''" class="missing">*</span>
                    </template>
                    <b-form-input v-model="metadata.url[l.code].content"></b-form-input>
                </b-tab>
            </b-tabs>
        </b-card>
    </div>
</template>

<script>
import _ from 'lodash';

export default {
    props: {
        value: {
            type: Object,
            required: true
        },
        organization: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            metadata: _.merge({
                published: false,
                job_title: this.spreadOverLocales({ content: '' }),
                salary: '',
                tax_status: null,
                url: this.spreadOverLocales({ content: '' })
            }, this.value),

            thisOrganization: _.cloneDeep(this.organization),
            
            organizationSearchQuery: '',
            organizationSearchQueryDirty: false,
            organizationSearchQueryFetching: false,

            organizationSearchResults: []
        }
    },
    watch: {
        metadata: {
            handler: function() {
                this.$emit('input', this.metadata)
            },
            deep: true
        },
        thisOrganization: {
            handler: function() {
                this.$parent.updateOrganization(this.thisOrganization);
            }
        },
        organizationSearchQuery: function() {
            this.organizationSearchQueryDirty = true;
            if (!this.organizationSearchQueryTooShort) {
                this.fetchOrganizations();
            }
        }
    },
    methods: {
        fetchOrganizations: _.debounce(function() {
            this.organizationSearchQueryFetching = true;

            let queryArray = this.organizationSearchQuery.split(/[^a-zA-Z0-9]/).filter(w => w != '');

            this.$axios
                .get(`/organizations?q=${queryArray.join(' ')}`)
                .then(response => {
                    this.organizationSearchQueryDirty = false;
                    this.organizationSearchQueryFetching = false;
                    
                    this.organizationSearchResults = response.data;
                })
                .catch(error => {
                    this.organizationSearchQueryDirty = false;
                    this.organizationSearchQueryFetching = false;

                    this.organizationSearchResults = [];

                    this.$root.$emit("global-notification", {
                        type: "danger",
                        message: `There was a problem retrieving the list of organizations.<br/>${error}`
                    });
                })
        }, 500)
    }
}
</script>
