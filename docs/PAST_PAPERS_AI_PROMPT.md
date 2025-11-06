# Past Papers Collections - AI Setup Prompts

If you're using Appwrite's onboard AI to create these collections, use these prompts:

---

## Prompt 1: Create pastPapers Collection

```
Create collection pastPapers in capstutor database. Attributes: teacherId(String255,req,idx), gradeLevel(Int1-12,req,def12,idx), subject(String255,req,idx), year(String10,req,idx), paperName(String255,req), memoName(String255,req), status(String50,req,defProcessing,idx), questionCount(Int,req,def0), generatedQuestions(String10000,opt,array). Permissions: Users(CRUD). Indexes: gradeLevel, subject, year, status, teacherId, gradeLevel+subject.
```

---

## Prompt 2: Create pastPaperProgress Collection

```
Create collection pastPaperProgress in capstutor database. Attributes: userId(String255,req,idx), paperId(String255,req,idx), currentQuestion(Int,req,def0), lastAccessed(String100,req,idx), paperSubject(String255,opt), paperYear(String10,opt), paperName(String255,opt). Permissions: Users(CRU). Indexes: userId, paperId, lastAccessed DESC, userId+lastAccessed.
```

---

## Alternative: Single Message (if AI supports it)

If the AI can handle longer prompts, combine both:

```
Create two collections in capstutor: 1) pastPapers: teacherId(String255,req,idx), gradeLevel(Int1-12,req,def12,idx), subject(String255,req,idx), year(String10,req,idx), paperName(String255,req), memoName(String255,req), status(String50,req,defProcessing,idx), questionCount(Int,req,def0), generatedQuestions(String10000,opt,array). Users(CRUD). 2) pastPaperProgress: userId(String255,req,idx), paperId(String255,req,idx), currentQuestion(Int,req,def0), lastAccessed(String100,req,idx), paperSubject(String255,opt), paperYear(String10,opt), paperName(String255,opt). Users(CRU).
```

---

## Important Notes for AI

- Collection IDs must be exactly: `pastPapers` and `pastPaperProgress` (case-sensitive)
- `userId` in `pastPaperProgress` must use lowercase 'd' (userId, not userID)
- `generatedQuestions` is a String Array (array of strings)
- `status` default value is "Processing"

