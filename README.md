Here is the documentation for your `README.md` based on the HTML file you provided:

---

# unnehdb.js Documentation

`unnehdb.js` is a simple, in-memory database implementation written in JavaScript that supports basic database operations like creating collections, adding documents, indexing, and file storage.

## Table of Contents

- [Overview](#overview)
- [Initializing the Database](#initializing-the-database)
- [Save Manually](#save-manually)
- [Working with Collections](#working-with-collections)
  - [Creating or Accessing a Collection](#creating-or-accessing-a-collection)
  - [Adding a Document](#adding-a-document)
  - [Retrieving a Document](#retrieving-a-document)
- [Pagination](#pagination)
- [Working with Sub-Collections](#working-with-sub-collections)
  - [Creating or Accessing a Sub-Collection](#creating-or-accessing-a-sub-collection)
- [File Storage](#file-storage)
  - [Saving a File](#saving-a-file)
- [Shortcuts and Notes](#shortcuts-and-notes)

---

## Overview

`unnehdb.js` is designed to handle in-memory data storage with basic features, such as collections and sub-collections. It also supports file storage, pagination, and automatic saving.

### Key Concepts:
- **Database**: Manages initialization, saving, and auto-saving at regular intervals. (like a main disk) 
- **Collection**: Handles operations on individual data sets. (like a folders)
- **Document**: Represents the data stored in JSON format. (like a files in folder)
- **SubCollection**: Nested collections within a document for hierarchical data. (like a subfolders)

---

## Initializing the Database

To initialize the database, use the following code:

```javascript
const db = new Database('unnehdb');
```

- The first argument is the file name for saving the database.
- The second argument is the auto-save interval (in milliseconds).
-  You can use a third argument to specify a custom file name.

---

## Save Manually

Normally, the database is saved automatically based on the specified interval, but you can also save it manually:

```javascript
const db = new Database('unnehdb',6000);
db.save();
```

---

## Working with Collections

### Creating or Accessing a Collection

To create or access a collection, use:

```javascript
const users = db.collection('users');
```

### Adding a Document

To add a document to a collection:

```javascript
const userId = users.add({ name: 'John Doe', email: 'john@example.com' });
```

The `add` method returns a unique ID for the document, and the argument is the document data in JSON format.

### Retrieving a Document

To retrieve a document by its ID:

```javascript
const user = users.getDocumentById(userId);
```

---

## Pagination

For paginating results in a collection:

```javascript
const page = users.paginate(0, 10);
```

This retrieves a specific page of results, with the first argument being the page number and the second argument being the number of items per page.

---
### Remove documents
```javascript
usersCollection.delete(documentid);
```

---

### Remove collections
```javascript
db2.deleteCollection("users");
```

---

## Working with Sub-Collections

### Creating or Accessing a Sub-Collection

To access a sub-collection within a collection:

```javascript
const orders = users.collection(userId, 'orders');
```

This creates or accesses the `orders` sub-collection for the given user.

---

## File Storage

### Saving a File

To save a file to a document:

```javascript
const fileBuffer = fs.readFileSync('path/to/file.jpg');
users.saveFile(documentId, 'profilePicture', fileBuffer, 'profile.jpg');
```

- The first argument is the document ID.
- The second argument is the key in the document for the file.
- The third argument is the file buffer.
- The fourth argument is the file name.

---

## Shortcuts and Notes

- **Auto-Save**: The database auto-saves at the specified interval.
- **Indexes**: Automatically updated when documents are added or updated.
- **Sub-Collections**: Useful for organizing hierarchical data.

---

### License

---
My first project like this wooho! by 177unneh
<!-- `unnehdb.js` is open-source and available under the MIT License. -->

