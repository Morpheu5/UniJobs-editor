<template>
    <div id="content_editor">
        <b-row v-if="content">
            <b-col>
                <b-row>
                    <b-col>
                        <b-card :class="content.title.validity" class="field_container">
                            <template slot="header">
                                <h5>{{ $t('content_editor.summary_title') }}</h5>
                                <p class="m-0">{{ $t('content_editor.summary_title_description') }}</p>
                            </template>
                            <b-input-group v-for="l in availableLocales()" :key="`title-${l.code}`" class="mb-3">
                                <b-input-group-text slot="prepend" class="text-monospace">
                                    <small>{{ l.code }}</small>
                                </b-input-group-text>
                                <b-input
                                    v-model="content.title.value[l.code]"
                                    :placeholder="$t('content_editor.summary_title_placeholder', l.iso)"
                                    type="text"
                                    required
                                />
                            </b-input-group>

                            <ul v-show="content.title.invalidFeedback" class="invalid_feedback mb-0">
                                <li v-for="(v,k) in content.title.invalidFeedback" :key="k">{{ v }}</li>
                            </ul>
                        </b-card>
                    </b-col>
                </b-row>

                <div v-for="(block, i) in content.content_blocks" :key="block.uuid" class="content_block mt-5">
                    <b-row>
                        <b-col>
                            <div class="float-left">
                                <h4>{{ $t(`block_types.${block.block_type}`) }}</h4>
                            </div>
                            <div class="float-right">
                                <span v-show="block.delete" class="text-danger">{{ $t('content_editor.delete_block_warning') }} </span>
                                <b-button v-show="block.delete" variant="success" size="sm" @click="block.delete = false"><fa :icon="['fas', 'undo']" fixed-width /></b-button>
                                <b-button v-show="!block.delete" variant="danger" size="sm" @click="block.delete = true"><fa :icon="['far', 'trash-alt']" fixed-width /></b-button>
                            </div>
                        </b-col>
                    </b-row>
                    <b-row class="mt-2">
                        <component :is="contentTypeToComponentBlockName(content.content_blocks[i].block_type)" ref="validatable" v-model="content.content_blocks[i]" :contentId="id" class="validatable" />
                    </b-row>
                </div>

                <div class="content_block mt-4">
                    <b-row>
                        <b-col>
                            <p class="text-center">
                                <b-button size="sm" variant="success" @click="addContentBlock('text')">
                                    <fa :icon="['fas', 'plus']" class="mr-2" /> {{ $t('content_editor.add_block_of_text') }}
                                </b-button>
                                <!--
                                <b-dropdown :text="$t('content_editor.add_block_of_type')" size="sm" class="ml-2" variant="success">
                                    <template slot="text">
                                        <fa :icon="['fas', 'plus']" class="mr-2" /> {{ $t('content_editor.add_block_of_type') }}
                                    </template>
                                    <b-dropdown-item v-for="t in ['text']" :key="t" @click="addContentBlock(t)">
                                        {{ $t(`block_types.${t}`) }}
                                    </b-dropdown-item>
                                </b-dropdown>
                                -->
                            </p>
                        </b-col>
                    </b-row>
                </div>
            </b-col>

            <b-col class="sidebar" cols="4">
                <b-card>
                    <template slot="header">
                        <h6 class="m-0">{{ $t('content_editor.meta') }}</h6>
                    </template>

                    <component :is="contentTypeToComponentMetaName(content.content_type.value)" ref="validatable" v-model="content.metadata" :organization="content.organization" class="validatable" @updateOrganization="updateOrganization" />
                </b-card>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-card class="mt-5">
                    <div class="float-right">
                        <b-button v-b-modal.deleteContentModal class="mr-3" variant="outline-danger">{{ $t('delete') }}</b-button>
                        <b-button :disabled="!documentDirty" class="mr-0" variant="success" @click="saveContent">{{ $t('save') }}</b-button>
                    </div>
                </b-card>

                <b-modal id="deleteContentModal" :title="$t('content_editor.delete_modal_title')" :ok-title="$t('yes')" :cancel-title="$t('no')" ok-variant="danger" header-text-variant="danger" @ok="deleteContent">
                    <div v-html="$t('content_editor.delete_modal')" />
                </b-modal>
            </b-col>
        </b-row>
    </div>
