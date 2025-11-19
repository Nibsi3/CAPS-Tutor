# Questions Collection Schema - Additional Attributes

This document lists all the attributes that need to be added to the `questions` collection in Appwrite to support table, graph, extract, and diagram question types.

## Where to Add These Attributes

1. Go to: **https://cloud.appwrite.io/console**
2. Select project: **CAPS Tutor**
3. Navigate to: **Databases** → **capstutor** → **questions** collection
4. Click on the **Attributes** tab
5. Click **+ Create Attribute** for each attribute below

---

## Required Attributes to Add

### 1. tableData
- **Type**: String
- **Size**: 32767 (maximum)
- **Required**: ❌ No
- **Array**: ❌ No
- **Indexed**: ❌ No
- **Default**: Leave empty
- **Description**: JSON string containing table data structure: `{ headers: string[], rows: string[][], description?: string }`
- **Usage**: Stores table structure for table-type questions

---

### 2. graphData
- **Type**: String
- **Size**: 32767 (maximum)
- **Required**: ❌ No
- **Array**: ❌ No
- **Indexed**: ❌ No
- **Default**: Leave empty
- **Description**: JSON string containing graph data structure: `{ type?: string, xAxisLabel?: string, yAxisLabel?: string, dataPoints?: Array<{label: string, value: number}>, description?: string }`
- **Usage**: Stores graph/chart data for graph-type questions

---

### 3. extractText
- **Type**: String
- **Size**: 32767 (maximum)
- **Required**: ❌ No
- **Array**: ❌ No
- **Indexed**: ❌ No
- **Default**: Leave empty
- **Description**: Text content for extract/passage questions
- **Usage**: Stores the extract or passage text that students need to read before answering extract-type questions

---

### 4. diagramLabel
- **Type**: String
- **Size**: 500
- **Required**: ❌ No
- **Array**: ❌ No
- **Indexed**: ❌ No
- **Default**: Leave empty
- **Description**: Label or description for diagram questions (e.g., "Figure 1: Heart structure")
- **Usage**: Stores diagram labels for diagram-type questions

---

### 5. coordinateSystem
- **Type**: String
- **Size**: 1000
- **Required**: ❌ No
- **Array**: ❌ No
- **Indexed**: ❌ No
- **Default**: Leave empty
- **Description**: JSON string containing coordinate system data: `{ xMin?: number, xMax?: number, yMin?: number, yMax?: number }`
- **Usage**: Stores coordinate system configuration for graph questions

---

### 6. tableSubject
- **Type**: String
- **Size**: 255
- **Required**: ❌ No
- **Array**: ❌ No
- **Indexed**: ❌ No
- **Default**: Leave empty
- **Description**: Subject or topic for the table (e.g., "Sales Data", "Population Statistics")
- **Usage**: Additional metadata for table questions

---

### 7. tableType
- **Type**: String
- **Size**: 100
- **Required**: ❌ No
- **Array**: ❌ No
- **Indexed**: ❌ No
- **Default**: Leave empty
- **Description**: Type of table (e.g., "comparison", "data", "statistics")
- **Usage**: Additional metadata for table questions

---

### 8. graphSubject
- **Type**: String
- **Size**: 255
- **Required**: ❌ No
- **Array**: ❌ No
- **Indexed**: ❌ No
- **Default**: Leave empty
- **Description**: Subject or topic for the graph (e.g., "Temperature Over Time", "Sales Trends")
- **Usage**: Additional metadata for graph questions

---

### 9. graphType
- **Type**: String
- **Size**: 100
- **Required**: ❌ No
- **Array**: ❌ No
- **Indexed**: ❌ No
- **Default**: Leave empty
- **Description**: Type of graph (e.g., "line", "bar", "pie", "scatter")
- **Usage**: Additional metadata for graph questions

---

### 10. instructionText
- **Type**: String
- **Size**: 1000
- **Required**: ❌ No
- **Array**: ❌ No
- **Indexed**: ❌ No
- **Default**: Leave empty
- **Description**: Additional instruction text for the question
- **Usage**: Stores supplementary instructions that appear before or after the main question text
- **Note**: The code also checks for `instruction_text` (with underscore), so you can use either name, but `instructionText` (camelCase) is preferred

---

## Attributes That Should Already Exist

These attributes should already be in your schema. If they're missing, add them too:

