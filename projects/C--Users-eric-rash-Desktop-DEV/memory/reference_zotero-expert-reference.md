---
name: zotero-expert-reference
description: "Zotero expert reference distilled from zotero.org/support (read 2026-10-13) — collect, organize, search, annotate, cite, sync, back up. Open for any Zotero how-to, troubleshooting, or setup question."
metadata:
  node_type: memory
  type: reference
  originSessionId: 25cf7597-8d98-41ad-9f32-763c997e5baa
  modified: 2026-10-13T15:26:05.684Z
---

Source: https://www.zotero.org/support/ (read 2026-10-13). Pages read: quick start, adding items, PDF reader, searching, collections and tags, word processor plugins, sync, data directory, attaching files, duplicates, PDF metadata, tips, bibliographies, styles, notes.

## Collect
- Best way to add items: Zotero Connector save button (Chrome, Firefox, Edge, Safari). It pulls metadata and open-access PDFs. Prefer it over manual entry.
- Add by Identifier (toolbar): ISBN, DOI, PubMed ID, arXiv ID, ADS Bibcode. Separate many IDs with spaces, commas, or line breaks.
- Drop a PDF in Zotero: it becomes a standalone attachment and metadata is retrieved automatically. The first few pages go to a Zotero lookup service (Crossref plus DOI/ISBN lookup; no account needed). If that fails: right-click > Create Parent Item (enter DOI/ISBN), or Manual Entry.
- Prefer child attachments under a parent item. Standalone attachments cannot be cited and are not used by My Publications.
- Stored files (default) live in the data directory and Zotero manages them. Linked files (Ctrl/Cmd-drag with modifier, or Attach Link to File) are not synced and do not work in group libraries. Convert with Tools > Manage Attachments.
- Large batches from Google Scholar, ProQuest, or Web of Science: export BibTeX or RIS and import the file. This avoids lockouts.
- Titles: store in sentence case. Zotero converts to title case on output. Journal abbreviations: store with periods.
- Extra field holds custom data. For citing fields Zotero does not support, see the KB article on item types and fields.
- Feeds: RSS subscriptions from journals, to browse and save.

## Organize
- Collections work like playlists. One item can sit in many collections, with no copies made. To move (not copy) between collections: hold Cmd (Mac) or Shift (Win/Linux) while dragging.
- Delete Collection keeps the items. Delete Collection and Items removes both.
- Tags travel between libraries. Collections do not.
- Colored tags (up to 9): press number keys 1-9 to toggle on selected items. Drag items onto a tag in the tag selector to tag them.
- Rename or delete a tag in the tag selector to change it everywhere. Renaming to an existing tag name merges the two.
- Automatic tags (red icon) come from catalog subject headings. Hide them, or delete them library-wide.
- Saved Searches are smart collections that update themselves. Example: Tag is not "read" = a To Read list.
- Special collections: Unfiled Items, Duplicate Items, Trash (30-day default, restorable), My Publications.
- View menu > Show Items from Subcollections.

## Search
- Quick search (Cmd/Ctrl-F) has three modes: Title/Year/Creator; All Fields and Tags; Everything (includes PDF full text). Type a leading quote mark to search only on Enter. This is faster on big libraries.
- Advanced Search (magnifier icon): field filters, Match all or any, Search subcollections, Show only top-level items, Include parent and child items. Wildcard is %, e.g. "W% Shakespeare".
- Saved Advanced Search updates itself. For Boolean logic, save each condition as a saved search, then combine them with a third search: Collection is Condition1 AND Collection is Condition2.
- Full-text index covers PDF, EPUB, HTML, and text files (not .docx). Default limit is 500,000 characters or 100 pages. If an item is missing from "Everything", right-click > Reindex Item. The "Indexed:" field in the right pane shows status.

