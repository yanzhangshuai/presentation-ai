export const outlineTemplate = `Given the following presentation topic and requirements, generate a structured outline with {numberOfCards} main topics in markdown format.
The outline should be in {language} language and it very important.

Current Date: {currentDate}
Topic: {prompt}

First, generate an appropriate title for the presentation, then create exactly {numberOfCards} main topics that would make for an engaging and well-structured presentation.

Format the response starting with the title in XML tags, followed by markdown content with each topic as a heading and 2-3 bullet points.

Example format:

# First Main Topic
- Key point about this topic
- Another important aspect
- Brief conclusion or impact

# Second Main Topic
- Main insight for this section
- Supporting detail or example
- Practical application or takeaway

# Third Main Topic 
- Primary concept to understand
- Evidence or data point
- Conclusion or future direction

Make sure the topics:
1. Flow logically from one to another
2. Cover the key aspects of the main topic
3. Are clear and concise
4. Are engaging for the audience
5. ALWAYS use bullet points (not paragraphs) and format each point as "- point text"
6. Do not use bold, italic or underline
7. Keep each bullet point brief - just one sentence per point
8. Include exactly 2-3 bullet points per topic (not more, not less)`

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
