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
TASK

You are generating the CONTENT of exactly ONE presentation slide.

Only generate slide content.
Do NOT generate events, IDs, or lifecycle markers.

--------------------------------
CURRENT SLIDE POSITION

Slide number: {{SLIDE_INDEX}} of {{TOTAL_SLIDES}}
Narrative step:
{{NARRATIVE_STEP}}

--------------------------------
SLIDE TOPIC

{{SLIDE_TOPIC}}

--------------------------------
SOURCE BULLET POINTS

{{SLIDE_BULLETS}}

--------------------------------
CONTENT GENERATION INSTRUCTION

- Treat each bullet point as a key idea to be EXPANDED, not repeated.
- Expand bullets into clear, self-contained explanations.
- It is allowed and encouraged to add logical connective text.
- Do NOT introduce concepts unrelated to the slide topic.
- Do NOT simply restate the bullet text verbatim.

--------------------------------
OUTPUT FORMAT (STRICT)

Output ONLY valid JSON.
Do NOT use Markdown.
Do NOT wrap the output in code blocks.
Do NOT include comments or explanations.

The JSON structure MUST be:

{
  "layout": "left | right | top | bottom | none",
  "rootImageQuery": "optional English visual image description",
  "nodes": [ ... ]
}

--------------------------------
NODE RULES (STRICT)

Allowed node types ONLY:
- heading
- paragraph
- bullet_list
- ordered_list
- columns
- image (secondary visuals only)

--------------------------------
NODE STRUCTURES

heading:
{
  "type": "heading",
  "content": [{ "type": "text", "text": "Title" }]
}

paragraph:
{
  "type": "paragraph",
  "content": [{ "type": "text", "text": "Text" }]
}

bullet_list / ordered_list:
{
  "type": "bullet_list",
  "content": [
    {
      "type": "list_item",
      "content": [
        {
          "type": "paragraph",
          "content": [{ "type": "text", "text": "Item" }]
        }
      ]
    }
  ]
}

columns:
{
  "type": "columns",
  "count": 2,
  "content": [
    [ <nodes for column 1> ],
    [ <nodes for column 2> ]
  ]
}

image (secondary only):
{
  "type": "image",
  "query": "English visual description"
}

--------------------------------
STYLE RULES

- Exactly ONE heading node
- Prefer paragraphs or lists (2–5 bullet items per list)
- Do NOT nest lists
- One slide should be concise and focused
- Prefer clarity and consistency over verbosity

--------------------------------
FINAL INSTRUCTION

ONLY output valid JSON.
Do NOT output explanations or text outside JSON.
`
