<template>
    <div id="job-editor">
        <b-row class="mb-3">
            <b-col cols="6">
                <h2 class="mb-3">Job editor</h2>
            </b-col>
        </b-row>
        <b-row v-if="job">
            <b-col>
                <b-row class="mt-3">
                    <b-col>
                        <h3>Title</h3>
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
                        <b-button class="mr-3" variant="outline-danger">Delete</b-button>
                        <b-button class="mr-0" variant="success" @click="saveJob">Save</b-button>
                    </div>
                </b-card>

            </b-col>

            <b-col class="sidebar" cols="4">
                <b-card>
                    <template slot="header">
                        <h6 class="m-0">Meta</h6>
                    </template>
                    
                    <b-form-checkbox id="published" v-model="job.metadata.published">Published</b-form-checkbox>

                    <job-metadata v-model="job.metadata" />

                    <p class="small mt-4 mb-0"><b>uuid</b><br/>{{ job.uuid }}</p>
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
            showBlocks: false,
        };
    },
    created() {
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
                this.job = response.data;
            })
            .catch(error => {
                this.job = null;
                this.$root.$emit("global-notification", {
                    type: "danger",
                    message: `Could not retrieve content.<br/>${error}`
                });
        });
    },
    methods: {
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
        saveJob() {
            const requests = [];

            // Prepare the requests for the content_blocks
            for (const contentBlock of this.job.content_blocks) {
                const contentBlockParams = { data: _.omit(contentBlock, ["id"]) };
                let contentBlockMethod;
                if (contentBlock.delete) { // FIXME This doesn't work when block is created AND deleted at the same time.
                    contentBlockMethod = 'delete';
                    contentBlockParams = null;
                } else {
                    contentBlockMethod = contentBlock.id ? 'patch' : 'post';
                }
                requests.push(
                    this.$axios[contentBlockMethod](
                        `/contents/${this.id}/content_blocks/${contentBlock.id || ''}`,
                        contentBlockParams
                    )
                );
            }

            // Prepare the request for the content
            const jobParams = { data: _.omit(this.job, ["id", "content_blocks"]) };
            const jobMethod = this.job.id ? 'patch' : 'post';
            requests.push(
                this.$axios[jobMethod](
                    `/contents/${this.id}`,
                    jobParams
                )
            );

            Promise.all(requests)
                .then(() => {
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
        contentTypeToComponentName(n) {
            return `${_.capitalize(_.camelCase(n))}ContentBlock`;
        }
    }
};
</script>
