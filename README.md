
# unnehdb.js Documentation

## Overview
A simple in-memory database implementation in JavaScript supporting operations like creating collections, adding documents, indexing, and file storage.

### Database
- Manages initialization, saving, auto-saving, and collection management.

### Collection
- Handles operations on individual collections.

### Document
- Represents data stored in JSON format.

### SubCollection
- Manages nested collections within documents.

## Initializing the Database
Initializes the database with a specified file name and auto-save interval.

## Save Manually
Allows manual saving of the database outside the auto-save interval.

## Working with Collections
- **Creating or Accessing a Collection:** Initializes or retrieves a collection.
- **Adding a Document:** Inserts a new document into a collection.
- **Retrieving a Document:** Fetches a document by its unique ID.

## Pagination
Implements data pagination by specifying the page number and the number of items per page.

## Working with Sub-Collections
- **Creating or Accessing a Sub-Collection:** Initializes or retrieves a nested collection within a document.

## File Storage
Handles saving files associated with documents, including reading file buffers and specifying file names.

## Shortcuts and Notes
- **Auto-Save:** Automatically saves the database at specified intervals.
- **Indexes:** Automatically updated when documents are added or modified.
- **Sub-Collections:** Facilitates hierarchical data organization.

