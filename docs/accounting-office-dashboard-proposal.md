# Accounting Office Dashboard Proposal

## A) Proposed UX + Navigation

### Primary IA (Firm Workspace)
- **Home / Work Queue**
  - Needs Review
  - Needs Client Info
  - Ready for Report
  - Ready to File
  - Filed / Archived
- **Clients**
  - Directory (filters: status, tax year, entity type, assigned team)
  - Client Profile
- **Engagements / Tax Years**
  - Per-client timelines and status tracking
- **Uploads**
  - Document Batches (per engagement)
- **Transactions**
  - Normalized ledger and categorization review
- **Review Packages**
  - Client approval bundles
- **Rules & Templates**
  - Firm rules, client exceptions, report templates, question templates
- **Exports**
  - CSV/XLSX, QuickBooks import, audit index
- **Admin**
  - Users, Roles, Permissions, Integrations, Audit Log

### Navigation
- **Top bar:** firm switcher, global search, notifications, help
- **Left rail:** Home, Clients, Engagements, Uploads, Transactions, Review Packages, Rules & Templates, Exports, Admin
- **Contextual tabs:** within a client or engagement (Overview, Uploads, Transactions, Questions, Review Package, Exports)

## B) Key Screens and Components

### 1) Home / Work Queue
- **Queue cards** by stage with counts and SLAs
- **Filters:** team member, client type (individual/corporation), tax year, province
- **Bulk actions:** assign reviewer, move status, export

### 2) Client Profile
- **Header:** client identity, entity type, status, assigned team, last upload
- **Tax Profile by year:** province, residency, GST/HST registration, fiscal year-end
- **Engagement timeline:** uploads, questions, review, filing
- **Open items:** missing docs, unanswered questions

### 3) Upload Center (Document Batches)
- **Drag-and-drop** multi-file upload with validation
- **Batch viewer** (page splits, rotations, doc type detection)
- **Progress & errors** with retry and repair tools

### 4) Transaction Review Workspace (Core)
- **Left panel:** doc preview with page thumbnails, OCR highlights
- **Middle:** transaction table (filters, bulk split, bulk classify, rules)
- **Right:** AI panel (recommended category, confidence, rationale, CRA notes)
- **Hotkeys:** approve, split, reclassify, add note, mark question

### 5) Questions / Client Clarifications
- **AI-generated list** of questions with severity
- **Status:** Open, Awaiting Client, Resolved
- **Audit notes** for client responses and attachments

### 6) Report Builder
- **One-click generate**
- **Editable narrative sections** (summary, major variances, flags)
- **Appendices** (transactions, receipts, document index)
- **Exports**: PDF for client, CSV/XLSX for internal systems

## C) Data Model

### Core Entities
- **Firm**
- **User** (role: Admin Partner, Manager, Staff Accountant, Bookkeeper, Reviewer)
- **Client** (Individuals + Corporations)
- **Engagement** (per tax year)
- **DocumentBatch**
- **Document** (page-level metadata)
- **Transaction** (canonical ledger entry)
- **Category** (CRA mapping)
- **Rule** (firm + client)
- **ReviewPackage**
- **Export**
- **AuditLog** (immutable change record)

### Key Fields (Selected)
- **Client**: legal_name, entity_type, province, residency_status, gst_hst_registered, fiscal_year_end
- **Engagement**: tax_year, status, assigned_team, questions_open
- **Document**: file_type, doc_type, classification_confidence, page_count, ocr_status
- **Transaction**: date, description, payee, amount, currency, tax_amounts, source_doc_id
- **Category**: cra_code, cra_name, internal_code, limitation_note
- **Rule**: scope (firm/client), conditions, target_category, priority
- **ReviewPackage**: status, generated_at, client_approval_status
- **AuditLog**: entity_type, entity_id, action, before, after, actor_id, reason

## D) Ingestion Pipeline

