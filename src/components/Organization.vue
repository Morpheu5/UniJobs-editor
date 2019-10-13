<template>
    <li>
        <router-link :to="`/organizations/${organization.id}`">{{ organization.name }} ({{ organization.short_name }})</router-link>
        <ul v-if="hasChildren">
            <Organization v-for="child in organization.children" :key="child.id" :organization="child" />
        </ul>
    </li>
</template>

<script>
export default {
    name: 'Organization',
    props: {
        organization: {
            name: String,
            short_name: String,
            parent_id: Number,
            children: Array
        }
    },
    computed: {
        hasChildren() {
            return this.organization.children?.length > 0;
        }
    }
};
</script>