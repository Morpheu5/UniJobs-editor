<template>
    <div id="job-editor">
        <b-row>
            <b-col>
                <h2 class="mb-3">Job editor</h2>
            </b-col>
        </b-row>
        <b-row v-if="job">
            <b-col>
                <!-- <b-row class="mt-3">
                    <b-col>
                        <h3>Title</h3>
                        <b-card no-body>
                            <b-tabs card>
                                <b-tab v-for="l in ['it', 'en']" :key="`title-${l}`">
                                    <template slot="title">
                                        {{ l.toUpperCase() }} <span v-show="!job.title[l] || job.title[l] == ''" class="missing">(missing)</span>
                                    </template>
                                    <b-form-input v-model="job.title[l]" type="text" placeholder="Enter a title" />
                                </b-tab>
                            </b-tabs>
                        </b-card>
                    </b-col>
                </b-row> -->

                <div v-for="(block, i) in job.content_blocks" :key="block.uuid" class="content_block mt-5">
                    <b-row>
                        <b-col>
                            <div class="float-left">
                                <h4>block type: {{ block.block_type }}</h4>
                            </div>
                            <div class="float-right">
                                <b-button variant="danger" size="sm">&times;</b-button>
                            </div>
                        </b-col>
                    </b-row>
                    <b-row class="mt-2">

                        <component v-model="job.content_blocks[i]" :contentId="id" :is="contentTypeToComponentName(block.block_type)" />

                    </b-row>
                </div>

                <div class="content_block mt-5">
                    <b-row>
                        <b-col>
                            <p class="text-center">
                                <b-dropdown text="Add a block of type " size="sm" class="ml-2" variant="success">
                                    <b-dropdown-item v-for="t in ['text']" :key="t" @click="addBlock(t)">
                                        {{ t[0].toUpperCase() + t.slice(1) }}
                                    </b-dropdown-item>
                                </b-dropdown>
                            </p>
                        </b-col>
                    </b-row>
                </div>
            </b-col>
            <b-col class="sidebar" cols="4">
                <b-card>
                    <template slot="header">
                        <h6 class="m-0">Meta</h6>
                    </template>
                    <b-form-checkbox id="published" v-model="job.metadata.published">Published</b-form-checkbox>
                    <p class="small mt-4 mb-0"><b>uuid</b><br/>{{ job.uuid }}</p>
                    <template slot="footer">
                        <div class="float-right">
                            <b-button class="mr-3" variant="outline-danger">Delete</b-button>
                            <b-button class="mr-0" variant="success" @click="saveJob">Save</b-button>
                        </div>
                    </template>
                </b-card>
            </b-col>
        </b-row>
    </div>
</template>

<script>
import axios from "axios";
import _ from "lodash";
import uuidv4 from "uuid/v4";

export default {
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
        axios
            .get(`http://localhost:3000/contents/${this.id}`)
            .then(response => {
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
        addBlock(block_type) {
            this.job.content_blocks = [
                ...this.job.content_blocks,
                {
                    block_type: block_type,
                    uuid: uuidv4()
                }
            ];
        },
        saveJob() {
            const requests = [];
            for (let content_block of this.job.content_blocks) {
                let cb_params = { data: _.omit(content_block, ["id", "uuid"]) };
                requests.push(
                    axios.patch(
                        `http://localhost:3000/contents/${this.id}/content_blocks/${
                            content_block.id
                        }`,
                        cb_params
                    )
                );
            }
            let job_params = {
                data: _.omit(this.job, ["id", "uuid", "content_blocks"])
            };
            requests.push(
                axios.patch(`http://localhost:3000/contents/${this.id}`, job_params)
            );

            axios
                .all(requests)
                .then(response => {
                    response;
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
