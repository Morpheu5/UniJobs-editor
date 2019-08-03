<template>
    <div id="content_list_page">
        <b-row>
            <b-col cols="10">
                <h2 class="mb-3">{{ $t('sidebar_menu.contents') }}</h2>
            </b-col>
            <b-col cols="2">
                <div class="float-right">
                    <b-button v-if="contentTypesForCreation.length === 1" variant="success">
                        <fa :icon="['fas', 'plus']" class="mr-2" /> {{ $t('contents_list.create_new') }} {{ $t(`content_type.${contentTypesForCreation[0]}`) }}
                    </b-button>
                    <b-dropdown v-else text="Create new " variant="success">
                        <template slot="text">
                            <fa :icon="['fas', 'plus']" class="mr-2" /> {{ $t('contents_list.create_new') }}
                        </template>
                        <b-dropdown-item v-for="contentType in contentTypesForCreation" :key="contentType.id" :to="`/contents/${contentType.id}/new`">
                            {{ $t(`content_types.${contentType.id}`) | capitalize }}
                        </b-dropdown-item>
                    </b-dropdown>
                </div>
            </b-col>
        </b-row>
        <div id="content-list">
            <b-row class="header mb-1 no-gutters">
                <b-col cols="1"></b-col>
                <b-col cols="5" class="pr-3">
                    <b-input-group>
                        <b-input-group-text slot="prepend" :class="filters.title ? 'bg-primary border-primary' : ''" @click="filters.title = ''">
                            <fa :icon="['fas', filters.title ? 'times' : 'search']" :class="filters.title ? 'text-white' : ''" />
                        </b-input-group-text>
                        <b-input v-model="filters.title" :placeholder="$t('contents_list.title')" type="text" size="sm"></b-input>
                    </b-input-group>
                </b-col>
                <b-col cols="3" class="pr-3">
                    <b-input-group>
                        <b-input-group-text slot="prepend" :class="filters.organization ? 'bg-primary border-primary' : ''" @click="filters.organization = ''">
                            <fa :icon="['fas', filters.organization ? 'times' : 'search']" :class="filters.organization ? 'text-white' : ''" />
                        </b-input-group-text>
                        <b-input v-model="filters.organization" :placeholder="$t('contents_list.organization')" type="text" size="sm"></b-input>
                    </b-input-group>
                </b-col>
                <b-col cols="2" class="text-center pr-3">
                    <b-input-group>
                        <b-input-group-text slot="prepend" :class="filters.content_type ? 'bg-primary border-primary' : ''" @click="filters.content_type = null">
                            <fa :icon="['fas', filters.content_type ? 'times' : 'filter']" :class="filters.content_type ? 'text-white' : ''" />
                        </b-input-group-text>
                        <b-form-select v-model="filters.content_type" :options="contentTypes" size="sm" />
                    </b-input-group>
                </b-col>
                <b-col cols="1">
                    {{ $t('content_meta.published') }}
                </b-col>
                <!-- <b-col cols="1">{{ $t('contents_list.created') }}</b-col> -->
                <!-- <b-col cols="1">{{ $t('contents_list.updated') }}</b-col> -->
            </b-row>
            <b-row v-for="(content, index) in filteredContents" :key="content.uuid" :class="{ even: (index%2), odd: !(index%2), first: !index, last: index == contents.length-1 }" class="py-2 content no-gutters" >
                <b-col cols="1">
                    <div class="text-center mt-2">
                        <b-button v-b-modal.deleteContentModal variant="link text-danger" class="pl-1 pr-0 mx-0" @click="toBeDeleted = [content.id]">
                            <fa :icon="['far', 'trash-alt']" fixed-width size="lg" />
                        </b-button>
                        <b-button :to="`/contents/${content.id}/edit`" variant="link text-primary" class="pl-1 pr-0 mx-0">
                            <fa :icon="['far', 'edit']" fixed-width size="lg" />
                        </b-button>
                    </div>
                </b-col>
                <b-col cols="5">
                    <div v-for="(v, k) in content.title" :key="`${content.uuid}-${k}`"><span class="lang">{{k}}</span>{{ v }}</div>
                </b-col>
                <b-col cols="3">
                    <div>{{ content.organization.ancestors | formatPath }}</div>
                </b-col>
                <b-col cols="2" class="text-center">
                    <div class="mt-3">{{ $t(`content_types.${content.content_type}`) | capitalize }}</div>
                </b-col>
                <b-col cols="1">
                    <div class="mt-3 text-center">
                        <fa v-if="content.metadata.published" :icon="['far', 'check-square']" size="lg" />
                        <fa v-else :icon="['far', 'square']" size="lg" />
                    </div>
                </b-col>
                <!-- <b-col cols="1">{{ content.created_at | formatDate }}</b-col> -->
                <!-- <b-col cols="1">{{ content.updated_at | formatDate }}</b-col> -->
            </b-row>
        </div>

        <b-modal id="deleteContentModal" :title="$t('content_editor.delete_modal_title')" :ok-title="$t('yes')" :cancel-title="$t('no')" ok-variant="danger" header-text-variant="danger" @ok="deleteContent" @cancel="toBeDeleted = []">
            <div v-html="$t('content_editor.delete_modal')" />
        </b-modal>
    </div>
