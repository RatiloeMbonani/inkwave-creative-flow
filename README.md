# Inkwave Content Hub

Build INKWAVE AI — Full-Stack AI Content Creation & Automation Platform

1. PRODUCT OVERVIEW

Build a fully functional, production-quality web application called:

INKWAVE AI

Tagline:

Where Ideas Make Waves.

INKWAVE AI is a multi-modal AI content creation and automation platform designed for digital creators, students, developers, designers, marketers, entrepreneurs, and professionals.

The platform should allow users to take a simple idea and transform it into different types of content using AI.

The core workflow is:

Idea → Prompt Optimization → AI Generation → Edit → Refine → Repurpose → Save → Export/Publish

This is NOT a static UI prototype.

Every major feature must be functional and connected to the backend, database, authentication system, AI APIs, file storage, and appropriate external services.

Do not create fake buttons, fake statistics, placeholder AI responses, or non-functional pages.

If an external API is required for a feature, structure the application so that the API can be configured through environment variables and provide a graceful fallback/error state when the API key is unavailable.



2. CORE OBJECTIVES

The application must demonstrate:

Prompt optimization

Prompt iteration and refinement

AI-generated text

AI-generated images

AI-generated video content

AI-generated code

AI-generated audio/voice

Content structuring

Content repurposing

AI productivity workflows

Automation concepts

Prompt library

Individual project management

User authentication

Database persistence

Content editing

Exporting

Analytics

Responsive design

The application should feel like a real SaaS product rather than a school-project mockup.



3. TARGET USERS

Primary users:

Content creators

Multimedia designers

Software developers

Students

Social media managers

Entrepreneurs

Freelancers

Marketing professionals

Personal-brand creators

The design must be gender-neutral and suitable for all creators.



4. BRAND IDENTITY

Application name:

INKWAVE AI

Tagline:

Where Ideas Make Waves.

Brand personality:

Creative

Intelligent

Modern

Professional

Innovative

Digital

Expressive

Gender-neutral

Avoid a stereotypically feminine visual style.

Do not overuse pink, pastel colours, hearts, flowers, or overly decorative elements.



5. COLOUR PALETTE

Use this colour system consistently.

Primary

Ink Black:
#0B1020

Midnight Navy:
#111A33

Electric Blue:
#4F7CFF

Cyan:
#22D3EE

Violet:
#8B5CF6

Cool White:
#F8FAFC

Slate:
#64748B

Light Blue:
#E8F0FF

Graphite:
#1E293B

Signal Orange:
#FF9F43

Brand Gradient

Use:

#4F7CFF → #8B5CF6 → #22D3EE

This should be used selectively for important AI/creative elements, buttons, visual accents, progress indicators, and branding.

Do NOT make every component gradient-heavy.



6. DESIGN DIRECTION

Create a clean, modern, premium SaaS interface.

The application should have:

Spacious layouts

Strong visual hierarchy

Rounded but professional cards

Subtle shadows

Clean typography

Clear navigation

Accessible contrast

Smooth micro-interactions

Responsive layouts

Minimal visual clutter

Use a dark sidebar with a light main workspace.

The interface should feel similar in quality to a modern professional AI SaaS platform.

Avoid making the dashboard too busy.



7. APPLICATION STRUCTURE

Create these main navigation items:

Dashboard

Create

Repurpose

Prompt Library

Projects

Automation

Content Planner

Analytics

Settings

The Create section should contain:

Blog

Social Media

Email

Image

Video

Code

Audio



8. AUTHENTICATION

Implement real authentication.

Users must be able to:

Register

Login

Logout

Reset password

Maintain a session

Update profile

Delete account

Registration fields:

Name

Email

Password

Confirm Password

Validate all fields.

Passwords must never be stored as plain text.

Protect authenticated routes.

Each user’s projects, prompts, generated content, workflows and analytics must belong to that user.



9. DASHBOARD

Create a functional dashboard.

Display:

Welcome section

“Welcome back, [User Name]”

Subtitle:

“What would you like to create today?”

Quick Create

Cards/buttons for:

Blog

Social Post

Email

Image

Video

Code

Each button must navigate to the corresponding functional creation tool.

