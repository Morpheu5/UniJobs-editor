<template>
    <div>
        <b-form-checkbox id="published" v-model="metadata.published.value">{{ $t('content_meta.published') }}</b-form-checkbox>

        <b-card :class="metadata.job_title.validity" no-body class="mt-3 field_container">
            <template slot="header">
                <h6 class="m-0">{{ $t('content_meta.job_title') }}</h6>
            </template>

            <div class="px-3 pb-3">
                <b-input-group v-for="l in availableLocales()" :key="l.name" class="mt-3">
                    <b-input-group-text slot="prepend" class="text-monospace">
                        <small>{{ l.code }}</small>
                    </b-input-group-text>

                    <b-input v-model="metadata.job_title.value[l.code].content" :placeholder="$t('content_meta.job_title_placeholder', l.iso)" required></b-input>
                </b-input-group>

                <ul v-show="metadata.job_title.invalidFeedback.length > 0" class="invalid_feedback mt-3 mb-0">
                    <li v-for="(v, k) in metadata.job_title.invalidFeedback" :key="k">{{ v }}</li>
                </ul>
            </div>
        </b-card>

        <b-card :class="metadata.contest_sector.validity" class="mt-3">
            <template slot="header">
                <h6 class="m-0">{{ $t('content_meta.contest_sector') }}</h6>
            </template>

            <b-input-group>
                <vue-tags-input
                    v-model="contest_sector_input_tag"
                    :add-on-key="[13, ',', ';']"
                    :autocomplete-items="contest_sector_valid_tags.map( text => ({ text }))"
                    :placeholder="$t('content_meta.contest_sector_placeholder')"
                    :tags="metadata.contest_sector.value.map( text => ({ text }) )"
                    @tags-changed="newTags => metadata.contest_sector.value = newTags.map( t => t.text )"
                />
            </b-input-group>

            <ul v-show="metadata.contest_sector.invalidFeedback.length > 0" class="invalid_feedback">
                <li v-for="(v, k) in metadata.contest_sector.invalidFeedback" :key="k">{{ v }}</li>
            </ul>
        </b-card>

        <b-card :class="metadata.scientific_sector.validity" class="mt-3">
            <template slot="header">
                <h6 class="m-0">{{ $t('content_meta.scientific_sector') }}</h6>
            </template>

            <b-input-group>
                <!-- <b-input v-model="metadata.scientific_sector.value" :placeholder="$t('content_meta.scientific_sector_placeholder')" /> -->
                <vue-tags-input
                    v-model="scientific_sector_input_tag"
                    :add-on-key="[13, ',', ';']"
                    :autocomplete-items="scientific_sector_valid_tags.map( text => ({ text }))"
                    :placeholder="$t('content_meta.scientific_sector_placeholder')"
                    :tags="metadata.scientific_sector.value.map( text => ({ text }) )"
                    @tags-changed="newTags => metadata.scientific_sector.value = newTags.map( t => t.text )"
                />
            </b-input-group>

            <ul v-show="metadata.scientific_sector.invalidFeedback.length > 0" class="invalid_feedback">
                <li v-for="(v, k) in metadata.scientific_sector.invalidFeedback" :key="k">{{ v }}</li>
            </ul>
        </b-card>

        <b-card :class="[metadata.salary.validity, metadata.tax_status.validity].includes('invalid') ? 'invalid' : null" class="mt-3 field_container">
            <template slot="header">
                <h6 class="m-0">{{ $t('content_meta.salary') }} (&euro;)</h6>
            </template>

            <b-form-input v-model="metadata.salary.value" :placeholder="$t('content_meta.salary_placeholder')" required></b-form-input>
            <b-radio-group id="tax_status" v-model="metadata.tax_status.value" class="mt-3" required>
                <b-radio value="gross" name="tax_status">{{ $t('content_meta.salary_gross') }}</b-radio>
                <b-radio value="tax-exempt" name="tax_status">{{ $t('content_meta.salary_tax_exempt') }}</b-radio>
            </b-radio-group>

            <ul v-show="[...metadata.salary.invalidFeedback, ...metadata.tax_status.validity].length > 0" class="invalid_feedback mt-3 mb-0">
                <li v-for="(v, k) in [...metadata.salary.invalidFeedback, ...metadata.tax_status.invalidFeedback]" :key="k">{{ v }}</li>
            </ul>
        </b-card>

        <b-card :class="organization.validity" class="mt-3 field_container">
            <template slot="header">
                <h6 class="m-0">{{ $t('content_meta.organization') }}</h6>
            </template>

            <OrganizationsPicker v-model="thisOrganization" />

            <ul v-show="organization.invalidFeedback.length > 0" class="invalid_feedback">
                <li v-for="(v, k) in organization.invalidFeedback" :key="k">{{ v }}</li>
            </ul>
        </b-card>

        <b-card :class="metadata.deadline.validity" class="mt-3">
            <template slot="header">
                <h6 class="m-0">{{ $t('content_meta.application_deadline') }}</h6>
            </template>

            <b-input-group>
                <b-input-group-text slot="append" required><fa :icon="['far', 'calendar-alt']" /></b-input-group-text>
                <flat-pickr v-model="metadata.deadline.value"
                            :config="deadlinePickerOptions"
                />
            </b-input-group>

            <ul v-show="metadata.deadline.invalidFeedback.length > 0" class="invalid_feedback">
                <li v-for="(v, k) in metadata.deadline.invalidFeedback" :key="k">{{ v }}</li>
            </ul>
        </b-card>

        <b-card :class="metadata.url.validity" no-body class="mt-3 field_container">
            <template slot="header">
                <h6 class="m-0">{{ $t('content_meta.application_url') }}</h6>
            </template>

            <div class="px-3 pb-3">
                <b-input-group v-for="l in availableLocales()" :key="l.name" class="mt-3">
                    <b-input-group-text slot="prepend" class="text-monospace">
                        <small>{{ l.code }}</small>
                    </b-input-group-text>

                    <b-input v-model="metadata.url.value[l.code].content" :placeholder="$t('content_meta.application_url_placeholder', l.iso)" required></b-input>
                </b-input-group>

                <ul v-show="metadata.url.invalidFeedback.length > 0" class="invalid_feedback mt-3 mb-0">
                    <li v-for="(v, k) in metadata.url.invalidFeedback" :key="k">{{ v }}</li>
                </ul>
            </div>
        </b-card>
    </div>
