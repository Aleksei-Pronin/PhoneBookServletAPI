import axios from "axios";

export default class ContactsService {
    static baseUrl = "/api/contact";

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

    deleteContacts(contactIds) {
        return axios.delete(ContactsService.baseUrl, {
            data: contactIds
        }).then(response => response.data);
    }
}