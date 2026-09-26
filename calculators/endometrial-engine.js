(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.EndometrialStaging = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const requiredFields = [
    ['histology', 'Histological type'],
    ['myometrialInvasion', 'Myometrial invasion'],
    ['lvsi', 'Lymphovascular space invasion'],
    ['cervicalStroma', 'Cervical stromal invasion'],
    ['ovary', 'Ovarian involvement'],
    ['fallopianTube', 'Fallopian tube involvement'],
    ['uterineSerosa', 'Uterine serosa involvement'],
    ['vagina', 'Vaginal involvement'],
    ['parametria', 'Parametrial involvement'],
    ['peritoneum', 'Peritoneal metastasis'],
    ['pelvicNodes', 'Pelvic lymph nodes'],
    ['paraaorticNodes', 'Para-aortic lymph nodes'],
    ['bladderMucosa', 'Bladder mucosa'],
    ['bowelMucosa', 'Bowel mucosa'],
    ['distantMetastasis', 'Distant metastasis']
  ];

  const stageDescriptions = {
    IA1: 'Non-aggressive histology limited to an endometrial polyp or the endometrium.',
    IA2: 'Non-aggressive histology with less than half myometrial invasion and no or focal LVSI.',
    IA3: 'Low-grade endometrioid carcinoma limited to the uterus and one ovary, meeting all IA3 criteria.',
    IB: 'Non-aggressive histology with invasion of half or more of the myometrium and no or focal LVSI.',
    IC: 'Aggressive histology limited to a polyp or the endometrium without myometrial invasion.',
    IIA: 'Cervical stromal invasion in a non-aggressive histological type.',
    IIB: 'Substantial LVSI in a non-aggressive histological type.',
    IIC: 'Aggressive histological type with any myometrial invasion.',
    IIIA1: 'Spread to the ovary or fallopian tube, except disease meeting IA3 criteria.',
    IIIA2: 'Involvement of the uterine subserosa or serosa.',
    IIIB1: 'Metastasis or direct spread to the vagina and/or parametria.',
    IIIB2: 'Metastasis to the pelvic peritoneum.',
    IIIC1: 'Pelvic lymph-node metastasis with deposit size not specified.',
    IIIC1i: 'Pelvic lymph-node micrometastasis.',
    IIIC1ii: 'Pelvic lymph-node macrometastasis.',
    IIIC2: 'Para-aortic lymph-node metastasis up to the renal vessels, with deposit size not specified.',
    IIIC2i: 'Para-aortic nodal disease up to the renal vessels with micrometastatic nodal volume.',
    IIIC2ii: 'Para-aortic nodal disease up to the renal vessels with macrometastatic nodal volume.',
    IVA: 'Invasion of the bladder mucosa and/or bowel mucosa.',
    IVB: 'Abdominal peritoneal metastasis beyond the pelvis.',
    IVC: 'Distant metastasis, including lymph nodes above the renal vessels or distant organs.'
  };

  function result(stage, rationale, badges) {
    return {
      status: 'complete',
      anatomicStage: stage,
      displayStage: stage,
      reason: stageDescriptions[stage],
      rationale: Array.isArray(rationale) ? rationale : [rationale],
      badges: badges || []
    };
  }

  function missingInputs(values) {
    return requiredFields
      .filter(([key]) => values[key] === undefined || values[key] === null || values[key] === '')
      .map(([, label]) => label);
  }

  function nodeStage(values) {
    const pelvic = values.pelvicNodes;
    const paraaortic = values.paraaorticNodes;
    const metastatic = value => ['micro', 'macro', 'unspecified'].includes(value);
    if (metastatic(paraaortic)) {
      if (paraaortic === 'macro') return 'IIIC2ii';
      if (paraaortic === 'micro') return 'IIIC2i';
      return 'IIIC2';
    }

    if (metastatic(pelvic)) {
      if (pelvic === 'macro') return 'IIIC1ii';
      if (pelvic === 'micro') return 'IIIC1i';
      return 'IIIC1';
    }

    return '';
  }

  function calculateAnatomicStage(values) {
    if (values.distantMetastasis === 'present') {
      return result('IVC', 'Distant organ disease or nodal disease above the renal vessels takes priority.', ['Distant disease']);
    }
    if (values.peritoneum === 'beyond-pelvis') {
      return result('IVB', 'Abdominal peritoneal metastasis beyond the pelvis takes priority over pelvic and uterine findings.', ['Extrapelvic peritoneum']);
    }
    if (values.bladderMucosa === 'involved' || values.bowelMucosa === 'involved') {
      return result('IVA', 'Bladder or bowel mucosal invasion takes priority over lower-stage findings.', ['Adjacent-organ mucosa']);
    }

    if (values.paraaorticNodes === 'micro' && ['macro', 'unspecified'].includes(values.pelvicNodes)) {
      return {
        status: 'review',
        anatomicStage: '',
        displayStage: 'Review required',
        reason: 'Para-aortic micrometastasis with a concurrent pelvic nodal deposit that is macro- or unspecified-volume is not unambiguously subclassified by the 2023 FIGO table.',
        rationale: ['Committee adjudication is required; the calculator will not infer whether IIIC2i or IIIC2ii applies to this mixed-volume pattern.'],
        badges: ['Mixed nodal volume']
      };
    }

    const nodes = nodeStage(values);
    if (nodes) {
      const badges = [nodes.startsWith('IIIC2') ? 'Para-aortic nodes' : 'Pelvic nodes'];
      if (nodes.endsWith('ii')) badges.push('Macrometastasis');
      if (nodes.endsWith('i') && !nodes.endsWith('ii')) badges.push('Micrometastasis');
      return result(nodes, 'Metastatic nodal location and the largest known deposit volume determine the IIIC substage.', badges);
    }

    if (values.peritoneum === 'pelvic') {
      return result('IIIB2', 'Pelvic peritoneal metastasis takes priority over other local uterine findings.', ['Pelvic peritoneum']);
    }
    if (values.vagina === 'involved' || values.parametria === 'involved') {
      return result('IIIB1', 'Vaginal or parametrial involvement determines Stage IIIB1.', [values.vagina === 'involved' ? 'Vagina' : 'Parametria']);
    }
    if (values.uterineSerosa === 'involved') {
      return result('IIIA2', 'Tumor reaches the submesothelial tissue or uterine serosa.', ['Uterine serosa']);
    }
    if (values.fallopianTube === 'intramucosal' || values.fallopianTube === 'involved') {
      return result('IIIA1', 'Fallopian tube involvement is staged as IIIA1; intraluminal floating fragments alone are excluded.', ['Fallopian tube']);
    }

    if (values.ovary !== 'none') {
      const qualifiesForIA3 = values.ovary === 'unilateral-contained'
        && values.histology === 'low-grade-eec'
        && ['none', 'lt50'].includes(values.myometrialInvasion)
        && ['none', 'focal'].includes(values.lvsi)
        && values.cervicalStroma === 'none';

      if (qualifiesForIA3) {
        return result('IA3', [
          'Low-grade endometrioid histology is present in the uterus and one ovary.',
          'Myometrial invasion is less than 50%, substantial LVSI is absent, no additional metastasis is selected, and the ovarian tumor is limited to one intact ovary.'
        ], ['Low-grade endometrioid', 'Unilateral ovary']);
      }

      return result('IIIA1', 'Ovarian involvement does not satisfy every IA3 criterion and is therefore staged as IIIA1.', ['Ovary']);
    }

    const aggressive = values.histology.startsWith('aggressive-');
    const nonAggressive = values.histology === 'low-grade-eec';
    if (!aggressive && !nonAggressive) {
      return {
        status: 'review',
        anatomicStage: '',
        displayStage: 'Review required',
        reason: 'The selected histology is not classified as non-aggressive or aggressive by the 2023 FIGO staging table.',
        rationale: ['Only low-grade (grade 1 or 2) endometrioid carcinoma is classified as non-aggressive for these stage rules.'],
        badges: ['Histology review']
      };
    }
    if (aggressive && values.myometrialInvasion !== 'none') {
      return result('IIC', 'Aggressive histology with any myometrial invasion determines Stage IIC.', ['Aggressive histology']);
    }
    if (!aggressive && values.lvsi === 'substantial') {
      return result('IIB', 'Substantial LVSI (at least five involved vessels) in non-aggressive histology determines Stage IIB.', ['Substantial LVSI']);
    }
    if (!aggressive && values.cervicalStroma === 'involved') {
      return result('IIA', 'Cervical stromal invasion in non-aggressive histology determines Stage IIA.', ['Cervical stroma']);
    }
    if (aggressive && values.cervicalStroma === 'involved' && values.myometrialInvasion === 'none') {
      return {
        status: 'review',
        anatomicStage: '',
        displayStage: 'Review required',
        reason: 'Aggressive histology with cervical stromal invasion but no myometrial invasion is not assigned a specific substage by the 2023 FIGO table.',
        rationale: ['Verify the pathology and assign the stage in multidisciplinary review; the calculator will not infer an unsupported substage.'],
        badges: ['Unresolved combination']
      };
    }
    if (aggressive) {
      return result('IC', 'Aggressive histology without myometrial invasion determines Stage IC.', ['Aggressive histology', 'No myometrial invasion']);
    }
    if (values.myometrialInvasion === 'ge50') {
      return result('IB', 'Non-aggressive histology with at least 50% myometrial invasion and no or focal LVSI determines Stage IB.', ['At least 50% invasion']);
    }
    if (values.myometrialInvasion === 'lt50') {
      return result('IA2', 'Non-aggressive histology with less than 50% myometrial invasion and no or focal LVSI determines Stage IA2.', ['Less than 50% invasion']);
    }
    return result('IA1', 'Non-aggressive histology confined to an endometrial polyp or the endometrium determines Stage IA1.', ['No myometrial invasion']);
  }

  function molecularClassification(values) {
    const pole = values.pole;
    const mmr = values.mmr;
    const p53 = values.p53;
    const positive = [pole === 'pathogenic', mmr === 'deficient', p53 === 'abnormal'].filter(Boolean).length;
    let classification = '';
    let note = '';

    if (pole === 'pathogenic') {
      classification = 'POLEmut';
      if (mmr === 'deficient') note = 'POLEmut and MMRd multiple classifier; recorded as POLEmut following WHO precedence, with limited outcome data for this combination.';
      else if (p53 === 'abnormal') note = 'POLEmut and p53abn multiple classifier; classified as POLEmut.';
    } else if (pole === 'not-pathogenic' && mmr === 'deficient') {
      classification = 'MMRd';
      if (p53 === 'abnormal') note = 'MMRd and p53abn multiple classifier; classified as MMRd.';
    } else if (pole === 'not-pathogenic' && mmr === 'proficient' && p53 === 'abnormal') {
      classification = 'p53abn';
    } else if (pole === 'not-pathogenic' && mmr === 'proficient' && p53 === 'wild-type') {
      classification = 'NSMP';
    }

    return { classification, note, multipleClassifier: positive > 1 };
  }

  function stageGroup(stage) {
    if (stage.startsWith('IV')) return 'IV';
    if (stage.startsWith('III')) return 'III';
    if (stage.startsWith('II')) return 'II';
    if (stage.startsWith('I')) return 'I';
    return '';
  }

  function addMolecularDesignation(anatomic, values) {
    if (anatomic.status !== 'complete') return anatomic;

    const molecular = molecularClassification(values);
    if (!molecular.classification) {
      return {
        ...anatomic,
        molecularClassification: '',
        molecularDesignation: '',
        molecularNote: 'Molecular classification is incomplete because one or more results required by the POLE → MMR → p53 testing hierarchy are unknown.'
      };
    }

    const group = stageGroup(anatomic.anatomicStage);
    const confinedToCorpusOrCervix = values.ovary === 'none'
      && ['none', 'fragments-only'].includes(values.fallopianTube)
      && !['III', 'IV'].includes(group);
    let displayStage = anatomic.displayStage;
    let molecularDesignation = `${group}m (${molecular.classification})`;
    let molecularNote = `${molecular.classification} is recorded without changing the anatomical stage category.`;

    if (confinedToCorpusOrCervix && molecular.classification === 'POLEmut') {
      displayStage = 'IAm (POLEmut)';
      molecularDesignation = displayStage;
      molecularNote = 'POLEmut disease confined to the uterine corpus or with cervical extension is molecularly assigned Stage IAm, regardless of histology or LVSI.';
    } else if (confinedToCorpusOrCervix && molecular.classification === 'p53abn' && values.myometrialInvasion !== 'none') {
      displayStage = 'IICm (p53abn)';
      molecularDesignation = displayStage;
      molecularNote = 'p53abn disease confined to the corpus with any myometrial invasion, with or without cervical invasion, is molecularly assigned Stage IICm.';
    }

    if (molecular.note) molecularNote = `${molecularNote} ${molecular.note}`;

    return {
      ...anatomic,
      displayStage,
      molecularClassification: molecular.classification,
      molecularDesignation,
      molecularNote,
      badges: [...anatomic.badges, molecular.classification]
    };
  }

  function calculate(values) {
    const normalized = {
      histology: values.histology || 'low-grade-eec',
      myometrialInvasion: values.myometrialInvasion || 'none',
      lvsi: values.lvsi || 'none',
      cervicalStroma: values.cervicalStroma || 'none',
      ovary: values.ovary || 'none',
      fallopianTube: values.fallopianTube || 'none',
      uterineSerosa: values.uterineSerosa || 'none',
      vagina: values.vagina || 'none',
      parametria: values.parametria || 'none',
      peritoneum: values.peritoneum || 'none',
      pelvicNodes: values.pelvicNodes || 'none',
      paraaorticNodes: values.paraaorticNodes || 'none',
      bladderMucosa: values.bladderMucosa || 'none',
      bowelMucosa: values.bowelMucosa || 'none',
      distantMetastasis: values.distantMetastasis || 'none',
      pole: values.pole || 'unknown',
      mmr: values.mmr || 'unknown',
      p53: values.p53 || 'unknown'
    };
    return addMolecularDesignation(calculateAnatomicStage(normalized), normalized);
  }

  return {
    calculate,
    calculateAnatomicStage,
    molecularClassification,
    requiredFields: requiredFields.map(([key]) => key),
    stageDescriptions
  };
}));