</template>

<style lang="scss">
@import '../assets/custom';

#content-list {
    .header {
        font-weight: bold;

        &:hover {
            background: none !important;
        }
    }

    .row {
        &:hover {
            background: $light;
        }

        div > span.lang {
            min-width: 2em;
            display: inline-block;
            text-align: right;
            margin-right: 1em;
            font-family: $font-family-monospace;
        }
    }
}
</style>

<script>
import _uniq from 'lodash/uniq';
import _capitalize from 'lodash/capitalize';

export default {
    filters: {
        formatDate(d) {
            let date = new Date(d);
            return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        },
        formatPath(path) {
            return path ? path.map((e, i, a) => (i < a.length - 1 ? e.short_name : e.name)).join(' › ') : '';
        }
    },
    data() {
        return {
            contents: [],
            filters: {
                title: '',
                organization: '',
                content_type: null
            },
            toBeDeleted: []
        };
    },
    computed: {
        filteredContents() {
            let filteredContents = this.contents;
            if (this.filters.title !== '') {
                const titleFilters = new RegExp(this.filters.title.split(new RegExp(',| ')).filter(e => e !== '').join('|'), 'i');
                filteredContents = filteredContents.filter(content => Object.values(content.title).some(v => v.match(titleFilters)));
            }
            if (this.filters.organization !== '') {
                const organizationFilters = this.filters.organization.split(new RegExp(',| ')).filter(e => e !== '').map(e => new RegExp(e, 'i'));
                // console.log(organizationFilters);
                filteredContents = filteredContents.filter(content => {
                    return organizationFilters.every(f => content.organization.ancestors.map(e => `${e.name} ${e.short_name}`).join(' ').match(f));
                });
            }
            if (this.filters.content_type !== null) {
                filteredContents = filteredContents.filter(content => content.content_type === this.filters.content_type);
            }
            return filteredContents;
        },
        contentTypes() {
            let options = [{ value: null, text: this.$t('contents_list.content_type') }];
            let otherOptions = _uniq(this.contents.map(c => c.content_type))
                                .map(t => ({ value: t, text: _capitalize(this.$t(`content_types.${t}`)) }));
            return [...options, ...otherOptions];
        },
        contentTypesForCreation() {
            if (!this.$store.state.user) {
                return [];
            }
            const types = [
                { id: 'job', roles: ['ADMIN', 'CONTENT_EDITOR', 'JOB_EDITOR'] },
                { id: 'page', roles: ['ADMIN', 'CONTENT_EDITOR'] }
            ];
            const userRole = this.$store.state.user.role;
            return types.filter(type => type.roles.includes(userRole));
        }
    },
    created() {
        this.$axios
            .get("/api/contents")
            .then(response => {
                this.contents = response.data;
            })
            .catch(error => {
                this.contents = [];
                this.$root.$emit("global-notification", {
                    type: "danger",
                    message: `${this.$t('contents_list.retrieve_list_failed')}<br/>${error}`
                });
        });
    },
    methods: {
        deleteContent() {
            const deleteRequests = this.toBeDeleted.map(e => this.$axios.delete(`/api/contents/${e}`));

            Promise.all(deleteRequests)
                .then(_responses => {
                    this.$root.$emit("global-notification", {
                        type: "success",
                        message: this.$t('content_editor.delete_content_success')
                    });
                    console.log(this.toBeDeleted);
                    this.contents = this.contents.filter(content => !this.toBeDeleted.includes(content.id));
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
        }
    }
};
</script>