</template>

<style lang="scss">
@import '../assets/custom';

.missing {
    color: theme-color('danger');
}

.field_container.invalid {
    border-color: theme-color('danger');

    .invalid_feedback {
        color: theme-color('danger');
    }
}
</style>

<script>
import _camelCase from 'lodash/camelCase';
import _capitalize from 'lodash/capitalize';
import _clone from 'lodash/clone';
import _cloneDeep from 'lodash/cloneDeep';
import _debounce from 'lodash/debounce';
import _isEqual from 'lodash/isEqual';
import _last from 'lodash/last';
import _merge from 'lodash/merge';
import _omit from 'lodash/omit';

import uuidv4 from "uuid/v4";

import Input from "./Input.js";

import JobMetadata from "./content_metadata/JobMetadata";
import PageMetadata from "./content_metadata/PageMetadata";

class Content {
    constructor(content) {
        this.id = new Input(content.id);
        this.uuid = new Input(content.uuid);
        this.content_type = new Input(content.content_type);
        this.title = new Input(content.title);
        this.metadata = content.metadata;
        this.organization = new Input(content.organization);
        this.content_blocks = content.content_blocks;
    }

    get document() {
        return {
            id: this.id.value,
            uuid: this.uuid.value,
            content_type: this.content_type.value,
            title: this.title.value,
            metadata: this.metadata,
            organization: this.organization.value,
            content_blocks: this.content_blocks
        };
    }

    validate() {
        let valid = true;

        if (Object.entries(this.title.value).some(e => e[1] === '')) {
            this.title.validity = 'invalid';
            this.title.invalidFeedback = ['Missing translations'];
            valid = false;
        } else {
            this.title.validity = 'valid';
            this.title.invalidFeedback = [];
        }

        if (!this.organization.value.id) {
            this.organization.validity = 'invalid';
            this.organization.invalidFeedback = ['Required field.'];
            valid = false;
        } else {
            this.organization.validity = 'valid';
            this.organization.invalidFeedback = [];
        }

        return valid;
    }
};

