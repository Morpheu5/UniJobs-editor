<template>
    <div id="content-editor">
        <b-row v-if="content">
            <b-col>
                <b-row class="mt-3">
                    <b-col>
                        <h3>Title</h3>
                        <b-card no-body>
                            <b-tabs card>
                                <b-tab v-for="l in availableLocales()" :key="`title-${l.code}`">
                                    <template slot="title">
                                        {{ l.name }} <span v-show="!content.title[l.code] || content.title[l.code] == ''" class="missing">(missing)</span>
                                    </template>
                                    <b-form-input v-model="content.title[l.code]" type="text" placeholder="Enter a title" />
                                </b-tab>
                            </b-tabs>
                        </b-card>
                    </b-col>
                </b-row>

                <div v-for="(block, i) in content.content_blocks" :key="block.uuid" class="content_block mt-5">
                    <b-row>
                        <b-col>
                            <div class="float-left">
                                <h4>block type: {{ block.block_type }}</h4>
                            </div>
                            <div class="float-right">
                                <span v-show="block.delete" class="text-danger">This block will be deleted when you save the document. </span>
                                <b-button v-show="block.delete" variant="success" size="sm" @click="block.delete = false"><fa :icon="['fas', 'undo']" fixed-width /></b-button>
                                <b-button v-show="!block.delete" variant="danger" size="sm" @click="block.delete = true"><fa :icon="['far', 'trash-alt']" fixed-width /></b-button>
                            </div>
                        </b-col>
                    </b-row>
                    <b-row class="mt-2">

                        <component v-model="content.content_blocks[i]" :contentId="id" :is="contentTypeToComponentBlockName(block.block_type)" />

                    </b-row>
                </div>

                <div class="content_block mt-4">
                    <b-row>
                        <b-col>
                            <p class="text-center">
                                <b-dropdown text="Add a block of type " size="sm" class="ml-2" variant="success">
                                    <b-dropdown-item v-for="t in ['text']" :key="t" @click="addContentBlock(t)">
                                        {{ t[0].toUpperCase() + t.slice(1) }}
                                    </b-dropdown-item>
                                </b-dropdown>
                            </p>
                        </b-col>
                    </b-row>
                </div>

                <b-card class="mt-2">
                    <div class="float-right">
                        <b-button v-b-modal.deleteContentModal class="mr-3" variant="outline-danger">Delete</b-button>
                        <b-button :disabled="!documentDirty" class="mr-0" variant="success" @click="saveContent">Save</b-button>
                    </div>
                </b-card>

                <b-modal id="deleteContentModal" title="Delete this content?" ok-variant="danger" ok-title="Yes" header-text-variant="danger" @ok="deleteContent">
                    <p><strong>This action is permanent</strong>.</p>
                    <p>If you confirm, you <strong>will not</strong> be able to recover the content.</p>
                    <p>Have you considered the alternative? You could <strong>unpublish</strong> this content instead.</p>
                    <p class="my-4 text-danger"><strong>Are you sure you want to delete this content?</strong></p>
                </b-modal>

            </b-col>

            <b-col class="sidebar" cols="4">
                <b-card>
                    <template slot="header">
                        <h6 class="m-0">Meta</h6>
                    </template>
                    
                    <b-form-checkbox id="published" v-model="content.metadata.published">Published</b-form-checkbox>

                    <component v-model="content.metadata" :organization="content.organization" :is="contentTypeToComponentMetaName(content.content_type)" />
                </b-card>
            </b-col>
        </b-row>
    </div>
</template>

<script>
import _ from "lodash";
import uuidv4 from "uuid/v4";

import JobMetadata from "./content_metadata/JobMetadata";
import PageMetadata from "./content_metadata/PageMetadata";

export default {
    components: {
        JobMetadata,
        PageMetadata
    },
    props: {
        id: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            content: null,
            referenceDocument: null,
            documentDirty: false,
        };
    },
    watch: {
        content: {
            handler: _.debounce(function() {
                if (_.isEqual(this.content, this.referenceDocument)) {
                    this.documentDirty = false;
                } else {
                    this.documentDirty = true;
                }
                this.$root.$emit('unsaved-changes', this.documentDirty);
            }, 500),
            deep: true
        }
    },
    created() {
        this.fetchContent();
    },
    methods: {
        updateOrganization(e) {
            this.content.organization = _.cloneDeep(e);
        },
        addContentBlock(blockType) {
            this.content.content_blocks = [
                ...this.content.content_blocks,
                {
                    block_type: blockType,
                    uuid: uuidv4(),
                    delete: false,
                    order: this.content.content_blocks.length > 0 ? _.last(this.content.content_blocks).order + 1 : 1
                }
            ];
        },
        fetchContent() {
            this.$axios
                .get(`/contents/${this.id}`)
                .then(response => {
                    // Add the "delete" property on the fly to the response data before assigning it
                    // to the component, otherwise stuff will not bind to it.
                    let q = _.clone(response.data.content_blocks);
                    let i = 0;
                    while (i < q.length) {
                        q[i].delete = false;
                        if (q[i].content_blocks) {
                            q.push(_.clone(q[i].content_blocks));
                        }
                        i += 1
                    }
                    this.content = _.cloneDeep(response.data);
                    this.referenceDocument = _.cloneDeep(response.data);
                })
                .catch(error => {
                    this.content = null;
                    this.$root.$emit("global-notification", {
                        type: "danger",
                        message: `Could not retrieve content.<br/>${error}`
                    });
                });
        },
        saveContent() {
            const requests = [];

            // Prepare the requests for the content_blocks
            for (const contentBlock of this.content.content_blocks) {
                const contentBlockParams = contentBlock.delete ? null : { data: _.omit(contentBlock, ["id"]) };
                const contentBlockMethod = contentBlock.delete ? 'delete' : (contentBlock.id ? 'patch' : 'post');
                if (contentBlockMethod !== 'delete' || contentBlock.id) {
                    requests.push(
                        this.$axios[contentBlockMethod](
                            `/contents/${this.id}/content_blocks/${contentBlock.id || ''}`,
                            contentBlockParams
                        )
                    );
                }
            }

            // Prepare the request for the content
            const contentParams = {
                data: _.merge(
                    _.omit(this.content, ["id", "content_blocks", "organization"]),
                    { organization_id: this.content.organization.id }
                )
            };
            const contentMethod = this.content.id ? 'patch' : 'post';
            requests.push(
                this.$axios[contentMethod](
                    `/contents/${this.id}`,
                    contentParams
                )
            );

            Promise.all(requests)
                .then(() => {
                    this.fetchContent();
                    this.$root.$emit("global-notification", {
                        type: "success",
                        message: "Content saved correctly."
                    });
                })
                .catch(error => {
                    this.$root.$emit("global-notification", {
                        type: "danger",
                        message: `Something went wrong while saving this content.<br/>${error}`
                    });
            });
        },
        deleteContent() {
            // TODO: Implement this.
        },
        contentTypeToComponentBlockName(n) {
            return `${_.capitalize(_.camelCase(n))}ContentBlock`;
        },
        contentTypeToComponentMetaName(n) {
            return `${_.capitalize(_.camelCase(n))}Metadata`;
        }
    }
};
</script>
