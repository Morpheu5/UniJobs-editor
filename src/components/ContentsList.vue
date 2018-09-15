<template>
    <div id="content_list_page">
        <b-row>
            <b-col cols="8">
                <h2 class="mb-3">Your contents</h2>
            </b-col>
            <b-col cols="2">
                <div class="float-right">
                    <b-button v-if="contentTypesForCreation.length === 1" variant="success">
                        <fa :icon="['fas', 'plus']" class="mr-2" /> Create new {{ contentTypesForCreation[0].name }}
                    </b-button>
                    <b-dropdown v-else text="Create new " variant="success">
                        <template slot="text">
                            <fa :icon="['fas', 'plus']" class="mr-2" /> Create new…
                        </template>
                        <b-dropdown-item v-for="contentType in contentTypesForCreation" :key="contentType.id" :to="`/contents/${contentType.id}/new`">
                            {{ contentType.name }}
                        </b-dropdown-item>
                    </b-dropdown>
                </div>
            </b-col>
        </b-row>
        <div id="content-list">
            <b-row class="header mb-1 no-gutters">
                <b-col cols="1"></b-col>
                <b-col cols="4">
                    <b-input-group>
                        <b-input-group-text slot="prepend" :class="filters.title ? 'bg-primary border-primary' : ''" @click="filters.title = ''">
                            <fa :icon="['fas', filters.title ? 'times' : 'search']" :class="filters.title ? 'text-white' : ''" />
                        </b-input-group-text>
                        <b-input v-model="filters.title" type="text" size="sm" placeholder="Title"></b-input>
                    </b-input-group>
                </b-col>
                <b-col cols="2" class="text-center px-3">
                    <b-input-group>
                        <b-input-group-text slot="prepend" :class="filters.content_type ? 'bg-primary border-primary' : ''" @click="filters.content_type = null">
                            <fa :icon="['fas', filters.content_type ? 'times' : 'filter']" :class="filters.content_type ? 'text-white' : ''" />
                        </b-input-group-text>
                        <b-form-select v-model="filters.content_type" :options="contentTypes" size="sm" />
                    </b-input-group>
                </b-col>
                <b-col cols="1">
                    Published
                </b-col>
                <b-col cols="1">Created</b-col>
                <b-col cols="1">Updated</b-col>
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
                <b-col cols="4">
                    <div v-for="(v, k) in content.title" :key="`${content.uuid}-${k}`"><span class="lang">{{k}}</span>{{ v }}</div>
                </b-col>
                <b-col cols="2" class="text-center">
                    <div class="mt-3">{{ content.content_type | titleCase }}</div>
                </b-col>
                <b-col cols="1">
                    <div class="mt-3 text-center">
                        <fa v-if="content.metadata.published" :icon="['far', 'check-square']" size="lg" />
                        <fa v-else :icon="['far', 'square']" size="lg" />
                    </div>
                </b-col>
                <b-col cols="1">{{ content.created_at | formatDate }}</b-col>
                <b-col cols="1">{{ content.updated_at | formatDate }}</b-col>
            </b-row>
        </div>

        <b-modal id="deleteContentModal" title="Delete this content?" ok-variant="danger" ok-title="Yes" header-text-variant="danger" @ok="deleteContent" @cancel="toBeDeleted = []">
            <p><strong>This action is permanent</strong>.</p>
            <p>If you confirm, you <strong>will not</strong> be able to recover the content.</p>
            <p>Have you considered the alternative? You could <strong>unpublish</strong> this content instead.</p>
            <p class="my-4 text-danger"><strong>Are you sure you want to delete this content?</strong></p>
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
        }
    },
    data() {
        return {
            contents: [],
            filters: {
                title: '',
                content_type: null,
            },
            toBeDeleted: [],
        };
    },
    computed: {
        filteredContents() {
            let filteredContents = this.contents;
            if (this.filters.title !== '') {
                const titleFilters = new RegExp(this.filters.title.split(new RegExp(',| ')).filter(e => e !== '').join('|'), 'i');
                filteredContents = filteredContents.filter(content => Object.values(content.title).some(v => v.match(titleFilters)));
            }
            if (this.filters.content_type !== null) {
                filteredContents = filteredContents.filter(content => content.content_type === this.filters.content_type);
            }
            return filteredContents;
        },
        contentTypes() {
            let options = [{ value: null, text: "Content Type"}];
            let otherOptions = _uniq(this.contents.map(c => c.content_type)).map(t => ({ value: t, text: _capitalize(t)}));
            return [...options, ...otherOptions];
        },
        contentTypesForCreation() {
            if (!this.$store.state.user) {
                return [];
            }
            const types = [
                { name: 'Job offer', id: 'job',
                  roles: ['ADMIN', 'CONTENT_EDITOR', 'JOB_EDITOR']
                },
                { name: 'Page', id: 'page',
                  roles: ['ADMIN', 'CONTENT_EDITOR']
                }
            ];
            const userRole = this.$store.state.user.role;
            return types.filter(type => type.roles.includes(userRole));
        }
    },
    created() {
        this.$axios
            .get("/contents")
            .then(response => {
                this.contents = response.data;
            })
            .catch(error => {
                this.contents = [];
                this.$root.$emit("global-notification", {
                    type: "danger",
                    message: `There was a problem retrieving the list of contents.<br/>${error}`
                });
        });
    },
    methods: {
        deleteContent() {
            const deleteRequests = this.toBeDeleted.map(e => this.$axios.delete(`/contents/${e}`));

            Promise.all(deleteRequests)
                .then(responses => {
                    this.$root.$emit("global-notification", {
                        type: "success",
                        message: "Content deleted succesfully."
                    });
                    console.log(responses);
                    // TODO Finish up updating list
                })
                .catch(errors => {
                    this.$root.$emit("global-notification", {
                        type: "danger",
                        message: `Something went wrong while deleting content.<br/>${errors}`
                    });
                });

            this.toBeDeleted = [];
        }
    }
};
</script>
