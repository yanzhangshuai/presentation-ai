export const outlinePromptTemplate = `
You are generating a presentation outline that will be used as a structural blueprint
for AI‑generated presentation slides.

The primary goal of this outline is clarity, structure, and expandability,
not literary style.

====================
TASK
====================

Based on the following presentation topic, generate a structured outline.

- The outline MUST contain exactly {numberOfCards} main topics.
- The outline language MUST be {language}.
- The outline will be directly used as input for a slide‑generation step.

Current Date: {currentDate}
Presentation Topic: {prompt}

====================
OUTPUT FORMAT (STRICT)
====================

1. First line:
   Output the presentation title using EXACTLY this XML format:
   <title>Presentation Title</title>

   - Use only this single XML tag.
   - Do NOT break the tag into multiple lines.
   - Do NOT include any other XML or text.

2. After the title, output the outline in Markdown format.

3. For each main topic:
   - Use a Markdown heading starting with "# "
   - Each heading represents one presentation section
   - Topics must be ordered logically

4. Under each topic heading, include EXACTLY 2 or 3 bullet points.

5. Bullet point rules:
   - Always start with "- "
   - One sentence per bullet point
   - Keep wording concise and factual
   - Do NOT use paragraphs
   - Do NOT use bold, italic, underline, links, or numbering

====================
CONTENT GUIDELINES
====================

1. Topics together should cover the core aspects of the topic.
2. Topics should progress naturally from introduction to implications or future outlook.
3. Avoid overly generic or overly narrow topics.
4. Do NOT create a standalone conclusion-only topic.
   The final topic may discuss implications or future direction,
   but should not simply summarize previous topics.
5. Bullet points describe ideas or angles, not full slide content.

====================
INTERNAL QUALITY CHECK
====================

Before outputting the final result, internally verify that:
- The number of topic headings equals {numberOfCards}
- Each topic has exactly 2 or 3 bullet points
- No extra sections are included
- Each topic can reasonably support a full presentation slide later

If any issue is found, revise internally and only output the final corrected version.

====================
FINAL INSTRUCTION
====================

Output ONLY the title line followed by the Markdown outline.
Do NOT include explanations or any additional text.
`

export const outlineWebTemplate = `You are an expert presentation outline generator. Your task is to create a comprehensive and engaging presentation outline based on the user's topic.

Current Date: {currentDate}

## Your Process:
1. **Analyze the topic** - Understand what the user wants to present
2. **Research if needed** - Use web search to find current, relevant information that can enhance the outline
3. **Generate outline** - Create a structured outline with the requested number of topics

## Web Search Guidelines:
- Use web search to find current statistics, recent developments, or expert insights
- Search for information that will make the presentation more credible and engaging
- Limit searches to 2-5 queries maximum (you decide how many are needed)
- Focus on finding information that directly relates to the presentation topic

## Outline Requirements:
- First generate an appropriate title for the presentation
- Generate exactly {numberOfCards} main topics
- Each topic should be a clear, engaging heading
- Include 2-3 bullet points per topic
- Use {language} language
- Make topics flow logically from one to another
- Ensure topics are comprehensive and cover key aspects

## Output Format:
Start with the title in XML tags, then generate the outline in markdown format with each topic as a heading followed by bullet points.

Example:
<TITLE>Your Generated Presentation Title Here</TITLE>

# First Main Topic
- Key point about this topic
- Another important aspect
- Brief conclusion or impact

# Second Main Topic
- Main insight for this section
- Supporting detail or example
- Practical application or takeaway

Remember: Use web search strategically to enhance the outline with current, relevant information.`

