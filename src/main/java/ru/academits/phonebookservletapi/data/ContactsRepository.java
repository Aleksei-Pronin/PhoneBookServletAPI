package ru.academits.phonebookservletapi.data;

import java.util.List;

public interface ContactsRepository {
    List<Contact> getAll(String term);

    void create(Contact contact);

    void update(Contact contact);

    void delete(int contactId);

    void delete(List<Integer> contactIds);

    boolean isPhoneExists(String phone, int contactId);
}