Statistics

Display real database-derived statistics:

Content Created

Images Generated

Videos Generated

Prompts Used

Projects

Words Generated

Do not hard-code these numbers.

Recent Projects

Display the user’s most recent projects.

Allow:

Open

Edit

Delete

Recent Content

Show recently generated content.

Prompt Suggestions

Display saved/frequently used prompts.



10. AI BLOG GENERATOR

Build a functional blog generation tool.

Inputs:

Topic

Target audience

Tone

Writing style

Word count

SEO keywords

Language

Optional additional instructions

Allow the user to generate a blog.

The AI response should contain:

SEO title

Introduction

Structured headings

Main content

Conclusion

Meta description

Keywords

Suggested image concepts

Image-generation prompts

Actions:

Generate

Regenerate

Improve

Expand

Shorten

Change Tone

Fix Grammar

Translate

Save

Export

Export options:

PDF

DOCX

TXT

Generated content must be stored in MongoDB.



11. SOCIAL MEDIA GENERATOR

Create a functional social-media generator.

Platforms:

LinkedIn

Instagram

TikTok

Facebook

X

Inputs:

Topic

Platform

Audience

Tone

Length

Objective

Call-to-action

Keywords

Generate platform-specific content.

For example, do not simply generate the same text for every platform.

LinkedIn should be professional and longer.

X should be concise.

Instagram should include captions and hashtags.

TikTok should include hooks and captions.

Actions:

Generate

Regenerate

Improve

Shorten

Expand

Change Tone

Generate Hashtags

Save

Copy

Export



12. AI EMAIL GENERATOR

Create a functional email generator.

Email types:

Professional

Job application

Internship request

Follow-up

Networking

Client communication

Marketing

Thank-you

Meeting request

Custom

Inputs:

Recipient context

Purpose

Tone

Key points

Desired length

Generate:

Subject

Email body

Actions:

Improve

Shorten

Make professional

Make friendly

Regenerate

Copy

Save

If an email integration is configured, allow the user to send the generated email.

Never expose API keys in the frontend.



13. AI IMAGE GENERATION

Implement actual AI image generation through a configurable image-generation API.

The user enters a prompt.

Options:

Style

Photorealistic

Cinematic

Illustration

3D

Editorial

Minimalist

Anime

Custom

Aspect Ratio

1:1

16:9

9:16

4:5

Quality

Allow available quality settings supported by the chosen provider.

Generate an actual image.

Actions:

Generate

Regenerate

Edit if supported

Download

Save

Add to Project

Use in Content

Generated image metadata must be stored.

Do not fake image generation with placeholder images.



14. AI VIDEO GENERATION

Implement a real video-generation workflow using a configurable video-generation API/service.

Do not pretend that a static image is a video.

Inputs:

Video topic

Description

Duration

Style

Aspect ratio

Target platform

Voice preference

Music preference

Workflow:

Generate video concept

Generate script

Generate scene breakdown/storyboard

Send generation request to video API

Show generation progress

Retrieve generated video

Display video preview

Allow download

Save to project

Actions:

Regenerate

Edit Script

Regenerate

Download

Save

If the chosen video API works asynchronously, implement job status polling/webhooks correctly.

Show proper loading/progress states.



15. AI CODE GENERATOR

Create an AI coding assistant.

Supported languages:

JavaScript

TypeScript

React

HTML

CSS

Python

PHP

Java

SQL

Node.js

Modes:

Generate Code

User describes what they need.

Explain Code

User pastes code and receives an explanation.

Debug Code

User pastes code/error and receives:

Problem

Explanation

Corrected code

Suggested solution

Improve Code

AI suggests cleaner or more efficient code.

Display generated code in a syntax-highlighted editor.

Actions:

Copy

Download

Save

Regenerate

Explain



16. AI AUDIO / VOICE GENERATOR

Implement text-to-speech through a configurable audio API.

Inputs:

Text

Voice

Language

Speed

Tone

Use cases:

Video narration

Podcast intro

Social media voiceover

Educational content

Generate actual audio.

Allow:

Play

Pause

Download

Save

Add to Project



17. PROMPT OPTIMIZER

