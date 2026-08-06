# Legacy Codebase & QC Wording Data Analysis

## Executive Summary
This analysis documents the legacy `standardwording.html` single-page web application. It extracts all 139 QC defect wording entries, 13 standard category definitions, 10 code sub-category groups (FCPB, FCPW, FCPC, RCPB, RCPW, RCPC, FCDS, RCDS, PC, ALL), data enrichment logic, fuzzy search matching algorithms, storage schemas, and UI layout modes.

---

## 1. QC Defect Entries (Complete 139 Entries)

The legacy dataset contains 139 entries numbered from #2 to #140. Each entry consists of:
- `id`: Primary key (`"b"` + entry number for base entries, e.g. `"b2"`)
- `n`: Numeric code / index (#2 to #140)
- `t`: Defect wording text
- `c`: Category key

| # | ID | Wording Text | Category | Code Group (if applicable) |
|---|---|---|---|---|
| 2 | b2 | Symbol B | body | - |
| 3 | b3 | Fake Back Cover | backcover | - |
| 4 | b4 | Bubble In Back Cover | backcover | - |
| 5 | b5 | Back Cover Fell off | backcover | - |
| 6 | b6 | Back Cover Missing | backcover | - |
| 7 | b7 | Fake Battery | battery | - |
| 8 | b8 | Battery Has Been Changed By Apple | battery | - |
| 9 | b9 | Home Button Not Functional | buttons | - |
| 10 | b10 | Home Button Missing | buttons | - |
| 11 | b11 | Home Button Wrong Color | buttons | - |
| 12 | b12 | Home Button Crack | buttons | - |
| 13 | b13 | Bixby Button Not Functional | buttons | - |
| 14 | b14 | Bixby Button Missing | buttons | - |
| 15 | b15 | Bixby Button Wrong Color | buttons | - |
| 16 | b16 | Bixby Button Crack | buttons | - |
| 17 | b17 | Mute Button Wrong Color | buttons | - |
| 18 | b18 | Mute Button Crack | buttons | - |
| 19 | b19 | On Off Button Wrong Color | buttons | - |
| 20 | b20 | On Off Button Crack | buttons | - |
| 21 | b21 | Volume Button Wrong Color | buttons | - |
| 22 | b22 | Volume Button Crack | buttons | - |
| 23 | b23 | Camera Control Button Not Functional | buttons | - |
| 24 | b24 | Camera Control Button Missing | buttons | - |
| 25 | b25 | Camera Control Button Wrong Color | buttons | - |
| 26 | b26 | Camera Control Button Crack | buttons | - |
| 27 | b27 | Front Camera Blur | camera | - |
| 28 | b28 | Front Camera Shadow | camera | - |
| 29 | b29 | Rear Camera Blur | camera | - |
| 30 | b30 | Rear Camera Shadow | camera | - |
| 31 | b31 | FCPB1 | codes | FCPB |
| 32 | b32 | FCPB21 | codes | FCPB |
| 33 | b33 | FCPB22 | codes | FCPB |
| 34 | b34 | FCPB3 | codes | FCPB |
| 35 | b35 | FCPB4 | codes | FCPB |
| 36 | b36 | FCPW1 | codes | FCPW |
| 37 | b37 | FCPW21 | codes | FCPW |
| 38 | b38 | FCPW22 | codes | FCPW |
| 39 | b39 | FCPW3 | codes | FCPW |
| 40 | b40 | FCPW4 | codes | FCPW |
| 41 | b41 | RCPB1 | codes | RCPB |
| 42 | b42 | RCPB21 | codes | RCPB |
| 43 | b43 | RCPB22 | codes | RCPB |
| 44 | b44 | RCPB3 | codes | RCPB |
| 45 | b45 | RCPB4 | codes | RCPB |
| 46 | b46 | RCPW1 | codes | RCPW |
| 47 | b47 | RCPW21 | codes | RCPW |
| 48 | b48 | RCPW22 | codes | RCPW |
| 49 | b49 | RCPW3 | codes | RCPW |
| 50 | b50 | RCPW4 | codes | RCPW |
| 51 | b51 | Camera Edge Missing | camera | - |
| 52 | b52 | Fake Front Camera | camera | - |
| 53 | b53 | Fake Rear Camera | camera | - |
| 54 | b54 | Fake Rear Camera Glass | camera | - |
| 55 | b55 | Camera Has Been Changed By Apple | camera | - |
| 56 | b56 | Screw Missing | body | - |
| 57 | b57 | In Parts Only Body | body | - |
| 58 | b58 | In Parts Only Screen | body | - |
| 59 | b59 | Jailbreak | locks | - |
| 60 | b60 | Cannot Remove Magnetic Holder | body | - |
| 61 | b61 | Passcode Lock | locks | - |
| 62 | b62 | icloud Lock | locks | - |
| 63 | b63 | Corporate Lock | locks | - |
| 64 | b64 | Google Account Lock | locks | - |
| 65 | b65 | Samsung Account Lock | locks | - |
| 66 | b66 | Huawei Account Lock | locks | - |
| 67 | b67 | Xiaomi Account Lock | locks | - |
| 68 | b68 | Payment Service Lock | locks | - |
| 69 | b69 | Random Restart | system | - |
| 70 | b70 | Turn Off When Fold | system | - |
| 71 | b71 | Mainboard Missing | body | - |
| 72 | b72 | Mic | audio | - |
| 73 | b73 | Mic Shock | audio | - |
| 74 | b74 | Rubber Screen Crack | body | - |
| 75 | b75 | Rubber Screen Missing | body | - |
| 76 | b76 | Rubber Feet Crack | body | - |
| 77 | b77 | Rubber Feet Missing | body | - |
| 78 | b78 | Pen Crack | pen | - |
| 79 | b79 | Pen Wrong Color | pen | - |
| 80 | b80 | Pen Cannot Take Photo | pen | - |
| 81 | b81 | Pen Cannot Pullout | pen | - |
| 82 | b82 | Pen Cannot Plugin | pen | - |
| 83 | b83 | Screen Crease | screen | - |
| 84 | b84 | Film Crease | screen | - |
| 85 | b85 | Color Leak | screen | - |
| 86 | b86 | Screen No Response | screen | - |
| 87 | b87 | Bubble In Screen | screen | - |
| 88 | b88 | Screen Ajar | screen | - |
| 89 | b89 | Screen No Response When Fold | screen | - |
| 90 | b90 | B7 Red Burn | screen | - |
| 91 | b91 | Screen Bruise | screen | - |
| 92 | b92 | Dust in Screen | screen | - |
| 93 | b93 | Screen Has Been Changed By Apple | screen | - |
| 94 | b94 | Bubble Under Film | screen | - |
| 95 | b95 | Sensor | body | - |
| 96 | b96 | Sim Tray Missing | body | - |
| 97 | b97 | Sim Tray Crack | body | - |
| 98 | b98 | Fake Sim Tray | body | - |
| 99 | b99 | Speaker Audio Shock | audio | - |
| 100 | b100 | Speaker Receiver Audio Shock | audio | - |
| 101 | b101 | Receiver Speaker Mesh Crack | audio | - |
| 102 | b102 | Vibration | body | - |
| 103 | b103 | No Strap | body | - |
| 104 | b104 | Fake Strap | body | - |
| 105 | b105 | Water Damage In Screen | water | - |
| 106 | b106 | Water Damage In Back Cover | water | - |
| 107 | b107 | Water Damage In Rear Camera | water | - |
| 108 | b108 | Unable to Activate | system | - |
| 109 | b109 | Used Screen | screen | - |
| 110 | b110 | Used Battery | battery | - |
| 111 | b111 | Used Camera | camera | - |
| 112 | b112 | Screen Locked by Owner | locks | - |
| 113 | b113 | Battery Locked by Owner | locks | - |
| 114 | b114 | Camera Locked by Owner | locks | - |
| 115 | b115 | Demo Lock | locks | - |
| 116 | b116 | Payment Service Not Lock | locks | - |
| 117 | b117 | System Lag | system | - |
| 118 | b118 | FCDS1 | codes | FCDS |
| 119 | b119 | FCDS2 | codes | FCDS |
| 120 | b120 | RCDS1 | codes | RCDS |
| 121 | b121 | RCDS2 | codes | RCDS |
| 122 | b122 | Back Cover Has Been Changed By Apple | backcover | - |
| 123 | b123 | Mainboard Has Been Changed By Apple | body | - |
| 124 | b124 | RCPC 1 | codes | RCPC |
| 125 | b125 | RCPC 21 | codes | RCPC |
| 126 | b126 | RCPC 22 | codes | RCPC |
| 127 | b127 | RCPC 3 | codes | RCPC |
| 128 | b128 | RCPC 4 | codes | RCPC |
| 129 | b129 | FCPC 1 | codes | FCPC |
| 130 | b130 | FCPC 21 | codes | FCPC |
| 131 | b131 | FCPC 22 | codes | FCPC |
| 132 | b132 | FCPC 3 | codes | FCPC |
| 133 | b133 | FCPC 4 | codes | FCPC |
| 134 | b134 | PC1 | codes | PC |
| 135 | b135 | PC21 | codes | PC |
| 136 | b136 | PC22 | codes | PC |
| 137 | b137 | PC3 | codes | PC |
| 138 | b138 | PC4 | codes | PC |
| 139 | b139 | Fake screen | screen | - |
| 140 | b140 | HINGE | body | - |

---

## 2. Categories Architecture (13 Standard Categories + Virtual Views)

The application organizes wording items into 13 primary categories, plus 2 virtual views (`all` and `pinned` / `recent` meta-views).

| ID | Display Name | Color Code | Description | Item Count |
|---|---|---|---|---|
| `all` | All | `#8a8577` | Every standard wording, numbered and searchable. | 139 |
| `codes` | Codes | `#7048e8` | Panel & part codes — FC / RC / PC groups. | 41 |
| `screen` | Screen | `#1971c2` | Display, film, crease, bubble & response issues. | 14 |
| `camera` | Camera | `#15aabf` | Front & rear camera condition. | 9 |
| `buttons` | Buttons | `#f59f00` | Home, Bixby, mute, volume & camera-control keys. | 18 |
| `battery` | Battery | `#2f9e44` | Battery authenticity & replacements. | 4 |
| `backcover` | Back Cover | `#b08020` | Back cover condition & Apple replacements. | 5 |
| `locks` | Locks | `#e03131` | Account locks & security states. | 15 |
| `pen` | Pen | `#c2255c` | S Pen condition & function. | 5 |
| `water` | Water Damage | `#0b7285` | Liquid damage indicators. | 3 |
| `audio` | Audio & Mic | `#0ca678` | Mic, speaker & receiver. | 5 |
| `body` | Body & Parts | `#64748b` | Housing, straps, sim tray, mainboard & parts. | 16 |
| `system` | System | `#e8590c` | Power, software & behaviour. | 4 |
| `pinned` | Pinned (Virtual) | `#e8930c` | Wordings starred by user for quick access. | Dynamic |
| `recent` | Recent (Virtual) | `#8a8577` | Most recently copied wordings. | Dynamic (max 20) |

---

## 3. Sub-Category Code Groups (Panel Chips & Codes)

When the `codes` category is active, a sub-category chip navigation bar allows filtering by panel code prefixes:

| Sub Code | Prefix Match | Entries Included | Count |
|---|---|---|---|
| `ALL` | (No filter) | All items in `codes` category | 41 |
| `FCPB` | `fcpb` | FCPB1, FCPB21, FCPB22, FCPB3, FCPB4 (#31–#35) | 5 |
| `FCPW` | `fcpw` | FCPW1, FCPW21, FCPW22, FCPW3, FCPW4 (#36–#40) | 5 |
| `FCPC` | `fcpc` | FCPC 1, FCPC 21, FCPC 22, FCPC 3, FCPC 4 (#129–#133) | 5 |
| `RCPB` | `rcpb` | RCPB1, RCPB21, RCPB22, RCPB3, RCPB4 (#41–#45) | 5 |
| `RCPW` | `rcpw` | RCPW1, RCPW21, RCPW22, RCPW3, RCPW4 (#46–#50) | 5 |
| `RCPC` | `rcpc` | RCPC 1, RCPC 21, RCPC 22, RCPC 3, RCPC 4 (#124–#128) | 5 |
| `FCDS` | `fcds` | FCDS1, FCDS2 (#118–#119) | 2 |
| `RCDS` | `rcds` | RCDS1, RCDS2 (#120–#121) | 2 |
| `PC` | `pc` | PC1, PC21, PC22, PC3, PC4 (#134–#138) | 5 |

Sub-category matching algorithm:
```javascript
norm(entry.t).startsWith(sub.toLowerCase())
```

---

## 4. Search Engine Architecture & Fuzzy Search Algorithm

The search engine provides instant typo-safe lookup with rank scoring and visual indicators (`≈`).

### Category Keyword Enriched Search (`CATKEY`)
Search queries evaluate against an enriched haystack containing category synonyms:
- `screen`: `"display lcd panel"`
- `camera`: `"cam photo"`
- `pen`: `"stylus spen"`
- `water`: `"liquid moisture"`
- `audio`: `"sound speaker mic microphone"`
- `locks`: `"lock account icloud passcode"`
- `body`: `"parts housing frame mainboard"`
- `battery`: `"batt"`
- `buttons`: `"key switch"`
- `backcover`: `"housing cover"`
- `system`: `"software reboot restart lag"`
- `codes`: `"code"`

### Alias Dictionary (`ALIAS`)
Words in user queries map to internal domain terms:
- `display`, `monitor`, `lcd`, `glass` $\to$ `screen`
- `stylus`, `spen` $\to$ `pen`
- `batt` $\to$ `battery`
- `cam` $\to$ `camera`
- `mic`, `speaker`, `sound` $\to$ `audio`
- `liquid`, `moisture` $\to$ `water`
- `btn`, `key` $\to$ `button`
- `band` $\to$ `strap`
- `haptic` $\to$ `vibration`
- `cover`, `housing` $\to$ `backcover`
- `icloud`, `account`, `passcode` $\to$ `lock`
- `fold`, `crease` $\to$ `fold`

### Matching & Scoring Logic
1. **Exact Prefix Match**: 100 points
2. **Substring Match**: $92 - \min(i, 24) \times 0.3$ points
3. **Normalized Substring Match**: 82 points
4. **Levenshtein Word Match**: $72 - d \times 18$ points (where max distance $d \in [1, 3]$)
5. **Sub-sequence Match**: 38 points (for queries $\ge 4$ characters)
6. **Multi-token Bonus**: $+8$ points if all tokens match
7. **Approximate Match Indicator (`≈`)**: Rendered when match score $< 80$

---

## 5. Storage Schema & LocalStorage Keys

State persistence uses browser `localStorage` under 12 keys:

| Storage Key | Type | Default Value | Description |
|---|---|---|---|
| `qc-appearance` | JSON Object | `{ layout: 'list', accent: 'ember', radius: 'soft', textsize: 'm', motion: 'full' }` | Appearance options |
| `qc-sort` | String | `'num'` | Sort mode (`'num'`, `'num-desc'`, `'az'`, `'za'`) |
| `qc-theme` | String | `'dark'` or `'light'` (system default) | Theme toggle |
| `qc-density` | String | `'cozy'` | Layout density (`'cozy'` or `'compact'`) |
| `qc-pins` | Array<String> | `[]` | Pinned item IDs (e.g. `["b2", "b83"]`) |
| `qc-recents` | Array<String> | `[]` | Recently copied wording strings (max 20) |
| `qc-history` | Array<String> | `[]` | Recent search queries (max 8) |
| `qc-batch` | Array<String> | `[]` | Batch clipboard queue strings |
| `qc-join` | String | `'nl'` | Batch delimiter (`'nl'`, `'comma'`, `'semi'`, `'space'`) |
| `qc-autoclear` | Boolean | `false` | Auto-clear batch on copy all |
| `qc-edits` | Object | `{}` | Modified base entry overrides `{ [id]: { t, c, n } }` |
| `qc-dels` | Array<String> | `[]` | Deleted base entry IDs |
| `qc-custom` | Array<Object> | `[]` | User-added custom entries `[{ id: 'c...', t, c, n }]` |

---

## 6. Batch Clipboard & Power Inspection Features

1. **Batch Queue**: Items can be added to the queue via the `+` action button or bulk pasted from clipboard.
2. **Delimiter Options**:
   - `nl`: Newline `\n`
   - `comma`: Comma + space `, `
   - `semi`: Semicolon + space `; `
   - `space`: Single space ` `
3. **Auto-Clear**: Optional toggle to empty the queue upon clicking "Copy all".
4. **Individual Copy & Removal**: Quick copy single batch item or remove specific row.
5. **Bulk Import/Paste**: Multi-line clipboard paste splits on newlines and filters duplicates.
6. **Edit Mode & JSON I/O**: Full CRUD support for custom wordings and base entry edits. Export/Import JSON payloads format:
```json
{
  "edits": { "b83": { "t": "Screen Crease Modified", "c": "screen", "n": 83 } },
  "dels": ["b2"],
  "customs": [{ "id": "c1723000000000", "t": "Custom Defect", "c": "screen", "n": 141 }]
}
```
7. **Reset All Changes**: Double-click arm mechanism to revert all edits/custom items to factory defaults.
