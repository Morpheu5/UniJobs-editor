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
            <b-radio-group id="tax_status" v-model="metadata.tax_status" class="mt-3">
                <b-radio value="gross">Gross</b-radio>
                <b-radio value="tax-exempt">Tax exempt</b-radio>
            </b-radio-group>
        </b-card>

        <b-card class="mt-3">
            <template slot="header">
                <h6 class="m-0">Organisation</h6>
            </template>
            <b-input id="organisation-popover-input"></b-input>
            <b-popover target="organisation-popover-input" placement="bottom" triggers="focus">
                Type to search…
            </b-popover>
        </b-card>

        <b-card no-body class="mt-3">
            <template slot="header">
                <h6 class="m-0">Application URL</h6>
            </template>
            <b-tabs card>
                <b-tab v-for="l in availableLocales()" :key="l.name">
                    <template slot="title">
                        {{ l.name }} <span v-show="!metadata.url[l.code] || metadata.url[l.code].content == ''" class="missing">*</span>
                    </template>
                    <b-form-input v-model="metadata.url[l.code].content"></b-form-input>
                </b-tab>
            </b-tabs>
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
                tax_status: null,
                organisation: '',
                url: this.spreadOverLocales({ content: '' })
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
