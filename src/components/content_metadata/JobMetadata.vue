<template>
    <div>
        <b-card :class="metadata.job_title.validity ? 'invalid' : ''" no-body class="mt-3 field_container">
            <template slot="header">
                <h6 class="m-0">Job title</h6>
            </template>
            <b-tabs card>
                <b-tab v-for="l in availableLocales()" :key="l.name">
                    <template slot="title">
                        {{ l.name }} <span v-show="!metadata.job_title.value[l.code] || metadata.job_title.value[l.code].content == ''" class="missing">*</span>
                    </template>
                    <b-form-input v-model="metadata.job_title.value[l.code].content" class="validated_input" required></b-form-input>
                </b-tab>
            </b-tabs>
        </b-card>

        <b-card class="mt-3 field_container">
            <template slot="header">
                <h6 class="m-0">Salary (&euro;)</h6>
            </template>
            <b-form-input v-model="metadata.salary.value" placeholder="e.g., 20000, 24000-30000…" required></b-form-input>
            <b-radio-group id="tax_status" v-model="metadata.tax_status.value" class="mt-3" required>
                <b-radio class="validated_input" value="gross" name="tax_status">Gross</b-radio>
                <b-radio class="validated_input" value="tax-exempt" name="tax_status">Tax exempt</b-radio>
            </b-radio-group>
        </b-card>

        <b-card :class="organization.validity" class="mt-3 field_container">
            <template slot="header">
                <h6 class="m-0">Organization</h6>
            </template>

            <p>{{ thisOrganization.ancestors | formatPath }}</p>
            
            <b-input v-model="organizationSearchQuery" class="validated_input" required placeholder="Type to search Organizations…"></b-input>
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
            <ul v-show="organization.invalidFeedback" class="invalid_feedback">
                <li v-for="(v,k) in organization.invalidFeedback" :key="k">{{ v }}</li>
            </ul>
        </b-card>

        <b-card class="mt-3">
            <template slot="header">
                <h6 class="m-0">Application Deadline</h6>
            </template>

            <b-input-group>
                <b-input-group-text slot="append" class="validated_input" required><fa :icon="['far', 'calendar-alt']" /></b-input-group-text>
                <flat-pickr v-model="metadata.deadline.value"
                            :config="deadlinePickerOptions"
                />
            </b-input-group>
        </b-card>

        <b-card no-body class="mt-3">
            <template slot="header">
                <h6 class="m-0">Application URL</h6>
            </template>
            <b-tabs card>
                <b-tab v-for="l in availableLocales()" :key="l.name">
                    <template slot="title">
                        {{ l.name }} <span v-show="!metadata.url.value[l.code] || metadata.url.value[l.code].content == ''" class="missing">*</span>
                    </template>
                    <b-form-input v-model="metadata.url.value[l.code].content" class="validated_input" required></b-form-input>
                </b-tab>
            </b-tabs>
        </b-card>
    </div>
</template>

<script>
import _ from 'lodash';

import Input from '../Input.js';

class JobMetadataData {
    constructor(data) {
        this.published = new Input(data.published);
        this.job_title = new Input(data.job_title);
        this.salary = new Input(data.salary);
        this.tax_status = new Input(data.tax_status);
        this.deadline = new Input(data.deadline);
        this.url = new Input(data.url);
    }

    validate() {
        console.log(this);
    }
};

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
            metadata: new JobMetadataData(_.merge({
                published: false,
                job_title: this.spreadOverLocales({ content: '' }),
                salary: '',
                tax_status: null,
                deadline: new Date(),
                url: this.spreadOverLocales({ content: '' })
            }, this.value)),

            thisOrganization: _.cloneDeep(this.organization.value),
            
            organizationSearchQuery: '',
            organizationSearchQueryDirty: false,
            organizationSearchQueryFetching: false,

            organizationSearchResults: [],

            deadlinePickerOptions: {
                dateFormat: 'Z',
                altFormat: 'd/m/Y @ H:i',
                altInput: true,
                enableTime: true,
                time_24hr: true,
                allowInput: true,
                wrap: true
            }
        };
    },
    watch: {
        metadata: {
            handler: function() {
                this.$emit('input', this.metadata);
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
        },
        clearThisOrganization() {
            this.thisOrganization = {ancestors:[]};
        },
        validate() {
            return this.metadata.validate();
        }
    }
};

</script>
