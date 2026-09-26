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
assert.equal(cervical.calculate({ ...cervicalBase, distantOrgans: '' }).stage, 'IA1');
assert.equal(cervical.calculate({ ...cervicalBase, distantOrgans: '' }).provisional, undefined);
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
assert.equal(ovarian.calculate({ ...ovarianBase, washings: '' }).stage, 'I');
assert.equal(ovarian.calculate({ ...ovarianBase, washings: '' }).provisional, undefined);
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
assert.equal(vaginal.calculate({ ...vaginalBase, distantMetastasis: '' }).stage, 'I');
assert.equal(vaginal.calculate({ ...vaginalBase, distantMetastasis: '' }).provisional, undefined);
assert.equal(vaginal.calculate({ ...vaginalBase, regionalNodes: 'not-assessed' }).provisional, undefined);
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
assert.equal(sarcoma.calculate({ ...sarcomaBase, distantMetastases: '' }).stage, 'IA');
assert.equal(sarcoma.calculate({ ...sarcomaBase, distantMetastases: '' }).provisional, undefined);
assert.equal(sarcoma.calculate({ ...sarcomaBase, nodes: 'yes' }).stage, 'IIIC');

const gtn = loadCalculator('gtn.html');
const gtnBase = {
  diseaseType: 'standard',
  diseaseExtent: 'uterus',
  age: '0',
  antecedentPregnancy: '0',
  interval: '0',
  hcg: '0',
  tumorSize: '0',
  metastasisSite: 'none',
  metastasisNumber: 'none'
};
assert.equal(gtn.calculate(gtnBase).stage, 'Stage I, Score 0');
assert.equal(gtn.calculate(gtnBase).risk, 'Low-risk GTN');
assert.equal(gtn.calculate({ ...gtnBase, diseaseExtent: 'other-metastatic', metastasisSite: 'brain-liver', metastasisNumber: 'one-four' }).stage, 'Stage IV, Score 5');
assert.equal(gtn.calculate({ ...gtnBase, hcg: '' }).stage, 'Stage I (score incomplete)');
assert.equal(gtn.calculate({
  ...gtnBase,
  diseaseExtent: 'other-metastatic',
  age: '1', antecedentPregnancy: '2', interval: '4', hcg: '4', tumorSize: '2',
  metastasisSite: 'brain-liver', metastasisNumber: 'more-eight'
}).risk, 'Ultra-high-risk GTN');
assert.equal(gtn.calculate({ ...gtnBase, diseaseType: 'pstt-ett', diseaseExtent: 'genital', interval: '4' }).stage, 'Stage II with good prognostic factor');
assert.equal(gtn.calculate({ ...gtnBase, diseaseType: 'pstt-ett', diseaseExtent: 'genital', interval: 'ge48' }).stage, 'Stage II with poor prognostic factor');
assert.equal(gtn.calculate({ ...gtnBase, diseaseType: 'pstt-ett', diseaseExtent: 'genital', interval: '' }).stage, 'Stage II (prognostic factor incomplete)');
assert.equal(gtn.calculate({ ...gtnBase, diseaseType: 'pstt-ett', diseaseExtent: 'other-metastatic', interval: '' }).stage, 'Stage IV with poor prognostic factor');
assert.equal(gtn.calculate({ ...gtnBase, interval: 'ge48' }).stage, 'Stage I, Score 4');
assert.equal(gtn.calculate({ ...gtnBase, diseaseExtent: 'nodes-below-r' }).stage, 'Stage III LNr, Score 0');
assert.equal(gtn.calculate({ ...gtnBase, diseaseExtent: 'nodes-below-r', hcg: '4', tumorSize: '2' }).stage, 'Stage III LNr, Score 6');
assert.equal(gtn.calculate({ ...gtnBase, metastasisSite: 'brain-liver', metastasisNumber: 'one-four' }).stage, 'Stage I (input review)');
assert.ok(!gtn.html.includes('Previous failed chemotherapy'));
assert.ok(!gtn.html.includes('Staging inputs'));
assert.ok(!gtn.html.includes('FIGO anatomic stage'));
assert.ok(!gtn.html.includes('id="psttInterval"'));
assert.match(gtn.html, /Interval from index\/previous pregnancy/);
assert.match(gtn.html, /13-47 months/);
assert.match(gtn.html, /&ge;48 months/);

const vulvar = loadCalculator('vulvar.html');
const vulvarBase = {
  tumorExtent: 'confined',
  tumorSize: 'le2',
  stromalInvasion: 'le1',
  regionalNodes: 'no',
  distantDisease: 'none'
};
assert.equal(vulvar.calculate(vulvarBase).stage, 'IA');
assert.equal(vulvar.calculate({ ...vulvarBase, tumorSize: 'gt2' }).stage, 'IB');
assert.equal(vulvar.calculate({ ...vulvarBase, tumorExtent: 'lower-adjacent' }).stage, 'II');
assert.equal(vulvar.calculate({ ...vulvarBase, tumorExtent: 'upper-adjacent' }).stage, 'IIIA');
assert.equal(vulvar.calculate({ ...vulvarBase, regionalNodes: 'le5' }).stage, 'IIIA');
assert.equal(vulvar.calculate({ ...vulvarBase, regionalNodes: 'gt5' }).stage, 'IIIB');
assert.equal(vulvar.calculate({ ...vulvarBase, regionalNodes: 'extracapsular' }).stage, 'IIIC');
assert.equal(vulvar.calculate({ ...vulvarBase, regionalNodes: 'fixed-ulcerated' }).stage, 'IVA');
assert.equal(vulvar.calculate({ ...vulvarBase, distantDisease: 'pelvic-nodes' }).stage, 'IVB');
const assumedNegativeVulvar = vulvar.calculate({ ...vulvarBase, regionalNodes: '', distantDisease: '' });
assert.equal(assumedNegativeVulvar.stage, 'IA');
assert.equal(assumedNegativeVulvar.provisional, undefined);
assert.equal(vulvar.calculate({ ...vulvarBase, regionalNodes: 'not-assessed' }).provisional, undefined);

for (const calculator of [cervical, ovarian, vaginal, sarcoma, gtn, vulvar]) {
  assert.match(calculator.html, /<strong>Version:<\/strong> 1\.4\.1/);
}

for (const calculator of [cervical, gtn, vulvar]) {
  assert.ok(calculator.html.includes('Select at least one field to begin staging.'));
}

const endometrialHtml = fs.readFileSync(path.join(__dirname, '..', 'calculators', 'endometrial.html'), 'utf8');
assert.ok(!endometrialHtml.includes('selectedIndex = 1'));
assert.match(endometrialHtml, /Micrometastasis \(&gt;0\.2-2 mm/);

console.log('All cross-calculator regression tests passed.');