This is a core feature.

User enters a basic prompt.

Example:

“Write a LinkedIn post about my project.”

INKWAVE should analyze and optimize it.

Create a structured optimized prompt containing, where appropriate:

Role

Context

Objective

Audience

Tone

Format

Constraints

Examples

Desired output

Display:

Original Prompt

The user’s prompt.

Optimized Prompt

The AI-improved prompt.

Why This Is Better

Explain the improvements.

Actions:

Use Prompt

Edit

Copy

Save to Prompt Library

Generate Content

The optimized prompt must actually be usable by the generation system.



18. PROMPT ITERATION

Allow users to refine prompts.

Example:

Version 1 → Version 2 → Version 3

Store prompt history.

Allow:

Compare versions

Restore version

Edit version

Use version

Delete version

This demonstrates prompt iteration and refinement.



19. PROMPT LIBRARY

Create a searchable prompt library.

Categories:

Blog

Social Media

Email

Image

Video

Code

Marketing

Career

Education

General

Each prompt should contain:

Title

Category

Description

Original prompt

Optimized prompt

Tags

Created date

Updated date

Actions:

Search

Filter

Create

Edit

Duplicate

Use

Favourite

Delete

Users can create their own prompts.



20. CONTENT REPURPOSING

This is one of the primary INKWAVE features.

Allow a user to select an existing piece of content or paste content.

Then select formats:

Blog

LinkedIn

Instagram

X

Facebook

TikTok

Email

Video script

Image prompt

INKWAVE should transform the original content into each selected format.

Example:

One blog →

LinkedIn post

Instagram caption

X thread

Email

TikTok script

Image prompt

Save all generated versions under the same project.



21. CONTENT EDITOR

Every generated text output must be editable.

Implement a rich text editor.

AI editing actions:

Improve

Rewrite

Shorten

Expand

Change tone

Simplify

Fix grammar

Translate

Make more engaging

Generate alternatives

Users must be able to manually edit content.

Auto-save drafts where appropriate.



22. PROJECT MANAGEMENT

Create a Projects section.

Users can create projects.

Each project can contain:

Blog posts

Social posts

Emails

Images

Videos

Audio

Code

Prompts

Project fields:

Name

Description

Status

Tags

Created date

Updated date

Statuses:

Draft

In Progress

Completed

Archived

Allow:

Search

Filter

Sort

Open

Edit

Delete

Archive



23. AUTOMATION WORKFLOWS

Create a functional workflow system.

Users can create workflows such as:

Social Media Campaign

Input topic

↓

Optimize prompt

↓

Generate blog

↓

Generate LinkedIn post

↓

Generate Instagram caption

↓

Generate image

↓

Save project

Users should be able to:

Create workflow

Name workflow

Add steps

Remove steps

Reorder steps

Save workflow

Run workflow

View workflow history

Show execution status:

Waiting

Running

Completed

Failed

Each workflow run should be stored.

If a step fails, show a meaningful error and allow retry.



24. CONTENT PLANNER

Create an AI-powered content planning tool.

User enters:

Niche

Target audience

Platform

Goal

Posting frequency

Duration

Generate a content calendar.

Example:

Monday — Educational post

Tuesday — Project showcase

Wednesday — Industry insight

Thursday — Storytelling post

Friday — Promotional post

Allow the user to click a calendar item and generate the actual content.

Save plans to the database.



25. SEO ASSISTANT

For blogs, include:

SEO title

Meta description

Keywords

Search intent

Suggested headings

Keyword placement

Readability suggestions

Image alt text

Provide an SEO score based on implemented rules/AI analysis.

Do not display a fake score.

Calculate the score from actual checks.



26. ANALYTICS

Analytics must use real database information.

Show:

Total content generated

Content by type

Images generated

Videos generated

Audio generated

Prompts used

Projects created

Words generated

Most-used content type

Most-used platform

Recent activity

Use charts where useful.

Allow filtering by:

7 days

30 days

90 days

All time



27. SEARCH

Implement global search.

Search across:

Projects

Prompts

Generated content

Workflows

Show relevant results.



28. NOTIFICATIONS

Create a notification system for:

