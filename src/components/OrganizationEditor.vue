<template>
    <div id="organization_editor">
        <b-form>
            <b-row>
                <b-col>
                    <b-form-group
                        :label="$t('organizations.name')"
                        :description="$t('organizations.name_description')"
                    >
                        <b-input v-model="organization.name" :state="validated ? validity.name.valid : null" />

                        <b-form-invalid-feedback>
                            {{ validity.name.feedback }}
                        </b-form-invalid-feedback>
                    </b-form-group>

                    <b-form-group
                        :label="$t('organizations.short_name')"
                        :description="$t('organizations.short_name_description')"
                    >
                        <b-input v-model="organization.short_name" :state="validated ? validity.short_name.valid : null" />
                    </b-form-group>

                    <b-form-group
                        :label="$t('organizations.part_of')"
                        :description="$t('organizations.part_of_description')"
                        :class="validity.parent_id.valid ? 'valid' : 'invalid'"
                    >
                        <OrganizationsPicker v-if="parentOrganization" :key="orgPickerUpdateKey" v-model="parentOrganization" />
                    </b-form-group>
                </b-col>
                <b-col>
                    <b-form-group
                        v-if="!organization.logo_url"
                        :label="$t('organizations.logo_label')"
                        :description="$t('organizations.logo_description')"
                    >
                        <b-form-file v-model="logoFile" name="logo" />
                    </b-form-group>
                    <div v-if="organization.logo_url">
                        <b-form-group
                            :label="$t('organizations.logo_label')"
                            :description="$t('organizations.logo_description')"
                        >
                            <div id="logo_wrapper">
                                <b-img :src="$cdnBaseUrl + organization.logo_url" thumbnail rounded class="text-center" />
                                <b-btn variant="light text-danger" :title="$t('delete')" @click="deleteLogo">
                                    <fa :icon="['fas', 'times']" />
                                </b-btn>
                            </div>
                        </b-form-group>
                    </div>
                    <!-- <file-pond
                        ref="pond"
                        name="test"
                        label-idle="Drop shit here..."
                        :server="'http://localhost:3000/api/organizations/5/logo'"
                        :files="myFiles"
                    /> -->
                </b-col>
            </b-row>
            <b-row>
                <b-col>
                    <b-card class="mt-5">
                        <div class="float-right">
                            <!-- <b-button v-b-modal.deleteOrganizationModal class="mr-3" variant="outline-danger">{{ $t('delete') }}</b-button> -->
                            <b-button :disabled="!documentDirty" class="mr-0" variant="success" @click="saveOrganization">{{ $t('save') }}</b-button>
                        </div>
                    </b-card>

                    <b-modal id="deleteOrganizationModal" :title="$t('organizations.delete_modal_title')" :ok-title="$t('yes')" :cancel-title="$t('no')" ok-variant="danger" header-text-variant="danger" @ok="deleteOrganization">
                        <div v-html="$t('organizations.delete_modal')" />
                    </b-modal>
                </b-col>
            </b-row>
        </b-form>
    </div>
</template>

<style lang="scss">
#logo_wrapper {
    position: relative;
    width: 50%;

    button {
        position: absolute;
        top: 10px;
        right: 10px;
        text-align: center;
    }
}
</style>

<script>
import _cloneDeep from 'lodash/cloneDeep';
import _debounce from 'lodash/debounce';
import _isEqual from 'lodash/isEqual';

import Input from './Input';
import OrganizationsPicker from '@/components/content_metadata/OrganizationsPicker.vue';

