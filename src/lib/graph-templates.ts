export type GraphType = 'line' | 'bar' | 'pie' | 'scatter' | 'histogram' | 'area' | 'dual-axis';

export interface GraphTemplate {
  type: GraphType;
  description?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  y2AxisLabel?: string; // For dual-axis graphs
  dataPoints: Array<{ label: string; value: string | number; value2?: string | number; category?: string }>;
  showLegend?: boolean;
  showGrid?: boolean;
}

export interface GraphTypeConfig {
  name: string;
  template: GraphTemplate;
}

export interface SubjectGraphTypes {
  [subject: string]: {
    [graphType: string]: GraphTemplate;
  };
}

// Graph templates for each subject and graph type
export const GRAPH_TEMPLATES: SubjectGraphTypes = {
  'Mathematics': {
    'Line graph': {
      type: 'line',
      description: 'Line graph',
      xAxisLabel: 'X-axis',
      yAxisLabel: 'Y-axis',
      dataPoints: [
        { label: 'Point 1', value: '' },
        { label: 'Point 2', value: '' },
        { label: 'Point 3', value: '' },
        { label: 'Point 4', value: '' },
      ],
      showLegend: false,
      showGrid: true,
    },
    'Bar graph': {
      type: 'bar',
      description: 'Bar graph',
      xAxisLabel: 'Category',
      yAxisLabel: 'Value',
      dataPoints: [
        { label: 'Category 1', value: '' },
        { label: 'Category 2', value: '' },
        { label: 'Category 3', value: '' },
      ],
      showLegend: false,
      showGrid: true,
    },
    'Pie chart': {
      type: 'pie',
      description: 'Pie chart',
      dataPoints: [
        { label: 'Category 1', value: '' },
        { label: 'Category 2', value: '' },
        { label: 'Category 3', value: '' },
      ],
      showLegend: true,
      showGrid: false,
    },
    'Scatter plot': {
      type: 'scatter',
      description: 'Scatter plot',
      xAxisLabel: 'X-axis',
      yAxisLabel: 'Y-axis',
      dataPoints: [
        { label: 'Point 1', value: '' },
        { label: 'Point 2', value: '' },
        { label: 'Point 3', value: '' },
      ],
      showLegend: false,
      showGrid: true,
    },
    'Histogram': {
      type: 'histogram',
      description: 'Histogram',
      xAxisLabel: 'Class Interval',
      yAxisLabel: 'Frequency',
      dataPoints: [
        { label: '0-10', value: '' },
        { label: '10-20', value: '' },
        { label: '20-30', value: '' },
        { label: '30-40', value: '' },
      ],
      showLegend: false,
      showGrid: true,
    },
    'Function graph': {
      type: 'line',
      description: 'Function graph',
      xAxisLabel: 'x',
      yAxisLabel: 'f(x)',
      dataPoints: [
        { label: '-2', value: '' },
        { label: '-1', value: '' },
        { label: '0', value: '' },
        { label: '1', value: '' },
        { label: '2', value: '' },
      ],
      showLegend: false,
      showGrid: true,
    },
    'Dual-axis graph': {
      type: 'dual-axis',
      description: 'Dual-axis graph',
      xAxisLabel: 'X-axis',
      yAxisLabel: 'Y-axis (Left)',
      y2AxisLabel: 'Y-axis (Right)',
      dataPoints: [
        { label: 'Point 1', value: '', value2: '' },
        { label: 'Point 2', value: '', value2: '' },
        { label: 'Point 3', value: '', value2: '' },
      ],
      showLegend: true,
      showGrid: true,
    },
    'Cartesian Coordinate System': {
      type: 'line',
      description: 'Cartesian coordinate system with interactive plotting',
      xAxisLabel: 'x',
      yAxisLabel: 'y',
      dataPoints: [],
      showLegend: false,
      showGrid: true,
    },
  },
  'Mathematical Literacy': {
    'Line graph': {
      type: 'line',
      description: 'Line graph',
      xAxisLabel: 'X-axis',
      yAxisLabel: 'Y-axis',
      dataPoints: [
        { label: 'Point 1', value: '' },
        { label: 'Point 2', value: '' },
        { label: 'Point 3', value: '' },
        { label: 'Point 4', value: '' },
      ],
      showLegend: false,
      showGrid: true,
    },
    'Bar graph': {
      type: 'bar',
      description: 'Bar graph',
      xAxisLabel: 'Category',
      yAxisLabel: 'Value',
      dataPoints: [
        { label: 'Category 1', value: '' },
        { label: 'Category 2', value: '' },
        { label: 'Category 3', value: '' },
      ],
      showLegend: false,
      showGrid: true,
    },
    'Pie chart': {
      type: 'pie',
      description: 'Pie chart',
      dataPoints: [
        { label: 'Category 1', value: '' },
        { label: 'Category 2', value: '' },
        { label: 'Category 3', value: '' },
      ],
      showLegend: true,
      showGrid: false,
    },
    'Histogram': {
      type: 'histogram',
      description: 'Histogram',
      xAxisLabel: 'Class Interval',
      yAxisLabel: 'Frequency',
      dataPoints: [
        { label: '0-10', value: '' },
        { label: '10-20', value: '' },
        { label: '20-30', value: '' },
        { label: '30-40', value: '' },
      ],
      showLegend: false,
      showGrid: true,
    },
    'Financial graph': {
      type: 'line',
      description: 'Financial graph',
      xAxisLabel: 'Time',
      yAxisLabel: 'Amount (R)',
      dataPoints: [
        { label: 'Month 1', value: '' },
        { label: 'Month 2', value: '' },
        { label: 'Month 3', value: '' },
        { label: 'Month 4', value: '' },
      ],
      showLegend: false,
      showGrid: true,
    },
  },
  'Physical Sciences': {
    'Line graph (experimental data)': {
      type: 'line',
      description: 'Experimental data line graph',
      xAxisLabel: 'Independent Variable',
      yAxisLabel: 'Dependent Variable',
      dataPoints: [
        { label: 'Trial 1', value: '' },
        { label: 'Trial 2', value: '' },
        { label: 'Trial 3', value: '' },
        { label: 'Trial 4', value: '' },
      ],
      showLegend: false,
      showGrid: true,
    },
    'Bar graph (comparison)': {
      type: 'bar',
      description: 'Comparison bar graph',
      xAxisLabel: 'Variable',
      yAxisLabel: 'Value',
      dataPoints: [
        { label: 'Variable 1', value: '' },
        { label: 'Variable 2', value: '' },
        { label: 'Variable 3', value: '' },
      ],
      showLegend: false,
      showGrid: true,
    },
    'Scatter plot (correlation)': {
      type: 'scatter',
      description: 'Correlation scatter plot',
      xAxisLabel: 'Variable 1',
      yAxisLabel: 'Variable 2',
      dataPoints: [
        { label: 'Point 1', value: '' },
        { label: 'Point 2', value: '' },
        { label: 'Point 3', value: '' },
        { label: 'Point 4', value: '' },
      ],
      showLegend: false,
      showGrid: true,
    },
    'Velocity-time graph': {
      type: 'line',
      description: 'Velocity-time graph',
      xAxisLabel: 'Time (s)',
      yAxisLabel: 'Velocity (m/s)',
      dataPoints: [
        { label: '0', value: '' },
        { label: '1', value: '' },
        { label: '2', value: '' },
        { label: '3', value: '' },
      ],
      showLegend: false,
      showGrid: true,
    },
    'Distance-time graph': {
      type: 'line',
      description: 'Distance-time graph',
      xAxisLabel: 'Time (s)',
      yAxisLabel: 'Distance (m)',
      dataPoints: [
        { label: '0', value: '' },
        { label: '1', value: '' },
        { label: '2', value: '' },
        { label: '3', value: '' },
      ],
      showLegend: false,
      showGrid: true,
    },
    'Reaction rate graph': {
      type: 'line',
      description: 'Reaction rate graph',
      xAxisLabel: 'Time (s)',
      yAxisLabel: 'Concentration (mol/dm³)',
      dataPoints: [
        { label: '0', value: '' },
        { label: '10', value: '' },
        { label: '20', value: '' },
        { label: '30', value: '' },
      ],
      showLegend: false,
      showGrid: true,
    },
  },
  'Life Sciences': {
    'Line graph (growth)': {
      type: 'line',
      description: 'Growth line graph',
      xAxisLabel: 'Time',
      yAxisLabel: 'Growth',
      dataPoints: [
        { label: 'Day 1', value: '' },
        { label: 'Day 2', value: '' },
        { label: 'Day 3', value: '' },
        { label: 'Day 4', value: '' },
      ],
      showLegend: false,
      showGrid: true,
    },
    'Bar graph (comparison)': {
      type: 'bar',
      description: 'Comparison bar graph',
      xAxisLabel: 'Category',
      yAxisLabel: 'Value',
      dataPoints: [
        { label: 'Category 1', value: '' },
        { label: 'Category 2', value: '' },
        { label: 'Category 3', value: '' },
      ],
      showLegend: false,
      showGrid: true,
    },
    'Pie chart (distribution)': {
      type: 'pie',
      description: 'Distribution pie chart',
      dataPoints: [
        { label: 'Category 1', value: '' },
        { label: 'Category 2', value: '' },
        { label: 'Category 3', value: '' },
      ],
      showLegend: true,
      showGrid: false,
    },
    'Histogram (frequency)': {
      type: 'histogram',
      description: 'Frequency histogram',
      xAxisLabel: 'Class Interval',
      yAxisLabel: 'Frequency',
      dataPoints: [
        { label: '0-10', value: '' },
        { label: '10-20', value: '' },
        { label: '20-30', value: '' },
        { label: '30-40', value: '' },
      ],
      showLegend: false,
      showGrid: true,
    },
    'Population growth graph': {
      type: 'line',
      description: 'Population growth graph',
      xAxisLabel: 'Time (years)',
      yAxisLabel: 'Population',
      dataPoints: [
        { label: 'Year 1', value: '' },
        { label: 'Year 2', value: '' },
        { label: 'Year 3', value: '' },
        { label: 'Year 4', value: '' },
      ],
      showLegend: false,
      showGrid: true,
    },
  },
  'Geography': {
    'Line graph (temperature)': {
      type: 'line',
      description: 'Temperature line graph',
      xAxisLabel: 'Month',
      yAxisLabel: 'Temperature (°C)',
      dataPoints: [
        { label: 'Jan', value: '' },
        { label: 'Feb', value: '' },
        { label: 'Mar', value: '' },
        { label: 'Apr', value: '' },
      ],
      showLegend: false,
      showGrid: true,
    },
    'Bar graph (rainfall)': {
      type: 'bar',
      description: 'Rainfall bar graph',
      xAxisLabel: 'Month',
      yAxisLabel: 'Rainfall (mm)',
      dataPoints: [
        { label: 'Jan', value: '' },
        { label: 'Feb', value: '' },
        { label: 'Mar', value: '' },
        { label: 'Apr', value: '' },
      ],
      showLegend: false,
      showGrid: true,
    },
    'Dual-axis graph (climate)': {
      type: 'dual-axis',
      description: 'Climate dual-axis graph',
      xAxisLabel: 'Month',
      yAxisLabel: 'Temperature (°C)',
      y2AxisLabel: 'Rainfall (mm)',
      dataPoints: [
        { label: 'Jan', value: '', value2: '' },
        { label: 'Feb', value: '', value2: '' },
        { label: 'Mar', value: '', value2: '' },
        { label: 'Apr', value: '', value2: '' },
      ],
      showLegend: true,
      showGrid: true,
    },
    'Pie chart (land use)': {
      type: 'pie',
      description: 'Land use pie chart',
      dataPoints: [
        { label: 'Agricultural', value: '' },
        { label: 'Urban', value: '' },
        { label: 'Forest', value: '' },
        { label: 'Other', value: '' },
      ],
      showLegend: true,
      showGrid: false,
    },
    'Population pyramid': {
      type: 'bar',
      description: 'Population pyramid',
      xAxisLabel: 'Age Group',
      yAxisLabel: 'Population',
      dataPoints: [
        { label: '0-10', value: '' },
        { label: '11-20', value: '' },
        { label: '21-30', value: '' },
        { label: '31-40', value: '' },
      ],
      showLegend: false,
      showGrid: true,
    },
  },
  'History': {
    'Timeline graph': {
      type: 'line',
      description: 'Timeline graph',
      xAxisLabel: 'Year',
      yAxisLabel: 'Events',
      dataPoints: [
        { label: '1900', value: '' },
        { label: '1920', value: '' },
        { label: '1940', value: '' },
        { label: '1960', value: '' },
      ],
      showLegend: false,
      showGrid: true,
    },
    'Bar graph (comparison)': {
      type: 'bar',
      description: 'Comparison bar graph',
      xAxisLabel: 'Category',
      yAxisLabel: 'Value',
      dataPoints: [
        { label: 'Category 1', value: '' },
        { label: 'Category 2', value: '' },
        { label: 'Category 3', value: '' },
      ],
      showLegend: false,
      showGrid: true,
    },
    'Pie chart (distribution)': {
      type: 'pie',
      description: 'Distribution pie chart',
      dataPoints: [
        { label: 'Category 1', value: '' },
        { label: 'Category 2', value: '' },
        { label: 'Category 3', value: '' },
      ],
      showLegend: true,
      showGrid: false,
    },
  },
  'Accounting': {
    'Bar graph (financial)': {
      type: 'bar',
      description: 'Financial bar graph',
      xAxisLabel: 'Category',
      yAxisLabel: 'Amount (R)',
      dataPoints: [
        { label: 'Revenue', value: '' },
        { label: 'Expenses', value: '' },
        { label: 'Profit', value: '' },
      ],
      showLegend: false,
      showGrid: true,
    },
    'Line graph (trends)': {
      type: 'line',
      description: 'Financial trends line graph',
      xAxisLabel: 'Month',
      yAxisLabel: 'Amount (R)',
      dataPoints: [
        { label: 'Jan', value: '' },
        { label: 'Feb', value: '' },
        { label: 'Mar', value: '' },
        { label: 'Apr', value: '' },
      ],
      showLegend: false,
      showGrid: true,
    },
    'Pie chart (breakdown)': {
      type: 'pie',
      description: 'Financial breakdown pie chart',
      dataPoints: [
        { label: 'Category 1', value: '' },
        { label: 'Category 2', value: '' },
        { label: 'Category 3', value: '' },
      ],
      showLegend: true,
      showGrid: false,
    },
  },
  'Business Studies': {
    'Bar graph (comparison)': {
      type: 'bar',
      description: 'Comparison bar graph',
      xAxisLabel: 'Category',
      yAxisLabel: 'Value',
      dataPoints: [
        { label: 'Category 1', value: '' },
        { label: 'Category 2', value: '' },
        { label: 'Category 3', value: '' },
      ],
      showLegend: false,
      showGrid: true,
    },
    'Line graph (trends)': {
      type: 'line',
      description: 'Trends line graph',
      xAxisLabel: 'Time',
      yAxisLabel: 'Value',
      dataPoints: [
        { label: 'Period 1', value: '' },
        { label: 'Period 2', value: '' },
        { label: 'Period 3', value: '' },
        { label: 'Period 4', value: '' },
      ],
      showLegend: false,
      showGrid: true,
    },
    'Pie chart (market share)': {
      type: 'pie',
      description: 'Market share pie chart',
      dataPoints: [
        { label: 'Company 1', value: '' },
        { label: 'Company 2', value: '' },
        { label: 'Company 3', value: '' },
      ],
      showLegend: true,
      showGrid: false,
    },
  },
  'Economics': {
    'Supply and demand graph': {
      type: 'line',
      description: 'Supply and demand graph',
      xAxisLabel: 'Quantity',
      yAxisLabel: 'Price',
      dataPoints: [
        { label: 'Point 1', value: '' },
        { label: 'Point 2', value: '' },
        { label: 'Point 3', value: '' },
        { label: 'Point 4', value: '' },
      ],
      showLegend: true,
      showGrid: true,
    },
    'Bar graph (comparison)': {
      type: 'bar',
      description: 'Comparison bar graph',
      xAxisLabel: 'Category',
      yAxisLabel: 'Value',
      dataPoints: [
        { label: 'Category 1', value: '' },
        { label: 'Category 2', value: '' },
        { label: 'Category 3', value: '' },
      ],
      showLegend: false,
      showGrid: true,
    },
    'Line graph (economic trends)': {
      type: 'line',
      description: 'Economic trends line graph',
      xAxisLabel: 'Time',
      yAxisLabel: 'Value',
      dataPoints: [
        { label: 'Year 1', value: '' },
        { label: 'Year 2', value: '' },
        { label: 'Year 3', value: '' },
        { label: 'Year 4', value: '' },
      ],
      showLegend: false,
      showGrid: true,
    },
    'Pie chart (distribution)': {
      type: 'pie',
      description: 'Distribution pie chart',
      dataPoints: [
        { label: 'Category 1', value: '' },
        { label: 'Category 2', value: '' },
        { label: 'Category 3', value: '' },
      ],
      showLegend: true,
      showGrid: false,
    },
  },
};

// Get available subjects for graphs
export function getGraphSubjects(): string[] {
  return Object.keys(GRAPH_TEMPLATES);
}

// Get graph types for a subject
export function getGraphTypesForSubject(subject: string): string[] {
  return Object.keys(GRAPH_TEMPLATES[subject] || {});
}

// Get template for a subject and graph type
export function getGraphTemplate(subject: string, graphType: string): GraphTemplate | null {
  return GRAPH_TEMPLATES[subject]?.[graphType] || null;
}

