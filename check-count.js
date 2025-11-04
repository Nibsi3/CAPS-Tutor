const fs = require('fs');
const content = fs.readFileSync('src/lib/questions.ts', 'utf8');
const matches = content.matchAll(/id: 'eng-hl-g(\d+)-/g);
const qs = {};
for (const m of matches) {
    const grade = m[1];
    qs[grade] = (qs[grade] || 0) + 1;
}
console.log('English HL questions by grade:');
Object.keys(qs).sort((a,b) => parseInt(a)-parseInt(b)).forEach(g => {
    console.log(`Grade ${g}: ${qs[g]} questions`);
});

