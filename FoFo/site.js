'use strict';

const picker = document.querySelector('.figure-picker');
const panels = [...document.querySelectorAll('.paper-figure')];

function showFigure() {
  const selected = picker.querySelector('input:checked').value;
  panels.forEach(panel => { panel.hidden = panel.id !== 'fig-' + selected; });
}

picker.addEventListener('change', showFigure);
showFigure();
picker.hidden = false;
