# 26 — File Management

> Every file that enters Tasork — request attachments, message attachments, deliverables — flows through one shared upload pipeline, so validation, scanning, and storage rules are enforced exactly once, not reimplemented per feature.

## 1. Upload Pipeline (Shared)
```
Client selects file(s) (Dropzone component, 18_UI_Components.md)
   ↓
Client-side check: MIME type + size (UX-level, fast feedback)
   ↓
multipart/form-data → backend upload endpoint
   ↓
Server-side re-validation (authoritative): MIME type, size, extension allowlist
   ↓
ClamAV scan (in-memory/temp, before persistence)
   ↓
[Clean] → stored to Cloudflare R2 with a generated (non-guessable) key → DB row created (RequestAttachment / MessageAttachment / Deliverable)
   ↓
[Infected/Rejected] → never touches permanent storage → client shown a specific rejection reason
```
- This mirrors and formalizes `14_Security.md` §8 — this document is the full functional spec, Security document is the policy summary.

## 2. Storage Structure
- Bucket per environment: `tasork-prod`, `tasork-staging` (`07_Technology.md`).
- Key prefixing by entity, as declared in `07_Technology.md`:
  - `/requests/{requestId}/{generatedKey}`
  - `/projects/{projectId}/deliverables/{milestoneId}/{generatedKey}`
  - `/messages/{projectId}/{generatedKey}`
  - `/avatars/{userId}/{generatedKey}`
- Original filenames are **preserved as metadata** (for display/download naming) but never used as the storage key itself — prevents path traversal and overwrite collisions (`14_Security.md` §8).

## 3. Access Control & Downloads
- All file access (except public CMS/marketing assets) goes through **signed, time-limited URLs** generated on-demand server-side — no public bucket links, ever, for client project data.
- Signed URL generation checks RBAC first: a client can only generate a signed URL for files belonging to their own requests/projects; staff access is scoped via `ProjectAssignment` unless the role is `admin`/`super_admin`.
- URL expiry kept short (e.g., 5–15 minutes) — long enough for a normal download/preview, short enough that a leaked link goes stale quickly.

## 4. Size & Type Limits
| Context | Max size (per file) | Allowed types |
|---|---|---|
| Request attachments | 50 MB | Documents (pdf, docx, xlsx, pptx), images (jpg, png, webp), archives (zip) |
| Message attachments | 25 MB | Same as above, image-forward (chat context) |
| Deliverables (staff upload) | 250 MB | Broader allowlist (code archives, design files, video for larger creative projects) — configurable per category |
| Avatar | 5 MB | jpg, png, webp only |
- Limits are enforced both client-side (immediate UX feedback, no wasted upload bandwidth) and server-side (authoritative — client-side checks are never trusted alone).
- Limits are **Admin-configurable** (Platform Settings) rather than hardcoded, since project types vary widely in typical file sizes.

## 5. Preview
- **Images:** inline thumbnail generation (resized variant stored alongside original) for fast list/grid rendering without pulling the full-resolution file.
- **PDFs:** first-page thumbnail preview where feasible; full preview via an embedded viewer (no forced download) for common formats.
- **Other documents (docx/xlsx/pptx):** filename + size + type icon shown; preview deferred to download rather than attempting in-browser rendering (avoids a heavy/fragile preview-conversion pipeline for MVP).
- **Videos (deliverables, F):** thumbnail frame extraction + streaming preview considered post-MVP if creative/video project categories grow.

## 6. Versioning
- **Deliverables specifically are versioned**, not overwritten: each new upload against a `Milestone` creates a new `Deliverable` row (linked to the same milestone) rather than replacing the prior file — preserves a full history of what was delivered and when, important for revision-cycle disputes (`04_User_Flow.md` Flow 9).
- **Request attachments** are not versioned in the same way — a client editing a pending (pre-review) request can remove/re-add files freely (`DELETE /solution-requests/:id/attachments/:fileId`), since no work has started yet.
- R2 bucket versioning (provider-level) is enabled as a secondary safety net for accidental-deletion recovery (`14_Security.md` §14), separate from the application-level Deliverable versioning above.

## 7. Permissions Model
| Role | Request attachments | Message attachments | Deliverables |
|---|---|---|---|
| Customer (own) | Read/Write (pre-review), Read-only after | Read/Write | Read-only (download + approve/request-revision) |
| Team Member (assigned) | Read | Read/Write | Read/Write (upload new versions) |
| Support | Read (for ticket context) | Read (client-visible only) | Read |
| Admin/Super Admin | Read/Write, Delete | Read | Read/Write, Delete |

## 8. Virus Scanning Details
- ClamAV runs as a pipeline step **before** any write to R2 — infected files are rejected outright, logged (actor, filename hash, timestamp) to `AuditLog`, and never persisted anywhere, including temp storage beyond the scan window.
- Scan failures (service unavailable, not a detected virus) fail closed — upload rejected with a "try again shortly" message rather than silently skipping the scan.

## 9. Retention & Deletion
- Files tied to `SolutionRequest`/`Project` records persist for the life of the record, consistent with soft-delete policy on parent entities (`12_Database_Planning.md`) — deleting a request/project doesn't hard-delete its files immediately, supporting dispute/audit needs.
- A documented data-retention window (aligned with backup policy, `14_Security.md` §14) governs eventual hard deletion of very old, closed-project files if storage cost or compliance requires it — process is logged, not ad hoc.

## 10. Upload UX Details (cross-ref `18_UI_Components.md` FileUpload/Dropzone)
- Multi-file drag-and-drop with per-file progress bars.
- Per-file success checkmark or a specific rejection reason (type not allowed / size exceeded / failed scan) — never a generic "upload failed."
- Rejected files don't block the rest of the batch — other valid files in the same drop continue uploading independently.
