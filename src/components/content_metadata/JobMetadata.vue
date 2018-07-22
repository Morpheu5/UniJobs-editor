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

            <p>{{ thisOrganization.ancestors | formatPath }}</p>
            
            <b-input v-model="organizationSearchQuery" placeholder="Type to search Organizations…"></b-input>
            <div class="mt-3">
                <p v-show="organizationSearchQueryFetching || organizationSearchQueryDirty">Searching…</p>
                <b-list-group v-if="organizationSearchResults.length">
                    <b-list-group-item
                        v-for="org in flattenForest(organizationSearchResults)"
                        :key="org.organization_id"
                        :active="thisOrganization.id === org.organization_id"
                        button
                        @click="thisOrganization = org">
                        {{ org.ancestors | formatPath }}
                    </b-list-group-item>
                </b-list-group>
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
    filters: {
        formatPath(path) {
            return path ? path.map((e, i, a) => (i < a.length-1 ? e.short_name : e.name)).join(' › ') : '';
        }
    },
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
            handler: function(newOrg) {
                _.merge(newOrg, newOrg.ancestors[newOrg.ancestors.length-1]);
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
            .catch(_error => {
                this.organizationSearchQueryDirty = false;
                this.organizationSearchQueryFetching = false;

                this.organizationSearchResults = [];
                // TODO Signal a problem with search.
            });
        }, 500),
        flattenTree(node, path = []) {
            let _path = [...path, _.omit(node, 'children')];
            if (node.children) {
                return node.children.reduce((accumulator, child) => accumulator.concat(this.flattenTree(child, _path)), []);
            }
            return [_path];
        },
        flattenForest(forest) {
            return forest.reduce((accumulator, node) => accumulator.concat(this.flattenTree(node)), [])
                         .map(t => ({ organization_id: t[t.length-1].id, ancestors: t }));
        }
    }
}

</script>
