<template>
    <div>
        <b-form-checkbox id="published" v-model="metadata.published.value">Published</b-form-checkbox>

        <b-card :class="metadata.job_title.validity" no-body class="mt-3 field_container">
            <template slot="header">
                <h6 class="m-0">Job title</h6>
            </template>

            <div class="px-3 pb-3">
                <b-input-group v-for="l in availableLocales()" :key="l.name" class="mt-3">
                    <b-input-group-text slot="prepend" class="text-monospace">
                        <small>{{ l.code }}</small>
                    </b-input-group-text>

                    <b-input v-model="metadata.job_title.value[l.code].content" required></b-input>
                </b-input-group>

                <ul v-show="metadata.job_title.invalidFeedback.length > 0" class="invalid_feedback mt-3 mb-0">
                    <li v-for="(v, k) in metadata.job_title.invalidFeedback" :key="k">{{ v }}</li>
                </ul>
            </div>
        </b-card>

        <b-card :class="[metadata.salary.validity, metadata.tax_status.validity].includes('invalid') ? 'invalid' : null" class="mt-3 field_container">
            <template slot="header">
                <h6 class="m-0">Salary (&euro;)</h6>
            </template>

            <b-form-input v-model="metadata.salary.value" placeholder="e.g., 20000, 24000-30000…" required></b-form-input>
            <b-radio-group id="tax_status" v-model="metadata.tax_status.value" class="mt-3" required>
                <b-radio value="gross" name="tax_status">Gross</b-radio>
                <b-radio value="tax-exempt" name="tax_status">Tax exempt</b-radio>
            </b-radio-group>

            <ul v-show="[...metadata.salary.invalidFeedback, ...metadata.tax_status.validity].length > 0" class="invalid_feedback mt-3 mb-0">
                <li v-for="(v, k) in [...metadata.salary.invalidFeedback, ...metadata.tax_status.invalidFeedback]" :key="k">{{ v }}</li>
            </ul>
        </b-card>

        <b-card :class="organization.validity" class="mt-3 field_container">
            <template slot="header">
                <h6 class="m-0">Organization</h6>
            </template>

            <p v-show="thisOrganization.ancestors && thisOrganization.ancestors.length > 0">
                <fa :icon="['fas', 'times']" size="sm" class="mr-1 text-danger" @click="thisOrganization = { ancestors: [] }" /> {{ thisOrganization.ancestors | formatPath }}
            </p>
            
            <b-input-group>
                <b-input-group-text slot="append" :class="organizationSearchQuery ? 'bg-primary border-primary' : ''" @click="organizationSearchQuery = ''">
                    <fa :icon="['fas', organizationSearchQuery ? 'times' : 'search']" :class="organizationSearchQuery ? 'text-white' : ''" />
                </b-input-group-text>
                <b-input v-model="organizationSearchQuery" placeholder="Type to search…"></b-input>
            </b-input-group>
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
            <ul v-show="organization.invalidFeedback.length > 0" class="invalid_feedback">
                <li v-for="(v, k) in organization.invalidFeedback" :key="k">{{ v }}</li>
            </ul>
        </b-card>

        <b-card :class="metadata.deadline.validity" class="mt-3">
            <template slot="header">
                <h6 class="m-0">Application Deadline</h6>
            </template>

            <b-input-group>
                <b-input-group-text slot="append" required><fa :icon="['far', 'calendar-alt']" /></b-input-group-text>
                <flat-pickr v-model="metadata.deadline.value"
                            :config="deadlinePickerOptions"
                />
            </b-input-group>

            <ul v-show="metadata.deadline.invalidFeedback.length > 0" class="invalid_feedback">
                <li v-for="(v, k) in metadata.deadline.invalidFeedback" :key="k">{{ v }}</li>
            </ul>
        </b-card>

        <b-card :class="metadata.url.validity" no-body class="mt-3 field_container">
            <template slot="header">
                <h6 class="m-0">Application URL</h6>
            </template>

            <div class="px-3 pb-3">
                <b-input-group v-for="l in availableLocales()" :key="l.name" class="mt-3">
                    <b-input-group-text slot="prepend" class="text-monospace">
                        <small>{{ l.code }}</small>
                    </b-input-group-text>

                    <b-input v-model="metadata.url.value[l.code].content" required></b-input>
                </b-input-group>

                <ul v-show="metadata.url.invalidFeedback.length > 0" class="invalid_feedback mt-3 mb-0">
                    <li v-for="(v, k) in metadata.url.invalidFeedback" :key="k">{{ v }}</li>
                </ul>
            </div>
        </b-card>
    </div>
</template>

<style lang="scss">
input.flatpickr-input.form-control {
    background: white;
}
</style>


<script>
import _cloneDeep from 'lodash/cloneDeep';
import _debounce from 'lodash/debounce';
import _merge from 'lodash/merge';
import _omit from 'lodash/omit';

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

    get document() {
        return {
            published: this.published.value,
            job_title: this.job_title.value,
            salary: this.salary.value,
            tax_status: this.tax_status.value,
            deadline: this.deadline.value,
            url: this.url.value,
        };
    }

    validate() {
        let valid = true;

        if (Object.entries(this.job_title.value).some(e => e[1].content === '')) {
            this.job_title.validity = 'invalid';
            this.job_title.invalidFeedback = ['Missing translations'];
            valid = false;
        } else {
            this.job_title.validity = 'valid';
            this.job_title.invalidFeedback = [];
        }

        if (this.salary.value !== '' && this.tax_status.value === null) {
            this.tax_status.validity = 'invalid';
            this.tax_status.invalidFeedback = ['If you specify a salary, you must specify a tax status as well'];
            valid = false;
        } else {
            this.tax_status.validity = 'valid';
            this.tax_status.invalidFeedback = [];
        }

        if (this.deadline.value === '') {
            this.deadline.validity = 'invalid';
            this.deadline.invalidFeedback = ['Required field'];
            valid = false;
        } else {
            this.deadline.validity = 'valid';
            this.deadline.invalidFeedback = [];
        }

        if (Object.entries(this.url.value).some(e => e[1].content === '')) {
            this.url.validity = 'invalid';
            this.url.invalidFeedback = ['Missing URLs'];
            valid = false;
        } else {
            this.url.validity = 'valid';
            this.url.invalidFeedback = [];
        }

        return valid;
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
            metadata: new JobMetadataData(_merge({
                published: false,
                job_title: this.spreadOverLocales({ content: '' }),
                salary: '',
                tax_status: null,
                deadline: new Date(),
                url: this.spreadOverLocales({ content: '' })
            }, this.value)),

            thisOrganization: _cloneDeep(this.organization.value),
            
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
                allowInput: false,
                wrap: true
            }
        };
    },
    watch: {
        metadata: {
            handler: function() {
                this.$emit('input', this.metadata.document);
            },
            deep: true
        },
        thisOrganization: {
            handler: function(newOrg) {
                _merge(newOrg, newOrg.ancestors[newOrg.ancestors.length-1]);
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
        fetchOrganizations: _debounce(function() {
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
            let _path = [...path, _omit(node, 'children')];
            if (node.children) {
                return node.children.reduce((accumulator, child) => accumulator.concat(this.flattenTree(child, _path)), []);
            }
            return [_path];
        },
        flattenForest(forest) {
            return forest.reduce((accumulator, node) => accumulator.concat(this.flattenTree(node)), [])
                         .map(t => ({ organization_id: t[t.length-1].id, ancestors: t }));
        },
        
        validate() {
            return this.metadata.validate();
        }
    }
};

</script>
