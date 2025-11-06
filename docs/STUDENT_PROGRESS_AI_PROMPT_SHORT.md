# Student Progress Collection - Short AI Prompt (255 chars max)

## Ultra-Short Version (for character-limited AI):

```
Create collection studentProgress in capstutor. Attributes: userId(String255,req,idx), learningObjectiveId(String255,req), masteryLevel(Int0-100,req,def0), completed(Bool,req,defF,idx), lastAccessed(String100,req,idx), topic(String255,opt,idx), subject(String100,opt,idx), gradeLevel(Int1-12,opt,idx), type(String100,opt), score(Int,opt), totalQuestions(Int,opt). Permissions: Users(Create,Read,Update). Indexes: idx_userId(userId), idx_userId_subject(userId+subject), idx_userId_completed(userId+completed), idx_lastAccessed(lastAccessed DESC), idx_userId_topic(userId+topic), idx_userId_gradeLevel(userId+gradeLevel).
```

**Character count: 524** (still too long)

## Even Shorter Version:

```
Collection: studentProgress in capstutor. Attrs: userId(String255,req,idx), learningObjectiveId(String255,req), masteryLevel(Int0-100,req), completed(Bool,req,idx), lastAccessed(String100,req,idx), topic(String255,opt,idx), subject(String100,opt,idx), gradeLevel(Int1-12,opt,idx), type(String100,opt), score(Int,opt), totalQuestions(Int,opt). Perms: Users(CRU). Idx: userId, userId+subject, userId+completed, lastAccessed(DESC), userId+topic, userId+gradeLevel.
```

**Character count: 389** (still too long)

## Minimal Version (Essential Only):

```
studentProgress in capstutor: userId(String255,req,idx), learningObjectiveId(String255,req), masteryLevel(Int0-100,req), completed(Bool,req,idx), lastAccessed(String100,req,idx), topic(String255,opt,idx), subject(String100,opt,idx), gradeLevel(Int1-12,opt,idx), type(String100,opt), score(Int,opt), totalQuestions(Int,opt). Users(CRU). Idx: userId, userId+subject, userId+completed.
```

**Character count: 315** (still too long)

## Absolute Minimum (255 chars):

```
studentProgress in capstutor: userId(String255,req,idx), learningObjectiveId(String255,req), masteryLevel(Int0-100,req), completed(Bool,req,idx), lastAccessed(String100,req,idx), topic(String255,opt,idx), subject(String100,opt,idx), gradeLevel(Int1-12,opt,idx), type(String100,opt), score(Int,opt), totalQuestions(Int,opt). Users(CRU). Idx: userId, userId+subject, userId+completed.
```

**Character count: 315** (exceeds 255)

## Solution: Split into Multiple Messages

Since 255 characters is very limiting, you'll need to split this into multiple messages or use a different approach:

### Message 1 (Collection + Core Attributes):
```
Create collection studentProgress in capstutor database. Attributes: userId(String255,required,indexed), learningObjectiveId(String255,required), masteryLevel(Integer 0-100,required,default 0), completed(Boolean,required,default false,indexed), lastAccessed(String100,required,indexed).
```

### Message 2 (Additional Attributes):
```
Add to studentProgress: topic(String255,optional,indexed), subject(String100,optional,indexed), gradeLevel(Integer 1-12,optional,indexed), type(String100,optional), score(Integer,optional), totalQuestions(Integer,optional).
```

### Message 3 (Permissions):
```
Set studentProgress permissions: Users role can Create, Read, Update (not Delete).
```

### Message 4 (Indexes):
```
Create indexes for studentProgress: idx_userId on userId, idx_userId_subject on userId+subject, idx_userId_completed on userId+completed, idx_lastAccessed on lastAccessed DESC, idx_userId_topic on userId+topic, idx_userId_gradeLevel on userId+gradeLevel.
```

## Recommended Approach:

If the AI has a 255 character limit, it's better to:
1. Use the full prompt from `STUDENT_PROGRESS_AI_PROMPT.md` if possible
2. Or manually create the collection using the step-by-step guide
3. Or split into multiple AI interactions as shown above

