export default {
    login: 'Entra',
    logout: 'Esci',
    yes: 'Sì',
    no: 'No',
    cancel: 'Annulla',
    save: 'Salva',
    delete: 'Elimina',
    main_container: {
        unsaved_changes: 'Ci sono modifiche non salvate in questa pagina.'
    },
    sidebar_menu: {
        dashboard: 'Dashboard',
        contents: 'Contenuti',
        scrapes: 'Importazioni'
    },
    login_page: {
        email_address: 'E-mail address',
        password: 'Password'
    },
    content_types: {
        job: 'offerta di lavoro',
        page: 'pagina'
    },
    block_types: {
        text: 'Testo'
    },
    contents_list: {
        title: 'Titolo',
        organization: 'Organizzazione',
        content_type: 'Tipo di contenuto',
        create_new: 'Crea…',
        created: 'Creato',
        updated: 'Aggiornato',
        retrieve_list_failed: `C'è stato un problema nel recuperare la lista dei contenuti.`
    },
    content_editor: {
        view_on_site: 'Mostra nel sito',
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
        delete_scrape_modal: `
            <p><strong>Questa azione è permanente</strong>.</p>
            <p>Se confermi, <strong>non sarà possibile</strong> recuperare l'importazione cancellata.</p>
            <p class="my-4 text-danger"><strong>Confermi di voler cancellare questa importazione?</strong></p>
        `,
        delete_content_success: 'Contenuto cancellato correttamente.',
        delete_content_fail: `C'è stato un problema nel cancellare questo contenuto.`,
        save_content_success: 'Contenuto salvato correttamente.',
        save_content_fail: `C'è stato un problema nel salvare questo contenuto.`
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
        scientific_sector: 'Settore scientifico-disciplinare',
        scientific_sector_placeholder: 'es. ING-INF/06',
        salary: 'Stipendio',
        salary_placeholder: 'es. 20000, 30000-40000…',
        salary_gross: 'Lordo',
        salary_tax_exempt: 'Esentasse',
        application_deadline: 'Scadenza',
        application_deadline_timezone: "L'orario è mostrato nel fuso orario del browser, non di Roma.",
        application_url: 'URL per fare domanda',
        application_url_placeholder: 'https://…',
        'borsista': 'Borsista',
        'postdoc': 'Ricercatore Post Dottorato',
        'ricercatore-tipo-a': 'Ricercatore (tipo A)',
        'ricercatore-tipo-b': 'Ricercatore (tipo B)',
        'professore-prima-fascia': 'Professore Ordinario',
        'professore-seconda-fascia': 'Professore Associato',
        organization_candidate: {
            not_found: 'Questa organizzazione non è presente nel nostro database:',
            part_of: 'Parte di',
            name: 'Nome',
            short_name: 'Nome breve',
            create: 'Aggiungi organizzazione'
        }
    },
    organizations: {
        name: 'Nome',
        name_description: 'La versione lunga del nome di questa organizzazione',
        short_name: 'Nome breve',
        short_name_description: 'La versione breve del nome di questa organizzazione',
        part_of: 'Fa capo a...',
        part_of_description: "L'organizzazione a cui fa capo questa organizzazione",
        logo_label: 'Logo',
        logo_description: "Immagine rappresentativa dell'organizzazione (es. lo stemma, il logo...)",
        delete_modal_title: 'Cancellare questa organizzazione?',
        delete_modal: `
            <p><strong>Questa azione è permanente</strong>.</p>
            <p>Se confermi, <strong>non sarà possibile</strong> recuperare l'organizzazione cancellata.</p>
            <p class="my-4 text-danger"><strong>Confermi di voler cancellare questa organizzazione?</strong></p>
        `,
        logo_upload_failed: "C'è stato un problema a caricare il logo.",
        logo_delete_success: 'Logo cancellato correttamente',
        logo_delete_failure: "C'è stato un problema a cancellare il logo.",
        save_organization_success: 'Organizzazione salvata correttamente.',
        save_organization_failed: "C'è stato un problema a salvare l'organizzazione."
    },
    scrapes_list: {
        show_expired: 'Mostra scaduti',
        delete_selected: 'Elimina i selezionati',
        clear_selection: 'Deseleziona'
    },
    validation_feedback: {
        missing_field: 'Questo campo è necessario'
    }
};