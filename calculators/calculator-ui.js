(function () {
  'use strict';

  const form = document.getElementById('stageForm');
  const stage = document.getElementById('stageValue');
  if (!form || !stage) return;

  const selects = Array.from(form.querySelectorAll('select'));
  const light = [216, 193, 201];
  const saturated = [139, 30, 63];

  function requiredSelects() {
    if (form.dataset.calculator === 'gtn') {
      const diseaseType = document.getElementById('diseaseType')?.value;
      if (diseaseType === 'pstt-ett') {
        return selects.filter(select => ['diseaseType', 'diseaseExtent', 'interval'].includes(select.id));
      }
    }
    return selects.filter(select => select.dataset.optional !== 'true');
  }

  function updateStageColor() {
    const required = requiredSelects();
    const completed = required.filter(select => select.value !== '').length;
    const ratio = required.length ? completed / required.length : 1;
    const rgb = light.map((channel, index) => Math.round(channel + (saturated[index] - channel) * ratio));

    stage.style.setProperty('--stage-confidence-color', `rgb(${rgb.join(', ')})`);
    stage.dataset.completedFields = String(completed);
    stage.dataset.requiredFields = String(required.length);
    stage.setAttribute('aria-label', `${stage.textContent}. ${completed} of ${required.length} required fields confirmed.`);
  }

  selects.forEach(select => select.addEventListener('change', updateStageColor));
  form.addEventListener('reset', () => window.setTimeout(updateStageColor, 0));
  updateStageColor();
}());