### Core Attributes (Should Already Exist)
- `paperId` (String, 255, Required: Yes, Indexed: Yes)
- `number` (String, 50, Required: Yes, Indexed: Yes)
- `question` (String, 32767, Required: Yes)
- `answer` (String, 32767, Required: No)
- `marks` (Integer, Required: No, Default: 0)
- `type` (String, 50, Required: No, Default: "normal")
- `hasImage` (Boolean, Required: No, Default: false)
- `order` (Integer, Required: No, Default: 0)
- `options` (String, 32767, Required: No) - JSON string for multiple-choice options
- `imageFileId` (String, 255, Required: No) - Appwrite Storage file ID
- `diagramData` (String, 32767, Required: No) - JSON string containing diagram data: `{ imageFileId: string, label?: string, title?: string }`

---

## Step-by-Step Instructions

### Step 1: Access Appwrite Console
1. Go to https://cloud.appwrite.io/console
2. Log in to your account
3. Select the **CAPS Tutor** project

### Step 2: Navigate to Questions Collection
1. Click **Databases** in the left sidebar
2. Click on **capstutor** database
3. Click on **questions** collection
4. Click on the **Attributes** tab

### Step 3: Add Each Attribute
For each attribute listed above (1-10):

1. Click **+ Create Attribute** button
2. Select the attribute **Type** (String, Integer, Boolean, etc.)
3. Enter the **Key** (attribute name) exactly as shown
4. Configure the settings:
   - **Size**: Enter the size (for String types)
   - **Required**: Set to **No** for all new attributes
   - **Array**: Set to **No**
   - **Indexed**: Set to **No** (unless specified)
   - **Default**: Leave empty (unless specified)
5. Click **Create**

### Step 4: Verify Attributes
After adding all attributes, verify they exist:
1. Scroll through the attributes list
2. Ensure all 10 new attributes are present
3. Check that the existing core attributes are also present

---

## After Adding Attributes

Once you've added all the attributes:

1. **Update the filter function** in `src/app/api/admin/past-papers/upload-json/route.ts`:
   - Remove `tableData`, `graphData`, `extractText`, `diagramLabel`, `coordinateSystem`, `tableSubject`, `tableType`, `graphSubject`, `graphType`, `instructionText` from the exclusion list in the `filterQuestionData` function
   - Uncomment the code that saves these fields (currently commented out)

2. **Test the upload**:
   - Upload a JSON file with table, graph, extract, and diagram questions
   - Verify that the structured data is saved correctly
   - Check that the editor displays the questions with their structured data

---

## JSON Structure Examples

### tableData Example
```json
{
  "headers": ["Name", "Age", "City"],
  "rows": [
    ["John", "25", "Cape Town"],
    ["Jane", "30", "Johannesburg"]
  ],
  "description": "Student information table"
}
```

### graphData Example
```json
{
  "type": "line",
  "xAxisLabel": "Time (months)",
  "yAxisLabel": "Temperature (°C)",
  "dataPoints": [
    { "label": "Jan", "value": 20 },
    { "label": "Feb", "value": 22 },
    { "label": "Mar", "value": 25 }
  ],
  "showLegend": true,
  "showGrid": true
}
```

### coordinateSystem Example
```json
{
  "xMin": 0,
  "xMax": 100,
  "yMin": 0,
  "yMax": 50
}
```

---

## Troubleshooting

### Error: "Unknown attribute"
- **Cause**: Attribute doesn't exist in the schema
- **Solution**: Add the missing attribute following the steps above

### Error: "Invalid document structure"
- **Cause**: Trying to save a field that doesn't exist or has wrong type
- **Solution**: Verify the attribute exists and has the correct type

### Data not saving
- **Cause**: Field might be filtered out or not in allowed list
- **Solution**: Update the `filterQuestionData` function to include the new fields

---

## Summary

Add these **10 new attributes** to the `questions` collection:

1. ✅ `tableData` (String, 32767)
2. ✅ `graphData` (String, 32767)
3. ✅ `extractText` (String, 32767)
4. ✅ `diagramLabel` (String, 500)
5. ✅ `coordinateSystem` (String, 1000)
6. ✅ `tableSubject` (String, 255)
7. ✅ `tableType` (String, 100)
8. ✅ `graphSubject` (String, 255)
9. ✅ `graphType` (String, 100)
10. ✅ `instructionText` (String, 1000)

All attributes should be:
- **Required**: No
- **Array**: No
- **Indexed**: No (unless specified)
- **Default**: Leave empty

After adding these attributes, update the code to save structured data and test the upload functionality.