## Annotate and notes
- PDF reader modes: unlocked (select text, pick a color from the popup) or locked (choose the highlight/underline tool and color; each selection highlights automatically).
- Annotations are stored in the Zotero database, not in the PDF file. External readers will not show them unless you export a PDF with embedded annotations. Adding, rotating, or deleting pages in an external reader breaks annotation positions.
- Get annotations into notes: drag them into the Notes pane, right-click > Add to Note, or right-click the parent item > Add Note from Annotations. Annotation citations link back to the page.
- Child notes attach to an item (Notes tab). Standalone notes come from the New Note button. Notes sync with metadata and do not count against file storage.
- Note editor "..." menu: Show/Hide Annotation Colors, Show/Hide Annotation Citations. Note templates customize annotation output.

## Cite and write
- Word, LibreOffice, and Google Docs plugins ship with Zotero. They insert citations, build the bibliography automatically, and switch styles for the whole document. Reinstall from Cite > Word Processor Plugins in preferences.
- Without a plugin: Quick Copy (drag items into any text field; hold Shift while dragging for in-text citations); Ctrl/Cmd-Shift-C copies the bibliography; Ctrl/Cmd-Shift-A copies a citation; export BibTeX or RIS. The Export pane sets format and HTML markup.
- RTF Scan: write plain text with placeholders, then Zotero finalizes citations and the bibliography.
- Styles use CSL (Citation Style Language). Over 10,000 are in the Zotero Style Repository (zotero.org/styles). For a style error, update Zotero and the style first, then post in the forum titled "Style Error: [Name]".
- Duplicates: Zotero compares title, DOI, and ISBN. Then it checks year (within 1 year) and first-author last name plus first initial. False positives cannot be marked yet. Always merge; do not delete. Merges keep collections and tags, and word-processor citations stay intact. Alt/Option-click selects one item. Merge works on same-type items anywhere in the library.

## Sync and backup
- Data sync is free and unlimited, and covers everything except files. File sync: Zotero Storage (300 MB free, paid tiers; recommended) or WebDAV (not for group libraries).
- Never put the data directory in a cloud-synced folder (Google Drive, Dropbox, OneDrive). It can corrupt the database.
- Default data directory: macOS /Users/<user>/Zotero; Windows C:\Users\<user>\Zotero; Linux ~/Zotero. Find it with Settings > Advanced > Show Data Directory.
- Contents: zotero.sqlite (database), storage/ (one 8-character subfolder per attachment), zotero.sqlite.bak (automatic daily backups), fulltext.sqlite (rebuildable; not backed up). Close Zotero before copying anything. Keep the -wal file with the .sqlite file.
- Backup: use a whole-machine backup such as Time Machine. Do not use export as a backup.
- Restore routes: sync back down; restore a .bak file (rename the current file first); or replace the whole data directory with Zotero closed.
- Replace Online Library (sync reset option) overwrites server data with local data. Use with care.

## Preferences and groups
- General pane: auto-snapshots of web pages, trash period, automatic tags toggle, and the external PDF reader choice.
- Group libraries are shared and separate from personal ones. Duplicate detection runs within each library only.

## Already on this machine (pointers, not copies)
- MCP tools: mcp__zotero__* (search, items_get, collections_*, cite, export, full_text_deep_search, sql, learnings, playbook).
- Skills: pp-zotero-research-library (library search and sync) and sports-science-research-grounding (research answers and batch work). Use them for procedures; this file is only the reference.

## Flint wiring (pointer)
- Flint setup and diagnosis: `~/DEV/Flint/docs/zotero-setup.md` (2026-10-13). Live layer is the bridge in `~/DEV/ZoteroInjestion`, read-only. The Go CLI cache is stale. Fixes need Eric's go-ahead.
- Decided 2026-10-13 (Eric): the bridge owns the Zotero `SecondBrain Queue` and the `research-papers` folder. Flint owns its vault library folder and writes no Zotero tags. The earlier `flint:*` tag plan is dropped.

## Gaps not yet read
Preferences pages in detail, Locate, Related items, Feeds details, RTF Scan details, Zotero Storage pricing, Groups details, Word plugin troubleshooting, Developer API, mobile app, Plugins list, KB articles (sentence casing, item types and fields, sync reset options).
