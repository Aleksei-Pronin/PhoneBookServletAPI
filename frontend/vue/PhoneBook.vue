<template>
    <div class="container py-4">
        <h1 class="text-center mb-4">Телефонная книга</h1>

        <div class="row g-4">
            <div class="col-md-8 order-2 order-md-1">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <h2 class="card-title mb-4 text-center fs-5">Контакты</h2>

                        <form @submit.prevent="getContacts" class="input-group mb-3">
                            <label for="filter" class="visually-hidden">Поиск</label>
                            <input v-model="searchText" type="text" class="form-control" id="filter"
                                   placeholder="Поиск">
                            <button class="btn btn-primary" type="submit" title="Найти">
                                <i class="bi bi-search"></i>
                            </button>
                            <button @click="clearFilter" class="btn btn-secondary" type="button" title="Сбросить">
                                <i class="bi bi-x-lg"></i>
                            </button>
                        </form>

                        <button v-if="selectedContacts.length > 0" @click="deleteSelected"
                                class="btn btn-outline-danger mb-3" type="button">
                            <i class="bi bi-trash me-1"></i>
                            Удалить выбранные
                        </button>

                        <div class="table-responsive">
                            <table class="table table-bordered table-hover table-striped mb-0">
                                <thead class="table-primary">
                                <tr>
                                    <th class="text-center">
                                        <input v-model="selectAll" @change="selectAllContacts" type="checkbox"
                                               title="Выбрать все">
                                    </th>
                                    <th class="text-center">№</th>
                                    <th class="text-center">Фамилия</th>
                                    <th class="text-center">Имя</th>
                                    <th class="text-center">Номер телефона</th>
                                    <th class="text-center">Действие</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr v-if="contacts.length === 0">
                                    <td colspan="6" class="text-center text-secondary py-4">Нет контактов</td>
                                </tr>
                                <tr v-for="(contact, index) in contacts" :key="contact.id">
                                    <td class="text-center">
                                        <input v-model="contact.selected" @change="updateSelectAll" type="checkbox">
                                    </td>
                                    <td class="text-center" v-text="index + 1"></td>
                                    <template v-if="editingContacts[contact.id]">
                                        <td>
                                            <input v-model.trim="editingContacts[contact.id].surname" type="text"
                                                   class="form-control form-control-sm"
                                                   :class="{ 'is-invalid': editingContacts[contact.id].isSurnameInvalid }">
                                            <div v-if="editingContacts[contact.id].isSurnameInvalid"
                                                 class="text-danger small mt-1">Необходимо заполнить поле
                                            </div>
                                        </td>
                                        <td>
                                            <input v-model.trim="editingContacts[contact.id].name" type="text"
                                                   class="form-control form-control-sm"
                                                   :class="{ 'is-invalid': editingContacts[contact.id].isNameInvalid }">
                                            <div v-if="editingContacts[contact.id].isNameInvalid"
                                                 class="text-danger small mt-1">Необходимо заполнить поле
                                            </div>
                                        </td>
                                        <td>
                                            <input v-model.trim="editingContacts[contact.id].phone" type="tel"
                                                   class="form-control form-control-sm"
                                                   :class="{ 'is-invalid': editingContacts[contact.id].isPhoneInvalid ||
                                               editingContacts[contact.id].isPhoneError }">
                                            <div v-if="editingContacts[contact.id].isPhoneInvalid"
                                                 class="text-danger small mt-1">Необходимо заполнить поле
                                            </div>
                                        </td>
                                        <td class="actions-cell text-center">
                                            <button @click="editContact(contact.id)" class="btn btn-sm btn-success me-2"
                                                    type="button" title="Сохранить">
                                                <i class="bi bi-check-lg"></i>
                                            </button>
                                            <button @click="cancelEdit(contact.id)" class="btn btn-sm btn-secondary"
                                                    type="button" title="Отменить">
                                                <i class="bi bi-x-lg"></i>
                                            </button>
                                        </td>
                                    </template>

                                    <template v-else>
                                        <td class="text-center" v-text="contact.surname"></td>
                                        <td class="text-center" v-text="contact.name"></td>
                                        <td class="text-center" v-text="contact.phone"></td>
                                        <td class="actions-cell text-center">
                                            <button @click="startEdit(contact)"
                                                    class="btn btn-sm btn-outline-primary me-2"
                                                    type="button" title="Редактировать">
                                                <i class="bi bi-pencil"></i>
                                            </button>

                                            <button @click="deleteContact(contact)"
                                                    class="btn btn-sm btn-outline-danger"
                                                    type="button" title="Удалить">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </template>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-4 order-1 order-md-2">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <h2 class="card-title mb-4 text-center fs-5">Новый контакт</h2>

                        <form @submit.prevent="addContact" novalidate autocomplete="off">
                            <div class="mb-3">
                                <label for="surname" class="form-label">Фамилия</label>
                                <input v-model.trim="surname" type="text" class="form-control"
                                       :class="{ 'is-invalid': isNewSurnameInvalid }" id="surname"
                                       placeholder="Фамилия">
                                <div v-if="isNewSurnameInvalid" class="text-danger small mt-1">
                                    Необходимо заполнить поле
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="name" class="form-label">Имя</label>
                                <input v-model.trim="name" type="text" class="form-control"
                                       :class="{ 'is-invalid': isNewNameInvalid }" id="name" placeholder="Имя">
                                <div v-if="isNewNameInvalid" class="text-danger small mt-1">
                                    Необходимо заполнить поле
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="phone" class="form-label">Номер телефона</label>
                                <input v-model.trim="phone" type="text" class="form-control"
                                       :class="{ 'is-invalid': isNewPhoneInvalid || isPhoneError }" id="phone"
                                       placeholder="Номер телефона">
                                <div v-if="isNewPhoneInvalid" class="text-danger small mt-1">
                                    Необходимо заполнить поле
                                </div>
                            </div>
                            <button class="btn btn-primary w-100" type="submit">
                                <i class="bi bi-plus-lg me-1"></i>
                                Добавить контакт
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal fade" ref="deleteModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title  fs-5">Подтвердите удаление</h2>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">{{ deleteMessage }}</div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                        <button @click="confirmDelete" type="button" class="btn btn-danger">Удалить</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import ContactsService from "../js/contactsService";
import {Modal} from "bootstrap";
import Toastify from "toastify-js";

export default {
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
                className: "phonebook-toast",
                style: {
                    background: "#dc3545"
                }
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
            Modal.getOrCreateInstance(this.$refs.deleteModal).hide();

            const deleteRequest = this.deleteContactIds.length === 1
                ? this.service.deleteContact(this.deleteContactIds[0])
                : this.service.deleteContacts(this.deleteContactIds);

            deleteRequest
                .then(response => {
                    if (!response.success) {
                        this.showError(response.message);
                        return;
                    }

                    this.getContacts();
                })
                .catch(() => {
                    this.showError(
                        this.deleteContactIds.length === 1
                            ? "Не удалось удалить контакт"
                            : "Не удалось удалить контакты"
                    );
                });
        },

        showDeleteModal() {
            Modal.getOrCreateInstance(this.$refs.deleteModal).show();
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
};
</script>