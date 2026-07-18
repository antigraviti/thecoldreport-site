const menuButton = document.querySelector('.nav-toggle');
const nav = document.querySelector('#nav');

if (menuButton && nav) {
  const setOpen = (open) => {
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close primary menu' : 'Open primary menu');
    menuButton.textContent = open ? 'Close' : 'Menu';
    nav.classList.toggle('open', open);
  };
  menuButton.addEventListener('click', () => setOpen(menuButton.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      menuButton.focus();
    }
  });
}

const radarForm = document.querySelector('[data-radar-application]');

if (radarForm) {
  const requiredGroup = radarForm.querySelector('[data-required-group]');
  const groupError = radarForm.querySelector('[data-group-error]');
  const status = radarForm.querySelector('[data-form-status]');
  const submit = radarForm.querySelector('button[type="submit"]');

  const hasCategory = () => Boolean(requiredGroup && requiredGroup.querySelector('input:checked'));
  const showCategoryError = (show) => {
    if (!requiredGroup || !groupError) return;
    requiredGroup.classList.toggle('invalid', show);
    groupError.hidden = !show;
  };

  requiredGroup?.addEventListener('change', () => showCategoryError(!hasCategory()));
  radarForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!hasCategory()) {
      showCategoryError(true);
      requiredGroup?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (!radarForm.reportValidity()) return;

    submit.disabled = true;
    submit.textContent = 'Submitting…';
    status.hidden = false;
    status.className = 'form-status pending';
    status.textContent = 'Sending your application securely…';

    try {
      const response = await fetch(radarForm.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(radarForm),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Submission failed');
      radarForm.reset();
      status.className = 'form-status success';
      status.innerHTML = '<strong>Application received.</strong><span>We will review the mandate and reply personally. Your reference is ' + String(result.id || 'recorded') + '.</span>';
      submit.textContent = 'Application submitted';
    } catch (error) {
      status.className = 'form-status error';
      status.innerHTML = '<strong>We could not submit this application.</strong><span>No information was recorded. Please try again or email <a href="mailto:hello@thecoldreport.com?subject=Radar%20application">hello@thecoldreport.com</a>.</span>';
      submit.disabled = false;
      submit.textContent = 'Try submission again';
    }
  });
}
