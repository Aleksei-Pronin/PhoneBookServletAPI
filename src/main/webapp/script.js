"use strict";

class ContactsService {
    static baseUrl = "/phone_book_servlet_api/api/contact";

    getContacts(term) {
        return axios.get(ContactsService.baseUrl, {
            params: {term}
        }).then(response => response.data);
    }

    addContact(contact) {
        return axios.post(ContactsService.baseUrl, contact)
            .then(response => response.data);
    }

    editContact(contactId, contact) {
        return axios.put(ContactsService.baseUrl + "/" + contactId, contact)
            .then(response => response.data);
    }

    deleteContact(contactId) {
        return axios.delete(ContactsService.baseUrl + "/" + contactId)
            .then(response => response.data);
    }
}

Vue.createApp({
    data() {
        return {
            contacts: [],
            editingContacts: {},
            surname: "",
            name: "",
            phone: "",
            searchText: "",
            isNewSurnameInvalid: false,
            isNewNameInvalid: false,
            isNewPhoneInvalid: false,
            isPhoneError: false,
            selectAll: false,
            deleteMessage: "",
            deleteContactIds: [],
            service: new ContactsService()
        };
    },

    created() {
        this.getContacts();
    },

    computed: {
        selectedContacts() {
            return this.contacts.filter(contact => contact.selected);
        }
    },

    methods: {
        showError(message) {
            Toastify({
                text: message,
                duration: 3000,
                gravity: "top",
                position: "right",
                close: true,
                className: "phonebook-toast"
            }).showToast();
        },

        getContacts() {
            this.service.getContacts(this.searchText)
                .then(contacts => {
                    this.contacts = contacts.map(contact => ({
                        ...contact,
                        selected: false
                    }));
                    this.selectAll = false;
                })
                .catch(() => {
                    this.showError("Не удалось загрузить список контактов");
                });
        },

        addContact() {
            this.isPhoneError = false;

            this.isNewSurnameInvalid = !this.surname.trim();
            this.isNewNameInvalid = !this.name.trim();
            this.isNewPhoneInvalid = !this.phone.trim();

            if (
                this.isNewSurnameInvalid ||
                this.isNewNameInvalid ||
                this.isNewPhoneInvalid
            ) {
                return;
            }

            const contact = {
                surname: this.surname.trim(),
                name: this.name.trim(),
                phone: this.phone.trim()
            };

            this.service.addContact(contact)
                .then(response => {
                    if (!response.success) {
                        this.isPhoneError = true;
                        this.showError(response.message);
                        return;
                    }

                    this.surname = "";
                    this.name = "";
                    this.phone = "";

                    this.isNewSurnameInvalid = false;
                    this.isNewNameInvalid = false;
                    this.isNewPhoneInvalid = false;
                    this.isPhoneError = false;

                    this.getContacts();
                })
                .catch(() => {
                    this.showError("Не удалось добавить контакт");
                });
        },

        startEdit(contact) {
            if (!contact || !contact.id) {
                return;
            }

            this.editingContacts[contact.id] = {
                surname: contact.surname,
                name: contact.name,
                phone: contact.phone,
                isSurnameInvalid: false,
                isNameInvalid: false,
                isPhoneInvalid: false,
                isPhoneError: false
            };
        },

        cancelEdit(contactId) {
            delete this.editingContacts[contactId];
        },

        editContact(contactId) {
            const editContact = this.editingContacts[contactId];

            if (!editContact) {
                return;
            }

            editContact.isPhoneError = false;

            editContact.isSurnameInvalid = !editContact.surname.trim();
            editContact.isNameInvalid = !editContact.name.trim();
            editContact.isPhoneInvalid = !editContact.phone.trim();

            if (
                editContact.isSurnameInvalid ||
                editContact.isNameInvalid ||
                editContact.isPhoneInvalid
            ) {
                return;
            }

            const contact = {
                surname: editContact.surname.trim(),
                name: editContact.name.trim(),
                phone: editContact.phone.trim()
            };

            this.service.editContact(contactId, contact)
                .then(response => {
                    if (!response.success) {
                        editContact.isPhoneError = true;
                        this.showError(response.message);
                        return;
                    }

                    delete this.editingContacts[contactId];
                    this.getContacts();
                })
                .catch(() => {
                    this.showError("Ошибка при сохранении изменений");
                });
        },

        deleteContact(contact) {
            this.deleteMessage = "Контакт будет удалён из таблицы";
            this.deleteContactIds = [contact.id];
            this.showDeleteModal();
        },

        deleteSelected() {
            this.deleteMessage = "Количество контактов: " + this.selectedContacts.length;
            this.deleteContactIds = this.selectedContacts.map(contact => contact.id);
            this.showDeleteModal();
        },

        confirmDelete() {
            bootstrap.Modal.getOrCreateInstance(this.$refs.deleteModal).hide();

            const requests = this.deleteContactIds.map(id => this.service.deleteContact(id));

            Promise.all(requests)
                .then(responses => {
                    const failedResponse = responses.find(response => !response.success);

                    if (failedResponse) {
                        this.showError(failedResponse.message);
                        return;
                    }

                    this.getContacts();
                })
                .catch(() => {
                    this.showError(
                        this.deleteContactIds.length === 1 ? "Не удалось удалить контакт" : "Не удалось удалить контакты");
                });
        },

        showDeleteModal() {
            bootstrap.Modal.getOrCreateInstance(this.$refs.deleteModal).show();
        },

        selectAllContacts() {
            this.contacts.forEach(contact => {
                contact.selected = this.selectAll;
            });
        },

        updateSelectAll() {
            if (!this.selectAll) {
                return;
            }

            if (this.contacts.some(contact => !contact.selected)) {
                this.selectAll = false;
            }
        },

        clearFilter() {
            this.searchText = "";
            this.getContacts();
        }
    }
}).mount("#app");