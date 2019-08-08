<template>
    <div>
        <b-form-checkbox id="published" v-model="metadata.published.value">{{ $t('content_meta.published') }}</b-form-checkbox>

        <b-card :class="metadata.job_title.validity" no-body class="mt-3 field_container">
            <template slot="header">
                <h6 class="m-0">{{ $t('content_meta.job_title') }}</h6>
            </template>

            <div class="px-3 pb-3">
                <b-select v-model="metadata.job_title.value" :options="job_title_options" class="mt-3"></b-select>

                <div v-if="metadata.job_title.value === null">
                    <b-input-group v-for="l in availableLocales()" :key="l.name" class="mt-3">
                        <b-input-group-text slot="prepend" class="text-monospace">
                            <small>{{ l.code }}</small>
                        </b-input-group-text>

                        <b-input v-model="metadata.job_title_alt.value[l.code].content" :placeholder="$t('content_meta.job_title_placeholder', l.iso)" required></b-input>
                    </b-input-group>
                </div>

                <ul v-show="metadata.job_title.invalidFeedback.length > 0" class="invalid_feedback mt-3 mb-0">
                    <li v-for="(v, k) in metadata.job_title.invalidFeedback" :key="k" @click={}>{{ v }}</li>
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
                    :validation="contest_sector_validation"
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
                <vue-tags-input
                    v-model="scientific_sector_input_tag"
                    :add-on-key="[13, ',', ';']"
                    :autocomplete-items="scientific_sector_valid_tags.map( text => ({ text }))"
                    :placeholder="$t('content_meta.scientific_sector_placeholder')"
                    :tags="metadata.scientific_sector.value.map( text => ({ text }) )"
                    :validation="scientific_sector_validation"
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
            <div v-if="metadata.salary_candidates && metadata.salary_candidates.length > 0">
                <b-button v-for="(v, k) in metadata.salary_candidates" :key="k" class="mr-3 mt-3" size="sm" :variant="v === metadata.salary.value ? 'primary' : 'outline-primary'" @click="metadata.salary.value = v">{{ v }}</b-button>
            </div>
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

            &.ti-invalid {
                background: theme-color('danger');
            }
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

import contest_sectors_data from '@/assets/contest_sectors.json';
import scientific_sectors_data from '@/assets/scientific_sectors.json';

class JobMetadataData {
    constructor(data) {
        this.published = new Input(data.published);
        this.contest_sector = new Input(data.contest_sector);
        this.scientific_sector = new Input(data.scientific_sector);
        this.job_title = new Input(data.job_title || data.job_title_candidates[0]);
        this.job_title_alt = new Input(data.job_title_alt || this.spreadOverLocales({ content: '' }));
        this.salary = new Input(data.salary || data.salary_candidates.filter(s => s.indexOf(',') > -1)[0]);
        this.tax_status = new Input(data.tax_status);
        this.deadline = new Input(data.deadline);
        this.url = new Input(data.url);

        this.job_title_candidates = data.job_title_candidates;
        this.salary_candidates = data.salary_candidates;
    }

    get document() {
        return {
            published: this.published.value,
            contest_sector: this.contest_sector.value,
            scientific_sector: this.scientific_sector.value,
            job_title: this.job_title.value,
            job_title_alt: this.job_title.value !== null ? this.spreadOverLocales({ content: '' }) : this.job_title_alt.value,
            salary: this.salary.value,
            tax_status: this.tax_status.value,
            deadline: this.deadline.value,
            url: this.url.value
        };
    }

    validate() {
        let valid = true;

        if (this.job_title.value === null && Object.entries(this.job_title_alt.value).every(e => e[1].content === '')) {
            this.job_title.validity = 'invalid';
            this.job_title_alt.validity = 'invalid';
            this.job_title.invalidFeedback = ['Either one of these is required'];
            valid = false;
        } else {
            this.job_title.validity = 'valid';
            this.job_title_alt.validity = 'valid';
            this.job_title.invalidFeedback = [];
        }

        if (Object.entries(this.job_title_alt.value).some(e => e[1].content === '')) {
            this.job_title_alt.validity = 'invalid';
            this.job_title_alt.invalidFeedback = [...this.job_title.invalidFeedback, 'Missing translations'];
            valid = false;
        } else {
            this.job_title_alt.validity = 'valid';
            this.job_title_alt.invalidFeedback = [];
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
                job_title: null,
                job_title_alt: this.spreadOverLocales({ content: '' }),
                salary: null,
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

            contest_sector_valid_tags: contest_sectors_data,
            contest_sector_input_tag: '',
            contest_sector_input_tags: [],
            contest_sector_validation: [{
                classes: 'not-allowed',
                rule: new RegExp(`${contest_sectors_data.join('|')}`)
            }],

            scientific_sector_valid_tags: scientific_sectors_data,
            scientific_sector_input_tag: '',
            scientific_sector_input_tags: [],
            scientific_sector_validation: [{
                classes: 'not-allowed',
                rule: new RegExp(`${scientific_sectors_data.join('|')}`)
            }],

            job_title_options: [
                { value: null, text: '' },
                { value: 'ricercatore-tipo-a', text: this.$t('content_meta.ricercatore-tipo-a') },
                { value: 'ricercatore-tipo-b', text: this.$t('content_meta.ricercatore-tipo-b') },
                { value: 'professore-prima-fascia', text: this.$t('content_meta.professore-prima-fascia') },
                { value: 'professore-seconda-fascia', text: this.$t('content_meta.professore-seconda-fascia') }
            ]
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