Generation completed

Video ready

Workflow completed

Generation failed

Project updated

System messages

Notifications should be stored/read-state aware.



29. FILE STORAGE

Generated:

Images

Videos

Audio

Documents

must be stored using an appropriate cloud storage solution.

Do not store large media files directly inside MongoDB.

Store metadata and URLs/references in MongoDB.



30. DATABASE

Use MongoDB.

Design appropriate collections.

At minimum:

users

projects

prompts

generatedContent

media

workflows

workflowRuns

contentPlans

notifications

usage

Relationships must be handled through IDs/references.

All user-owned resources must contain the appropriate userId.

Add timestamps.

Use indexes for frequently searched fields.



31. API ARCHITECTURE

Use a clean backend architecture.

Recommended:

Frontend:
React + TypeScript

Backend:
Node.js + Express

Database:
MongoDB

Authentication:
Secure token/session-based authentication.

AI services should be abstracted behind backend services.

Example:

/api/auth

/api/content

/api/blog

/api/social

/api/email

/api/image

/api/video

/api/audio

/api/code

/api/prompts

/api/projects

/api/repurpose

/api/workflows

/api/planner

/api/analytics

Never expose secret API keys to the browser.



32. AI SERVICE ARCHITECTURE

Do not hard-code the entire application around one AI provider.

Create service abstractions such as:

TextGenerationService

ImageGenerationService

VideoGenerationService

SpeechGenerationService

PromptOptimizationService

This allows providers to be changed later.

Use environment variables for API keys.

Example:

TEXT_AI_API_KEY=

IMAGE_AI_API_KEY=

VIDEO_AI_API_KEY=

AUDIO_AI_API_KEY=

MONGODB_URI=

AUTH_SECRET=

STORAGE_API_KEY=

Never commit .env files or secrets to GitHub.



33. ERROR HANDLING

Every AI generation feature must handle:

Missing API key

Invalid request

Rate limits

Network failures

Generation failure

Timeout

Unsupported input

File upload failure

Display user-friendly messages.

Never expose raw server errors or API secrets.

Example:

“Your image couldn’t be generated right now. Please try again.”

Provide a Retry button.



34. LOADING STATES

AI generation can take time.

Implement proper states:

Preparing

Optimizing prompt

Generating

Processing

Finalizing

Complete

Do not freeze the UI.

For video/image/audio generation, show meaningful progress where the API supports it.



35. RESPONSIVE DESIGN

The application must work on:

Desktop

Laptop

Tablet

Mobile

Prioritize desktop for the main workspace but ensure mobile usability.



36. ACCESSIBILITY

Implement:

Keyboard navigation

Proper labels

Accessible buttons

Sufficient colour contrast

Alt text

Focus states

Semantic HTML

Screen-reader-friendly controls



37. SECURITY

Implement:

Password hashing

Authentication

Authorization

Input validation

API rate limiting where appropriate

Secure API key handling

File upload validation

Protected backend routes

MongoDB query sanitization

XSS protection

CORS configuration

Secure error responses

A user must NEVER be able to access another user’s projects, prompts or generated content.



38. UX DETAILS

Use confirmation dialogs for destructive actions.

For example:

“Delete this project?”

Buttons:

Cancel

Delete

Use toast notifications for successful actions:

“Content saved successfully.”

“Prompt added to your library.”

“Image generated successfully.”



39. CREATE FLOW

Make the main creation flow extremely simple.

User clicks:

Create

Then:

What do you want to create?

Blog

Social

Email

Image

Video

Code

Audio

After selecting a type:

Tell INKWAVE what you have in mind.

User enters their idea.

Then:

Optimize Prompt

Then:

Generate

Then:

Edit / Refine / Repurpose / Save

This should be the central user experience.



40. AI CONTENT GENERATION PIPELINE

Whenever appropriate, the backend should follow:

User Input

     ↓

Validate Input

     ↓

Prompt Optimization

     ↓

Build AI Prompt

     ↓

AI Generation

     ↓

Validate Response

     ↓

Format Output

     ↓

Save to MongoDB

     ↓

Return Result

     ↓

Display in Editor

Do not blindly trust AI output.

