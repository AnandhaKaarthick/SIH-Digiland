# DigiLand — Google Stitch Prompt Kit

Google Stitch generates one screen per prompt, so the best approach is: **one strong "design system" prompt for your first screen (Dashboard), then shorter prompts for every other screen that reference the same system** so Stitch keeps them visually consistent.

---

## How to use this

1. Paste the **Master System Prompt** first, generate the **Dashboard**.
2. For every other screen, paste the matching prompt below — each one repeats the core style tokens (colors, fonts, status-first pattern) so Stitch doesn't drift.
3. If Stitch gives you a "Refine" or follow-up box after generating, use the **Refinement lines** to nudge details instead of rewriting from scratch.
4. Do screens in this order (matches your build priority): Dashboard → Document Upload → Processing Status → Verification (split-view) → Record Detail → Audit Trail → GIS Map → Admin/RBAC → Login.

---

## 1. Master System Prompt (use for Dashboard — your first screen)

```
Design a web app dashboard for "DigiLand," an AI-powered land record digitization platform for a government revenue department. Style: official but modern, calm, data-dense but scannable — think a trustworthy govtech SaaS product, not a flashy consumer app.

Color system:
- Background #F7F5F0, card/surface #FFFFFF
- Primary brand green #1B5E3A
- Secondary accent ochre #C17817
- Text primary #1F2A24, text secondary #5B6B62
- Border #E0DED5
- Status colors: success/valid #2E7D32, warning/flagged #ED8936, error/failed #C0392B, info/link #1B6FA8
Support a dark mode variant using #12181A background, #1B2224 cards, #5FBE8A primary, #E0A94D accent, #EDEFEC text — same hues, just shifted for low-glare use.

Typography: Poppins SemiBold for headings/nav/buttons, Inter for body text and tables/data, monospace (JetBrains Mono style) for IDs, hashes, and codes.

Layout: left sidebar navigation (role-based: Dashboard, Upload, Verification Queue, Records, Audit Trail, GIS Map, Admin), top bar with search and user/role badge.

Main content: a metrics dashboard with:
- 4 metric cards in a row using soft muted tint fills (not solid colors): "Documents Processed," "Extraction Accuracy %," "Pending Verification," "District-wise Progress"
- A district-wise digitization progress section (choropleth-style map placeholder or horizontal progress bars per district)
- A "Pending Queue" widget listing recent records, each row with a colored left-border badge (green = valid, amber = flagged, red = failed) matching confidence tier
- A validation status breakdown chart (donut or bar: VALID / FLAGGED / FAILED)

Overall feel: clean grid, generous whitespace, rounded-corner cards (8-10px radius), subtle shadows, status-first visual language throughout.
```

**Refinement lines** (add after generating if needed):
- "Make the metric cards use tint fills, not solid green/orange blocks — keep it calm and muted."
- "Add a colored left border to each pending-queue row, not a full-color background."

---

## 2. Document Upload screen

```
Same DigiLand design system (green #1B5E3A, ochre #C17817 accent, background #F7F5F0, Poppins headings + Inter body, status-first colored badges). Design the Document Upload screen: a large centered drag-and-drop zone with a dashed border in the ochre accent, an icon, and text "Drag & drop scanned records or click to browse." Below it, buttons for "Camera Capture" and "Batch Upload." Show a list of recently uploaded files below with filename, thumbnail, file size, and a live processing status pill (Uploading / Processing / Queued) in the status colors. Keep the same left sidebar and top bar as the dashboard.
```

---

## 3. Processing Status screen

```
Same DigiLand design system. Design a Processing Status screen showing a single document mid-pipeline: a horizontal stepper at the top with 6 stages — Upload, CV Cleanup, OCR, NLP, Validation, Scoring — each stage shown as a circle connected by a line, completed steps filled green, current step pulsing/highlighted, upcoming steps in muted gray. Below the stepper, show the document thumbnail on the left and a live activity log/console on the right with timestamped status lines in monospace font. Keep sidebar and top bar consistent.
```

