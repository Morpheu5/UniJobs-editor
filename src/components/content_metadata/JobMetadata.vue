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

            scientific_sector_valid_tags: ["MAT/01","MAT/04","MAT/02","MAT/03","MAT/05","MAT/06","MAT/07","MAT/08","MAT/09","INF/01","FIS/01","FIS/04","FIS/02","FIS/04","FIS/08","FIS/01","FIS/03","FIS/02","FIS/03","FIS/08","FIS/07","FIS/05","FIS/06","CHIM/01","CHIM/12","CHIM/02","CHIM/12","CHIM/03","CHIM/07","CHIM/06","CHIM/04","CHIM/05","CHIM/08","CHIM/10","CHIM/11","CHIM/09","GEO/06","GEO/07","GEO/08","GEO/09","GEO/01","GEO/02","GEO/03","GEO/04","GEO/05","GEO/10","GEO/11","GEO/12","BIO/01","BIO/02","BIO/03","BIO/15","BIO/04","BIO/05","BIO/08","BIO/06","BIO/07","BIO/09","M-EDF/01","M-EDF/02","BIO/10","BIO/12","M-EDF/01","M-EDF/02","BIO/11","BIO/13","M-EDF/01","M-EDF/02","BIO/14","BIO/15","BIO/16","M-EDF/01","M-EDF/02","BIO/17","BIO/18","BIO/19","M-EDF/01","M-EDF/02","MED/03","MED/04","MED/05","MED/46","MED/02","MED/07","MED/46","MED/08","MED/09","M-EDF/01","M-EDF/02","MED/18","MED/10","MED/11","MED/13","MED/49","MED/14","M-EDF/01","M-EDF/02","MED/15","MED/16","MED/06","MED/12","MED/17","MED/35","MED/25","MED/26","MED/22","MED/23","MED/21","MED/19","MED/20","MED/24","MED/27","MED/29","MED/28","MED/30","MED/31","MED/32","MED/33","MED/34","MED/38","MED/39","MED/40","MED/36","MED/37","MED/41","MED/42","MED/01","MED/43","MED/44","MED/45","MED/46","MED/48","MED/47","MED/49","MED/50","M-EDF/01","M-EDF/02","AGR/01","AGR/02","AGR/04","AGR/03","AGR/05","AGR/06","AGR/08","AGR/09","AGR/10","AGR/11","AGR/12","AGR/07","AGR/13","AGR/14","AGR/15","AGR/16","AGR/17","AGR/18","AGR/19","AGR/20","VET/01","VET/02","VET/03","VET/04","VET/05","VET/06","VET/07","VET/08","VET/09","VET/10","ICAR/01","ICAR/02","ICAR/03","ING-IND/28","ING-IND/29","ING-IND/30","ICAR/04","ICAR/05","ICAR/22","ICAR/06","ICAR/07","ICAR/08","ICAR/09","ICAR/10","ICAR/11","ICAR/12","ICAR/13","ICAR/14","ICAR/15","ICAR/16","ICAR/21","ICAR/17","ICAR/18","ICAR/19","ICAR/20","ICAR/21","ING-IND/01","ING-IND/02","ING-IND/03","ING-IND/04","ING-IND/06","ING-IND/05","ING-IND/07","ING-IND/13","ING-IND/14","ING-IND/15","ING-IND/21","ING-IND/16","ING-IND/17","ING-IND/35","ING-IND/08","ING-IND/09","ING-IND/10","ING-IND/11","ING-IND/18","ING-IND/19","ING-IND/20","ING-IND/21","ING-IND/22","ING-IND/23","ING-IND/24","ING-IND/26","ING-IND/25","ING-IND/27","ING-IND/31","ING-IND/32","ING-IND/33","ING-INF/01","ING-INF/07","ING-IND/12","ING-INF/02","ING-INF/03","ING-INF/04","ING-INF/06","ING-IND/34","ING-INF/05","L-ANT/01","L-FIL-LET/01","L-ANT/04","L-ANT/06","L-ANT/07","L-ANT/08","L-ANT/09","L-ANT/10","L-ART/01","L-ART/02","L-ART/03","L-ART/04","L-ART/05","L-ART/06","L-ART/07","L-ART/08","L-ANT/02","L-ANT/03","L-FIL-LET/01","L-FIL-LET/02","L-FIL-LET/07","L-LIN/20","L-FIL-LET/06","L-FIL-LET/04","L-FIL-LET/06","L-FIL-LET/05","L-FIL-LET/06","L-ANT/0","L-FIL-LET/08","L-FIL-LET/09","L-LIN/17","L-LIN/08","L-LIN/09","L-FIL-LET/10","L-FIL-LET/11","L-FIL-LET/13","L-FIL-LET/14","L-FIL-LET/03","L-LIN/01","L-LIN/02","L-LIN/18","L-LIN/19","L-LIN/03","L-LIN/04","L-LIN/05","L-LIN/06","L-LIN/07","L-LIN/10","L-LIN/11","L-LIN/12","L-FIL-LET/15","L-LIN/13","L-LIN/14","L-LIN/15","L-LIN/16","L-LIN/21","L-OR/01","L-OR/02","L-OR/03","L-OR/04","L-OR/05","L-OR/06","L-OR/07","L-OR/08","L-OR/09","L-OR/10","L-OR/11","L-OR/12","L-OR/13","L-OR/14","L-OR/15","L-OR/16","L-OR/17","L-OR/18","L-OR/19","L-OR/20","L-OR/21","L-OR/22","L-OR/23","M-STO/01","M-STO/03","M-STO/02","M-STO/03","M-STO/04","M-STO/03","M-STO/08","M-STO/09","M-STO/06","M-STO/07","M-GGR/01","M-GGR/02","M-FIL/01","M-FIL/02","M-STO/05","M-FIL/03","M-FIL/04","M-FIL/05","M-FIL/06","M-FIL/07","M-FIL/08","M-PED/01","M-PED/02","M-PED/03","M-PED/04","M-EDF/01","M-EDF/02","M-PSI/01","M-PSI/02","M-PSI/03","M-PSI/04","M-PSI/05","M-PSI/06","M-PSI/07","M-PSI/08","IUS/01","IUS/04","IUS/06","IUS/07","IUS/08","IUS/09","IUS/11","IUS/10","IUS/09","IUS/12","IUS/13","IUS/14","IUS/02","IUS/21","IUS/03","IUS/05","IUS/15","IUS/17","IUS/16","IUS/18","IUS/19","IUS/20","SECS-P/01","SECS-P/02","SECS-P/03","SECS-P/06","SECS-P/05","SECS-P/07","SECS-P/08","SECS-P/10","SECS-P/11","SECS-P/09","SECS-P/13","SECS-P/12","SECS-P/04","SECS-S/01","SECS-S/02","SECS-S/03","SECS-S/04","SECS-S/05","SECS-S/06","SPS/01","SPS/04","SPS/02","SPS/03","SPS/05","SPS/06","SPS/13","SPS/14","SPS/07","SPS/11","SPS/12","SPS/08","SPS/09","SPS/10"],
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
