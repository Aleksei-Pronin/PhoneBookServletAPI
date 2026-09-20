package ru.academits.phonebookservletapi.servlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import ru.academits.phonebookservletapi.data.Contact;
import ru.academits.phonebookservletapi.data.ContactsInMemoryRepository;
import ru.academits.phonebookservletapi.data.ContactsRepository;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/api/contact/*")
public class PhoneBookServlet extends HttpServlet {
    private final ContactsRepository contactsRepository = new ContactsInMemoryRepository();
    private final ObjectMapper mapper = JsonMapper.builder().build();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String term = req.getParameter("term");
        sendJson(resp, contactsRepository.getAll(term));
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Contact contact = readContact(req, resp);

        if (contact == null) {
            return;
        }

        if (contactsRepository.isPhoneExists(contact.getPhone(), 0)) {
            sendJson(resp, createResponse(false, "Уже есть контакт с таким номером"));
            return;
        }

        contactsRepository.create(contact);

        sendJson(resp, createResponse(true, null));
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Integer id = getContactId(req, resp);

        if (id == null) {
            return;
        }

        Contact contact = readContact(req, resp);

        if (contact == null) {
            return;
        }

        if (contactsRepository.isPhoneExists(contact.getPhone(), id)) {
            sendJson(resp, createResponse(false, "Уже есть другой контакт с таким номером"));
            return;
        }

        contact.setId(id);
        try {
            contactsRepository.update(contact);
        } catch (IllegalArgumentException e) {
            sendJson(resp, createResponse(false, e.getMessage()));
            return;
        }

        sendJson(resp, createResponse(true, null));
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Integer id = getContactId(req, resp);

        if (id == null) {
            return;
        }

        try {
            contactsRepository.delete(id);
        } catch (IllegalArgumentException e) {
            sendJson(resp, createResponse(false, e.getMessage()));
            return;
        }

        sendJson(resp, createResponse(true, null));
    }

    private Contact readContact(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Contact contact;

        try {
            contact = mapper.readValue(req.getInputStream(), Contact.class);
        } catch (IOException e) {
            sendJson(resp, createResponse(false, "Некорректные данные контакта"));
            return null;
        }

        String surname = normalize(contact.getSurname());
        String name = normalize(contact.getName());
        String phone = normalize(contact.getPhone());

        String validationMessage = validateContact(surname, name, phone);

        if (validationMessage != null) {
            sendJson(resp, createResponse(false, validationMessage));
            return null;
        }

        contact.setSurname(surname);
        contact.setName(name);
        contact.setPhone(phone);

        return contact;
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private String validateContact(String surname, String name, String phone) {
        if (surname.isEmpty()) {
            return "Необходимо заполнить фамилию";
        }

        if (name.isEmpty()) {
            return "Необходимо заполнить имя";
        }

        if (phone.isEmpty()) {
            return "Необходимо заполнить номер телефона";
        }

        return null;
    }

    private Integer getContactId(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String pathInfo = req.getPathInfo();

        if (pathInfo == null || pathInfo.length() <= 1) {
            sendJson(resp, createResponse(false, "Не указан id контакта"));
            return null;
        }

        try {
            return Integer.parseInt(pathInfo.substring(1));
        } catch (NumberFormatException e) {
            sendJson(resp, createResponse(false, "Некорректный id контакта"));
            return null;
        }
    }

    private Map<String, Object> createResponse(boolean success, String message) {
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", success);
        resp.put("message", message);

        return resp;
    }

    private void sendJson(HttpServletResponse resp, Object data) throws IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        mapper.writeValue(resp.getWriter(), data);
    }
}
