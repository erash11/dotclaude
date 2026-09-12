---
name: diagram-generator
description: Generate professional color-coded Excalidraw diagrams (.excalidraw JSON files, editable at excalidraw.com) from plain-English descriptions. Use when the user asks for a flowchart, architecture diagram, process or flow diagram, mind map, timeline, or before/after comparison diagram, or says "diagram this", "draw the architecture", "map out this process". NOT for styled interactive HTML explainer pages — use visual-explainer for those.
argument-hint: "[what to diagram]"
---

# Diagram Generator

You turn text descriptions into professional, color-coded Excalidraw diagrams. The user describes a system, process, or structure in plain English, and you produce a clean `.excalidraw` JSON file they can open at excalidraw.com, edit, export, and share.

## Process

### Step 1: Understand the Concept
- What are the key components or steps?
- What flows into what?
- What are the relationships?

### Step 2: Choose a Layout

| Diagram Type | Best For |
|-------------|----------|
| **Flow diagram** | Processes, workflows, "how X works" |
| **Architecture diagram** | Systems, tools, integrations |
| **Comparison diagram** | Before/after, options, alternatives |
| **Mind map** | Features, capabilities, use cases |
| **Timeline** | Steps, sequences, journeys |

### Step 3: Generate Excalidraw JSON

Create a valid Excalidraw JSON file. The output must follow this exact design system.

## Design System (Mandatory)

### Font & Canvas
- **Canvas background:** `#ffffff` (white, always)
- **Font family:** `3` (Cascadia/monospace) for ALL text elements
- **Primary text color:** `#1c1c1e`
- **Secondary/description text:** `#6e6e73`
- **Divider color:** `#c7c7cc`

### Zone-Based Color System

Each section of the diagram gets its own color zone. Use these consistently:

| Zone | Stroke | Background | Use For |
|------|--------|------------|---------|
| **Title** | `#e03131` | `#e03131` (solid fill, white text) | Title bar at the very top |
| **Blue Zone** | `#1971c2` | `#a5d8ff` | Input, user actions, starting points |
| **Yellow Zone** | `#f08c00` | `#ffec99` | Processing, engines, core logic |
| **Green Zone** | `#2f9e44` | `#b2f2bb` | Data, storage, libraries, collections |
| **Purple Zone** | `#7950f2` | `#d0bfff` | Integrations, external services, APIs |
| **Red Zone** | `#e03131` | `#ffc9c9` | Output, results, final deliverables |
| **Gray** | `#868e96` | `#e9ecef` | Neutral info, labels, connectors |

### Element Structure

Every element in the JSON follows this pattern:

**Rounded rectangle (card/box):**
```json
{
  "type": "rectangle",
  "x": 100, "y": 140,
  "width": 380, "height": 70,
  "backgroundColor": "#a5d8ff",
  "strokeColor": "#1971c2",
  "fillStyle": "solid",
  "roundness": { "type": 3, "value": 16 },
  "id": "unique-id"
}
```

**Text label:**
```json
{
  "type": "text",
  "x": 120, "y": 148,
  "width": 340, "height": 50,
  "text": "Large emoji + short title\nOne-line description",
  "fontSize": 16,
  "fontFamily": 3,
  "color": "#1c1c1e",
  "id": "unique-id"
}
```

**Section header (colored label text):**
```json
{
  "type": "text",
  "x": 100, "y": 110,
  "width": 300, "height": 24,
  "text": "SECTION TITLE",
  "fontSize": 18,
  "fontFamily": 3,
  "color": "#1971c2",
  "id": "unique-id"
}
```

**Thin divider line between sections:**
```json
{
  "type": "rectangle",
  "x": 80, "y": 100,
  "width": 900, "height": 4,
  "backgroundColor": "#a5d8ff",
  "strokeColor": "#a5d8ff",
  "fillStyle": "solid",
  "id": "unique-id"
}
```

**Arrow between sections (emoji text):**
```json
{
  "type": "text",
  "x": 460, "y": 235,
  "width": 140, "height": 36,
  "text": "down arrow emoji",
  "fontSize": 32,
  "fontFamily": 3,
  "textAlign": "center",
  "color": "#868e96",
  "id": "unique-id"
}
```

### Layout Rules

1. **Title bar** at the very top: full-width red rectangle with white text, large emoji + title
2. **Sections flow top-to-bottom**, each separated by a thin colored divider line
3. **Section labels** use circled step numbers: 1 2 3 4 5 6 7 — colored to match their zone
4. **Cards within a section** sit side-by-side horizontally (2-4 cards per row)
5. **Each card** has a large emoji (fontSize 32-36) as a visual anchor + short punchy text
6. **Arrows** between sections use emoji text elements (down arrow), centered, gray color
7. **Minimum 40px gap** between all elements — white space is critical
8. **Canvas width:** ~900-1000px total. Don't go wider.
9. **Consistent card sizing** within the same section

### Text Rules

- Titles: 1-3 words max
- Descriptions: one line, plain English
- NO dense paragraph text anywhere
- If it takes more than one line to read, simplify it
- Section labels are ALL CAPS with the circled step number

### Comparison Diagrams

For before/after or comparison layouts:
- Two columns, equal width
- "VS" circle between the two columns
- Each column ends with a result summary box (colored background, short punchy line)
- Left column = "before" or option A
- Right column = "after" or option B

## JSON Wrapper

Every diagram must be wrapped in this structure:

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "cowork-skill",
  "elements": [ ... all elements here ... ],
  "appState": {
    "viewBackgroundColor": "#ffffff",
    "gridSize": null
  }
}
```

## Output

Save the `.excalidraw` file and tell the user:

```
## Diagram Created

**Topic:** [Topic name]
**Type:** [Flow/Architecture/Comparison/Mind map/Timeline]

**How to use:**
1. Go to excalidraw.com
2. Click the menu icon > "Open" and select the file
   OR drag the file directly onto excalidraw.com

**What's in the diagram:**
- [Brief description of key elements and relationships]
```

## Rules

- White background always. Diagrams need to be clean and printable.
- Maximum 15 elements per diagram. If there are more, group into categories.
- Every element needs a label. No unlabeled boxes.
- Arrows must clearly show direction of flow or relationship.
- Color-coding communicates meaning, not decoration. Use the zone system consistently.
- The diagram should be readable at a glance. If someone needs more than 10 seconds to understand the structure, simplify it.
- Use consistent sizing. All boxes in the same category should be the same dimensions.
- fontFamily: 3 (monospace) for ALL text. Never use fontFamily 1 or 2.

## Verification Gate

Before delivery:

1. Parse the `.excalidraw` file as JSON. Require the expected top-level document fields and unique element IDs.
2. Check every reference that is present (`containerId`, `boundElements`, arrow bindings, group IDs) resolves to an existing element.
3. Build a coverage list from the request and confirm every required component, label, and relationship appears in the artifact.
4. Render or open the diagram and inspect it. Reject clipped text, unintended overlaps, ambiguous arrow direction, unreadable contrast, inconsistent category sizing, or content outside the visible canvas.

Report `PASS` only when all four checks succeed. Report `FAIL` with the exact defect otherwise. If no render surface is available, report `DEGRADED`; JSON validity alone is not proof of visual quality.
