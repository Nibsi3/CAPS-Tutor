# Questions Collection Schema - Quick Reference

## Quick Copy-Paste Guide for Appwrite Console

### Location
- **Console**: https://cloud.appwrite.io/console
- **Project**: CAPS Tutor
- **Database**: capstutor
- **Collection**: questions
- **Tab**: Attributes

---

## Attributes to Add (All Required: No, Array: No, Indexed: No)

| # | Attribute Name | Type | Size | Description |
|---|----------------|------|------|-------------|
| 1 | `tableData` | String | 32767 | JSON string: table structure (headers, rows) |
| 2 | `graphData` | String | 32767 | JSON string: graph/chart data (axis labels, data points) |
| 3 | `extractText` | String | 32767 | Extract/passage text for extract questions |
| 4 | `diagramLabel` | String | 500 | Diagram label/description (e.g., "Figure 1: Heart") |
| 5 | `coordinateSystem` | String | 1000 | JSON string: coordinate system (xMin, xMax, yMin, yMax) |
| 6 | `tableSubject` | String | 255 | Subject/topic for table (e.g., "Sales Data") |
| 7 | `tableType` | String | 100 | Type of table (e.g., "comparison", "data") |
| 8 | `graphSubject` | String | 255 | Subject/topic for graph (e.g., "Temperature Over Time") |
| 9 | `graphType` | String | 100 | Type of graph (e.g., "line", "bar", "pie") |
| 10 | `instructionText` | String | 1000 | Additional instruction text for questions |

---

## Step-by-Step for Each Attribute

### Attribute 1: tableData
```
Type: String
Size: 32767
Required: No
Array: No
Indexed: No
Default: (leave empty)
```

### Attribute 2: graphData
```
Type: String
Size: 32767
Required: No
Array: No
Indexed: No
Default: (leave empty)
```

### Attribute 3: extractText
```
Type: String
Size: 32767
Required: No
Array: No
Indexed: No
Default: (leave empty)
```

### Attribute 4: diagramLabel
```
Type: String
Size: 500
Required: No
Array: No
Indexed: No
Default: (leave empty)
```

### Attribute 5: coordinateSystem
```
Type: String
Size: 1000
Required: No
Array: No
Indexed: No
Default: (leave empty)
```

### Attribute 6: tableSubject
```
Type: String
Size: 255
Required: No
Array: No
Indexed: No
Default: (leave empty)
```

### Attribute 7: tableType
```
Type: String
Size: 100
Required: No
Array: No
Indexed: No
Default: (leave empty)
```

### Attribute 8: graphSubject
```
Type: String
Size: 255
Required: No
Array: No
Indexed: No
Default: (leave empty)
```

### Attribute 9: graphType
```
Type: String
Size: 100
Required: No
Array: No
Indexed: No
Default: (leave empty)
```

### Attribute 10: instructionText
```
Type: String
Size: 1000
Required: No
Array: No
Indexed: No
Default: (leave empty)
```

---

## Verification Checklist

After adding all attributes, verify:

- [ ] All 10 attributes are present in the Attributes tab
- [ ] All attributes have Type: String
- [ ] All attributes have Required: No
- [ ] All attributes have Array: No
- [ ] All attributes have Indexed: No
- [ ] All attributes have correct Size values
- [ ] Attribute names match exactly (case-sensitive)

---

## After Adding Attributes

1. **Update Code**: Remove the new attributes from the filter exclusion list in `upload-json/route.ts`
2. **Uncomment Code**: Uncomment the code that saves structured data
3. **Test Upload**: Upload a JSON file and verify structured data is saved
4. **Check Editor**: Verify questions display correctly with structured data

---

## Common Issues

### Issue: "Unknown attribute" error
**Solution**: Make sure the attribute name matches exactly (case-sensitive)

### Issue: Data too long
**Solution**: Check the Size limit (32767 for large JSON fields)

### Issue: JSON parsing error
**Solution**: Ensure tableData and graphData are valid JSON strings

---

## Need Help?

Refer to the detailed guide: `QUESTIONS_COLLECTION_SCHEMA_ADDITIONS.md`