### Storage & Processing
1. **Upload** → virus scan → store raw in object storage
2. **Document classification** (statement vs receipt vs tax form)
3. **OCR + table extraction** (PDFs + images)
4. **Parsing** per file type
5. **Normalization** to canonical Transaction and Document models
6. **Validation** (missing months, duplicate detection, totals reconcile)

### File-type Parsers
- **PDF**: OCR + table extractor + page classifier
- **CSV/XLSX**: schema inference, column mapping
- **Images**: OCR + receipt line item parser
- **Tax slips**: form templates for T4/T4A/T5/etc.

## E) AI System Design

### Components
- **Document Classifier** (multi-label, page-level)
- **Extraction Engine** (structured data + table parsing)
- **Categorization Model** (CRA-aligned mapping)
- **Rules Engine** (firm + client overrides)
- **Confidence + Explainability** (scores + rationale)
- **Feedback Loop** (human overrides retrain or rule creation)

### Safety & Control
- **No silent finalization** — all AI outputs require human approval
- **To-review queues** with clear confidence thresholds
- **Override reasons** captured in audit log

## F) CRA Category System + Code Mapping Approach

### Category Families
- **Income** (employment, business, investment, rental)
- **COGS / Direct Costs**
- **Operating Expenses** (office, professional fees, software)
- **Travel & Meals** (meals 50% limitation flag)
- **Vehicle** (km log prompts)
- **Home Office** (T2200/T2200S prompts)
- **Capital Gains** (ACB tracking, superficial loss flags)
- **GST/HST** (ITC eligibility tagging)

### Mapping Mechanics
- **Internal Category Code** → **CRA code** + **Guideline note**
- **Rationale** required for AI suggestions
- **Uncertain state** for ambiguous items

## G) MVP Scope + Next Iterations

### MVP
- Firm workspace nav, Clients, Engagements, Uploads, Transaction Review
- OCR + parsing for PDF/CSV/XLSX + receipt images
- CRA category mapping + AI suggestions with confidence
- Review package generation
- Audit trail + role-based permissions

### V1
- Tax slip extraction templates
- Capital gains pipeline (brokerage + crypto CSV)
- Rules engine with bulk operations
- QuickBooks export

### V2
- Advanced anomaly detection (missing months, duplicates)
- Auto-match receipts to transactions
- Client portal for clarifications

## H) Backlog Tickets (Priority)

### P0 — Foundation
1. Create firm workspace nav + role-based access controls
2. Build upload pipeline with OCR + parsing
3. Implement canonical Transaction model and ledger view
4. Build CRA category mapping table + category picker
5. Add AI panel with confidence + rationale
6. Generate review package PDF + export CSV/XLSX
7. Add audit logging and change reasons

### P1 — Quality & Scale
1. Add document batch tools (split, rotate, merge)
2. Add rules engine (firm + client scope)
3. Add question list + client clarifications
4. Add validation checks (missing periods, duplicates)

### P2 — Advanced
1. Capital gains ACB tracking
2. Receipt matching engine
3. QuickBooks import format
4. Advanced reporting templates

## I) Risks + Mitigations
- **OCR failure on scans** → multi-engine OCR fallback + human correction tools
- **Misclassification risk** → confidence thresholds + mandatory review
- **PII compliance** → encryption at rest + access controls + audit log
- **Data reconciliation errors** → automated totals check + manual override

## J) Questions You Need Answered
1. Preferred OCR vendor (or in-house)?
2. Which tax prep software integrations are critical first?
3. Should client portal be included in MVP or V1?

## Extra Improvements Included
- Client identity + tax profile per year
- Multi-currency support + FX handling
- GST/HST ITC tagging
- Transaction ↔ receipt matching
- Audit-ready change log + reason required
- Validation rules and reconciliation checks
- Firm-wide templates and batch operations
- Global search for clients, uploads, transactions, notes
- Security: encryption at rest, expiring client review links
