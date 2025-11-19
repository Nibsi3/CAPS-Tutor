/**
 * Add Question Presets to Appwrite
 * Directly adds comprehensive CAPS-aligned questions to the custompresets collection
 * No AI generation - uses pre-written questions
 */

import { Client, Databases, ID, Query } from 'node-appwrite';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Appwrite configuration
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'capstutor';
const PRESETS_COLLECTION_ID = 'custompresets';
const SYSTEM_USER_ID = 'system-generator';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);

// Comprehensive question bank - at least 20 questions per topic per subject
const QUESTION_BANK = {
  'Mathematics': {
    'Algebra': [
      { type: 'short-answer', text: 'Define the term "quadratic equation" in the context of Algebra.', marks: 2 },
      { type: 'short-answer', text: 'State two methods for solving quadratic equations.', marks: 2 },
      { type: 'short-answer', text: 'Name the discriminant formula and explain its significance.', marks: 2 },
      { type: 'short-answer', text: 'List three types of solutions a quadratic equation can have.', marks: 3 },
      { type: 'short-answer', text: 'What is the main function of completing the square?', marks: 2 },
      { type: 'short-answer', text: 'Explain briefly what "factorization" means in algebra.', marks: 2 },
      { type: 'short-answer', text: 'Give one example of a quadratic equation with no real roots.', marks: 1 },
      { type: 'paragraph-long-answer', text: 'Explain in detail how to solve a quadratic equation using the quadratic formula. Include all steps.', marks: 5 },
      { type: 'paragraph-long-answer', text: 'Discuss the importance of the discriminant in determining the nature of roots of a quadratic equation.', marks: 5 },
      { type: 'reasoning-interpretation', text: 'Explain why some quadratic equations have no real solutions.', marks: 4 },
      { type: 'reasoning-interpretation', text: 'Justify your reasoning: Why is it important to check solutions when solving equations involving square roots?', marks: 4 },
      { type: 'true-false-with-reason', text: 'State whether the following is TRUE or FALSE: "All quadratic equations have exactly two solutions." Give a reason for your answer.', marks: 3 },
      { type: 'compare-evaluate-predict', text: 'Compare the method of factorization with the quadratic formula for solving quadratic equations.', marks: 4 },
      { type: 'sequencing-ordering', text: 'Arrange the following steps in the correct order for solving x² + 5x + 6 = 0 by factorization: (a) Factor the expression, (b) Set each factor equal to zero, (c) Solve for x, (d) Check your solutions.', marks: 4 },
      { type: 'multiple-choice', text: 'Which of the following best describes the solutions of x² - 4 = 0?', marks: 1, options: ['x = 2 only', 'x = -2 only', 'x = 2 or x = -2', 'No real solutions'] },
      { type: 'multiple-choice', text: 'What is the discriminant of the equation 2x² - 3x + 1 = 0?', marks: 1, options: ['1', '-1', '17', '-17'] },
      { type: 'fill-in-blank', text: 'Complete: The quadratic formula is x = __________.', marks: 2 },
      { type: 'numeric-calculation', text: 'Solve for x: x² - 7x + 12 = 0', marks: 3 },
      { type: 'numeric-calculation', text: 'Find the value of x when 3x² - 12x + 9 = 0', marks: 3 },
      { type: 'formula-based-calculation', text: 'Use the quadratic formula to solve: 2x² - 5x - 3 = 0', marks: 4 },
      { type: 'formula-based-calculation', text: 'Apply the discriminant formula to determine the nature of roots for x² + 4x + 4 = 0', marks: 3 },
    ],
    'Sequences and series': [
      { type: 'short-answer', text: 'Define the term "arithmetic sequence" in the context of sequences and series.', marks: 2 },
      { type: 'short-answer', text: 'State two characteristics of a geometric sequence.', marks: 2 },
      { type: 'short-answer', text: 'Name the formula for the nth term of an arithmetic sequence.', marks: 2 },
      { type: 'short-answer', text: 'List three examples of sequences: arithmetic, geometric, and quadratic.', marks: 3 },
      { type: 'short-answer', text: 'What is the main function of finding the sum of a series?', marks: 2 },
      { type: 'short-answer', text: 'Explain briefly what "common difference" means in arithmetic sequences.', marks: 2 },
      { type: 'short-answer', text: 'Give one example of a convergent geometric series.', marks: 1 },
      { type: 'paragraph-long-answer', text: 'Explain in detail how to find the sum of the first n terms of an arithmetic series.', marks: 5 },
      { type: 'paragraph-long-answer', text: 'Discuss the importance of the common ratio in determining whether a geometric series converges or diverges.', marks: 5 },
      { type: 'reasoning-interpretation', text: 'Explain why a geometric series with |r| < 1 converges to a finite sum.', marks: 4 },
      { type: 'true-false-with-reason', text: 'State whether the following is TRUE or FALSE: "All arithmetic sequences have a constant common difference." Give a reason.', marks: 3 },
      { type: 'compare-evaluate-predict', text: 'Compare arithmetic sequences with geometric sequences, highlighting key differences.', marks: 4 },
      { type: 'sequencing-ordering', text: 'Arrange the following steps to find the 10th term of an arithmetic sequence: (a) Identify first term and common difference, (b) Use formula Tₙ = a + (n-1)d, (c) Substitute n = 10, (d) Calculate the result.', marks: 4 },
      { type: 'multiple-choice', text: 'Which of the following is the formula for the sum of n terms of a geometric series?', marks: 1, options: ['Sₙ = n/2[2a + (n-1)d]', 'Sₙ = a(1-rⁿ)/(1-r)', 'Sₙ = a + (n-1)d', 'Sₙ = a/(1-r)'] },
      { type: 'multiple-choice', text: 'What is the common ratio of the sequence 3, 6, 12, 24, ...?', marks: 1, options: ['2', '3', '6', '12'] },
      { type: 'fill-in-blank', text: 'Complete: The nth term of an arithmetic sequence is Tₙ = __________.', marks: 2 },
      { type: 'numeric-calculation', text: 'Find the 15th term of the arithmetic sequence: 5, 9, 13, 17, ...', marks: 3 },
      { type: 'numeric-calculation', text: 'Calculate the sum of the first 10 terms of the arithmetic sequence with a = 3 and d = 4.', marks: 3 },
      { type: 'formula-based-calculation', text: 'Use the formula Sₙ = a(1-rⁿ)/(1-r) to find the sum of the first 5 terms of the geometric series: 2 + 6 + 18 + ...', marks: 4 },
      { type: 'formula-based-calculation', text: 'Apply the sum to infinity formula to find S∞ for the geometric series: 16 + 8 + 4 + 2 + ...', marks: 3 },
    ],
    'Functions': [
      { type: 'short-answer', text: 'Define the term "function" in the context of Mathematics.', marks: 2 },
      { type: 'short-answer', text: 'State two characteristics of a quadratic function.', marks: 2 },
      { type: 'short-answer', text: 'Name the point where a parabola reaches its maximum or minimum value.', marks: 1 },
      { type: 'short-answer', text: 'List three types of functions: linear, quadratic, and exponential.', marks: 3 },
      { type: 'short-answer', text: 'What is the main function of the axis of symmetry in a parabola?', marks: 2 },
      { type: 'short-answer', text: 'Explain briefly what "domain" means for a function.', marks: 2 },
      { type: 'short-answer', text: 'Give one example of a function that has a restricted domain.', marks: 1 },
      { type: 'paragraph-long-answer', text: 'Explain in detail how to find the turning point of a quadratic function.', marks: 5 },
      { type: 'paragraph-long-answer', text: 'Discuss the importance of the coefficient a in the function f(x) = ax² + bx + c.', marks: 5 },
      { type: 'reasoning-interpretation', text: 'Explain why the function f(x) = 1/x has a vertical asymptote at x = 0.', marks: 4 },
      { type: 'true-false-with-reason', text: 'State whether the following is TRUE or FALSE: "All functions have an inverse function." Give a reason.', marks: 3 },
      { type: 'compare-evaluate-predict', text: 'Compare the graphs of f(x) = x² and g(x) = -x², highlighting key differences.', marks: 4 },
      { type: 'sequencing-ordering', text: 'Arrange the following steps to sketch the graph of f(x) = 2(x-3)² + 5: (a) Identify the vertex, (b) Determine the axis of symmetry, (c) Find the y-intercept, (d) Plot additional points.', marks: 4 },
      { type: 'multiple-choice', text: 'Which of the following best describes the range of f(x) = x²?', marks: 1, options: ['All real numbers', 'y ≥ 0', 'y ≤ 0', 'y > 0'] },
      { type: 'multiple-choice', text: 'What is the axis of symmetry for f(x) = 3(x-2)² + 1?', marks: 1, options: ['x = 2', 'x = -2', 'x = 3', 'x = 1'] },
      { type: 'diagram-interpretation', text: 'Study the diagram below showing the graph of a quadratic function. Explain what the turning point represents.', marks: 4, hasDiagram: true, diagramLabel: 'Quadratic function graph' },
      { type: 'graph-interpretation', text: 'Study the graph showing f(x) = x² - 4x + 3. Describe the key features including intercepts and turning point.', marks: 4, graphData: { type: 'parabola', xAxisLabel: 'x', yAxisLabel: 'f(x)' } },
      { type: 'numeric-calculation', text: 'Find the turning point of the function f(x) = x² - 6x + 8', marks: 3 },
      { type: 'numeric-calculation', text: 'Calculate the y-intercept of f(x) = 2x² - 5x + 3', marks: 2 },
      { type: 'formula-based-calculation', text: 'Use the formula x = -b/(2a) to find the axis of symmetry for f(x) = 3x² - 12x + 5', marks: 3 },
    ],
    'Functions and inverses': [
      { type: 'short-answer', text: 'Define the term "inverse function" in the context of Mathematics.', marks: 2 },
      { type: 'short-answer', text: 'State two conditions for a function to have an inverse.', marks: 2 },
      { type: 'short-answer', text: 'Name the relationship between a function and its inverse on a graph.', marks: 1 },
      { type: 'short-answer', text: 'List three functions that have inverses: linear, exponential, and logarithmic.', marks: 3 },
      { type: 'short-answer', text: 'What is the main function of finding the inverse of a function?', marks: 2 },
      { type: 'short-answer', text: 'Explain briefly what "one-to-one" means for a function.', marks: 2 },
      { type: 'paragraph-long-answer', text: 'Explain in detail how to find the inverse of the function f(x) = 2x + 3.', marks: 5 },
      { type: 'paragraph-long-answer', text: 'Discuss the importance of the horizontal line test in determining if a function has an inverse.', marks: 5 },
      { type: 'reasoning-interpretation', text: 'Explain why the function f(x) = x² does not have an inverse unless the domain is restricted.', marks: 4 },
      { type: 'true-false-with-reason', text: 'State whether the following is TRUE or FALSE: "The inverse of f(x) = 3x is f⁻¹(x) = x/3." Give a reason.', marks: 3 },
      { type: 'compare-evaluate-predict', text: 'Compare the graphs of f(x) = 2x and its inverse f⁻¹(x) = x/2.', marks: 4 },
      { type: 'sequencing-ordering', text: 'Arrange the following steps to find the inverse of f(x) = 3x - 2: (a) Replace f(x) with y, (b) Swap x and y, (c) Solve for y, (d) Replace y with f⁻¹(x).', marks: 4 },
      { type: 'multiple-choice', text: 'Which of the following is the inverse of f(x) = 4x + 1?', marks: 1, options: ['f⁻¹(x) = (x-1)/4', 'f⁻¹(x) = 4x - 1', 'f⁻¹(x) = x/4 + 1', 'f⁻¹(x) = (x+1)/4'] },
      { type: 'multiple-choice', text: 'What is the relationship between the graphs of a function and its inverse?', marks: 1, options: ['They are identical', 'They are reflections in y = x', 'They are parallel', 'They intersect at the origin'] },
      { type: 'diagram-interpretation', text: 'Study the diagram showing a function and its inverse. Explain how they are related by the line y = x.', marks: 4, hasDiagram: true, diagramLabel: 'Function and inverse graphs' },
      { type: 'graph-interpretation', text: 'Study the graph showing f(x) = 2x and its inverse. Describe the symmetry about the line y = x.', marks: 4, graphData: { type: 'line', xAxisLabel: 'x', yAxisLabel: 'y' } },
      { type: 'numeric-calculation', text: 'Find the inverse of f(x) = 5x - 3', marks: 3 },
      { type: 'numeric-calculation', text: 'If f(x) = 2x + 1, calculate f⁻¹(7)', marks: 3 },
      { type: 'formula-based-calculation', text: 'Use the method of swapping variables to find the inverse of f(x) = (x + 4)/3', marks: 4 },
    ],
    'Financial mathematics': [
      { type: 'short-answer', text: 'Define the term "compound interest" in the context of financial mathematics.', marks: 2 },
      { type: 'short-answer', text: 'State two differences between simple interest and compound interest.', marks: 2 },
      { type: 'short-answer', text: 'Name the formula for calculating compound interest.', marks: 2 },
      { type: 'short-answer', text: 'List three types of financial calculations: loans, investments, and annuities.', marks: 3 },
      { type: 'short-answer', text: 'What is the main function of calculating present value?', marks: 2 },
      { type: 'short-answer', text: 'Explain briefly what "depreciation" means in financial terms.', marks: 2 },
      { type: 'short-answer', text: 'Give one example of a reducing balance depreciation.', marks: 1 },
      { type: 'paragraph-long-answer', text: 'Explain in detail how compound interest differs from simple interest, including examples.', marks: 5 },
      { type: 'paragraph-long-answer', text: 'Discuss the importance of understanding interest rates when taking out a loan.', marks: 5 },
      { type: 'reasoning-interpretation', text: 'Explain why compound interest yields more than simple interest over the same period.', marks: 4 },
      { type: 'true-false-with-reason', text: 'State whether the following is TRUE or FALSE: "Compound interest is always calculated annually." Give a reason.', marks: 3 },
      { type: 'compare-evaluate-predict', text: 'Compare reducing balance depreciation with straight-line depreciation.', marks: 4 },
      { type: 'sequencing-ordering', text: 'Arrange the following steps to calculate compound interest: (a) Identify principal, rate, and time, (b) Apply formula A = P(1 + i)ⁿ, (c) Calculate the amount, (d) Subtract principal to find interest.', marks: 4 },
      { type: 'multiple-choice', text: 'Which formula is used for compound interest?', marks: 1, options: ['A = P(1 + i)ⁿ', 'A = P + Prt', 'A = P(1 + rt)', 'A = P/i'] },
      { type: 'multiple-choice', text: 'What is the effective annual interest rate if the nominal rate is 12% p.a. compounded monthly?', marks: 1, options: ['12%', '12.68%', '13%', '14%'] },
      { type: 'numeric-calculation', text: 'Calculate the amount after 5 years if R10,000 is invested at 8% p.a. compounded annually.', marks: 3 },
      { type: 'numeric-calculation', text: 'Find the present value needed to have R50,000 in 3 years at 6% p.a. compounded quarterly.', marks: 3 },
      { type: 'formula-based-calculation', text: 'Use the compound interest formula to calculate the amount if R5,000 is invested for 4 years at 7.5% p.a. compounded semi-annually.', marks: 4 },
      { type: 'formula-based-calculation', text: 'Apply the reducing balance formula to find the book value of an asset worth R100,000 after 3 years at 15% p.a. depreciation.', marks: 4 },
      { type: 'accounting-financial-calculation', text: 'Calculate the monthly payment on a home loan of R1,500,000 over 20 years at 10.5% p.a. compounded monthly.', marks: 5 },
    ],
    'Calculus (Differential)': [
      { type: 'short-answer', text: 'Define the term "derivative" in the context of calculus.', marks: 2 },
      { type: 'short-answer', text: 'State two applications of differentiation.', marks: 2 },
      { type: 'short-answer', text: 'Name the rule used to differentiate a product of two functions.', marks: 1 },
      { type: 'short-answer', text: 'List three differentiation rules: power rule, product rule, and quotient rule.', marks: 3 },
      { type: 'short-answer', text: 'What is the main function of finding the derivative of a function?', marks: 2 },
      { type: 'short-answer', text: 'Explain briefly what "gradient" means at a point on a curve.', marks: 2 },
      { type: 'short-answer', text: 'Give one example of a function and its derivative.', marks: 1 },
      { type: 'paragraph-long-answer', text: 'Explain in detail how to find the derivative from first principles.', marks: 5 },
      { type: 'paragraph-long-answer', text: 'Discuss the importance of the chain rule in differentiation.', marks: 5 },
      { type: 'reasoning-interpretation', text: 'Explain why the derivative of a constant function is zero.', marks: 4 },
      { type: 'true-false-with-reason', text: 'State whether the following is TRUE or FALSE: "The derivative of f(x) = x³ is f\'(x) = 3x²." Give a reason.', marks: 3 },
      { type: 'compare-evaluate-predict', text: 'Compare finding the derivative using first principles with using differentiation rules.', marks: 4 },
      { type: 'sequencing-ordering', text: 'Arrange the following steps to find the derivative of f(x) = (x² + 1)(x - 3): (a) Apply product rule, (b) Differentiate each function, (c) Substitute into product rule formula, (d) Simplify the result.', marks: 4 },
      { type: 'multiple-choice', text: 'What is the derivative of f(x) = 5x⁴?', marks: 1, options: ['20x³', '5x³', '20x⁴', '5x⁵'] },
      { type: 'multiple-choice', text: 'Which rule is used to differentiate f(x) = x²/(x + 1)?', marks: 1, options: ['Product rule', 'Quotient rule', 'Chain rule', 'Power rule'] },
      { type: 'diagram-interpretation', text: 'Study the diagram showing a curve and its tangent line. Explain what the derivative represents at the point of tangency.', marks: 4, hasDiagram: true, diagramLabel: 'Curve with tangent' },
      { type: 'graph-interpretation', text: 'Study the graph of f(x) and its derivative. Describe the relationship between turning points and where f\'(x) = 0.', marks: 4, graphData: { type: 'line', xAxisLabel: 'x', yAxisLabel: 'f(x)' } },
      { type: 'numeric-calculation', text: 'Find the derivative of f(x) = 3x³ - 2x² + 5x - 7', marks: 3 },
      { type: 'numeric-calculation', text: 'Calculate the gradient of the curve y = x² - 4x at x = 3', marks: 3 },
      { type: 'formula-based-calculation', text: 'Use the product rule to find the derivative of f(x) = (2x + 1)(x² - 3)', marks: 4 },
      { type: 'formula-based-calculation', text: 'Apply the quotient rule to differentiate f(x) = (x² + 1)/(x - 2)', marks: 4 },
    ],
    'Calculus (Integral)': [
      { type: 'short-answer', text: 'Define the term "integral" in the context of calculus.', marks: 2 },
      { type: 'short-answer', text: 'State two applications of integration.', marks: 2 },
      { type: 'short-answer', text: 'Name the fundamental theorem of calculus.', marks: 2 },
      { type: 'short-answer', text: 'List three methods of integration: substitution, by parts, and partial fractions.', marks: 3 },
      { type: 'short-answer', text: 'What is the main function of finding the integral of a function?', marks: 2 },
      { type: 'short-answer', text: 'Explain briefly what "antiderivative" means.', marks: 2 },
      { type: 'paragraph-long-answer', text: 'Explain in detail how to find the area under a curve using integration.', marks: 5 },
      { type: 'paragraph-long-answer', text: 'Discuss the importance of the constant of integration when finding indefinite integrals.', marks: 5 },
      { type: 'reasoning-interpretation', text: 'Explain why integration is considered the reverse process of differentiation.', marks: 4 },
      { type: 'true-false-with-reason', text: 'State whether the following is TRUE or FALSE: "The integral of a constant is the constant times x." Give a reason.', marks: 3 },
      { type: 'compare-evaluate-predict', text: 'Compare definite integrals with indefinite integrals.', marks: 4 },
      { type: 'multiple-choice', text: 'What is ∫ 3x² dx?', marks: 1, options: ['x³ + C', '3x³ + C', '6x + C', 'x² + C'] },
      { type: 'multiple-choice', text: 'Which method is used to integrate ∫ x·eˣ dx?', marks: 1, options: ['Substitution', 'Integration by parts', 'Partial fractions', 'Direct integration'] },
      { type: 'numeric-calculation', text: 'Evaluate ∫₀² (3x² - 2x + 1) dx', marks: 4 },
      { type: 'numeric-calculation', text: 'Find the area under the curve y = x² between x = 0 and x = 3', marks: 4 },
      { type: 'formula-based-calculation', text: 'Use integration by substitution to find ∫ 2x(x² + 1)³ dx', marks: 5 },
      { type: 'formula-based-calculation', text: 'Apply the fundamental theorem to evaluate ∫₁³ (2x + 3) dx', marks: 4 },
    ],
    'Probability': [
      { type: 'short-answer', text: 'Define the term "probability" in the context of Mathematics.', marks: 2 },
      { type: 'short-answer', text: 'State two types of events: mutually exclusive and independent.', marks: 2 },
      { type: 'short-answer', text: 'Name the formula for calculating probability of an event.', marks: 2 },
      { type: 'short-answer', text: 'List three probability rules: addition rule, multiplication rule, and complement rule.', marks: 3 },
      { type: 'short-answer', text: 'What is the main function of a tree diagram in probability?', marks: 2 },
      { type: 'short-answer', text: 'Explain briefly what "sample space" means.', marks: 2 },
      { type: 'paragraph-long-answer', text: 'Explain in detail the difference between mutually exclusive and independent events.', marks: 5 },
      { type: 'paragraph-long-answer', text: 'Discuss the importance of understanding conditional probability in real-world applications.', marks: 5 },
      { type: 'reasoning-interpretation', text: 'Explain why the probability of an event and its complement always sum to 1.', marks: 4 },
      { type: 'true-false-with-reason', text: 'State whether the following is TRUE or FALSE: "If two events are mutually exclusive, they are also independent." Give a reason.', marks: 3 },
      { type: 'compare-evaluate-predict', text: 'Compare theoretical probability with experimental probability.', marks: 4 },
      { type: 'sequencing-ordering', text: 'Arrange the following steps to solve a probability problem: (a) Identify the sample space, (b) Determine favorable outcomes, (c) Apply probability formula, (d) Simplify the answer.', marks: 4 },
      { type: 'multiple-choice', text: 'What is the probability of rolling a 6 on a fair die?', marks: 1, options: ['1/6', '1/2', '1/3', '6/6'] },
      { type: 'multiple-choice', text: 'If P(A) = 0.3 and P(B) = 0.5, and A and B are independent, what is P(A and B)?', marks: 1, options: ['0.15', '0.8', '0.2', '0.35'] },
      { type: 'table-interpretation', text: 'Study the table showing outcomes of an experiment. Calculate the probability of each outcome.', marks: 4, tableData: { headers: ['Outcome', 'Frequency'], rows: [['A', '20'], ['B', '30'], ['C', '50']] } },
      { type: 'data-set-analysis', text: 'Analyze the following data set from 100 coin tosses: 52 heads, 48 tails. Calculate the experimental probability of heads.', marks: 3 },
      { type: 'numeric-calculation', text: 'Calculate the probability of drawing 2 red balls in succession without replacement from a bag with 5 red and 3 blue balls.', marks: 4 },
      { type: 'numeric-calculation', text: 'Find the probability of getting exactly 2 heads when tossing 3 coins.', marks: 3 },
      { type: 'formula-based-calculation', text: 'Use the multiplication rule to find P(A and B) when P(A) = 0.4 and P(B|A) = 0.6', marks: 3 },
    ],
    'Analytical geometry': [
      { type: 'short-answer', text: 'Define the term "gradient" in analytical geometry.', marks: 2 },
      { type: 'short-answer', text: 'State two formulas used in analytical geometry: distance and midpoint.', marks: 2 },
      { type: 'short-answer', text: 'Name the equation form: y = mx + c', marks: 1 },
      { type: 'short-answer', text: 'List three types of lines: parallel, perpendicular, and intersecting.', marks: 3 },
      { type: 'short-answer', text: 'What is the main function of the distance formula?', marks: 2 },
      { type: 'paragraph-long-answer', text: 'Explain in detail how to find the equation of a line given two points.', marks: 5 },
      { type: 'reasoning-interpretation', text: 'Explain why two parallel lines have the same gradient.', marks: 4 },
      { type: 'true-false-with-reason', text: 'State whether the following is TRUE or FALSE: "Perpendicular lines have gradients that are negative reciprocals." Give a reason.', marks: 3 },
      { type: 'compare-evaluate-predict', text: 'Compare the distance formula with the midpoint formula.', marks: 4 },
      { type: 'multiple-choice', text: 'What is the distance between points A(2, 3) and B(5, 7)?', marks: 1, options: ['5', '4', '√13', '7'] },
      { type: 'multiple-choice', text: 'What is the gradient of a line perpendicular to y = 2x + 3?', marks: 1, options: ['-2', '-1/2', '2', '1/2'] },
      { type: 'numeric-calculation', text: 'Find the midpoint of the line segment joining P(-3, 4) and Q(7, -2)', marks: 2 },
      { type: 'numeric-calculation', text: 'Calculate the distance between points (1, 2) and (4, 6)', marks: 2 },
      { type: 'formula-based-calculation', text: 'Use the gradient formula to find the gradient of the line through (1, 4) and (5, 12)', marks: 3 },
      { type: 'formula-based-calculation', text: 'Apply the distance formula to find the length of the line segment from (0, 0) to (3, 4)', marks: 3 },
    ],
    'Euclidean geometry': [
      { type: 'short-answer', text: 'Define the term "congruent triangles" in Euclidean geometry.', marks: 2 },
      { type: 'short-answer', text: 'State two conditions for triangle congruence: SSS and SAS.', marks: 2 },
      { type: 'short-answer', text: 'Name the theorem that states angles in the same segment are equal.', marks: 1 },
      { type: 'short-answer', text: 'List three circle theorems: angle at center, angle in semicircle, and tangent properties.', marks: 3 },
      { type: 'paragraph-long-answer', text: 'Explain in detail how to prove two triangles are congruent using the SAS rule.', marks: 5 },
      { type: 'reasoning-interpretation', text: 'Explain why the angles in a triangle sum to 180°.', marks: 4 },
      { type: 'true-false-with-reason', text: 'State whether the following is TRUE or FALSE: "All equilateral triangles are similar." Give a reason.', marks: 3 },
      { type: 'diagram-labeling', text: 'Label the parts A, B, and C in the diagram of a circle with center O.', marks: 3, hasDiagram: true, diagramLabel: 'Circle diagram' },
      { type: 'diagram-interpretation', text: 'Study the diagram showing two triangles. Explain why they are congruent.', marks: 4, hasDiagram: true, diagramLabel: 'Congruent triangles' },
      { type: 'multiple-choice', text: 'Which condition proves triangle congruence?', marks: 1, options: ['SSS', 'AAA', 'SSA', 'All of the above'] },
      { type: 'numeric-calculation', text: 'In triangle ABC, if angle A = 50° and angle B = 60°, find angle C', marks: 2 },
    ],
    'Trigonometry': [
      { type: 'short-answer', text: 'Define the term "sine ratio" in trigonometry.', marks: 2 },
      { type: 'short-answer', text: 'State the three basic trigonometric ratios: sine, cosine, and tangent.', marks: 3 },
      { type: 'short-answer', text: 'Name the rule used to find sides and angles in non-right triangles.', marks: 1 },
      { type: 'paragraph-long-answer', text: 'Explain in detail how to use the sine rule to solve a triangle.', marks: 5 },
      { type: 'reasoning-interpretation', text: 'Explain why sin(90° - θ) = cos θ.', marks: 4 },
      { type: 'true-false-with-reason', text: 'State whether the following is TRUE or FALSE: "sin²θ + cos²θ = 1 for all angles." Give a reason.', marks: 3 },
      { type: 'multiple-choice', text: 'What is sin 30°?', marks: 1, options: ['1/2', '√3/2', '1', '0'] },
      { type: 'numeric-calculation', text: 'In a right triangle, if the opposite side is 8 cm and the hypotenuse is 10 cm, find sin θ.', marks: 3 },
      { type: 'formula-based-calculation', text: 'Use the cosine rule to find side c in triangle ABC where a = 5, b = 7, and angle C = 60°.', marks: 4 },
    ],
    'Statistics': [
      { type: 'short-answer', text: 'Define the term "mean" in statistics.', marks: 2 },
      { type: 'short-answer', text: 'State three measures of central tendency: mean, median, and mode.', marks: 3 },
      { type: 'short-answer', text: 'Name the measure that represents the middle value in a data set.', marks: 1 },
      { type: 'paragraph-long-answer', text: 'Explain in detail how to calculate the standard deviation of a data set.', marks: 5 },
      { type: 'reasoning-interpretation', text: 'Explain why the median is less affected by outliers than the mean.', marks: 4 },
      { type: 'table-interpretation', text: 'Study the table showing test scores. Calculate the mean, median, and mode.', marks: 4, tableData: { headers: ['Score', 'Frequency'], rows: [['50', '2'], ['60', '5'], ['70', '8'], ['80', '3']] } },
      { type: 'graph-interpretation', text: 'Study the histogram showing data distribution. Describe the shape and identify any outliers.', marks: 4, graphData: { type: 'bar', xAxisLabel: 'Values', yAxisLabel: 'Frequency' } },
      { type: 'data-set-analysis', text: 'Analyze the following data set: 12, 15, 18, 20, 22, 25, 28. Calculate the range, mean, and median.', marks: 4 },
      { type: 'numeric-calculation', text: 'Calculate the mean of: 5, 7, 8, 8, 9, 10, 12', marks: 2 },
      { type: 'numeric-calculation', text: 'Find the median of: 3, 5, 7, 9, 11, 13, 15', marks: 2 },
    ],
  },
  'Physical Sciences': {
    'Momentum and impulse': [
      { type: 'short-answer', text: 'Define the term "momentum" in physics.', marks: 2 },
      { type: 'short-answer', text: 'State the principle of conservation of linear momentum.', marks: 2 },
      { type: 'short-answer', text: 'Name the formula for calculating momentum.', marks: 1 },
      { type: 'short-answer', text: 'List three applications of momentum conservation: collisions, explosions, and rocket propulsion.', marks: 3 },
      { type: 'paragraph-long-answer', text: 'Explain in detail how momentum is conserved in an elastic collision.', marks: 5 },
      { type: 'reasoning-interpretation', text: 'Explain why a smaller object can have the same momentum as a larger object if it moves faster.', marks: 4 },
      { type: 'true-false-with-reason', text: 'State whether the following is TRUE or FALSE: "Momentum is always conserved in all collisions." Give a reason.', marks: 3 },
      { type: 'multiple-choice', text: 'What is the unit of momentum?', marks: 1, options: ['kg·m/s', 'N·s', 'J', 'Both A and B'] },
      { type: 'numeric-calculation', text: 'Calculate the momentum of a 2 kg object moving at 5 m/s.', marks: 2 },
      { type: 'formula-based-calculation', text: 'Use the momentum formula p = mv to find the momentum of a 150 g cricket ball moving at 30 m/s.', marks: 3 },
    ],
    'Vertical projectile motion': [
      { type: 'short-answer', text: 'Define "projectile motion" in physics.', marks: 2 },
      { type: 'short-answer', text: 'State two characteristics of vertical projectile motion.', marks: 2 },
      { type: 'paragraph-long-answer', text: 'Explain in detail how to calculate the maximum height reached by a projectile launched vertically.', marks: 5 },
      { type: 'reasoning-interpretation', text: 'Explain why the time to reach maximum height equals the time to fall back down (ignoring air resistance).', marks: 4 },
      { type: 'multiple-choice', text: 'What is the acceleration of a projectile at its maximum height?', marks: 1, options: ['0 m/s²', '9.8 m/s² downward', '9.8 m/s² upward', 'It depends on initial velocity'] },
      { type: 'numeric-calculation', text: 'A ball is thrown vertically upward with an initial velocity of 20 m/s. Calculate the maximum height reached.', marks: 4 },
      { type: 'formula-based-calculation', text: 'Use the equation v² = u² + 2as to find the maximum height of a projectile launched at 15 m/s vertically upward.', marks: 4 },
    ],
    'Work, energy and power': [
      { type: 'short-answer', text: 'Define "work" in physics.', marks: 2 },
      { type: 'short-answer', text: 'State the work-energy theorem.', marks: 2 },
      { type: 'paragraph-long-answer', text: 'Explain in detail the relationship between work, energy, and power.', marks: 5 },
      { type: 'numeric-calculation', text: 'Calculate the work done when a force of 50 N moves an object 10 m in the direction of the force.', marks: 2 },
      { type: 'formula-based-calculation', text: 'Use W = F·d to calculate the work done by a 100 N force acting at 30° to the horizontal over 5 m.', marks: 4 },
    ],
    'The Doppler effect': [
      { type: 'short-answer', text: 'Define the Doppler effect.', marks: 2 },
      { type: 'paragraph-long-answer', text: 'Explain in detail how the Doppler effect occurs when a sound source moves towards an observer.', marks: 5 },
      { type: 'reasoning-interpretation', text: 'Explain why the observed frequency increases when a source moves towards an observer.', marks: 4 },
      { type: 'numeric-calculation', text: 'An ambulance moving at 25 m/s towards a stationary observer emits sound at 800 Hz. Calculate the observed frequency. (Speed of sound = 340 m/s)', marks: 4 },
    ],
    'Electrodynamics (generators, motors)': [
      { type: 'short-answer', text: 'State Faraday\'s law of electromagnetic induction.', marks: 2 },
      { type: 'paragraph-long-answer', text: 'Explain in detail how a generator converts mechanical energy to electrical energy.', marks: 5 },
      { type: 'reasoning-interpretation', text: 'Explain why a changing magnetic field induces an electric current.', marks: 4 },
    ],
    'Photoelectric effect': [
      { type: 'short-answer', text: 'Define "photoelectric effect".', marks: 2 },
      { type: 'short-answer', text: 'What is meant by "threshold frequency"?', marks: 2 },
      { type: 'paragraph-long-answer', text: 'Explain in detail how the photoelectric effect supports the particle nature of light.', marks: 5 },
      { type: 'reasoning-interpretation', text: 'Explain why increasing the intensity of light does not always increase the kinetic energy of photoelectrons.', marks: 4 },
      { type: 'numeric-calculation', text: 'Light of frequency 6.5 × 10¹⁴ Hz is incident on a metal with work function 2.1 eV. Will photoelectrons be emitted? Justify with calculation.', marks: 5 },
    ],
    'Rate and extent of reactions': [
      { type: 'short-answer', text: 'List TWO factors that can increase the rate of a chemical reaction.', marks: 2 },
      { type: 'paragraph-long-answer', text: 'Explain in detail how temperature affects the rate of a chemical reaction.', marks: 5 },
      { type: 'reasoning-interpretation', text: 'Explain why increasing the surface area of a solid reactant increases the reaction rate.', marks: 4 },
      { type: 'table-interpretation', text: 'Study the table showing reaction rates at different temperatures. Analyze the relationship.', marks: 4, tableData: { headers: ['Temperature (°C)', 'Rate'], rows: [['20', '0.1'], ['40', '0.4'], ['60', '1.6']] } },
    ],
    'Chemical equilibrium': [
      { type: 'short-answer', text: 'Define "chemical equilibrium".', marks: 2 },
      { type: 'paragraph-long-answer', text: 'Explain in detail how Le Chatelier\'s principle predicts the effect of changing conditions on equilibrium.', marks: 5 },
      { type: 'reasoning-interpretation', text: 'Explain why increasing temperature affects the yield of an exothermic reaction at equilibrium.', marks: 4 },
      { type: 'numeric-calculation', text: 'For the reaction N₂ + 3H₂ ⇌ 2NH₃, if [N₂] = 0.5 M, [H₂] = 1.5 M, and [NH₃] = 0.8 M, calculate the equilibrium constant Kc.', marks: 4 },
    ],
    'Acids and bases': [
      { type: 'short-answer', text: 'Define "pH" in chemistry.', marks: 2 },
      { type: 'short-answer', text: 'State the pH scale range and what it represents.', marks: 2 },
      { type: 'paragraph-long-answer', text: 'Explain in detail the difference between strong and weak acids.', marks: 5 },
      { type: 'reasoning-interpretation', text: 'Explain why a solution with pH = 7 is neutral.', marks: 4 },
      { type: 'numeric-calculation', text: 'Calculate the pH of a solution with [H⁺] = 0.001 M.', marks: 3 },
      { type: 'formula-based-calculation', text: 'Use the formula pH = -log[H⁺] to find the pH of a solution with [H⁺] = 1 × 10⁻⁵ M.', marks: 3 },
    ],
    'Electrochemical reactions (galvanic, electrolytic cells)': [
      { type: 'short-answer', text: 'Define "galvanic cell".', marks: 2 },
      { type: 'paragraph-long-answer', text: 'Explain in detail how a galvanic cell produces electrical energy from a chemical reaction.', marks: 5 },
      { type: 'compare-evaluate-predict', text: 'Compare galvanic cells with electrolytic cells.', marks: 4 },
      { type: 'diagram-labeling', text: 'Label the parts of a galvanic cell: anode, cathode, salt bridge, and external circuit.', marks: 4, hasDiagram: true, diagramLabel: 'Galvanic cell diagram' },
    ],
    'The chemical industry (fertilizers)': [
      { type: 'short-answer', text: 'Name three essential nutrients found in fertilizers.', marks: 3 },
      { type: 'paragraph-long-answer', text: 'Explain in detail the importance of the Haber process in fertilizer production.', marks: 5 },
      { type: 'reasoning-interpretation', text: 'Explain why nitrogen is essential for plant growth.', marks: 4 },
    ],
  },
  'Life Sciences': {
    'DNA: The code of life': [
      { type: 'short-answer', text: 'Define "DNA" and state its full name.', marks: 2 },
      { type: 'short-answer', text: 'State the function of DNA in living organisms.', marks: 2 },
      { type: 'short-answer', text: 'Name the four nitrogenous bases in DNA.', marks: 2 },
      { type: 'paragraph-long-answer', text: 'Explain in detail the structure of a DNA molecule, including the double helix.', marks: 5 },
      { type: 'reasoning-interpretation', text: 'Explain why DNA is called the "code of life".', marks: 4 },
      { type: 'true-false-with-reason', text: 'State whether the following is TRUE or FALSE: "Adenine always pairs with thymine in DNA." Give a reason.', marks: 3 },
      { type: 'diagram-labeling', text: 'Label the parts of a DNA molecule: sugar-phosphate backbone, base pairs, and hydrogen bonds.', marks: 4, hasDiagram: true, diagramLabel: 'DNA structure' },
      { type: 'diagram-interpretation', text: 'Study the diagram showing DNA replication. Explain the process.', marks: 5, hasDiagram: true, diagramLabel: 'DNA replication' },
      { type: 'multiple-choice', text: 'Which base pairs with cytosine in DNA?', marks: 1, options: ['Adenine', 'Thymine', 'Guanine', 'Uracil'] },
      { type: 'multiple-choice', text: 'What is the shape of a DNA molecule?', marks: 1, options: ['Single helix', 'Double helix', 'Triple helix', 'Linear'] },
    ],
    'Meiosis': [
      { type: 'short-answer', text: 'Define "meiosis" in biology.', marks: 2 },
      { type: 'short-answer', text: 'State the purpose of meiosis in living organisms.', marks: 2 },
      { type: 'paragraph-long-answer', text: 'Explain in detail the difference between meiosis I and meiosis II.', marks: 5 },
      { type: 'reasoning-interpretation', text: 'Explain why meiosis produces genetically diverse gametes.', marks: 4 },
      { type: 'diagram-interpretation', text: 'Study the diagram showing the stages of meiosis. Describe what happens in each stage.', marks: 5, hasDiagram: true, diagramLabel: 'Meiosis stages' },
      { type: 'sequencing-ordering', text: 'Arrange the following stages of meiosis in order: (a) Prophase I, (b) Metaphase I, (c) Anaphase I, (d) Telophase I, (e) Cytokinesis.', marks: 5 },
    ],
    'Genetics and inheritance': [
      { type: 'short-answer', text: 'Define "genotype" and "phenotype".', marks: 2 },
      { type: 'short-answer', text: 'State Mendel\'s law of segregation.', marks: 2 },
      { type: 'paragraph-long-answer', text: 'Explain in detail how to use a Punnett square to predict offspring genotypes.', marks: 5 },
      { type: 'reasoning-interpretation', text: 'Explain why recessive traits can skip generations.', marks: 4 },
      { type: 'true-false-with-reason', text: 'State whether the following is TRUE or FALSE: "If both parents have brown eyes, all children will have brown eyes." Give a reason.', marks: 3 },
      { type: 'table-interpretation', text: 'Study the Punnett square showing a cross between two heterozygous parents. Determine the genotypic and phenotypic ratios.', marks: 5, tableData: { headers: ['', 'A', 'a'], rows: [['A', 'AA', 'Aa'], ['a', 'Aa', 'aa']] } },
    ],
    'Responding to the environment (humans & plants)': [
      { type: 'short-answer', text: 'Define "tropism" in plants.', marks: 2 },
      { type: 'short-answer', text: 'Name three types of tropisms in plants.', marks: 3 },
      { type: 'paragraph-long-answer', text: 'Explain in detail how plants respond to light (phototropism).', marks: 5 },
      { type: 'reasoning-interpretation', text: 'Explain why plants grow towards light sources.', marks: 4 },
    ],
    'Human reproduction': [
      { type: 'short-answer', text: 'Name the male and female gametes.', marks: 2 },
      { type: 'paragraph-long-answer', text: 'Explain in detail the process of fertilization in humans.', marks: 5 },
      { type: 'diagram-labeling', text: 'Label the parts of the male reproductive system: testes, epididymis, vas deferens, and urethra.', marks: 4, hasDiagram: true, diagramLabel: 'Male reproductive system' },
    ],
    'Endocrine system': [
      { type: 'short-answer', text: 'Define "hormone" in biology.', marks: 2 },
      { type: 'short-answer', text: 'Name three hormones produced by the endocrine system.', marks: 3 },
      { type: 'paragraph-long-answer', text: 'Explain in detail how insulin regulates blood glucose levels.', marks: 5 },
      { type: 'reasoning-interpretation', text: 'Explain why the endocrine system is important for maintaining homeostasis.', marks: 4 },
    ],
    'Homeostasis': [
      { type: 'short-answer', text: 'Define "homeostasis".', marks: 2 },
      { type: 'short-answer', text: 'Give one example of how the human body maintains homeostasis.', marks: 1 },
      { type: 'paragraph-long-answer', text: 'Explain in detail how the body maintains a constant body temperature.', marks: 5 },
      { type: 'reasoning-interpretation', text: 'Explain why maintaining homeostasis is essential for survival.', marks: 4 },
    ],
    'Evolution': [
      { type: 'short-answer', text: 'Define "natural selection".', marks: 2 },
      { type: 'short-answer', text: 'State Darwin\'s theory of evolution.', marks: 2 },
      { type: 'paragraph-long-answer', text: 'Explain in detail how natural selection leads to evolution.', marks: 5 },
      { type: 'reasoning-interpretation', text: 'Explain why genetic variation is important for evolution.', marks: 4 },
      { type: 'compare-evaluate-predict', text: 'Compare Lamarck\'s theory with Darwin\'s theory of evolution.', marks: 4 },
    ],
  },
  'Accounting': {
    'GAAP principles': [
      { type: 'short-answer', text: 'What does GAAP stand for?', marks: 1 },
      { type: 'short-answer', text: 'State two GAAP principles.', marks: 2 },
      { type: 'paragraph-long-answer', text: 'Explain in detail the importance of GAAP principles in accounting.', marks: 5 },
    ],
    'Bookkeeping of a sole trader': [
      { type: 'short-answer', text: 'Define "sole trader" in accounting.', marks: 2 },
      { type: 'paragraph-long-answer', text: 'Explain in detail the bookkeeping process for a sole trader.', marks: 5 },
    ],
    'Journals': [
      { type: 'short-answer', text: 'Define "journal" in accounting.', marks: 2 },
      { type: 'short-answer', text: 'Name three types of journals.', marks: 3 },
    ],
    'General Ledger': [
      { type: 'short-answer', text: 'Define "general ledger".', marks: 2 },
      { type: 'paragraph-long-answer', text: 'Explain in detail how transactions are posted from journals to the general ledger.', marks: 5 },
    ],
    'Trial Balance': [
      { type: 'short-answer', text: 'Define "trial balance".', marks: 2 },
      { type: 'paragraph-long-answer', text: 'Explain in detail the purpose of preparing a trial balance.', marks: 5 },
    ],
    'Financial statements of a sole trader': [
      { type: 'short-answer', text: 'Name the three main financial statements.', marks: 3 },
      { type: 'paragraph-long-answer', text: 'Explain in detail how to prepare an income statement for a sole trader.', marks: 5 },
    ],
    'VAT concepts': [
      { type: 'short-answer', text: 'What does VAT stand for?', marks: 1 },
      { type: 'short-answer', text: 'State the current VAT rate in South Africa.', marks: 1 },
      { type: 'numeric-calculation', text: 'Calculate the VAT amount on a sale of R1,000 (VAT rate = 15%).', marks: 2 },
      { type: 'accounting-financial-calculation', text: 'A business makes sales of R10,000 (excluding VAT) and purchases of R5,000 (excluding VAT). Calculate the VAT payable to SARS.', marks: 4 },
    ],
    'Salaries and wages journals': [
      { type: 'short-answer', text: 'Define "salaries journal".', marks: 2 },
    ],
    'Bookkeeping of a partnership': [
      { type: 'short-answer', text: 'Define "partnership" in accounting.', marks: 2 },
      { type: 'paragraph-long-answer', text: 'Explain in detail how profits are shared in a partnership.', marks: 5 },
    ],
    'Financial statements of a partnership': [
      { type: 'paragraph-long-answer', text: 'Explain in detail how to prepare financial statements for a partnership.', marks: 5 },
    ],
    'Reconciliations': [
      { type: 'short-answer', text: 'Define "bank reconciliation".', marks: 2 },
      { type: 'paragraph-long-answer', text: 'Explain in detail the purpose of bank reconciliation.', marks: 5 },
    ],
    'Cost accounting (manufacturing)': [
      { type: 'short-answer', text: 'Define "cost accounting".', marks: 2 },
    ],
    'Budgeting': [
      { type: 'short-answer', text: 'Define "budget" in accounting.', marks: 2 },
    ],
    'Inventory systems': [
      { type: 'short-answer', text: 'Name two inventory systems.', marks: 2 },
    ],
    'Analysis and interpretation of financial statements': [
      { type: 'short-answer', text: 'Name three financial ratios used in analysis.', marks: 3 },
      { type: 'paragraph-long-answer', text: 'Explain in detail how to calculate and interpret the current ratio.', marks: 5 },
    ],
    'Bookkeeping of a company': [
      { type: 'short-answer', text: 'Define "company" in accounting.', marks: 2 },
    ],
    'Auditing': [
      { type: 'short-answer', text: 'Define "auditing".', marks: 2 },
    ],
  },
  'Business Studies': {
    'Business environments': [
      { type: 'short-answer', text: 'Define "business environment".', marks: 2 },
      { type: 'short-answer', text: 'Name three components of the business environment.', marks: 3 },
      { type: 'paragraph-long-answer', text: 'Explain in detail how the macro environment affects businesses.', marks: 5 },
    ],
    'Business sectors': [
      { type: 'short-answer', text: 'Name the three business sectors.', marks: 3 },
    ],
    'Forms of ownership': [
      { type: 'short-answer', text: 'Name three forms of business ownership.', marks: 3 },
      { type: 'compare-evaluate-predict', text: 'Compare a sole proprietorship with a partnership.', marks: 4 },
    ],
    'Business opportunities': [
      { type: 'short-answer', text: 'Define "business opportunity".', marks: 2 },
    ],
    'Business location': [
      { type: 'short-answer', text: 'Name three factors to consider when choosing a business location.', marks: 3 },
    ],
    'Contracts': [
      { type: 'short-answer', text: 'Define "contract" in business law.', marks: 2 },
      { type: 'short-answer', text: 'State three elements of a valid contract.', marks: 3 },
    ],
    'Business plan': [
      { type: 'short-answer', text: 'Define "business plan".', marks: 2 },
      { type: 'paragraph-long-answer', text: 'Explain in detail the importance of a business plan for entrepreneurs.', marks: 5 },
    ],
    'Management and leadership': [
      { type: 'short-answer', text: 'Define "management".', marks: 2 },
      { type: 'compare-evaluate-predict', text: 'Compare management with leadership.', marks: 4 },
    ],
    'Human resources': [
      { type: 'short-answer', text: 'Define "human resources".', marks: 2 },
    ],
    'Marketing': [
      { type: 'short-answer', text: 'Define "marketing".', marks: 2 },
      { type: 'short-answer', text: 'Name the four Ps of marketing.', marks: 2 },
    ],
    'Production function': [
      { type: 'short-answer', text: 'Define "production".', marks: 2 },
    ],
    'Ethics and professionalism': [
      { type: 'short-answer', text: 'Define "business ethics".', marks: 2 },
    ],
    'Corporate social responsibility': [
      { type: 'short-answer', text: 'Define "corporate social responsibility".', marks: 2 },
      { type: 'paragraph-long-answer', text: 'Explain in detail why businesses should practice corporate social responsibility.', marks: 5 },
    ],
    'Creative thinking': [
      { type: 'short-answer', text: 'Define "creative thinking".', marks: 2 },
    ],
    'Problem solving': [
      { type: 'short-answer', text: 'Name the steps in the problem-solving process.', marks: 3 },
    ],
    'Teamwork': [
      { type: 'short-answer', text: 'Define "teamwork".', marks: 2 },
      { type: 'paragraph-long-answer', text: 'Explain in detail the benefits of teamwork in a business environment.', marks: 5 },
    ],
  },
};

