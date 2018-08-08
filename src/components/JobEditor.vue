<template>
    <div id="job-editor">
        <b-row v-if="job">
            <b-col>
                <b-row class="mt-3">
                    <b-col>
                        <h3>Title</h3>
                        <p>A brief description of the job advert.</p>
                        <b-card no-body>
                            <b-tabs card>
                                <b-tab v-for="l in availableLocales()" :key="`title-${l.code}`">
                                    <template slot="title">
                                        {{ l.name }} <span v-show="!job.title[l.code] || job.title[l.code] == ''" class="missing">(missing)</span>
                                    </template>
                                    <b-form-input v-model="job.title[l.code]" type="text" placeholder="Enter a title" />
                                </b-tab>
                            </b-tabs>
                        </b-card>
                    </b-col>
                </b-row>

                <div v-for="(block, i) in job.content_blocks" :key="block.uuid" class="content_block mt-5">
                    <b-row>
                        <b-col>
                            <div class="float-left">
                                <h4>block type: {{ block.block_type }}</h4>
                            </div>
                            <div class="float-right">
                                <span v-show="block.delete" class="text-danger">This block will be deleted when you save the document. </span>
                                <b-button v-show="block.delete" variant="success" size="sm" @click="block.delete = false">&circlearrowleft;</b-button>
                                <b-button v-show="!block.delete" variant="danger" size="sm" @click="block.delete = true">&times;</b-button>
                            </div>
                        </b-col>
                    </b-row>
                    <b-row class="mt-2">

                        <component v-model="job.content_blocks[i]" :contentId="id" :is="contentTypeToComponentName(block.block_type)" />

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
                        <b-button v-b-modal.deleteJobModal class="mr-3" variant="outline-danger">Delete</b-button>
                        <b-button :disabled="!documentDirty" class="mr-0" variant="success" @click="saveJob">Save</b-button>
                    </div>
                </b-card>

                <b-modal id="deleteJobModal" title="Delete this job?" ok-variant="danger" ok-title="Yes" header-text-variant="danger" @ok="deleteJob">
                    <p><strong>This action is permanent</strong>.</p>
                    <p>If you confirm, you <strong>will not</strong> be able to recover the job offer.</p>
                    <p>Have you considered the alternative? You could <strong>unpublish</strong> this job offer instead.</p>
                    <p class="my-4 text-danger"><strong>Are you sure you want to delete this job offer?</strong></p>
                </b-modal>

            </b-col>

            <b-col class="sidebar" cols="4">
                <b-card>
                    <template slot="header">
                        <h6 class="m-0">Meta</h6>
                    </template>
                    
                    <b-form-checkbox id="published" v-model="job.metadata.published">Published</b-form-checkbox>

                    <job-metadata v-model="job.metadata" :organization="job.organization" />
                </b-card>
            </b-col>
        </b-row>
    </div>
</template>

<script>
import _ from "lodash";
import uuidv4 from "uuid/v4";

import JobMetadata from "./content_metadata/JobMetadata";

export default {
    components: {
        JobMetadata
    },
    props: {
        id: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            job: null,
            referenceDocument: null,
            documentDirty: false,
        };
    },
    watch: {
        job: {
            handler: _.debounce(function() {
                if (_.isEqual(this.job, this.referenceDocument)) {
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
        this.fetchJob();
    },
    methods: {
        updateOrganization(e) {
            this.job.organization = _.cloneDeep(e);
        },
        addContentBlock(blockType) {
            this.job.content_blocks = [
                ...this.job.content_blocks,
                {
                    block_type: blockType,
                    uuid: uuidv4(),
                    delete: false,
                    order: this.job.content_blocks.length > 0 ? _.last(this.job.content_blocks).order + 1 : 1
                }
            ];
        },
        fetchJob() {
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
                    this.job = _.cloneDeep(response.data);
                    this.referenceDocument = _.cloneDeep(response.data);
                })
                .catch(error => {
                    this.job = null;
                    this.$root.$emit("global-notification", {
                        type: "danger",
                        message: `Could not retrieve content.<br/>${error}`
                    });
                });
        },
        saveJob() {
            const requests = [];

            // Prepare the requests for the content_blocks
            for (const contentBlock of this.job.content_blocks) {
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
            const jobParams = {
                data: _.merge(
                    _.omit(this.job, ["id", "content_blocks", "organization"]),
                    { organization_id: this.job.organization.id }
                )
            };
            const jobMethod = this.job.id ? 'patch' : 'post';
            requests.push(
                this.$axios[jobMethod](
                    `/contents/${this.id}`,
                    jobParams
                )
            );

            Promise.all(requests)
                .then(() => {
                    this.fetchJob();
                    // this.referenceDocument = _.cloneDeep(this.job);
                    this.$root.$emit("global-notification", {
                        type: "success",
                        message: "Job saved correctly."
                    });
                })
                .catch(error => {
                    this.$root.$emit("global-notification", {
                        type: "danger",
                        message: `Something went wrong while saving this job.<br/>${error}`
                    });
            });
        },
        deleteJob() {
            // TODO: Implement this.
        },
        contentTypeToComponentName(n) {
            return `${_.capitalize(_.camelCase(n))}ContentBlock`;
        }
    }
};
</script>