export const slidesTemplate = `
You are generating presentation slides based strictly on a provided outline.

Your role is to act as a protocol-compliant slide generator.
You MUST follow all structural, ordering, and formatting rules exactly.

Your output will be consumed as a streaming JSON Lines (JSONL) event stream
and parsed line by line to construct a ProseMirror-based presentation editor.

Any deviation from this protocol will cause the output to be rejected.

====================
INPUT CONTEXT
====================

Presentation Title:
{TITLE}

User Original Prompt:
{PROMPT}

Current Date:
{CURRENT_DATE}

Language:
{LANGUAGE}

Tone:
{TONE}

Target Number of Slides:
{TOTAL_SLIDES}

====================
PRESENTATION OUTLINE (SOURCE OF TRUTH)
====================

{OUTLINE_FORMATTED}

====================
RESEARCH / GROUNDING CONTEXT
====================

{SEARCH_RESULTS}

====================
PRESENTATION LIFECYCLE (MANDATORY)
====================

1. BEFORE emitting any slide-related events, emit exactly ONE JSON line:

{ "event": "presentation.start", "data": { "totalSlides": {TOTAL_SLIDES} } }

2. AFTER the final slide is fully completed, emit exactly ONE JSON line:

{ "event": "presentation.end", "data": {} }

No slide or node events are allowed outside this lifecycle.

====================
CORE SLIDE RULES
====================

1. Generate EXACTLY {TOTAL_SLIDES} slides.
2. Generate EXACTLY ONE slide per outline topic.
3. Follow the outline order EXACTLY.
4. DO NOT reorder, merge, split, or add slides.
5. Each slide MUST correspond to one outline topic.

====================
STREAMING ORDER (STRICT)
====================

For each slide, emit events in this exact order:

1. slide.start
2. node.append (one or more)
3. slide.end

After slide.end, DO NOT emit any additional events for that slide.

====================
SLIDE START EVENT
====================

slide.start event format:

{
  "event": "slide.start",
  "data": {
    "slideId": "slide-<number>",
    "layout": "left | right | top | bottom | none",
    "rootImageQuery": "English natural-language visual query for the primary slide image"
  }
}

slideId numbering starts at 1 and increases sequentially.

====================
LAYOUT & ROOT IMAGE QUERY RULES (MANDATORY)
====================

- layout defines WHERE the primary image appears.
- rootImageQuery defines WHAT the primary image visually depicts.

Rules:

1. If layout is "left" or "right":
   - rootImageQuery is REQUIRED.
2. If layout is "top" or "bottom":
   - rootImageQuery MAY be included.
3. If layout is "none":
   - rootImageQuery MUST NOT be included.
4. rootImageQuery MUST:
   - Be written in English
   - Be purely visual (no titles, no abstract concepts)
   - Be suitable for image generation or image search
   - NOT be a URL or filename

====================
TITLE RULES
====================

1. Each slide MUST include exactly ONE level-1 heading node.
2. The heading MUST be semantically equivalent to the outline topic.
3. Only minimal wording adjustments are allowed.
4. DO NOT introduce new concepts in slide titles.

====================
NODE EVENTS
====================

node.append event format:

{
  "event": "node.append",
  "data": {
    "slideId": "slide-<number>",
    "node": { ... }
  }
}

====================
ALLOWED NODE TYPES (STRICT)
====================

ONLY the following node types may be emitted.

–––––
1. heading
–––––

{
  "type": "heading",
  "attrs": {
    "id": "<slideId>-heading-<index>",
    "level": 1
  },
  "content": [
    { "type": "text", "text": "..." }
  ]
}

–––––
2. paragraph
–––––

{
  "type": "paragraph",
  "attrs": {
    "id": "<slideId>-paragraph-<index>"
  },
  "content": [
    { "type": "text", "text": "..." }
  ]
}

–––––
3. columns (STRUCTURED CONTAINER)
–––––

The columns node is a MULTI-COLUMN LAYOUT CONTAINER.
It MUST NOT contain strings and MUST NOT use nested arrays.

{
  "type": "columns",
  "attrs": {
    "id": "<slideId>-columns-<index>",
    "count": 2
  },
  "content": [
    <VALID BLOCK NODES ONLY>
  ]
}

====================
CRITICAL COLUMNS CONTENT RULES (MANDATORY)
====================

ABSOLUTE REQUIREMENTS:

1. **columns.content** MUST be a FLAT ARRAY of node objects.
2. **columns.content** MUST NOT contain nested arrays under any circumstances.
3. Each item inside **columns.content** MUST be a valid ProseMirror block node
   (e.g., paragraph, bullet_list, ordered_list).
4. Do NOT represent columns using array-of-arrays or grouped lists.
5. Column separation is semantic ONLY and must be derived from:
   - the order of nodes in **columns.content**
   - the numeric value of **columns.attrs.count**

INVALID EXAMPLE (STRICTLY FORBIDDEN):

{
  "type": "columns",
  "content": [
    [ { ... }, { ... } ],
    [ { ... }, { ... } ]
  ]
}

VALID EXAMPLE:

{
  "type": "columns",
  "content": [
    { /* column 1 content */ },
    { /* column 1 content */ },
    { /* column 2 content */ },
    { /* column 2 content */ }
  ]
}

Any violation of these rules will cause the output to be rejected.

–––––
4. image (SECONDARY VISUALS ONLY)
–––––

{
  "type": "image",
  "attrs": {
    "id": "<slideId>-image-<index>",
    "query": "English visual query",
    "status": "placeholder"
  }
}

Primary visuals MUST use rootImageQuery.
Image nodes represent SECONDARY visuals only.

–––––
5. bullet_list
–––––

{
  "type": "bullet_list",
  "content": [
    {
      "type": "list_item",
      "content": [
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "List item text" }
          ]
        }
      ]
    }
  ]
}

–––––
6. ordered_list
–––––

{
  "type": "ordered_list",
  "attrs": { "order": 1 },
  "content": [
    {
      "type": "list_item",
      "content": [
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "Step description" }
          ]
        }
      ]
    }
  ]
}

====================
LIST RULES (MANDATORY)
====================

- Lists MUST contain 2–5 list_item nodes.
- Lists MUST NOT be nested.
- list_item content MUST be paragraph only.
- Do NOT use bullet characters (•, -, *) inside text.
- Do NOT replace all paragraphs with lists.

====================
IMAGE RULES
====================

1. Most slides SHOULD include either rootImageQuery or secondary image nodes.
2. rootImageQuery defines PRIMARY visuals.
3. image nodes define SECONDARY visuals.
4. Prefer vivid, concrete, scene-based visual descriptions.

====================
SLIDE END EVENT
====================

{
  "event": "slide.end",
  "data": {
    "slideId": "slide-<number>",
    "nodeCount": -1
  }
}

====================
OUTPUT FORMAT (STRICT)
====================

- Output MUST be JSON Lines (JSONL).
- Each line MUST be a valid JSON object.
- DO NOT output Markdown.
- DO NOT output explanations, comments, or extra text.

====================
FINAL INSTRUCTION
====================

Generate the full presentation now.
Strictly follow all rules above.
Output JSONL only.
`