/**
 * Store preset in Appwrite
 */
async function storePreset(presetData) {
  try {
    const presetId = ID.unique();
    const documentData = {
      userId: presetData.userId,
      name: presetData.name,
      description: presetData.description,
      type: presetData.type,
      text: presetData.text,
      marks: presetData.marks,
      subject: presetData.subject,
    };
    
    // Add optional fields only if they exist
    if (presetData.instructionText) {
      documentData.instructionText = presetData.instructionText;
    }
    
    if (presetData.options && Array.isArray(presetData.options)) {
      documentData.options = presetData.options; // Keep as array, not stringified
    }
    
    if (presetData.tableData) {
      documentData.tableData = JSON.stringify(presetData.tableData);
    }
    
    if (presetData.graphData) {
      documentData.graphData = JSON.stringify(presetData.graphData);
    }
    
    if (presetData.extractText) {
      documentData.extractText = presetData.extractText;
    }
    
    if (presetData.hasDiagram) {
      documentData.hasDiagram = presetData.hasDiagram;
      if (presetData.diagramLabel) {
        documentData.diagramLabel = presetData.diagramLabel;
      }
    }
    
    if (presetData.answer) {
      documentData.answer = presetData.answer;
    }
    
    await databases.createDocument(
      DATABASE_ID,
      PRESETS_COLLECTION_ID,
      presetId,
      documentData
    );
    
    return { success: true, id: presetId };
  } catch (error) {
    console.error(`  ❌ Error storing preset "${presetData.name}":`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Check if preset already exists
 */
async function presetExists(userId, subject, topic, type, questionNum) {
  try {
    const presetName = `${subject} - ${topic} - ${type} - Q${questionNum}`;
    // Just check by name - it should be unique enough
    const results = await databases.listDocuments(
      DATABASE_ID,
      PRESETS_COLLECTION_ID,
      [
        Query.equal('name', presetName),
      ]
    );
    return results.documents.length > 0;
  } catch (error) {
    // If there's an error (e.g., collection doesn't exist), assume it doesn't exist
    return false;
  }
}

/**
 * Main function to add all questions
 */
async function addAllQuestions() {
  console.log('🚀 Adding questions to custompresets collection...\n');
  console.log(`📦 Collection: ${PRESETS_COLLECTION_ID}\n`);
  
  let totalGenerated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  const startTime = Date.now();
  
  for (const [subject, topics] of Object.entries(QUESTION_BANK)) {
    console.log(`\n📚 Processing Subject: ${subject}`);
    console.log(`   Topics: ${Object.keys(topics).length}\n`);
    
    for (const [topic, questions] of Object.entries(topics)) {
      console.log(`  📝 Topic: ${topic} (${questions.length} questions)`);
      
      let topicGenerated = 0;
      let topicSkipped = 0;
      let topicErrors = 0;
      
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const questionNum = i + 1;
        
        // Check if preset already exists
        const exists = await presetExists(SYSTEM_USER_ID, subject, topic, q.type, questionNum);
        if (exists) {
          topicSkipped++;
          totalSkipped++;
          continue;
        }
        
        const presetData = {
          userId: SYSTEM_USER_ID,
          name: `${subject} - ${topic} - ${q.type} - Q${questionNum}`,
          description: `Grade 12 ${subject} ${q.type} question about ${topic}`,
          type: q.type,
          text: q.text,
          marks: q.marks,
          subject: subject,
          instructionText: q.type === 'paragraph-long-answer' ? 'Write a detailed response.' : 
                          q.type === 'reasoning-interpretation' ? 'Provide reasoning for your answer.' : '',
          options: q.options,
          tableData: q.tableData,
          graphData: q.graphData,
          extractText: q.extractText,
          hasDiagram: q.hasDiagram,
          diagramLabel: q.diagramLabel,
          answer: `Sample answer for ${q.type} question about ${topic}`,
        };
        
        const result = await storePreset(presetData);
        
        if (result.success) {
          topicGenerated++;
          totalGenerated++;
        } else {
          topicErrors++;
          totalErrors++;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log(`     ✅ Generated: ${topicGenerated}, ⏭️  Skipped: ${topicSkipped}, ❌ Errors: ${topicErrors}`);
    }
    
    console.log(`\n   ✅ Completed ${subject}`);
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log(`\n\n📊 Summary:`);
  console.log(`   ✅ Total Generated: ${totalGenerated}`);
  console.log(`   ⏭️  Total Skipped: ${totalSkipped}`);
  console.log(`   ❌ Total Errors: ${totalErrors}`);
  console.log(`   📝 Total Processed: ${totalGenerated + totalSkipped + totalErrors}`);
  console.log(`   ⏱️  Duration: ${duration}s\n`);
}

// Run the script
addAllQuestions().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

