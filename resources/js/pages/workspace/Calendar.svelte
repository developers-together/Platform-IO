<svelte:options runes={false} />

<script>
  import AppHead from '@/components/AppHead.svelte';
  import AppLayout from '@/layouts/AppLayout.svelte';

  // Preview mode keeps the calendar UI visible while backend integration is pending.
  // TODO(back-end): replace this mock event list with tasks API data and remove preview lock.
  const FEATURE_STATUS_NOTE = 'Calendar is currently in preview mode. Backend actions are temporarily disabled.';
  let currentDate = new Date();
  const previewYear = currentDate.getFullYear();
  const previewMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
  let tasks = [
    { title: 'Sprint planning', end: `${previewYear}-${previewMonth}-04` },
    { title: 'Stakeholder review', end: `${previewYear}-${previewMonth}-12` },
    { title: 'Release readiness', end: `${previewYear}-${previewMonth}-20` },
    { title: 'Retrospective', end: `${previewYear}-${previewMonth}-27` },
  ];

  $: year = currentDate.getFullYear();
  $: month = currentDate.getMonth();
  $: monthName = currentDate.toLocaleString('default', { month: 'long' });
  $: daysInMonth = new Date(year, month + 1, 0).getDate();
  $: firstDay = new Date(year, month, 1).getDay();
  $: calendarDays = buildCalendar(year, month, daysInMonth, firstDay);
  $: today = new Date().toISOString().split('T')[0];

  function buildCalendar(y, m, days, first) {
    const cells = [];
    for (let i = 0; i < first; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(d);
    return cells;
  }

  function getTasksForDay(day) {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter((task) => {
      const dueDate = task.end ?? task.endAt ?? null;
      return typeof dueDate === 'string' && dueDate.slice(0, 10) === dateStr;
    });
  }

  function isToday(day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` === today;
  }

  function prevMonth() {
    currentDate = new Date(year, month - 1, 1);
  }
  function nextMonth() {
    currentDate = new Date(year, month + 1, 1);
  }

</script>

<AppHead title="Calendar" />

<AppLayout>
<div class="calendar-page">
  <p class="feature-preview-banner" data-test="calendar-preview-banner">{FEATURE_STATUS_NOTE}</p>
  <div class="feature-preview-disabled" aria-disabled="true" title={FEATURE_STATUS_NOTE} inert>
  <div class="calendar-header" data-test="calendar-header">
    <button type="button" class="nav-btn" data-test="calendar-prev-month" on:click={prevMonth}>◀</button>
    <h1>{monthName} {year}</h1>
    <button type="button" class="nav-btn" data-test="calendar-next-month" on:click={nextMonth}>▶</button>
  </div>

  <div class="calendar-grid" data-test="calendar-grid">
    <div class="day-name">Sun</div>
    <div class="day-name">Mon</div>
    <div class="day-name">Tue</div>
    <div class="day-name">Wed</div>
    <div class="day-name">Thu</div>
    <div class="day-name">Fri</div>
    <div class="day-name">Sat</div>

    {#each calendarDays as day}
      <div class="day-cell" class:today={isToday(day)} class:empty={!day}>
        {#if day}
          <span class="day-number">{day}</span>
          {#each getTasksForDay(day) as task}
            <div class="event-pill">{task.title}</div>
          {/each}
        {/if}
      </div>
    {/each}
  </div>
  </div>
</div>
</AppLayout>

<style>
  .calendar-page { padding: 24px; background: var(--gray-100); min-height: 100vh; }
  .feature-preview-banner { margin: 0 0 16px; padding: 12px 16px; border-radius: 12px; border: 1px solid #f0d27a; background: #fff6db; color: #6a5000; font-size: 0.95rem; font-weight: 500; }
  .feature-preview-disabled { pointer-events: none; opacity: 0.88; filter: saturate(0.9); }

  .calendar-header { display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 24px; }
  .calendar-header h1 { font-size: 1.8rem; color: var(--gray-800); font-weight: 600; min-width: 250px; text-align: center; }
  .nav-btn { background: var(--brand-blue); color: white; border-radius: var(--radius-md); padding: 8px 16px; font-size: 1rem; transition: var(--transition); }
  .nav-btn:hover { background: var(--brand-blue-hover); }

  .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; background: var(--gray-300); border-radius: var(--radius-lg); overflow: hidden; }

  .day-name { background: var(--brand-blue); color: white; padding: 12px; text-align: center; font-weight: 600; font-size: 0.85rem; }

  .day-cell { background: white; min-height: 100px; padding: 8px; position: relative; display: flex; flex-direction: column; gap: 4px; }
  .day-cell.empty { background: #f9fafc; }
  .day-cell.today { background: #e3f2fd; }

  .day-number { font-weight: 600; font-size: 0.9rem; color: var(--gray-700); margin-bottom: 4px; }

  .event-pill { background: var(--brand-blue); color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