export default {
    components: {
        OrganizationsPicker
    },
    props: {
        id: String
    },
    data() {
        return {
            orgPickerUpdateKey: 0,
            organization: {
                name: '',
                short_name: '',
                parent_id: null,
                ancestors: []
            },
            referenceOrg: {},
            validated: false,
            validity: {
                name: { valid: true, feedback: '' },
                short_name: { valid: true, feedback: '' },
                parent_id: { valid: true, feedback: '' }
            },
            parentOrganization: new Input({ id: null, name: '', short_name: '', parent_id: null, ancestors: [] }),
            logoFile: null,
            documentDirty: false
        };
    },
    watch: {
        parentOrganization: {
            handler: function() {
                if (this.parentOrganization.value) {
                    this.organization.parent_id = this.parentOrganization.value.id;
                } else {
                    this.organization.parent_id = this.parentOrganization.id;
                }
            },
            deep: true
        },
        organization: {
            handler: _debounce(function() {
                if (_isEqual(this.organization, this.referenceOrg)) {
                    this.documentDirty = false;
                } else {
                    this.documentDirty = true;
                }
                this.$root.$emit('unsaved-changes', this.documentDirty);
            }, 250),
            deep: true
        },
        logoFile: {
            handler: _debounce(function() {
                if (this.logoFile) {
                    this.documentDirty = true;
                }
                this.$root.$emit('unsaved-changes', this.documentDirty);
            }, 250)
        }
    },
    async mounted() {
        if (this.id === 'new') {

        } else {
            await this.$axios.get(`/api/organizations/${this.id}`)
            .then(response => {
                this.organization = response.data;
            });
            if (this.organization.ancestors.length > 1) {
                await this.$axios.get(`/api/organizations/${this.organization.ancestors[this.organization.ancestors.length - 2].id}`)
                .then(response => {
                    this.parentOrganization.value = { ...this.parentOrganization.value, ...response.data };
                    this.orgPickerUpdateKey++;

                    this.referenceOrg = _cloneDeep(this.organization);
                });
            }
        }
    },
    methods: {
        validate() {
            let valid = true;
            if (this.organization.name) {
                this.validity.name.valid = true;
                this.validity.name.feedback = '';
            } else {
                this.validity.name.valid = false;
                this.validity.name.feedback = this.$t('validation_feedback.missing_field');
                valid = false;
            }

            if (this.organization.short_name) {
                this.validity.short_name.valid = true;
                this.validity.short_name.feedback = '';
            } else {
                this.validity.short_name.valid = false;
                this.validity.short_name.feedback = this.$t('validation_feedback.missing_field');
                valid = false;
            }

            this.validated = true;
            return valid;
        },
        uploadLogo() {
            // let data = new FormData();
            // data.append('data[logo]', this.logoFile);
            // this.$axios.patch(`/api/organizations/${this.id}`)
            // .then(respose => {
            //     console.log('SUCCESS' + response);
            // })
            // .catch(response => {
            //     console.log('FAILURE' + response);
            // });
        },
        deleteLogo() {
            let data = new FormData();
            data.append('data[remove_logo]', true);
            this.$axios.patch(`/api/organizations/${this.id}`, data)
            .then(response => {
                this.logoFile = null;
                this.organization = response.data;
                this.$root.$emit("global-notification", {
                    type: "success",
                    message: this.$t('organizations.logo_delete_success')
                });
            })
            .catch(error => {
                this.$root.$emit("global-notification", {
                    type: "danger",
                    message: `${this.$t('organizations.logo_delete_failed')}<br />${error}`
                });
            });
        },
        saveOrganization() {
            if (!this.validate()) {
                return;
            }
            let data = new FormData();
            data.append('data[name]', this.organization.name);
            data.append('data[short_name]', this.organization.short_name);
            data.append('data[parent_id]', this.organization.parent_id);
            if (this.logoFile) {
                data.append('data[logo]', this.logoFile);
            }
            this.$axios.patch(`/api/organizations/${this.organization.id}`, data)
            .then(response => {
                this.logoFile = null;
                this.organization = response.data;
                this.$root.$emit("global-notification", {
                    type: "success",
                    message: this.$t('organizations.save_organization_success')
                });
            })
            .catch(error => {
                this.$root.$emit("global-notification", {
                    type: "danger",
                    message: `${this.$t('organizations.save_organization_failed')}<br />${error}`
                });
            });
        },
        deleteOrganization() {

        }
    }
};
</script>