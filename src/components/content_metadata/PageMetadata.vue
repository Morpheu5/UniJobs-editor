<template>
    <div>
        <b-card :class="metadata.slug.validity" class="mt-3 field_container">
            <template slot="header">
                <h6 class="m-0">URL Slug</h6>
            </template>

            <b-form-group>
                <b-input id="page_metadata_url_slug"
                         v-model="metadata.slug.value"
                />
            </b-form-group>

            <ul v-show="metadata.slug.invalidFeedback.length > 0" class="invalid_feedback">
                <li v-for="(v, k) in metadata.slug.invalidFeedback" :key="k">{{ v }}</li>
            </ul>
        </b-card>

        <b-card :class="organization.validity" class="mt-3 field_container">
            <template slot="header">
                <h6 class="m-0">Organization</h6>
            </template>

            <p v-show="thisOrganization.ancestors && thisOrganization.ancestors.length > 0">{{ thisOrganization.ancestors | formatPath }}</p>
            
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
            <ul v-show="organization.invalidFeedback.length > 0" class="invalid_feedback">
                <li v-for="(v, k) in organization.invalidFeedback" :key="k">{{ v }}</li>
            </ul>
        </b-card>
    </div>
</template>

<script>
import _cloneDeep from 'lodash/cloneDeep';
import _debounce from 'lodash/debounce';
import _merge from 'lodash/merge';
import _omit from 'lodash/omit';

import Input from '../Input';

class PageMetadataData {
    constructor(data) {
        this.published = new Input(data.published);
        this.slug = new Input(data.slug);
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
            metadata: new PageMetadataData(_merge({
                published: false,
                slug: ''
            }, this.value)),

            thisOrganization: _cloneDeep(this.organization.value),
            
            organizationSearchQuery: '',
            organizationSearchQueryDirty: false,
            organizationSearchQueryFetching: false,

            organizationSearchResults: []
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
            let valid = true;

            if (this.metadata.slug.value === '') {
                this.metadata.slug.validity = 'invalid';
                this.metadata.slug.invalidFeedback = ['Required field'];
                valid = false;
            } else {
                this.metadata.slug.validity = 'valid';
                this.metadata.slug.invalidFeedback = [];
            }

            return valid;
        }
    }
};

</script>
