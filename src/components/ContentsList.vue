<template>
    <div id="content-list" >
        <h2 class="mb-3">Your contents</h2>
        <b-row class="header mb-1 no-gutters">
            <b-col cols="1"></b-col>
            <b-col cols="4">
                <b-input-group>
                    <b-input-group-text slot="prepend"><fa :icon="['fas', 'search']" /></b-input-group-text>
                    <b-input v-model="filters.title" type="text" size="sm" placeholder="Title"></b-input>
                </b-input-group>
            </b-col>
            <b-col cols="2" class="text-center px-3">
                <b-input-group>
                    <b-input-group-text slot="prepend"><fa :icon="['fas', 'filter']" /></b-input-group-text>
                    <b-form-select v-model="filters.content_type" :options="contentTypes" size="sm" />
                </b-input-group>
            </b-col>
            <b-col cols="1">
                Published
            </b-col>
            <b-col cols="1">Created</b-col>
            <b-col cols="1">Updated</b-col>
        </b-row>
        <b-row v-for="(content, index) in filteredContents" :key="content.uuid" :class="{ even: (index%2), odd: !(index%2), first: !index, last: index == contents.length-1 }" class="py-2 content no-gutters" >
            <b-col cols="1">
                <div class="text-center mt-2">
                    <b-button variant="link text-danger" class="pl-1 pr-0 mx-0">
                        <fa :icon="['far', 'trash-alt']" fixed-width size="lg" />
                    </b-button>
                    <b-button :to="`/contents/${content.id}/edit`" variant="link text-primary" class="pl-1 pr-0 mx-0">
                        <fa :icon="['far', 'edit']" fixed-width size="lg" />
                    </b-button>
                </div>
            </b-col>
            <b-col cols="4">
                <div v-for="(v, k) in content.title" :key="`${content.uuid}-${k}`"><span class="lang">{{k}}</span>{{ v }}</div>
            </b-col>
            <b-col cols="2" class="text-center">
                <div class="mt-3">{{ content.content_type | titleCase }}</div>
            </b-col>
            <b-col cols="1">
                <div class="mt-3 text-center">
                    <fa v-if="content.metadata.published" :icon="['far', 'check-square']" size="lg" />
                    <fa v-else :icon="['far', 'square']" size="lg" />
                </div>
            </b-col>
            <b-col cols="1">{{ content.created_at | formatDate }}</b-col>
            <b-col cols="1">{{ content.updated_at | formatDate }}</b-col>
        </b-row>
    </div>
</template>

<style lang="scss">
@import "../../node_modules/bootstrap/scss/bootstrap.scss";

#content-list {
    .header {
        font-weight: bold;

        &:hover {
            background: none !important;
        }
    }

    .row {
        &:hover {
            background: $light;
        }

        div > span.lang {
            min-width: 2em;
            display: inline-block;
            text-align: right;
            margin-right: 1em;
            font-family: $font-family-monospace;
        }
    }
}
</style>


<script>
export default {
    filters: {
        formatDate(d) {
            let date = new Date(d);
            return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        }
    },
    data() {
        return {
            contents: [],
            filters: {
                title: '',
                content_type: null
            }
        };
    },
    computed: {
        filteredContents() {
            let filteredContents = this.contents;
            if (this.filters.title !== '') {
                const titleFilters = new RegExp(this.filters.title.split(new RegExp(',| ')).filter(e => e !== '').join('|'), 'i');
                filteredContents = filteredContents.filter(content => Object.values(content.title).some(v => v.match(titleFilters)));
            }
            if (this.filters.content_type !== null) {
                filteredContents = filteredContents.filter(content => content.content_type === this.filters.content_type);
            }
            return filteredContents;
        },
        contentTypes() {
            let options = [{ value: null, text: ""}];
            let otherOptions = _.uniq(this.contents.map(c => c.content_type)).map(t => ({ value: t, text: _.capitalize(t)}));
            return [...options, ...otherOptions];
        }
    },
    created() {
        this.$axios
            .get("/contents")
            .then(response => {
                this.contents = response.data;
            })
            .catch(error => {
                this.contents = [];
                this.$root.$emit("global-notification", {
                    type: "danger",
                    message: `There was a problem retrieving the list of contents.<br/>${error}`
                });
        });
    },
};
</script>