</template>

<style lang="scss">
@import '~bootstrap/scss/bootstrap';

input.flatpickr-input.form-control {
    background: white;
}

.vue-tags-input {
    width: 100%;
    
    .ti-input {
        border-radius: $border-radius;

        li.ti-tag {
            border-radius: $border-radius;
            background: theme-color('primary');
        }
    }
}
</style>

<script>
import _cloneDeep from 'lodash/cloneDeep';
import _merge from 'lodash/merge';
import Input from '../Input.js';
import OrganizationsPicker from '@/components/content_metadata/OrganizationsPicker';
import VueTagsInput from '@johmun/vue-tags-input';

class JobMetadataData {
    constructor(data) {
        this.published = new Input(data.published);
        this.contest_sector = new Input(data.contest_sector);
        this.scientific_sector = new Input(data.scientific_sector);
        this.job_title = new Input(data.job_title);
        this.salary = new Input(data.salary);
        this.tax_status = new Input(data.tax_status);
        this.deadline = new Input(data.deadline);
        this.url = new Input(data.url);
    }

    get document() {
        return {
            published: this.published.value,
            contest_sector: this.contest_sector.value,
            scientific_sector: this.scientific_sector.value,
            job_title: this.job_title.value,
            salary: this.salary.value,
            tax_status: this.tax_status.value,
            deadline: this.deadline.value,
            url: this.url.value
        };
    }

    validate() {
        let valid = true;

        if (Object.entries(this.job_title.value).some(e => e[1].content === '')) {
            this.job_title.validity = 'invalid';
            this.job_title.invalidFeedback = ['Missing translations'];
            valid = false;
        } else {
            this.job_title.validity = 'valid';
            this.job_title.invalidFeedback = [];
        }

        if (this.salary.value !== '' && this.tax_status.value === null) {
            this.tax_status.validity = 'invalid';
            this.tax_status.invalidFeedback = ['If you specify a salary, you must specify a tax status as well'];
            valid = false;
        } else {
            this.tax_status.validity = 'valid';
            this.tax_status.invalidFeedback = [];
        }

        if (this.deadline.value === '') {
            this.deadline.validity = 'invalid';
            this.deadline.invalidFeedback = ['Required field'];
            valid = false;
        } else {
            this.deadline.validity = 'valid';
            this.deadline.invalidFeedback = [];
        }

        if (Object.entries(this.url.value).some(e => e[1].content === '')) {
            this.url.validity = 'invalid';
            this.url.invalidFeedback = ['Missing URLs'];
            valid = false;
        } else {
            this.url.validity = 'valid';
            this.url.invalidFeedback = [];
        }

        return valid;
    }
};

