<template>
    <div>
        {{ scraps }}
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

@Component
export default class ScrapeList extends Vue {
    data() {
        return {
            scraps: []
        };
    }
    
    created() {

    }
}
</script>