<template>
    <div>
        <p v-show="thisOrganization.ancestors && thisOrganization.ancestors.length > 0">
            <fa :icon="['fas', 'times']" size="sm" class="mr-1 text-danger" @click="thisOrganization = { ancestors: [] }" /> {{ thisOrganization.ancestors | formatPath }}
        </p>
        
        <b-input-group>
            <b-input-group-text slot="append" :class="organizationSearchQuery ? 'bg-primary border-primary' : ''" @click="organizationSearchQuery = ''">
                <fa :icon="['fas', organizationSearchQuery ? 'times' : 'search']" :class="organizationSearchQuery ? 'text-white' : ''" />
            </b-input-group-text>
            <b-input v-model="organizationSearchQuery" :placeholder="$t('content_meta.type_to_search')"></b-input>
        </b-input-group>
        <div class="mt-3">
            <p v-show="organizationSearchQueryFetching || organizationSearchQueryDirty">{{ $t('content_meta.searching') }}</p>
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
                {{ $t('content_meta.no_organizations_found') }}
            </div>
        </div>
    </div>
</template>

<script>
import _cloneDeep from 'lodash/cloneDeep';
import _debounce from 'lodash/debounce';
import _merge from 'lodash/merge';
import _omit from 'lodash/omit';

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
        }
    },
    data() {
        return {
            thisOrganization: _cloneDeep(this.value.value),
            
            organizationSearchQuery: '',
            organizationSearchQueryDirty: false,
            organizationSearchQueryFetching: false,

            organizationSearchResults: []
        };
    },
    watch: {
        thisOrganization: {
            handler: function(newOrg) {
                _merge(newOrg, newOrg.ancestors[newOrg.ancestors.length-1]);
                this.$emit('input', this.thisOrganization);
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
    }
};
</script>