export default {
    components: {
        OrganizationsPicker,
        VueTagsInput
    },
    props: {
        value: {
            type: Object,
            required: true
        },
        organization: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            metadata: new JobMetadataData(_merge({
                published: false,
                contest_sector: [],
                scientific_sector: [],
                job_title: this.spreadOverLocales({ content: '' }),
                salary: '',
                tax_status: null,
                deadline: new Date(),
                url: this.spreadOverLocales({ content: '' })
            }, this.value)),
            thisOrganization: _cloneDeep(this.organization),

            deadlinePickerOptions: {
                dateFormat: 'Z',
                altFormat: 'd/m/Y @ H:i',
                altInput: true,
                enableTime: true,
                time_24hr: true,
                allowInput: false,
                wrap: true
            },

            contest_sector_valid_tags: ["01/A1","01/A2","01/A3","01/A4","01/A5","01/A6","01/B1","02/A1","02/A2","02/B1","02/B2","02/B3","02/C1","03/A1","03/A2","03/B1","03/B2","03/C1","03/C2","03/D1","03/D2","04/A1","04/A2","04/A3","04/A4","05/A1","05/A2","05/B1","05/B2","05/C1","05/D1","05/E1","05/E2","05/F1","05/G1","05/H1","05/H2","05/I1","05/L1","06/A1","06/A2","06/A3","06/A4","06/B1","06/C1","06/D1","06/D2","06/D3","06/D4","06/D5","06/D6","06/E1","06/E2","06/E3","06/F1","06/F2","06/F3","06/F4","06/G1","06/H1","06/I1","06/L1","06/M1","06/M2","06/M3","06/N1","07/A1","07/B1","07/B2","07/C1","07/D1","07/E1","07/F1","07/F2","07/G1","07/H1","07/H2","07/H3","07/H4","07/H5","08/A1","08/A4","08/B1","08/B2","08/B3","08/C1","08/D1","08/A2","08/A3","08/E1","08/E2","08/F1","09/A1","09/A2","09/A3","09/B1","09/B2","09/B3","09/C1","09/C2","09/C3","09/D1","09/D2","09/D3","09/E1","09/E2","09/E3","09/E4","09/F1","09/F2","09/G1","09/G2","09/H1","10/A1","10/B1","10/C1","10/D1","10/D2","10/D3","10/D4","10/E1","10/F1","10/F2","10/F3","10/F4","10/G1","10/H1","10/I1","10/L1","10/M1","10/M2","10/N1","10/N2","10/N3","11/A1","11/A2","11/A3","11/A4","11/A5","11/A6","11/B1","11/C1","11/C2","11/C3","11/C4","11/C5","11/D1","11/D2","11/E1","11/E2","11/E3","11/E4","12/A1","12/B1","12/B2","12/C1","12/C2","12/D1","12/D2","12/E1","12/E2","12/E3","12/F1","12/G1","12/G2","12/H1","12/H2","12/H3","13/A1","13/A2","13/A3","13/A4","13/A5","13/B1","13/B2","13/B3","13/B4","13/B5","13/C1","13/D1","13/D2","13/D3","13/D4","14/A1","14/A2","14/B1","14/B2","14/C1","14/C2","14/D1"],
            contest_sector_input_tag: '',
            contest_sector_input_tags: [],

            scientific_sector_valid_tags: [],
            scientific_sector_input_tag: '',
            scientific_sector_input_tags: []
        };
    },
    watch: {
        metadata: {
            handler: function() {
                this.$emit('input', this.metadata.document);
            },
            deep: true
        },
        thisOrganization: {
            handler: function() {
                this.$emit('updateOrganization', this.thisOrganization);
            }
        }
    },
    methods: {
        validate() {
            return this.metadata.validate();
        }
    }
};

</script>
