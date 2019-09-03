<template>
    <b-col>
        <b-card :class="block_data.validity" no-body class="field_container">
            <b-tabs card>
                <b-tab v-for="l in availableLocales()" :key="`${block_data.uuid}-${l.code}`">
                    <template slot="title">
                        {{ l.name }} <span v-show="!block_data.value.body[l.code] || block_data.value.body[l.code] == ''" class="missing">(missing)</span>
                    </template>
                    <vue-simplemde v-model="block_data.value.body[l.code].content" :disabled="value.delete" :configs="mdeConfig" />
                </b-tab>
            </b-tabs>
            <ul v-show="block_data.invalidFeedback" class="invalid_feedback">
                <li v-for="(v,k) in block_data.invalidFeedback" :key="k">{{ v }}</li>
            </ul>
        </b-card>
    </b-col>
</template>

<script>
import Input from '../Input';
import _merge from 'lodash/merge';

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
            block_data: new Input(_merge({
                block_type: 'text',
                uuid: 'uuidv4()',
                body: this.spreadOverLocales({ content: '' })
            }, this.value)),
            mdeConfig: {
                forceSync: true,
                spellChecker: false,
                status: false,
                toolbar: ['bold', 'italic', 'quote', 'unordered-list', 'ordered-list', 'clean-block', 'guide']
            }
        };
    },
    watch: {
        block_data: {
            handler: function() {
                this.$emit('input', this.block_data.value);
            },
            deep: true
        }
    },
    methods: {
        validate() {
            if (Object.entries(this.block_data.value.body).some(e => e[1].content === '')) {
                this.block_data.validity = 'invalid';
                this.block_data.invalidFeedback = ['Missing translations'];
                return false;
            } else {
                this.block_data.validity = 'valid';
                this.block_data.invalidFeedback = [];
                return true;
            }
        }
    }
};
</script>
