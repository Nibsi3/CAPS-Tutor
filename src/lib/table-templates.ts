export interface TableTemplate {
  headers: string[];
  rows: string[][];
  description?: string;
}

export interface SubjectTableTypes {
  [subject: string]: {
    [tableType: string]: TableTemplate;
  };
}

// Table templates for each subject and table type
export const TABLE_TEMPLATES: SubjectTableTypes = {
  'Mathematics': {
    'Data table': {
      headers: ['Category', 'Value'],
      rows: [
        ['', ''],
        ['', ''],
        ['', ''],
      ],
      description: 'Data table',
    },
    'Function table': {
      headers: ['x', 'f(x)'],
      rows: [
        ['-2', ''],
        ['-1', ''],
        ['0', ''],
        ['1', ''],
        ['2', ''],
      ],
      description: 'Function table',
    },
    'Statistical table': {
      headers: ['Class Interval', 'Frequency'],
      rows: [
        ['0-10', ''],
        ['10-20', ''],
        ['20-30', ''],
        ['30-40', ''],
        ['40-50', ''],
      ],
      description: 'Statistical frequency table',
    },
    'Comparison table': {
      headers: ['Item', 'Value 1', 'Value 2'],
      rows: [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ],
      description: 'Comparison table',
    },
    'Matrix table': {
      headers: ['', 'Column 1', 'Column 2', 'Column 3'],
      rows: [
        ['Row 1', '', '', ''],
        ['Row 2', '', '', ''],
        ['Row 3', '', '', ''],
      ],
      description: 'Matrix table',
    },
    'Truth table': {
      headers: ['p', 'q', 'p ∧ q'],
      rows: [
        ['T', 'T', ''],
        ['T', 'F', ''],
        ['F', 'T', ''],
        ['F', 'F', ''],
      ],
      description: 'Truth table',
    },
  },
  'Mathematical Literacy': {
    'Data table': {
      headers: ['Category', 'Value'],
      rows: [
        ['', ''],
        ['', ''],
        ['', ''],
      ],
      description: 'Data table',
    },
    'Financial table': {
      headers: ['Item', 'Amount (R)'],
      rows: [
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
      ],
      description: 'Financial table',
    },
    'Budget table': {
      headers: ['Category', 'Budgeted', 'Actual', 'Difference'],
      rows: [
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
      ],
      description: 'Budget table',
    },
    'Conversion table': {
      headers: ['Unit 1', 'Unit 2'],
      rows: [
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
      ],
      description: 'Unit conversion table',
    },
    'Percentage table': {
      headers: ['Item', 'Percentage', 'Value'],
      rows: [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ],
      description: 'Percentage table',
    },
    'Statistical table': {
      headers: ['Category', 'Frequency', 'Percentage'],
      rows: [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ],
      description: 'Statistical frequency table',
    },
  },
  'Physical Sciences': {
    'Experimental data table': {
      headers: ['Trial', 'Independent Variable', 'Dependent Variable'],
      rows: [
        ['1', '', ''],
        ['2', '', ''],
        ['3', '', ''],
        ['4', '', ''],
      ],
      description: 'Experimental data table',
    },
    'Periodic table (excerpt)': {
      headers: ['Element', 'Symbol', 'Atomic Number', 'Atomic Mass'],
      rows: [
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
      ],
      description: 'Periodic table excerpt',
    },
    'Reaction table': {
      headers: ['Reactant', 'Product', 'Coefficient'],
      rows: [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ],
      description: 'Chemical reaction table',
    },
    'Physical properties table': {
      headers: ['Property', 'Value', 'Unit'],
      rows: [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ],
      description: 'Physical properties table',
    },
    'Kinematic data table': {
      headers: ['Time (s)', 'Position (m)', 'Velocity (m/s)', 'Acceleration (m/s²)'],
      rows: [
        ['0', '', '', ''],
        ['1', '', '', ''],
        ['2', '', '', ''],
        ['3', '', '', ''],
      ],
      description: 'Kinematic data table',
    },
    'Energy table': {
      headers: ['Type', 'Value', 'Unit'],
      rows: [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ],
      description: 'Energy values table',
    },
  },
  'Life Sciences': {
    'Data table': {
      headers: ['Category', 'Value'],
      rows: [
        ['', ''],
        ['', ''],
        ['', ''],
      ],
      description: 'Data table',
    },
    'Classification table': {
      headers: ['Organism', 'Kingdom', 'Phylum', 'Class'],
      rows: [
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
      ],
      description: 'Biological classification table',
    },
    'Comparison table': {
      headers: ['Feature', 'Organism 1', 'Organism 2'],
      rows: [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ],
      description: 'Comparison table',
    },
    'Experimental results table': {
      headers: ['Treatment', 'Result', 'Observation'],
      rows: [
        ['Control', '', ''],
        ['Treatment 1', '', ''],
        ['Treatment 2', '', ''],
      ],
      description: 'Experimental results table',
    },
    'Anatomical structure table': {
      headers: ['Structure', 'Function', 'Location'],
      rows: [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ],
      description: 'Anatomical structure table',
    },
    'Population data table': {
      headers: ['Species', 'Population', 'Year'],
      rows: [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ],
      description: 'Population data table',
    },
  },
  'Geography': {
    'Climate data table': {
      headers: ['Month', 'Temperature (°C)', 'Rainfall (mm)'],
      rows: [
        ['Jan', '', ''],
        ['Feb', '', ''],
        ['Mar', '', ''],
        ['Apr', '', ''],
        ['May', '', ''],
        ['Jun', '', ''],
      ],
      description: 'Climate data table',
    },
    'Population table': {
      headers: ['Region', 'Population', 'Density (per km²)'],
      rows: [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ],
      description: 'Population table',
    },
    'Economic data table': {
      headers: ['Sector', 'Contribution (%)', 'Employment (%)'],
      rows: [
        ['Primary', '', ''],
        ['Secondary', '', ''],
        ['Tertiary', '', ''],
      ],
      description: 'Economic sector table',
    },
    'Geographic features table': {
      headers: ['Feature', 'Location', 'Characteristics'],
      rows: [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ],
      description: 'Geographic features table',
    },
    'Weather data table': {
      headers: ['Date', 'Temperature (°C)', 'Humidity (%)', 'Pressure (hPa)'],
      rows: [
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
      ],
      description: 'Weather data table',
    },
    'Land use table': {
      headers: ['Land Use Type', 'Area (km²)', 'Percentage (%)'],
      rows: [
        ['Agricultural', '', ''],
        ['Urban', '', ''],
        ['Forest', '', ''],
        ['Other', '', ''],
      ],
      description: 'Land use table',
    },
  },
  'History': {
    'Timeline table': {
      headers: ['Year', 'Event', 'Significance'],
      rows: [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ],
      description: 'Timeline table',
    },
    'Comparison table': {
      headers: ['Aspect', 'Period 1', 'Period 2'],
      rows: [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ],
      description: 'Historical comparison table',
    },
    'Chronological table': {
      headers: ['Date', 'Event', 'Location', 'Outcome'],
      rows: [
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
      ],
      description: 'Chronological events table',
    },
    'Causes and effects table': {
      headers: ['Cause', 'Effect', 'Significance'],
      rows: [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ],
      description: 'Causes and effects table',
    },
    'Political leaders table': {
      headers: ['Leader', 'Period', 'Achievements'],
      rows: [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ],
      description: 'Political leaders table',
    },
  },
  'Accounting': {
    'Financial statement table': {
      headers: ['Item', 'Amount (R)'],
      rows: [
        ['Revenue', ''],
        ['Expenses', ''],
        ['Net Income', ''],
      ],
      description: 'Financial statement table',
    },
    'Balance sheet table': {
      headers: ['Account', 'Debit (R)', 'Credit (R)'],
      rows: [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ],
      description: 'Balance sheet table',
    },
    'Income statement table': {
      headers: ['Revenue Item', 'Amount (R)'],
      rows: [
        ['Sales', ''],
        ['Other Income', ''],
        ['Total Revenue', ''],
      ],
      description: 'Income statement table',
    },
    'Expense table': {
      headers: ['Expense Item', 'Amount (R)'],
      rows: [
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
      ],
      description: 'Expense table',
    },
    'Asset table': {
      headers: ['Asset', 'Cost (R)', 'Depreciation (R)', 'Book Value (R)'],
      rows: [
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
      ],
      description: 'Asset depreciation table',
    },
    'Budget comparison table': {
      headers: ['Item', 'Budgeted (R)', 'Actual (R)', 'Variance (R)'],
      rows: [
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
      ],
      description: 'Budget comparison table',
    },
  },
  'Business Studies': {
    'Financial table': {
      headers: ['Item', 'Value'],
      rows: [
        ['', ''],
        ['', ''],
        ['', ''],
      ],
      description: 'Financial table',
    },
    'Market analysis table': {
      headers: ['Market Segment', 'Size', 'Growth (%)', 'Share (%)'],
      rows: [
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
      ],
      description: 'Market analysis table',
    },
    'SWOT analysis table': {
      headers: ['Strengths', 'Weaknesses', 'Opportunities', 'Threats'],
      rows: [
        ['', '', '', ''],
        ['', '', '', ''],
      ],
      description: 'SWOT analysis table',
    },
    'Performance table': {
      headers: ['Metric', 'Target', 'Actual', 'Variance'],
      rows: [
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
      ],
      description: 'Performance metrics table',
    },
    'Organizational structure table': {
      headers: ['Department', 'Manager', 'Employees', 'Budget (R)'],
      rows: [
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
      ],
      description: 'Organizational structure table',
    },
    'Product comparison table': {
      headers: ['Feature', 'Product A', 'Product B', 'Product C'],
      rows: [
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
      ],
      description: 'Product comparison table',
    },
  },
  'Economics': {
    'Economic data table': {
      headers: ['Indicator', 'Value', 'Unit'],
      rows: [
        ['GDP', '', ''],
        ['Inflation', '', ''],
        ['Unemployment', '', ''],
      ],
      description: 'Economic indicators table',
    },
    'Supply and demand table': {
      headers: ['Price', 'Quantity Supplied', 'Quantity Demanded'],
      rows: [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ],
      description: 'Supply and demand table',
    },
    'Market structure table': {
      headers: ['Market Type', 'Characteristics', 'Examples'],
      rows: [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ],
      description: 'Market structure table',
    },
    'Trade table': {
      headers: ['Country', 'Exports (R)', 'Imports (R)', 'Balance (R)'],
      rows: [
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
      ],
      description: 'International trade table',
    },
    'Inflation table': {
      headers: ['Year', 'Inflation Rate (%)', 'CPI'],
      rows: [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ],
      description: 'Inflation data table',
    },
    'Production costs table': {
      headers: ['Input', 'Quantity', 'Cost (R)', 'Total Cost (R)'],
      rows: [
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
      ],
      description: 'Production costs table',
    },
  },
};

// Get available subjects for tables
export function getSubjects(): string[] {
  return Object.keys(TABLE_TEMPLATES);
}

// Get table types for a subject
export function getTableTypesForSubject(subject: string): string[] {
  return Object.keys(TABLE_TEMPLATES[subject] || {});
}

// Get template for a subject and table type
export function getTableTemplate(subject: string, tableType: string): TableTemplate | null {
  return TABLE_TEMPLATES[subject]?.[tableType] || null;
}
