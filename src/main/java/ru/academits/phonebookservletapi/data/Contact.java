package ru.academits.phonebookservletapi.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Contact {
    private int id;
    private String surname;
    private String name;
    private String phone;

    public Contact(Contact contact) {
        this(contact.id, contact.surname, contact.getName(), contact.getPhone());
    }
}