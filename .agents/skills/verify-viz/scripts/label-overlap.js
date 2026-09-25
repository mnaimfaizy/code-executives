// Evaluate in the page (async, returns a string). Steps through every beat of the story on the
// page and reports labels that overlap each other or are clipped by the viewer.
// Relies on: [data-viz-viewer], [data-viz-label], and buttons labelled "Restart" / "Next step".
(async () => {
  const SETTLE_MS = 2200; // camera glide + enter animations
  const button = (label) =>
    [...document.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === label);
  const viewer = document.querySelector('[data-viz-viewer]');
  if (!viewer) return 'FAIL: no [data-viz-viewer] on the page';
  if (!button('Restart') || !button('Next step')) return 'FAIL: story controls not found';

  // A hidden or background tab throttles requestAnimationFrame, so animations and camera moves
  // never settle and every result would be meaningless.
  // Count frames for one second on a timer: a fully hidden page may never fire a frame at all.
  const fps = await new Promise((resolve) => {
    let frames = 0;
    let counting = true;
    const tick = () => {
      if (!counting) return;
      frames++;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    setTimeout(() => {
      counting = false;
      resolve(frames);
    }, 1000);
  });
  if (fps < 20) return `FAIL: page renders at ${fps} fps (hidden or background tab). Make it visible and rerun.`;

  const area = (a, b) =>
    Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
    Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));

  button('Restart').click();
  const lines = [`viewer ${Math.round(viewer.getBoundingClientRect().width)}px`];
  for (let beat = 1; ; beat++) {
    await new Promise((r) => setTimeout(r, SETTLE_MS));
    const frame = viewer.getBoundingClientRect();
    const labels = [...viewer.querySelectorAll('[data-viz-label]')]
      .filter((el) => getComputedStyle(el).opacity !== '0' && el.getClientRects().length)
      .map((el) => ({ name: el.textContent.trim().slice(0, 18), r: el.getBoundingClientRect() }));
    const problems = labels.length ? [] : ['FAIL: no visible [data-viz-label]'];
    labels.forEach((a, i) => {
      const r = a.r;
      if (r.left < frame.left - 1 || r.right > frame.right + 1 || r.top < frame.top - 1 || r.bottom > frame.bottom + 1)
        problems.push(`clipped: ${a.name}`);
      for (const b of labels.slice(i + 1)) if (area(r, b.r) > 4) problems.push(`${a.name} × ${b.name}`);
    });
    // Labels a renderer deliberately hides at the frame edge are listed, never silently skipped.
    const offframe = [...viewer.querySelectorAll('[data-viz-label][data-viz-offframe]')].map((el) =>
      el.textContent.trim().slice(0, 18)
    );
    const hidden = offframe.length ? ` | offframe: ${offframe.join(', ')}` : '';
    lines.push(`${beat}: ${problems.join(' | ') || 'ok'} (${labels.length} labels)${hidden}`);
    const next = button('Next step');
    if (!next || next.disabled) break;
    next.click();
  }
  return lines.join('\n');
})();
