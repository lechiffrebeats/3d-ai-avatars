<script lang="ts">
  import { onMount } from "svelte";
  import {
    session,
    startEval,
    eval_session_initialized,
    next,
    setText,
    setSelect,
    setDateDMTask,
    setLikertNew,
    type Step,
  } from "../EvalSystem";

  let isRunning = false;
  let delayMs = 250;

  const randInt = (a: number, b: number) =>
    a + Math.floor(Math.random() * (b - a + 1));
  const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

  onMount(async () => {
    if (!$eval_session_initialized) {
      await startEval();
    }
  });

  function fillTask(stepIndex: number, st: Step) {
    if (!st?.isTask || st?.dontShowReplyField) return;

    const qid = "task";
    const ui = st.ui;

    if (!ui) return;

    switch (ui.type) {
      case "number": {
        const v = String(randInt(1, 200));
        setText(stepIndex, qid, v);
        break;
      }
      case "email": {
        const v = `auto${randInt(1000, 9999)}@example.com`;
        setText(stepIndex, qid, v);
        break;
      }
      case "text": {
        setText(stepIndex, qid, `auto-test ${randInt(1, 9999)}`);
        break;
      }
      case "select": {
        const opts = ui.options ?? [];
        if (opts.length) {
          const id = pick(opts).id;
          setSelect(stepIndex, qid, id);
        }
        break;
      }
      case "date_dm": {
        const d = randInt(1, 28);
        const m = randInt(1, 12);
        setDateDMTask(stepIndex, d, m);
        break;
      }
    }
  }

  function fillEvalQuestions(stepIndex: number, st: Step) {
    const qs = st?.eval_questions ?? [];
    if (!qs.length) return;

    // set answers directly for text/select; use setLikertNew for likerts
    for (const q of qs) {
      if (q.type === "likert") {
        const min = typeof q.min === "number" ? q.min : 1;
        const max = typeof q.max === "number" ? q.max : 7;
        setLikertNew(stepIndex, q.id, randInt(min, max));
      } else if (q.type === "select") {
        const opts = q.options ?? [];
        if (opts.length) {
          const id = pick(opts).id;
          // update the session store with the chosen id
          session.update((s) => {
            const st2 = s.steps[stepIndex];
            const item = st2?.eval_questions?.find((x) => x.id === q.id);
            if (item) (item as any).answer = id;
            return s;
          });
        }
      } else if (q.type === "text") {
        session.update((s) => {
          const st2 = s.steps[stepIndex];
          const item = st2?.eval_questions?.find((x) => x.id === q.id);
          if (item) (item as any).answer = `auto-note ${randInt(1, 9999)}`;
          return s;
        });
      }
    }
  }

  async function stepOnce() {
    const idx = $session.currStep;
    const st = $session.steps?.[idx];
    if (!st) return;

    fillTask(idx, st);
    fillEvalQuestions(idx, st);

    // go next
    next();
  }

  async function runAll() {
    if (!$eval_session_initialized) {
      await startEval();
    }

    isRunning = true;

    // iterate until last step
    while (isRunning) {
      const idx = $session.currStep;
      const total = $session.steps?.length ?? 0;
      if (!total || idx >= total - 1) {
        // fill last step once and stop
        await stepOnce();
        isRunning = false;
        break;
      }

      await stepOnce();
      // small delay to let UI catch up
      await new Promise((r) => setTimeout(r, Math.max(0, delayMs)));
    }
  }

  function stop() {
    isRunning = false;
  }
</script>

<div>
  <h3>Eval Auto-Tester</h3>
  <p>
    Step: {$session.currStep + 1} / {$session.steps?.length ?? 0}
    — <em>{$session.steps?.[$session.currStep]?.title ?? "(no step)"}</em>
  </p>
  <label>
    Delay (ms):
    <input
      type="number"
      min="0"
      step="50"
      bind:value={delayMs}
      style="width: 7rem;"
    />
  </label>
  <div style="display: flex; gap: .5rem; margin-top: .5rem;">
    <button on:click={runAll} disabled={isRunning}>Start Auto</button>
    <button on:click={stop} disabled={!isRunning}>Stop</button>
    <button on:click={stepOnce} disabled={isRunning}>Step once</button>
  </div>
</div>
