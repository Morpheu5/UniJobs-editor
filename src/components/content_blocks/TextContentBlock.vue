<template>
    <b-col>
        <b-card no-body>
            <b-tabs card>
                <b-tab v-for="l in ['it', 'en']" :key="`${block_data.uuid}-${l}`">
                    <template slot="title">
                        {{ l.toUpperCase() }} <span v-show="!block_data.body[l] || block_data.body[l] == ''" class="missing">(missing)</span>
                    </template>
                    <b-form-textarea v-model="block_data.body[l].content" rows="6" />
                    <div class="small mt-3">
                        <code>{{ { block_type: block_data.block_type, uuid: block_data.uuid, order: block_data.order } }}</code>
                    </div>
                </b-tab>
            </b-tabs>
        </b-card>
    </b-col>
</template>

<script>
import _ from 'lodash';

export default {
    props: {
        contentId: {
            type: String,
            required: true
        },
        value: {
            type: Object,
            required: true
        }
    },
    data: function() {
        return {
            block_data: _.merge({
                block_type: 'text',
                uuid: 'uuidv4()',
                body: {
                    en: { content: '' },
                    it: { content: '' }
                }
            }, this.value)
        };
    },
    watch: {
        block_data: {
            handler: function() {
                this.$emit('input', this.block_data)
            },
            deep: true
        }
    }
};
</script>