export const slideNodesPromptTemplate = `

{{CONTEXT}}

--------------------------------
ROLE

You are an expert presentation designer and content strategist.
You generate structured TipTap / ProseMirror JSON for EXACTLY ONE presentation slide.

--------------------------------
TASK

Generate the content of EXACTLY ONE slide.
Output ONLY TipTap-compatible JSON.

Do NOT generate:
- XML
- HTML
- Markdown
- IDs
- attrs.id
- node identifiers
- unique keys or identifiers of any kind
- lifecycle markers
- events
- explanations

--------------------------------
SLIDE POSITION

Slide number: {{SLIDE_INDEX}} of {{TOTAL_SLIDES}}

Narrative step:
{{NARRATIVE_STEP}}

--------------------------------
LAYOUT CONTROL (STRICT)

This slide MUST use the following layout:

{{SLIDE_LAYOUT}}

Rules:
- Use EXACTLY this value for the "layout" field
- Do NOT change it
- Do NOT fallback to left or right
- Valid values are: left, right, top, bottom, none

--------------------------------
SLIDE TOPIC

{{SLIDE_TOPIC}}

--------------------------------
SOURCE BULLET POINTS (REFERENCE ONLY)

{{SLIDE_BULLETS}}

Do NOT copy these verbatim.
Each point must be EXPANDED with:
- context
- examples
- light industry data or trends
- connective explanations

--------------------------------
OUTPUT FORMAT (STRICT)

Output ONLY valid JSON.
Do NOT wrap in code blocks.
Do NOT include extra text.

The JSON structure MUST be:

{
  "layout": "{{SLIDE_LAYOUT}}",
  "rootImageQuery": "optional detailed English image description (10+ words)",
  "nodes": [ ...TipTap block nodes... ]
}

--------------------------------
ALLOWED NODE TYPES (STRICT)

- heading
- paragraph
- bullet_list
- ordered_list
- list_item
- columns
- column
- image

--------------------------------
NODE STRUCTURES (AUTHORITATIVE)

====================
H1 TITLE RULE (MANDATORY)
====================

EVERY slide MUST include EXACTLY ONE heading node
with level = 1.

- This heading is the slide title (H1)
- It MUST appear as the FIRST node in "nodes"
- It MUST be semantically equivalent to {{SLIDE_TOPIC}}
- Only minimal wording adjustments are allowed
- NO other heading nodes are allowed anywhere in the slide

--------------------------------
heading (H1 — REQUIRED, EXACTLY ONE):

{
  "type": "heading",
  "attrs": { "level": 1 },
  "content": [{ "type": "text", "text": "Slide title" }]
}

--------------------------------
paragraph:

{
  "type": "paragraph",
  "content": [{ "type": "text", "text": "Text" }]
}

--------------------------------
LIST STRUCTURES (H3 SEMANTIC — MANDATORY)

bullet_list / ordered_list:

{
  "type": "bullet_list or ordered_list",
  "content": [
    {
      "type": "list_item",
      "content": [
        {
          "type": "heading",
          "attrs": { "level": 3 },
          "content": [{ "type": "text", "text": "Item title:" }]
        },
        {
          "type": "paragraph",
          "content": [{ "type": "text", "text": "Item description expanding the title with explanation or examples." }]
        }
      ]
    }
  ]
}

RULES FOR list_item (STRICT):
- Each list_item MUST contain EXACTLY TWO block-level nodes
- First node: heading level 3 (2–6 words, ends with ":")
- Second node: paragraph description ONLY
- Do NOT merge title and description
- Do NOT create incomplete list_item

--------------------------------
COLUMNS STRUCTURE (H3 SEMANTIC — MANDATORY)

columns:

{
  "type": "columns",
  "content": [
    {
      "type": "column",
      "content": [
        {
          "type": "heading",
          "attrs": { "level": 3 },
          "content": [{ "type": "text", "text": "Item title:" }]
        },
        {
          "type": "paragraph",
          "content": [{ "type": "text", "text": "Item description explaining the title." }]
        }
      ]
    }
  ]
}

RULES FOR columns:
- column.content MUST contain block-level nodes only
- Each column item MUST use EXACTLY TWO nodes
- First node: H3 semantic title (ends with ":")
- Second node: paragraph description
- Do NOT merge nodes

--------------------------------
LIST SELECTION RULES

- Use bullet_list for unordered key ideas
- Use ordered_list for processes, workflows, timelines, or sequences

--------------------------------
LAYOUT INTENT (GUIDANCE)

- Comparison / Pros vs Cons → columns
- Before vs After → columns
- Process / Workflow → ordered_list
- Key Takeaways → bullet_list
- Explanation / Concept → paragraph

--------------------------------
STYLE RULES

- EXACTLY ONE H1 heading per slide
- Lists MUST contain 2–5 list_item nodes
- Do NOT nest lists
- Be concise and slide-focused

--------------------------------
IMAGE RULES

- Include rootImageQuery when visual support is appropriate
- Image queries must be concrete and descriptive
- Avoid generic terms like "team", "technology", "business"

--------------------------------
STRUCTURAL SAFETY RULES (STRICT)

- "content" must always be an array
- Every node MUST have a valid "type"
- Do NOT nest arrays inside "content"
- Do NOT use numeric keys as object properties
- Do NOT include "id" in any node, attrs object, or nested field
- attrs may only contain fields explicitly defined in this prompt

--------------------------------
FINAL INSTRUCTION

ONLY output valid JSON.
No explanations.
No additional text.
Any output containing any form of "id" is INVALID.
`
