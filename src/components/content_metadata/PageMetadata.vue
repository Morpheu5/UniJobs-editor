<template>
    <div>
        <b-form-checkbox id="published" v-model="metadata.published.value">{{ $t('content_meta.published') }}</b-form-checkbox>

        <b-card :class="metadata.slug.validity" class="mt-3 field_container">
            <template slot="header">
                <h6 class="m-0">{{ $t('content_meta.url_slug') }}</h6>
            </template>

            <b-form-group>
                <b-input id="page_metadata_url_slug"
                         v-model="metadata.slug.value"
                />
            </b-form-group>

            <ul v-show="metadata.slug.invalidFeedback.length > 0" class="invalid_feedback">
                <li v-for="(v, k) in metadata.slug.invalidFeedback" :key="k">{{ v }}</li>
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

    </div>
</template>

<script>
import _cloneDeep from 'lodash/cloneDeep';
import _merge from 'lodash/merge';

import Input from '../Input';

import OrganizationsPicker from '@/components/content_metadata/OrganizationsPicker';

class PageMetadataData {
    constructor(data) {
        this.published = new Input(data.published);
        this.slug = new Input(data.slug);
    }

    get document() {
        return {
            published: this.published.value,
            slug: this.slug.value
        };
    }

    validate() {
        let valid = true;

        if (this.slug.value === '') {
            this.slug.validity = 'invalid';
            this.slug.invalidFeedback = ['Required field'];
            valid = false;
        } else {
            this.slug.validity = 'valid';
            this.slug.invalidFeedback = [];
        }

        return valid;
    }
};

export default {
    components: {
        OrganizationsPicker
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
            metadata: new PageMetadataData(_merge({
                published: false,
                slug: ''
            }, this.value)),
            thisOrganization: _cloneDeep(this.organization)
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
    mounted() {
        this.$emit('input', this.metadata.document);
    },
    methods: {
        validate() {
            return this.metadata.validate();
        }
    }
};

</script>