Validate and sanitize responses where necessary.



41. CONTENT HISTORY

Users should be able to see previous generations.

For every generation store:

Original input

Optimized prompt

Generated result

Content type

Model/provider

Timestamp

Project

Version

Allow users to restore previous versions.



42. EXPORT

Support appropriate exports.

Text:

TXT

PDF

DOCX

Images:

PNG

JPG

Video:

MP4 where supported

Audio:

MP3/WAV where supported

Code:

Download source file



43. SETTINGS

Settings should include:

Profile

Name

Email

Profile picture

AI Preferences

Default tone

Default language

Preferred content style

Notifications

Generation notifications

Workflow notifications

Account

Change password

Delete account

Logout



44. EMPTY STATES

Do not leave blank screens.

Example:

No projects:

“You haven’t created a project yet.”

Button:

Start Creating

No prompts:

“Save your first prompt to build your personal AI library.”

No content:

“Your generated content will appear here.”



45. SEED DATA

During development, create optional sample data for demonstration.

Clearly distinguish demo data from real user data.

Do not use fake statistics in production.



46. CODE QUALITY

Use:

TypeScript

Reusable components

Clean architecture

Modular services

API validation

Environment variables

Proper error handling

Reusable UI components

Consistent naming

Comments only where useful

Avoid putting the entire application in one huge component.



47. REQUIRED FUNCTIONAL TESTING

Before considering the project complete, test:

Authentication

Register

Login

Logout

Password reset

Blog

Generate

Edit

Regenerate

Save

Export

Social

Generate platform-specific content

Save

Repurpose

Email

Generate

Edit

Save

Send if integration is configured

Image

Generate actual image

Save

Download

Video

Generate actual video through configured provider

Track generation status

Preview

Download

Code

Generate

Explain

Debug

Copy

Save

Audio

Generate actual audio

Play

Download

Prompts

Optimize

Save

Edit

Version

Reuse

Projects

Create

Edit

Delete

Search

Filter

Automation

Create workflow

Save workflow

Run workflow

Track status

Retry failed step

Analytics

Ensure numbers are calculated from real database records.



48. IMPORTANT: DO NOT BUILD A STATIC PROTOTYPE

This requirement is critical.

Do NOT:

Create fake AI responses

Use hard-coded generated content

Use fake analytics

Create buttons that do nothing

Create fake loading animations without API calls

Pretend a static image is AI-generated

Pretend a text response is a generated video

Store everything only in localStorage

Put API keys in frontend code

Leave major features as “coming soon”

If an API cannot be configured immediately, create the correct integration architecture and clearly show an integration/setup error rather than pretending the feature works.



49. FINAL USER JOURNEY

A complete demonstration should work like this:

User registers.

User enters the dashboard.

User clicks Create.

User selects Blog.

User enters an idea.

INKWAVE optimizes the prompt.

User reviews the optimized prompt.

User generates the blog.

AI produces the blog.

User edits the blog.

User generates an AI image for the blog.

User saves both to a project.

User clicks Repurpose.

INKWAVE converts the blog into:



LinkedIn post

Instagram caption

X post

Email

Video script

User generates a video from the video workflow.

User saves all outputs.

User can return to the project later.

Dashboard analytics update automatically.

The entire process must use real backend/database/API functionality.



50. FINAL PRODUCT VISION

INKWAVE AI should feel like a combination of:

AI Writing Assistant + AI Image Generator + AI Video Studio + Prompt Engineering Workspace + Content Repurposing Tool + Automation Platform

but with a unified, simple user experience.

The key differentiator is:

ONE IDEA → MANY POSSIBILITIES

The application should help users move from:

Idea

to

Prompt

to

Content

to

Visuals

to

Video

to

Repurposed Content

to

Automated Workflow

without needing to switch between multiple applications.

Build the application completely, connect all necessary backend services, implement real database persistence, implement real AI integrations where configured, and ensure every major button and workflow performs the action it claims to perform.

The final result must be a fully functional full-stack AI content creation platform, not a visual mockup.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://inkwave-creative-flow.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/87d69cc3-fe36-48d8-82c4-7797ecc966e1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