---

## 4. Verification screen (flagship split-view)

```
Same DigiLand design system. This is the flagship screen — a split-view Human-in-the-Loop verification interface. Left half: the original scanned land record document displayed full-height, with a highlighted bounding box overlay (ochre outline) around the currently-selected field. Right half: a vertical form of extracted structured fields (Khasra No., Khata No., Owner Name, Plot Area, Village, Tehsil, District, Land Classification) — each field is editable, with a small confidence chip next to it (green "98% High," amber "72% Review," red "45% Low") and a colored left border matching that confidence tier. Bottom of the right pane: "Approve & Sign," "Reject," and "Flag for Tehsildar" buttons, primary button in brand green. Keep sidebar and top bar.
```

---

## 5. Record Detail screen

```
Same DigiLand design system. Design a Record Detail screen for a single land record: header with khasra/khata number in monospace font and a large status badge (VALID/FLAGGED/FAILED in status colors). Below, a two-column layout — left column: all extracted fields in a clean label/value list; right column: a small map preview (Leaflet-style) showing the parcel outline, plus a compact audit history timeline (3-4 entries with actor, timestamp, action). Use card sections with subtle borders, rounded corners, and generous spacing.
```

---

## 6. Audit Trail screen

```
Same DigiLand design system. Design an Audit Trail / compliance screen: a vertical immutable timeline showing chronological entries, each with actor name/role badge, timestamp, action taken (e.g. "Field corrected," "Record approved," "Signed by Tehsildar"), and a short monospace hash value with a small "verified" checkmark icon in green. Include a filter bar at top (by date range, by officer, by record type). Keep it dense but legible — this is a compliance/trust screen so lean slightly more formal, more monospace, more blue (#1B6FA8) for links/hash values.
```

---

## 7. GIS Map View

```
Same DigiLand design system. Design a full-width GIS map screen using a Leaflet-style map as the main content, showing cadastral parcels color-coded: green outline/fill for validated parcels, red for mismatched parcels, amber for pending. A collapsible left panel lists parcels with search/filter by district/village. Clicking a parcel (shown in a small popup card) reveals khasra number, owner, and validation status. Keep sidebar/top bar consistent with the rest of the app.
```

---

## 8. Admin / RBAC screen

```
Same DigiLand design system. Design an Admin panel for role-based access control: a table of users with columns Name, Role (Clerk/Patwari/Tehsildar/Admin, shown as colored role badges), District, Status (Active/Inactive), and Actions. Above the table, an "Add User" button in brand green. Include a permission matrix section below — a grid of roles (columns) vs permissions (rows: Upload, Verify, Approve, Override, Manage Users, View Audit Trail) with checkmarks/toggles in each cell.
```

---

## 9. Login screen

```
Same DigiLand design system, but simpler: a centered card on a soft green-tinted background, DigiLand logo/wordmark at top in Poppins SemiBold, fields for Email/ID and Password, a role indicator or role-select dropdown (Clerk / Patwari / Tehsildar / Admin / Citizen), a primary "Sign In" button in brand green, and small text noting "Secured with government-grade encryption" near the footer for trust signaling.
```

---

## Tips specific to Stitch

- Stitch works best with **one screen per prompt** — don't ask for the whole app flow in a single generation.
- Front-load the **color hex codes and fonts** in every prompt (as done above) — Stitch treats these as hard constraints more reliably than adjectives like "professional."
- After generating, use Stitch's **"Edit with text"** feature for small tweaks (e.g., "make the sidebar collapsible") rather than regenerating the whole screen.
- If you want pixel-accurate consistency across screens, generate the Dashboard first, then when prompting later screens you can also **upload a screenshot of the Dashboard** as a style reference alongside the text prompt — Stitch supports image + text input.