export default {
    components: {
        JobMetadata,
        PageMetadata
    },
    props: {
        id: {
            type: String,
            required: true
        },
        content_type: {
            type: String,
            required: false
        }
    },
    data() {
        return {
            content: null,
            referenceDocument: null,
            documentDirty: false
        };
    },
    watch: {
        content: {
            handler: _debounce(function() {
                if (_isEqual(this.content.document, this.referenceDocument.document)) {
                    this.documentDirty = false;
                } else {
                    this.documentDirty = true;
                }
                this.$root.$emit('unsaved-changes', this.documentDirty);
            }, 250),
            deep: true
        }
    },
    created() {
        if (this.id === 'new') {
            const contentArgs = {
                id: null,
                uuid: 0,
                content_type: this.content_type,
                title: this.spreadOverLocales(''),
                metadata: {},
                organization: {},
                content_blocks: []
            };
            this.content = new Content(_cloneDeep(contentArgs));
            this.referenceDocument = new Content(_cloneDeep(contentArgs));
        } else {
            this.fetchContent()
                .then(contentArgs => {
                    if (contentArgs) {
                        this.content = new Content(_cloneDeep(contentArgs));
                        this.referenceDocument = new Content(_cloneDeep(contentArgs));
                    }
                });
        }
    },
    methods: {
        updateOrganization(e) {
            this.content.organization.value = _cloneDeep(e);
        },
        addContentBlock(blockType) {
            this.content.content_blocks = [
                ...this.content.content_blocks,
                {
                    block_type: blockType,
                    uuid: uuidv4(),
                    delete: false,
                    order: this.content.content_blocks.length > 0 ? _last(this.content.content_blocks).order + 1 : 1
                }
            ];
        },
        fetchContent() {
            return this.$axios
                .get(`/api/contents/${this.id}`)
                .then(response => {
                    // Add the "delete" property on the fly to the response data before assigning it
                    // to the component, otherwise stuff will not bind to it.
                    let q = _clone(response.data.content_blocks);
                    let i = 0;
                    while (i < q.length) {
                        q[i].delete = false;
                        if (q[i].content_blocks) {
                            q.push(_clone(q[i].content_blocks));
                        }
                        i += 1;
                    }
                    return response.data;
                })
                .catch(error => {
                    this.$root.$emit("global-notification", {
                        type: "danger",
                        message: `${this.$t('content_editor.retrieve_content_fail')}<br/>${error}`
                    });
                    return null;
                });
        },

        validate() {
            // const validatable = this.$children.filter(e => {
            //     console.log(!e.$el.classList && e.$el);
            //     return e.$el.classList && e.$el.classList.contains('validatable')
            // });
            const validatable = this.$refs.validatable;
            const childrenValidity = validatable.validate(); // validatable.map(e => e.validate()).reduce((a, e) => a && e);
            // Oddly enough, this works. I don't understand how, though.

            return this.content.validate() && childrenValidity;
        },

        saveContent(event) {
            event.preventDefault();
            event.stopPropagation();

            if (!this.validate()) {
                return;
            }
            // Prepare the request for the content
            const contentParams = {
                data: _merge(
                    _omit(this.content.document, ["id", "content_blocks", "organization"]),
                    {
                        organization_id: this.content.document.organization.id,
                        content_blocks_attributes: this.content.content_blocks,
                        user_id: this.$store.state.user.id
                    }
                )
            };
            if (this.id === 'new') {
                // Create (POST)
                this.$axios
                    .post('/api/contents', contentParams)
                    .then(response => {
                        // Content created!
                        this.$router.push({ path: `/contents/${response.data.id}/edit` });
                        this.$router.go();
                    }).catch(error => {
                        // Error creating the content
                        this.$root.$emit("global-notification", {
                            type: "danger",
                            message: `${this.$t('content_editor.save_content_fail')}<br/>${error}`
                        });
                    });
            } else if (this.content.document.id) {
                // Edit (PATCH)
                this.$axios
                    .patch(`/api/contents/${this.content.document.id}`, contentParams)
                    .then(_response => {
                        // Content edited!
                        this.fetchContent()
                            .then(contentArgs => {
                                if (contentArgs) {
                                    this.content = new Content(_cloneDeep(contentArgs));
                                    this.referenceDocument = new Content(_cloneDeep(contentArgs));
                                }
                            });
                        this.$root.$emit("global-notification", {
                            type: "success",
                            message: this.$t('content_editor.save_content_success')
                        });
                    }).catch(error => {
                        // Error editing the content
                        this.$root.$emit("global-notification", {
                            type: "danger",
                            message: `${this.$t('content_editor.save_content_fail')}.<br/>${error}`
                        });
                    });
            } else {
                // This is weird...
            }
        },
        deleteContent() {
            this.$axios
                .delete(`/api/contents/${this.content.document.id}`)
                .then(_response => {
                this.$router.push({ path: '/contents' });
                    this.$root.$emit("global-notification", {
                        type: "success",
                        message: this.$t('content_editor.delete_content_success')
                    });
                })
                .catch(error => {
                    this.$root.$emit("global-notification", {
                        type: "danger",
                        message: `${this.$t('content_editor.delete_content_fail')}<br/>${error}`
                    });
                });
        },
        contentTypeToComponentBlockName(n) {
            return `${_capitalize(_camelCase(n))}ContentBlock`;
        },
        contentTypeToComponentMetaName(n) {
            return `${_capitalize(_camelCase(n))}Metadata`;
        }
    }
};
</script>
