<template>
    <div>
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
                published: false
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
