'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadCalculator(filename) {
  const html = fs.readFileSync(path.join(__dirname, '..', 'calculators', filename), 'utf8');
  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
    .map(match => match[1])
    .filter(script => script.trim());
  const elements = new Map();
  const element = id => {
    if (!elements.has(id)) {
      elements.set(id, {
        id,
        value: '',
        textContent: '',
        innerHTML: '',
        classList: { add() {}, remove() {}, toggle() {} },
        addEventListener() {}
      });
    }
    return elements.get(id);
  };
  const context = vm.createContext({
    console,
    document: { getElementById: element },
    navigator: { clipboard: { writeText: async () => {} } },
    window: { setTimeout: callback => callback() },
    setTimeout: callback => callback()
  });
  for (const script of scripts) vm.runInContext(script, context, { filename });
  return {
    calculate: values => vm.runInContext('calculateStage', context)(values),
    html
  };
}

const cervical = loadCalculator('cervical.html');
const cervicalBase = {
  stromalInvasion: '≤ 3 mm in depth',
  tumorDimension: 'No gross tumor',
  vagina: 'not involved',
  parametrium: 'not involved',
  lymphNode: 'no metastasis',
  kidney: 'no abnormality or abnormality not caused by cervical cancer',
  adjacentOrgans: 'not involved',
  distantOrgans: 'no'
};
assert.equal(cervical.calculate(cervicalBase).stage, 'IA1');
assert.equal(cervical.calculate({ ...cervicalBase, distantOrgans: '' }).stage, '');
assert.equal(cervical.calculate({ ...cervicalBase, lymphNode: 'metastasis to pelvic node(s) indicated by image study' }).stage, 'IIIC1r');
assert.equal(cervical.calculate({ ...cervicalBase, lymphNode: 'isolated tumor cells only' }).stage, 'IA1');
assert.equal(cervical.calculate({ ...cervicalBase, adjacentOrgans: 'extension beyond the true pelvis' }).stage, 'IVA');

const ovarian = loadCalculator('ovarian-fallopian-peritoneal.html');
const ovarianBase = {
  primarySite: 'ovary',
  confinedTumor: 'one',
  surgicalSpill: 'no',
  capsuleSurface: 'no',
  washings: 'no',
  pelvicExtension: 'none',
  extrapelvicPeritoneum: 'none',
  retroNodes: 'no',
  distantDisease: 'none'
};
assert.equal(ovarian.calculate(ovarianBase).stage, 'IA');
assert.equal(ovarian.calculate({ ...ovarianBase, washings: 'yes' }).stage, 'IC3');
assert.equal(ovarian.calculate({ ...ovarianBase, washings: '' }).stage, '');
assert.equal(ovarian.calculate({ ...ovarianBase, confinedTumor: 'none', retroNodes: 'positive-le-10mm' }).stage, 'IIIA1(i)');
assert.ok(!ovarian.html.includes('positive-with-peritoneal'));

const vaginal = loadCalculator('vaginal.html');
const vaginalBase = {
  primaryTumor: 'vagina-le-2cm',
  bullousEdema: 'no',
  regionalNodes: 'no',
  distantMetastasis: 'no'
};
assert.equal(vaginal.calculate(vaginalBase).stage, 'I');
assert.equal(vaginal.calculate({ ...vaginalBase, distantMetastasis: '' }).stage, '');
assert.equal(vaginal.calculate({ ...vaginalBase, primaryTumor: 'bladder-rectum-true-pelvis', bullousEdema: 'yes' }).stage, '');
assert.equal(vaginal.calculate({ ...vaginalBase, regionalNodes: 'positive' }).stage, 'III');
assert.equal(vaginal.calculate({ ...vaginalBase, primaryTumor: 'none', regionalNodes: 'positive' }).stage, '');

const sarcoma = loadCalculator('uterine-leiomyosarcoma.html');
const sarcomaBase = {
  uterineExtent: 'le-5cm',
  pelvicSpread: 'none',
  abdominalTissues: 'none',
  nodes: 'no',
  bladderRectum: 'no',
  distantMetastases: 'no'
};
assert.equal(sarcoma.calculate(sarcomaBase).stage, 'IA');
assert.equal(sarcoma.calculate({ ...sarcomaBase, distantMetastases: '' }).stage, '');
assert.equal(sarcoma.calculate({ ...sarcomaBase, nodes: 'yes' }).stage, 'IIIC');

const gtn = loadCalculator('gtn.html');
const gtnBase = {
  diseaseType: 'standard',
  diseaseExtent: 'uterus',
  psttInterval: '',
  age: '0',
  antecedentPregnancy: '0',
  interval: '0',
  hcg: '0',
  tumorSize: '0',
  metastasisSite: 'none',
  metastasisNumber: 'none'
};
assert.equal(gtn.calculate(gtnBase).stage, 'Stage I:0');
assert.equal(gtn.calculate(gtnBase).risk, 'Low-risk GTN');
assert.equal(gtn.calculate({ ...gtnBase, diseaseExtent: 'other-metastatic', metastasisSite: 'brain-liver', metastasisNumber: 'one-four' }).stage, 'Stage IV:5');
assert.equal(gtn.calculate({ ...gtnBase, hcg: '' }).stage, 'Stage I (score incomplete)');
assert.equal(gtn.calculate({
  ...gtnBase,
  diseaseExtent: 'other-metastatic',
  age: '1', antecedentPregnancy: '2', interval: '4', hcg: '4', tumorSize: '2',
  metastasisSite: 'brain-liver', metastasisNumber: 'more-eight'
}).risk, 'Ultra-high-risk GTN');
assert.equal(gtn.calculate({ ...gtnBase, diseaseType: 'pstt-ett', diseaseExtent: 'genital', psttInterval: 'lt48' }).stage, 'Stage II:GP');
assert.equal(gtn.calculate({ ...gtnBase, diseaseType: 'pstt-ett', diseaseExtent: 'genital', psttInterval: 'ge48' }).stage, 'Stage II:PP');
assert.equal(gtn.calculate({ ...gtnBase, diseaseType: 'pstt-ett', diseaseExtent: 'other-metastatic', psttInterval: '' }).stage, 'Stage IV:PP');
assert.equal(gtn.calculate({ ...gtnBase, diseaseExtent: 'nodes-below-r' }).stage, 'Stage III LN r:0');
assert.equal(gtn.calculate({ ...gtnBase, metastasisSite: 'brain-liver', metastasisNumber: 'one-four' }).stage, 'Stage I (input review)');
assert.ok(!gtn.html.includes('Previous failed chemotherapy'));

for (const calculator of [cervical, ovarian, vaginal, sarcoma, gtn]) {
  assert.match(calculator.html, /<strong>Version:<\/strong> 1\.2\.0/);
}

const endometrialHtml = fs.readFileSync(path.join(__dirname, '..', 'calculators', 'endometrial.html'), 'utf8');
assert.ok(!endometrialHtml.includes('selectedIndex = 1'));
assert.match(endometrialHtml, /Micrometastasis \(&gt;0\.2-2 mm/);

console.log('All cross-calculator regression tests passed.');
