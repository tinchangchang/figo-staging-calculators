'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const calculators = [
  'cervical.html',
  'endometrial.html',
  'gtn.html',
  'ovarian-fallopian-peritoneal.html',
  'uterine-leiomyosarcoma.html',
  'vaginal.html',
  'vulvar.html'
];
const expectedTitles = {
  'cervical.html': 'Cervical Cancer',
  'endometrial.html': 'Endometrial Cancer',
  'gtn.html': 'Gestational Trophoblastic Neoplasia',
  'ovarian-fallopian-peritoneal.html': 'Epithelial Ovarian, Fallopian Tube, and Peritoneal Cancer',
  'uterine-leiomyosarcoma.html': 'Uterine Leiomyosarcoma',
  'vaginal.html': 'Vaginal Cancer',
  'vulvar.html': 'Vulvar Cancer'
};

function inlineScripts(html) {
  return [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
    .map(match => match[1])
    .filter(script => script.trim());
}

for (const filename of calculators) {
  const computer = fs.readFileSync(path.join(root, 'calculators', filename), 'utf8');
  const phone = fs.readFileSync(path.join(root, 'phone', 'calculators', filename), 'utf8');

  assert.ok(!phone.includes('>Staging inputs<'), `${filename} still shows the removed heading`);
  assert.ok(phone.includes('href="./phone.css"'), `${filename} does not load phone.css`);
  assert.ok(phone.includes('Phone version 1.1'), `${filename} is not marked as phone version 1.1`);
  assert.ok(phone.includes(`<h1>${expectedTitles[filename]}</h1>`), `${filename} does not use its compact title`);
  assert.deepEqual(inlineScripts(phone), inlineScripts(computer), `${filename} staging logic differs between editions`);
}

assert.equal(
  fs.readFileSync(path.join(root, 'phone', 'calculators', 'endometrial-engine.js'), 'utf8'),
  fs.readFileSync(path.join(root, 'calculators', 'endometrial-engine.js'), 'utf8')
);
assert.equal(
  fs.readFileSync(path.join(root, 'phone', 'calculators', 'calculator-ui.js'), 'utf8'),
  fs.readFileSync(path.join(root, 'calculators', 'calculator-ui.js'), 'utf8')
);

console.log('All phone-edition regression tests passed.');
