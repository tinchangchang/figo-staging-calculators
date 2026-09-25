'use strict';

const assert = require('node:assert/strict');
const { calculate, molecularClassification } = require('../calculators/endometrial-engine.js');

const base = {
  histology: 'low-grade-eec',
  myometrialInvasion: 'none',
  lvsi: 'none',
  cervicalStroma: 'none',
  ovary: 'none',
  fallopianTube: 'none',
  uterineSerosa: 'none',
  vagina: 'none',
  parametria: 'none',
  peritoneum: 'none',
  pelvicNodes: 'none',
  paraaorticNodes: 'none',
  bladderMucosa: 'none',
  bowelMucosa: 'none',
  distantMetastasis: 'none',
  pole: 'unknown',
  mmr: 'unknown',
  p53: 'unknown'
};

function expectStage(stage, changes, expectedDisplay) {
  const actual = calculate({ ...base, ...changes });
  assert.equal(actual.status, 'complete');
  assert.equal(actual.anatomicStage, stage);
  assert.equal(actual.displayStage, expectedDisplay || stage);
}

assert.equal(calculate({}).status, 'incomplete');
assert.equal(calculate({}).missing.length, 15);

const provisionalEarly = calculate({
  histology: 'low-grade-eec',
  myometrialInvasion: 'lt50',
  lvsi: 'focal',
  cervicalStroma: 'none'
});
assert.equal(provisionalEarly.status, 'provisional');
assert.equal(provisionalEarly.anatomicStage, 'IA2');

const provisionalAdvanced = calculate({ distantMetastasis: 'present' });
assert.equal(provisionalAdvanced.status, 'provisional');
assert.equal(provisionalAdvanced.anatomicStage, 'IVC');

expectStage('IA1', {});
expectStage('IA2', { myometrialInvasion: 'lt50', lvsi: 'focal' });
expectStage('IB', { myometrialInvasion: 'ge50', lvsi: 'focal' });
expectStage('IIB', { myometrialInvasion: 'ge50', lvsi: 'substantial' });
expectStage('IIA', { cervicalStroma: 'involved' });
expectStage('IC', { histology: 'aggressive-serous' });
expectStage('IIC', { histology: 'aggressive-serous', myometrialInvasion: 'lt50' });

expectStage('IA3', {
  ovary: 'unilateral-contained',
  myometrialInvasion: 'lt50',
  lvsi: 'focal'
});
expectStage('IIIA1', { ovary: 'unilateral-breach' });
expectStage('IIIA1', { ovary: 'bilateral' });
expectStage('IIIA1', { ovary: 'unilateral-contained', histology: 'unclassified' });
expectStage('IIIA1', { ovary: 'unilateral-contained', lvsi: 'substantial' });
expectStage('IIIA1', { fallopianTube: 'intramucosal' });
expectStage('IIIA1', { fallopianTube: 'involved' });
expectStage('IA1', { fallopianTube: 'fragments-only' });
expectStage('IIIA2', { uterineSerosa: 'involved', fallopianTube: 'involved' });
expectStage('IIIB1', { vagina: 'involved' });
expectStage('IIIB1', { parametria: 'involved' });
expectStage('IIIB2', { peritoneum: 'pelvic' });

expectStage('IA1', { pelvicNodes: 'itc', paraaorticNodes: 'itc' });
expectStage('IIIC1', { pelvicNodes: 'unspecified' });
expectStage('IIIC1i', { pelvicNodes: 'micro' });
expectStage('IIIC1ii', { pelvicNodes: 'macro' });
expectStage('IIIC2', { paraaorticNodes: 'unspecified' });
expectStage('IIIC2i', { paraaorticNodes: 'micro' });
expectStage('IIIC2ii', { paraaorticNodes: 'macro' });
assert.equal(calculate({ ...base, paraaorticNodes: 'micro', pelvicNodes: 'macro' }).status, 'review');
assert.equal(calculate({ ...base, paraaorticNodes: 'micro', pelvicNodes: 'unspecified' }).status, 'review');
expectStage('IIIC2', { paraaorticNodes: 'unspecified', pelvicNodes: 'macro' });

expectStage('IVA', { bladderMucosa: 'involved' });
expectStage('IVA', { bowelMucosa: 'involved' });
expectStage('IVB', { peritoneum: 'beyond-pelvis' });
expectStage('IVC', { distantMetastasis: 'present' });
expectStage('IVC', {
  distantMetastasis: 'present',
  peritoneum: 'beyond-pelvis',
  bladderMucosa: 'involved',
  paraaorticNodes: 'macro'
});

expectStage('IIC', {
  histology: 'aggressive-serous',
  myometrialInvasion: 'ge50',
  pole: 'pathogenic'
}, 'IAm (POLEmut)');
expectStage('IA2', {
  myometrialInvasion: 'lt50',
  pole: 'not-pathogenic',
  mmr: 'proficient',
  p53: 'abnormal'
}, 'IICm (p53abn)');
expectStage('IA1', { p53: 'abnormal' });
expectStage('IA2', {
  myometrialInvasion: 'lt50',
  pole: 'not-pathogenic',
  mmr: 'deficient',
  p53: 'wild-type'
});
expectStage('IA3', {
  ovary: 'unilateral-contained',
  pole: 'pathogenic'
});

const mmrd = calculate({
  ...base,
  myometrialInvasion: 'lt50',
  pole: 'not-pathogenic',
  mmr: 'deficient',
  p53: 'wild-type'
});
assert.equal(mmrd.molecularClassification, 'MMRd');
assert.equal(mmrd.molecularDesignation, 'Im (MMRd)');

const nsmp = calculate({
  ...base,
  pole: 'not-pathogenic',
  mmr: 'proficient',
  p53: 'wild-type'
});
assert.equal(nsmp.molecularClassification, 'NSMP');
assert.equal(nsmp.molecularDesignation, 'Im (NSMP)');

const stageThreeMolecular = calculate({
  ...base,
  uterineSerosa: 'involved',
  pole: 'pathogenic'
});
assert.equal(stageThreeMolecular.displayStage, 'IIIA2');
assert.equal(stageThreeMolecular.molecularDesignation, 'IIIm (POLEmut)');

assert.equal(molecularClassification({ pole: 'pathogenic', mmr: 'deficient', p53: 'abnormal' }).classification, 'POLEmut');
assert.equal(molecularClassification({ pole: 'not-pathogenic', mmr: 'deficient', p53: 'abnormal' }).classification, 'MMRd');
assert.equal(molecularClassification({ pole: 'unknown', mmr: 'deficient', p53: 'abnormal' }).classification, '');
assert.equal(molecularClassification({ pole: 'not-pathogenic', mmr: 'unknown', p53: 'abnormal' }).classification, '');

const incompleteMolecular = calculate({ ...base, myometrialInvasion: 'lt50', p53: 'abnormal' });
assert.equal(incompleteMolecular.displayStage, 'IA2');
assert.equal(incompleteMolecular.molecularClassification, '');

assert.equal(calculate({ ...base, histology: 'unclassified' }).status, 'review');

const unresolved = calculate({ ...base, histology: 'aggressive-serous', cervicalStroma: 'involved' });
assert.equal(unresolved.status, 'review');

console.log('All endometrial staging engine tests passed.');
