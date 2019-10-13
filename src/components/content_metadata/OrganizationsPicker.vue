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
                    v-for="org in organizationSearchResults"
                    :key="org.id"
                    :active="thisOrganization.id === org.id"
                    button
                    @click="thisOrganization = org">
                    {{ org.ancestors | formatPath }}
                </b-list-group-item>
            </b-list-group>
            <div v-else-if="organizationSearchQuery && !organizationSearchQueryDirty">
                {{ $t('content_meta.no_organizations_found') }}
            </div>
        </div>
        <div v-if="thisCandidate && Object.keys(thisCandidate).length > 0">
            <p><fa :icon="['fas', 'exclamation-circle']" class="text-danger" size="sm" /> {{ $t('content_meta.organization_candidate.not_found') }}</p>
            <p><strong>{{ thisCandidate.parent_short_name }} &raquo; {{ thisCandidate.name }}</strong> ({{ thisCandidate.short_name }})</p>
            <b-button variant="primary" @click="createOrganization">{{ $t('content_meta.organization_candidate.create') }}</b-button>
        </div>
    </div>
</template>

<script>
import _cloneDeep from 'lodash/cloneDeep';
import _debounce from 'lodash/debounce';
import _merge from 'lodash/merge';

export default {
    filters: {
        formatPath(path) {
            return path ? path.map((e, i, a) => (i < a.length - 1 ? e.short_name : e.name)).join(' › ') : '';
        }
    },
    props: {
        value: {
            type: Object,
            required: true
        },
        candidate: {
            type: Object,
            required: false
        }
    },
    data() {
        return {
            thisOrganization: _cloneDeep(this.value.value),
            thisCandidate: Object.assign({}, this.candidate),

            organizationSearchQuery: '',
            organizationSearchQueryDirty: false,
            organizationSearchQueryFetching: false,

            organizationSearchResults: []
        };
    },
    watch: {
        thisOrganization: {
            handler: function(newOrg) {
                _merge(newOrg, newOrg.ancestors[newOrg.ancestors.length - 1]);
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

            let queryArray = this.organizationSearchQuery.split(/[^a-zA-Z0-9]/).filter(w => w !== '');

            this.$axios
            .get(`/api/organizations?q=${queryArray.join(' ')}`)
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
        async createOrganization() {
            const parentResponse = await this.$axios.get(`/api/organizations?q=${this.thisCandidate.parent_short_name}`)
                .catch(error => {
                    this.$root.$emit("global-notification", {
                        type: "danger",
                        message: `${this.$t('content_editor.organization_candidate_parent_fetch_fail')}<br/>${error}`
                    });
                });
            const parent = parentResponse.data.filter(o => o.short_name.toLowerCase() === this.thisCandidate.parent_short_name.toLowerCase())[0];
            if (!parent) {
                this.$root.$emit("global-notification", {
                    type: "danger",
                    message: `${this.$t('content_editor.organization_candidate_parent_fail')}`
                });
                return;
            }
            const newOrg = {
                parent_id: parent.id,
                name: this.thisCandidate.name,
                short_name: this.thisCandidate.short_name
            };
            this.$axios.post(`/api/organizations`, { data: newOrg })
                .then(response => {
                    this.thisOrganization = response.data;
                    this.thisCandidate = null;
                    // This key-changing forced update is nasty and should not be necessary, but it is :(
                    // this.orgPickerKey += 1;
                })
                .catch(error => {
                    this.$root.$emit("global-notification", {
                        type: "danger",
                        message: `${this.$t('content_editor.organization_candidate_parent_post_fail')}<br/>${error}`
                    });
                });
        }
    }
};
</script>
