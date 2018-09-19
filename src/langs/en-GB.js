export default {
    login: 'Entra',
    logout: 'Esci',
    yes: 'Yes',
    no: 'No',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    main_container: {
        unsaved_changes: 'There are unsaved changes in this page.',
    },
    sidebar_menu: {
        dashboard: 'Dashboard',
        contents: 'Your contents',
    },
    login: {
        email_address: 'E-mail address',
        password: 'Password',
    },
    content_types: {
        job: 'job offer',
        page: 'page',
    },
    block_types: {
        text: 'Text',
    },
    contents_list: {
        title: 'Title',
        organization: 'Organization',
        content_type: 'Content Type',
        create_new: 'Create new…',
        created: 'Created',
        updated: 'Updated',
        retrieve_list_fail: 'There was a problem retrieving the list of contents.',
    },
    content_editor: {
        summary_title: 'Summary title',
        summary_title_description: 'A title or a brief description of the content.',
        summary_title_placeholder: 'Enter a title',
        add_block_of_text: 'Add a block of text',
        add_block_of_type: 'Add a block of type… ',
        meta: 'Meta',
        retrieve_content_fail: 'There was a problem retrieving this content.',
        delete_block_warning: 'This block will be deleted when you save the document.',
        delete_modal_title: 'Delete this content?',
        delete_modal: `
            <p><strong>This action is permanent</strong>.</p>
            <p>If you confirm, you <strong>will not</strong> be able to recover the content.</p>
            <p>Have you considered the alternative? You could <strong>unpublish</strong> this content instead.</p>
            <p class="my-4 text-danger"><strong>Are you sure you want to delete this content?</strong></p>
        `,
        delete_content_success: 'Content deleted succesfully.',
        delete_content_fail: 'Something went wrong while deleting content.',
        save_content_success: 'Content saved correctly.',
        save_content_fail: 'Something went wrong while saving this content.',
    },
    content_meta: {
        published: 'Published',
        url_slug: 'URL slug',
        organization: 'Organization',
        type_to_search: 'Type to search…',
        searching: 'Searching…',
        job_title: 'Job title',
        job_title_placeholder: 'e.g., Research Associate…',
        salary: 'Salary',
        salary_placeholder: 'e.g., 20000, 30000-40000…',
        salary_gross: 'Gross',
        salary_tax_exempt: 'Tax Exempt',
        application_deadline: 'Application deadline',
        application_url: 'Application URL',
        application_url_placeholder: 'https://…',
    }
};