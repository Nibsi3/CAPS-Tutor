# Presets Collection Setup - Complete Guide

This guide will help you create the `custompresets` collection in Appwrite for storing question presets that can be used in the paper editor.

## Collection Details

- **Collection ID**: `custompresets` (lowercase, exact spelling)
- **Collection Name**: `Custom Presets`
- **Database**: `capstutor`
- **Purpose**: Stores question presets organized by subject and question type for use in the paper editor

## Step 1: Create the Collection

1. Go to: https://cloud.appwrite.io/console
2. Select project: **CAPS Tutor**
3. Navigate to: **Databases** → **capstutor**
4. Click **+ Create Collection**
5. **Collection ID**: `custompresets` (exact spelling, lowercase)
6. **Name**: `Custom Presets`
7. Click **Create**

## Step 2: Add Attributes

Go to the **Attributes** tab and add these attributes in order:

### 1. `userId` (String)
- **Type**: String
- **Size**: 255
- **Required**: ✅ Yes
- **Array**: ❌ No
- **Indexed**: ✅ Yes
- **Default**: Leave empty
- **Description**: The Appwrite user ID of the user who created the preset (use 'system-generator' for system-generated presets)

### 2. `name` (String)
- **Type**: String
- **Size**: 500
- **Required**: ✅ Yes
- **Array**: ❌ No
- **Indexed**: ✅ Yes
- **Default**: Leave empty
- **Description**: Name of the preset (e.g., "Mathematics - Algebra - short-answer - Q1")

### 3. `description` (String)
- **Type**: String
- **Size**: 1000
- **Required**: ✅ Yes
- **Array**: ❌ No
- **Indexed**: ❌ No
- **Default**: Leave empty
- **Description**: Description of the preset (e.g., "Grade 12 Mathematics short-answer question about Algebra")

### 4. `type` (String)
- **Type**: String
- **Size**: 100
- **Required**: ✅ Yes
- **Array**: ❌ No
- **Indexed**: ✅ Yes
- **Default**: Leave empty
- **Description**: Question type (one of the 22 types: short-answer, paragraph-long-answer, multiple-choice, etc.)

### 5. `text` (String)
- **Type**: String
- **Size**: 5000
- **Required**: ✅ Yes
- **Array**: ❌ No
- **Indexed**: ❌ No
- **Default**: Leave empty
- **Description**: The question text/content

### 6. `marks` (Integer)
- **Type**: Integer
- **Required**: ✅ Yes
- **Array**: ❌ No
- **Indexed**: ❌ No
- **Min**: 1
- **Max**: 20
- **Default**: 2
- **Description**: Marks allocated to this question

### 7. `subject` (String)
- **Type**: String
- **Size**: 255
- **Required**: ✅ Yes
- **Array**: ❌ No
- **Indexed**: ✅ Yes
- **Default**: Leave empty
- **Description**: Subject name (e.g., "Mathematics", "Life Sciences", "Physical Sciences")

### 8. `instructionText` (String) - Optional
- **Type**: String
- **Size**: 1000
- **Required**: ❌ No
- **Array**: ❌ No
- **Indexed**: ❌ No
- **Default**: Leave empty
- **Description**: Additional instructions for the question

### 9. `options` (String) - Optional
- **Type**: String
- **Size**: 2000
- **Required**: ❌ No
- **Array**: ❌ No
- **Indexed**: ❌ No
- **Default**: Leave empty
- **Description**: JSON string array of options for multiple-choice questions (e.g., '["Option A", "Option B", "Option C", "Option D"]')

### 10. `tableData` (String) - Optional
- **Type**: String
- **Size**: 5000
- **Required**: ❌ No
- **Array**: ❌ No
- **Indexed**: ❌ No
- **Default**: Leave empty
- **Description**: JSON string for table data (for table-interpretation questions)
- **Format**: `{"headers": ["Col1", "Col2"], "rows": [["Data1", "Data2"]], "description": "Table description"}`

### 11. `graphData` (String) - Optional
- **Type**: String
- **Size**: 5000
- **Required**: ❌ No
- **Array**: ❌ No
- **Indexed**: ❌ No
- **Default**: Leave empty
- **Description**: JSON string for graph data (for graph-interpretation questions)
- **Format**: `{"type": "line", "xAxisLabel": "X", "yAxisLabel": "Y", "dataPoints": [{"label": "Point 1", "value": 10}]}`

