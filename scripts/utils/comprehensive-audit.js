const fs = require('fs');

// Read questions file
const questionsContent = fs.readFileSync('src/lib/questions.ts', 'utf8');

// Extract all question topics by grade, subject, and topic
const questionMatches = questionsContent.matchAll(/id: '([a-z-]+)-g(\d+)-[^']+', topic: '([^']+)'/g);
const questionsByGradeSubject = {};

for (const match of questionMatches) {
    const subjectAbbr = match[1];
    const grade = match[2];
    const topic = match[3];
    
    if (!questionsByGradeSubject[grade]) {
        questionsByGradeSubject[grade] = {};
    }
    if (!questionsByGradeSubject[grade][subjectAbbr]) {
        questionsByGradeSubject[grade][subjectAbbr] = {};
    }
    if (!questionsByGradeSubject[grade][subjectAbbr][topic]) {
        questionsByGradeSubject[grade][subjectAbbr][topic] = 0;
    }
    questionsByGradeSubject[grade][subjectAbbr][topic]++;
}

// Display results
console.log('Question coverage by grade, subject, and topic:\n');
Object.keys(questionsByGradeSubject).sort((a,b) => parseInt(a) - parseInt(b)).forEach(grade => {
    console.log(`\n========== GRADE ${grade} ==========`);
    Object.keys(questionsByGradeSubject[grade]).sort().forEach(subject => {
        const topics = Object.keys(questionsByGradeSubject[grade][subject]);
        const totalQ = Object.values(questionsByGradeSubject[grade][subject]).reduce((sum, count) => sum + count, 0);
        console.log(`  ${subject}: ${topics.length} topics, ${totalQ} total questions`);
        // Show topics with question counts
        Object.keys(questionsByGradeSubject[grade][subject]).forEach(topic => {
            const count = questionsByGradeSubject[grade][subject][topic];
            console.log(`    - ${topic}: ${count} questions`);
        });
    });
});

// Summary
console.log('\n\n========== SUMMARY ==========');
Object.keys(questionsByGradeSubject).sort((a,b) => parseInt(a) - parseInt(b)).forEach(grade => {
    const totalQ = Object.values(questionsByGradeSubject[grade])
        .reduce((sum, subject) => sum + Object.values(subject).reduce((s, count) => s + count, 0), 0);
    const subjectCount = Object.keys(questionsByGradeSubject[grade]).length;
    console.log(`Grade ${grade}: ${subjectCount} subjects, ${totalQ} total questions`);
});

