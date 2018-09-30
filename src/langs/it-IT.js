export default {
    login: 'Entra',
    logout: 'Esci',
    yes: 'Sì',
    no: 'No',
    cancel: 'Annulla',
    save: 'Salva',
    delete: 'Elimina',
    main_container: {
        unsaved_changes: 'Ci sono modifiche non salvate in questa pagina.',
    },
    sidebar_menu: {
        dashboard: 'Dashboard',
        contents: 'Contenuti',
    },
    login_page: {
        email_address: 'E-mail address',
        password: 'Password',
    },
    content_types: {
        job: 'offerta di lavoro',
        page: 'pagina',
    },
    block_types: {
        text: 'Testo',
    },
    contents_list: {
        title: 'Titolo',
        organization: 'Organizzazione',
        content_type: 'Tipo di contenuto',
        create_new: 'Crea…',
        created: 'Creato',
        updated: 'Aggiornato',
        retrieve_list_failed: `C'è stato un problema nel recuperare la lista dei contenuti.`,
    },
    content_editor: {
        summary_title: 'Titolo',
        summary_title_description: 'Una breve descrizione del contenuto.',
        summary_title_placeholder: 'Inserisci un titolo',
        add_block_of_text: 'Aggiungi un blocco di testo',
        add_block_of_type: 'Aggiungi un blocco di tipo… ',
        meta: 'Meta',
        delete_block_warning: 'Questo blocco verrà cancellato quando salverai il contenuto.',
        delete_modal_title: 'Cancellare questo contenuto?',
        delete_modal: `
            <p><strong>Questa azione è permanente</strong>.</p>
            <p>Se confermi, <strong>non sarà possibile</strong> recuperare il contenuto cancellato.</p>
            <p>Hai considerato l'alternativa? Potresti impostare il contenuto come <strong>non pubblicato</strong>.</p>
            <p class="my-4 text-danger"><strong>Confermi di voler cancellare questo contenuto?</strong></p>
        `,
        delete_content_success: 'Contenuto cancellato correttamente.',
        delete_content_fail: `C'è stato un problema nel cancellare questo contenuto.`,
        save_content_success: 'Contenuto salvato correttamente.',
        save_content_fail: `C'è stato un problema nel salvare questo contenuto.`,
    },
    content_meta: {
        published: 'Pubblicato',
        url_slug: 'URL breve',
        organization: 'Organizzazione',
        type_to_search: 'Cerca…',
        searching: 'Ricerca in corso…',
        job_title: 'Titolo professionale',
        job_title_placeholder: 'es. Ricercatore Associato…',
        contest_sector: 'Settore concorsuale',
        contest_sector_placeholder: 'es. 09/H1',
        sector: 'Settore scientifico-disciplinare',
        sector_placeholder: 'es. ING-INF/06',
        salary: 'Stipendio',
        salary_placeholder: 'es. 20000, 30000-40000…',
        salary_gross: 'Lordo',
        salary_tax_exempt: 'Esentasse',
        application_deadline: 'Scadenza per fare domanda',
        application_url: 'URL per fare domanda',
        application_url_placeholder: 'https://…',
    }
};