### 12. `extractText` (String) - Optional
- **Type**: String
- **Size**: 5000
- **Required**: ❌ No
- **Array**: ❌ No
- **Indexed**: ❌ No
- **Default**: Leave empty
- **Description**: Extract or case study text (for extract-source and case-study questions)

### 13. `diagramLabel` (String) - Optional
- **Type**: String
- **Size**: 255
- **Required**: ❌ No
- **Array**: ❌ No
- **Indexed**: ❌ No
- **Default**: Leave empty
- **Description**: Label for diagram (for diagram-interpretation and diagram-labeling questions)

### 14. `hasDiagram` (Boolean) - Optional
- **Type**: Boolean
- **Required**: ❌ No
- **Array**: ❌ No
- **Indexed**: ❌ No
- **Default**: `false`
- **Description**: Whether the question has a diagram (for diagram-interpretation and diagram-labeling questions)

### 15. `answer` (String) - Optional
- **Type**: String
- **Size**: 2000
- **Required**: ❌ No
- **Array**: ❌ No
- **Indexed**: ❌ No
- **Default**: Leave empty
- **Description**: Sample answer or answer key for the question

## Question Types

The collection supports all 22 question types organized by category:

### Written (6 types):
- `short-answer`
- `paragraph-long-answer`
- `reasoning-interpretation`
- `true-false-with-reason`
- `compare-evaluate-predict`
- `sequencing-ordering`

### Objective (3 types):
- `multiple-choice`
- `matching-pairing`
- `fill-in-blank`

### Visual (6 types):
- `diagram-interpretation`
- `diagram-labeling`
- `table-interpretation`
- `graph-interpretation`
- `map-cartoon`
- `data-set-analysis`

### Extract-Based (2 types):
- `extract-source`
- `case-study`

### Calculation (5 types):
- `numeric-calculation`
- `formula-based-calculation`
- `accounting-financial-calculation`
- `geography-scale-gradient`
- `biology-percentage-ratio`

## Step 3: Set Permissions

Go to the **Settings** tab, under **Permissions**:

### Create Permission
- Select: **"All users"** or **"Users"** role
- This allows authenticated users to create presets

### Read Permission
- Select: **"All users"** or **"Users"** role
- This allows all users to view presets

### Update Permission
- Select: **"All users"** or **"Users"** role
- This allows users to update their own presets

### Delete Permission
- Select: **"All users"** or **"Users"** role
- This allows users to delete their own presets

**Note**: You may want to restrict Create/Update/Delete to admin users only. In that case, create a custom role for admins and assign permissions accordingly.

## Step 4: Create Indexes

Go to the **Indexes** tab and create the following indexes for efficient querying:

### 1. userId Index
- **Key**: `userId`
- **Type**: Key
- **Attributes**: `userId` (ascending)
- **Description**: For filtering presets by user

### 2. subject Index
- **Key**: `subject`
- **Type**: Key
- **Attributes**: `subject` (ascending)
- **Description**: For filtering presets by subject

### 3. type Index
- **Key**: `type`
- **Type**: Key
- **Attributes**: `type` (ascending)
- **Description**: For filtering presets by question type

### 4. name Index
- **Key**: `name`
- **Type**: Key
- **Attributes**: `name` (ascending)
- **Description**: For searching presets by name

### 5. Composite Index (Optional but Recommended)
- **Key**: `userId_subject_type`
- **Type**: Key
- **Attributes**: 
  - `userId` (ascending)
  - `subject` (ascending)
  - `type` (ascending)
- **Description**: For efficiently filtering presets by user, subject, and type simultaneously

## Example Document

```json
{
  "$id": "unique-id",
  "userId": "system-generator",
  "name": "Mathematics - Algebra - short-answer - Q1",
  "description": "Grade 12 Mathematics short-answer question about Algebra",
  "type": "short-answer",
  "text": "Define the term 'quadratic equation' in the context of Algebra.",
  "marks": 2,
  "subject": "Mathematics",
  "instructionText": "",
  "answer": "A quadratic equation is a polynomial equation of degree 2."
}
```

## Usage in Paper Editor

Presets stored in this collection will be:
1. Available in the "Manage Presets" page
2. Filterable by subject and question type
3. Addable to past papers in the paper editor
4. Used by the "Randomize Questions" feature

## Notes

- The collection ID must be exactly `custompresets` (lowercase) to match the code
- JSON strings for `options`, `tableData`, and `graphData` should be properly escaped
- The `userId` field is used to identify who created the preset (use 'system-generator' for system-generated presets)

