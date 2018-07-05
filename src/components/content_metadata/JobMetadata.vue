<template>
    <div>
        <b-card no-body class="mt-3">
            <template slot="header">
                <h6 class="m-0">Job title</h6>
            </template>
            <b-tabs card>
                <b-tab v-for="l in availableLocales()" :key="l.name">
                    <template slot="title">
                        {{ l.name }} <span v-show="!metadata.job_title[l.code] || metadata.job_title[l.code].content == ''" class="missing">*</span>
                    </template>
                    <b-form-input v-model="metadata.job_title[l.code].content"></b-form-input>
                </b-tab>
            </b-tabs>
        </b-card>

        <b-card class="mt-3">
            <template slot="header">
                <h6 class="m-0">Salary (&euro;)</h6>
            </template>
            <b-form-input v-model="metadata.salary" placeholder="e.g., 20000, 24000-30000…"></b-form-input>
            <b-form-select v-model="metadata.tax_status" class="mt-3">
                <option :value="null">Tax status (please choose one)</option>
                <option value="gross">Gross</option>
                <option value="tax-exempt">Tax exempt</option>
            </b-form-select>
        </b-card>
    </div>


</template>

<script>

export default {
    props: {
        value: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            metadata: _.merge({
                published: false,
                job_title: this.spreadOverLocales({ content: '' }),
                salary: '',
                tax_status: null
            }, this.value)
        }
    },
    watch: {
        metadata: {
            handler: function() {
                this.$emit('input', this.metadata)
            },
            deep: true
        }
    }
}
</script>
