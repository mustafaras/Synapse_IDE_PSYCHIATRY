



export const PHQ9_HTML = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>PHQ-9 — Depression Screener</title>
<style>
  :root { --ink:#e7edf2; --bg:#0b0f14; --line:#1d2a34; --accent:#00A6D7; }
  html,body{background:var(--bg);color:var(--ink);font:14px/1.45 ui-sans-serif,system-ui,Segoe UI,Roboto,Arial;}
  .wrap{max-width:880px;margin:24px auto;padding:24px;border:1px solid var(--line);border-radius:14px;background:#0d1319;}
  h1{margin:0 0 12px;font-size:20px}
  fieldset{border:1px solid var(--line);border-radius:10px;margin:16px 0;padding:12px}
  legend{padding:0 6px;color:#a8c0cf}
  .row{display:grid;grid-template-columns:1fr repeat(4,120px);gap:8px;align-items:center;margin:8px 0}
  .head{font-weight:600;color:#bcd0da}
  label{display:flex;gap:8px;align-items:center}
  input[type=radio]{transform:scale(1.15)}
  .btn{background:linear-gradient(135deg,var(--accent),#3CC7FF 50%,#7EE0FF);color:#041017;border:0;
       border-radius:9999px;padding:10px 16px;font-weight:600;cursor:pointer}
  .muted{color:#93a7b3;font-size:12px}
  .result{margin-top:16px;padding:12px;border:1px solid var(--line);border-radius:10px;background:#0b1116}
  @media print{.btn{display:none}}
</style>
</head><body>
<div class="wrap">
  <h1>PHQ-9 (Depression)</h1>
  <p class="muted">Reference period: last 2 weeks. Scale 0–3 (0=Not at all, 1=Several days, 2=More than half the days, 3=Nearly every day).</p>

  <form id="f">
    <div class="row head">
      <div>Item</div><div>0</div><div>1</div><div>2</div><div>3</div>
    </div>
    ${[1,2,3,4,5,6,7,8,9].map(i=>`
    <fieldset>
      <legend>Q${i}</legend>
      <div class="row">
        <div>
          ${(() => {
            const items: Record<number,string> = {
              1:"Little interest or pleasure in doing things",
              2:"Feeling down, depressed, or hopeless",
              3:"Trouble falling/staying asleep, or sleeping too much",
              4:"Feeling tired or having little energy",
              5:"Poor appetite or overeating",
              6:"Feeling bad about yourself; failure or let-down",
              7:"Trouble concentrating",
              8:"Psychomotor change: slowed or fidgety",
              9:"Thoughts of being better off dead or self-harm"
            }; return items[i as number]; })()}
        </div>
        ${[0,1,2,3].map(v=>`<label><input name="q${i}" type="radio" value="${v}" required/> ${v}</label>`).join('')}
      </div>
    </fieldset>`).join('')}
    <button class="btn" type="button" id="scoreBtn">Calculate Score</button>
  </form>

  <div id="res" class="result" hidden>
    <b>Total:</b> <span id="total">0</span> / 27 &nbsp;—&nbsp; <b>Severity:</b> <span id="sev">minimal</span>
    <p class="muted">Educational use only; not diagnostic. Consider clinical interview and risk assessment as needed.</p>
  </div>
</div>
<script>
  const btn = document.getElementById('scoreBtn');
  btn.addEventListener('click', () => {
    const vals = Array.from({length:9},(_,i)=> {
      const el = document.querySelector('input[name="q'+(i+1)+'"]:checked');
      return el? Number(el.value) : 0;
    });
    const s = vals.reduce((a,b)=>a+b,0);
    let sev='minimal';
    if (s>=5 && s<=9) sev='mild';
    else if (s>=10 && s<=14) sev='moderate';
    else if (s>=15 && s<=19) sev='moderately severe';
    else if (s>=20) sev='severe';
    document.getElementById('total').textContent=String(s);
    document.getElementById('sev').textContent=sev;
    document.getElementById('res').hidden=false;
  });
</script>
</body></html>`;

export const GAD7_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>GAD-7 — Anxiety Screener</title>
<style>
  body{background:#0b0f14;color:#e7edf2;font:14px/1.45 ui-sans-serif,system-ui}
  .wrap{max-width:860px;margin:24px auto;padding:24px;border:1px solid #1d2a34;border-radius:14px;background:#0d1319}
  fieldset{border:1px solid #1d2a34;border-radius:10px;margin:12px 0;padding:10px}
  .row{display:grid;grid-template-columns:1fr repeat(4,120px);gap:8px;align-items:center}
  .btn{background:linear-gradient(135deg,#00A6D7,#3CC7FF 50%,#7EE0FF);color:#041017;border:0;border-radius:9999px;padding:10px 16px;font-weight:600;cursor:pointer}
  .result{margin-top:16px;padding:12px;border:1px solid #1d2a34;border-radius:10px;background:#0b1116}
  .muted{color:#93a7b3;font-size:12px}
</style></head><body>
<div class="wrap">
  <h1>GAD-7 (Anxiety)</h1>
  <p class="muted">Last 2 weeks; 0–3 scale. (0=Not at all · 1=Several days · 2=More than half the days · 3=Nearly every day)</p>
  <form id="f">
    ${[1,2,3,4,5,6,7].map(i=>`
    <fieldset><legend>Q${i}</legend>
      <div class="row">
        <div>Item ${i}</div>
        ${[0,1,2,3].map(v=>`<label><input type="radio" required name="q${i}" value="${v}"/> ${v}</label>`).join('')}
      </div>
    </fieldset>`).join('')}
    <button class="btn" type="button" id="scoreBtn">Calculate Score</button>
  </form>
  <div id="res" class="result" hidden>
    <b>Total:</b> <span id="total">0</span> / 21 &nbsp;—&nbsp; <b>Severity:</b> <span id="sev">minimal</span>
    <p class="muted">Educational use only; not diagnostic.</p>
  </div>
</div>
<script>
  document.getElementById('scoreBtn').addEventListener('click',()=>{
    const vals = Array.from({length:7},(_,i)=>Number((document.querySelector('input[name="q'+(i+1)+'"]:checked')||{value:0}).value));
    const s = vals.reduce((a,b)=>a+b,0);
    let sev='minimal'; if(s>=5&&s<=9)sev='mild'; else if(s>=10&&s<=14)sev='moderate'; else if(s>=15)sev='severe';
    total.textContent=s; sev=document.getElementById('sev').textContent=sev; res.hidden=false;
  });
</script>
</body></html>`;

export const PCL5_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>PCL-5 — PTSD Checklist (20 items)</title>
<style>
  body{background:#0b0f14;color:#e7edf2;font:14px/1.45 ui-sans-serif}
  .wrap{max-width:940px;margin:24px auto;padding:24px;border:1px solid #1d2a34;border-radius:14px;background:#0d1319}
  fieldset{border:1px solid #1d2a34;border-radius:10px;margin:10px 0;padding:10px}
  .row{display:grid;grid-template-columns:1fr repeat(5,110px);gap:8px;align-items:center}
  .btn{background:linear-gradient(135deg,#00A6D7,#3CC7FF 50%,#7EE0FF);color:#041017;border:0;border-radius:9999px;padding:10px 16px;font-weight:600;cursor:pointer}
  .result{margin-top:16px;padding:12px;border:1px solid #1d2a34;border-radius:10px;background:#0b1116}
  .muted{color:#93a7b3;font-size:12px}
</style></head><body>
<div class="wrap">
  <h1>PCL-5 (PTSD)</h1>
  <p class="muted">Scale 0–4 (Not at all, A little bit, Moderately, Quite a bit, Extremely). Cut-offs vary (screen ≥31–33 used in many settings).</p>
  <form id="f">
    ${Array.from({length:20},(_,i)=>i+1).map(i=>`
    <fieldset><legend>Q${i}</legend>
      <div class="row">
        <div>PTSD symptom item ${i}</div>
        ${[0,1,2,3,4].map(v=>`<label><input type="radio" required name="q${i}" value="${v}"/> ${v}</label>`).join('')}
      </div>
    </fieldset>`).join('')}
    <button class="btn" type="button" id="scoreBtn">Calculate Score</button>
  </form>
  <div id="res" class="result" hidden>
    <b>Total:</b> <span id="total">0</span> / 80
    <p class="muted">Educational screen only; discuss traumatic exposure and functional impact in clinical context.</p>
  </div>
</div>
<script>
  document.getElementById('scoreBtn').addEventListener('click',()=>{
    const vals = Array.from({length:20},(_,i)=>Number((document.querySelector('input[name="q'+(i+1)+'"]:checked')||{value:0}).value));
    const s = vals.reduce((a,b)=>a+b,0);
    total.textContent=s; res.hidden=false;
  });
</script>
</body></html>`;

export const ASRSv11_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>ASRS v1.1 — Adult ADHD Screener (Part A, 6 items)</title>
<style>
  body{background:#0b0f14;color:#e7edf2;font:14px/1.45 ui-sans-serif}
  .wrap{max-width:860px;margin:24px auto;padding:24px;border:1px solid #1d2a34;border-radius:14px;background:#0d1319}
  .grid{display:grid;grid-template-columns:1fr repeat(5,120px);gap:8px;align-items:center}
  fieldset{border:1px solid #1d2a34;border-radius:10px;margin:10px 0;padding:10px}
  .btn{background:linear-gradient(135deg,#00A6D7,#3CC7FF 50%,#7EE0FF);color:#041017;border:0;border-radius:9999px;padding:10px 16px;font-weight:600;cursor:pointer}
  .result{margin-top:16px;padding:12px;border:1px solid #1d2a34;border-radius:10px;background:#0b1116}
  .muted{color:#93a7b3;font-size:12px}
</style></head><body><div class="wrap">
<h1>ASRS v1.1 — Part A (6)</h1>
<p class="muted">Count answers at or above the symptom threshold: Sometimes/Often/Very Often (>=2). Positive adult ADHD screen if count ≥4.</p>
<form id="f">
${[1,2,3,4,5,6].map(i=>`
<fieldset><legend>Q${i}</legend>
  <div class="grid">
    <div>Symptom item ${i}</div>
    ${['Never','Rarely','Sometimes','Often','Very Often'].map((lab,idx)=>`
      <label><input type="radio" name="q${i}" value="${idx}" required/> ${lab}</label>`).join('')}
  </div>
</fieldset>`).join('')}
<button class="btn" type="button" id="scoreBtn">Calculate</button>
</form>
<div id="res" class="result" hidden>
  <b>Above-threshold count:</b> <span id="cnt">0</span> / 6
  <p class="muted">Screening only; consider comprehensive ADHD evaluation.</p>
</div>
</div>
<script>
document.getElementById('scoreBtn').addEventListener('click',()=>{
  const thr = ['Never','Rarely','Sometimes','Often','Very Often'];
  const cnt = [1,2,3,4,5,6].reduce((acc,i)=>{
    const el = document.querySelector('input[name="q'+i+'"]:checked');
    const v = el? Number(el.value) : 0;
    return acc + (v>=2 ? 1 : 0);
  },0);
  document.getElementById('cnt').textContent=String(cnt);
  document.getElementById('res').hidden=false;
});
</script>
</body></html>`;

export const MDQ_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>MDQ — Mood Disorder Questionnaire</title>
<style>
  body{background:#0b0f14;color:#e7edf2;font:14px/1.45 ui-sans-serif}
  .wrap{max-width:900px;margin:24px auto;padding:24px;border:1px solid #1d2a34;border-radius:14px;background:#0d1319}
  fieldset{border:1px solid #1d2a34;border-radius:10px;margin:10px 0;padding:10px}
  .btn{background:linear-gradient(135deg,#00A6D7,#3CC7FF 50%,#7EE0FF);color:#041017;border:0;border-radius:9999px;padding:10px 16px;font-weight:600;cursor:pointer}
  .muted{color:#93a7b3;font-size:12px}
  .result{margin-top:16px;padding:12px;border:1px solid #1d2a34;border-radius:10px;background:#0b1116}
</style></head><body><div class="wrap">
<h1>MDQ — Bipolar Spectrum Screening</h1>
<form id="f">
<fieldset><legend>Part 1 — 13 yes/no</legend>
  ${Array.from({length:13},(_,i)=>i+1).map(i=>`
    <label style="display:block;margin:6px 0">
      <input type="checkbox" name="p1_${i}" value="1"/> Symptom item ${i}
    </label>`).join('')}
</fieldset>
<fieldset><legend>Part 2 — Cluster?</legend>
  <label><input type="radio" name="cluster" value="yes" required/> Yes</label>
  <label><input type="radio" name="cluster" value="no" required/> No</label>
</fieldset>
<fieldset><legend>Part 3 — Impairment</legend>
  ${['None','Minor','Moderate','Severe'].map(x=>`
    <label><input type="radio" name="imp" value="${x}" required/> ${x}</label>`).join('')}
</fieldset>
<button class="btn" type="button" id="scoreBtn">Evaluate</button>
</form>
<div id="res" class="result" hidden>
  <b>Heuristic screen:</b> <span id="msg">—</span>
  <p class="muted">Typical positive screen: ≥7 “Yes” in Part 1, “Yes” to clustering, and “Moderate/Severe” impairment.</p>
</div>
</div>
<script>
document.getElementById('scoreBtn').addEventListener('click',()=>{
  const yesCount = Array.from(document.querySelectorAll('input[name^="p1_"]:checked')).length;
  const cluster = (document.querySelector('input[name="cluster"]:checked')||{}).value === 'yes';
  const imp = (document.querySelector('input[name="imp"]:checked')||{}).value;
  const positive = (yesCount>=7) && cluster && (imp==='Moderate' || imp==='Severe');
  document.getElementById('msg').textContent = positive ? 'Positive screen (discuss further evaluation)' : 'Screen negative';
  document.getElementById('res').hidden=false;
});
</script>
</body></html>`;

export const AUDITC_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>AUDIT-C — Alcohol Use</title>
<style>
  body{background:#0b0f14;color:#e7edf2;font:14px/1.45 ui-sans-serif}
  .wrap{max-width:800px;margin:24px auto;padding:24px;border:1px solid #1d2a34;border-radius:14px;background:#0d1319}
  fieldset{border:1px solid #1d2a34;border-radius:10px;margin:10px 0;padding:10px}
  .btn{background:linear-gradient(135deg,#00A6D7,#3CC7FF 50%,#7EE0FF);color:#041017;border:0;border-radius:9999px;padding:10px 16px;font-weight:600;cursor:pointer}
  .result{margin-top:16px;padding:12px;border:1px solid #1d2a34;border-radius:10px;background:#0b1116}
  .muted{color:#93a7b3;font-size:12px}
</style></head><body><div class="wrap">
<h1>AUDIT-C (3 items)</h1>
<form id="f">
  ${[1,2,3].map(i=>`
  <fieldset><legend>Q${i}</legend>
    ${[0,1,2,3,4].map(v=>`<label style="display:block"><input type="radio" name="q${i}" value="${v}" required/> ${v}</label>`).join('')}
  </fieldset>`).join('')}
  <button class="btn" type="button" id="scoreBtn">Calculate</button>
</form>
<div id="res" class="result" hidden>
  <b>Total:</b> <span id="total">0</span> / 12
  <p class="muted">Interpretation varies; many use ≥4 (men) or ≥3 (women) as a positive screen. Use clinical judgment.</p>
</div>
</div>
<script>
document.getElementById('scoreBtn').addEventListener('click',()=>{
  const s = [1,2,3].reduce((acc,i)=>acc + Number((document.querySelector('input[name="q'+i+'"]:checked')||{value:0}).value),0);
  total.textContent=s; res.hidden=false;
});
</script>
</body></html>`;



export const MSE_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Mental Status Examination — Template</title>
<style>
  body{background:#0b0f14;color:#e7edf2;font:14px/1.45 ui-sans-serif}
  .wrap{max-width:900px;margin:24px auto;padding:24px;border:1px solid #1d2a34;border-radius:14px;background:#0d1319}
  textarea{width:100%;min-height:90px;background:#0b1116;color:#e7edf2;border:1px solid #1d2a34;border-radius:10px;padding:10px}
  .muted{color:#93a7b3;font-size:12px;margin-top:8px}
</style></head><body><div class="wrap">
<h1>Mental Status Examination (MSE)</h1>
<p class="muted">Educational template; adjust to clinical context.</p>
<form>
  ${['Appearance','Behavior/Psychomotor','Speech','Mood/Affect','Thought Process','Thought Content','Perception','Cognition','Insight/Judgment','Risk'].map(s=>`
  <label><b>${s}</b><br/><textarea placeholder="${s} notes…"></textarea></label><br/>`).join('')}
</form>
</div></body></html>`;

export const SOAP_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>SOAP Note — Template</title>
<style>
  body{background:#0b0f14;color:#e7edf2;font:14px/1.45 ui-sans-serif}
  .wrap{max-width:900px;margin:24px auto;padding:24px;border:1px solid #1d2a34;border-radius:14px;background:#0d1319}
  textarea{width:100%;min-height:120px;background:#0b1116;color:#e7edf2;border:1px solid #1d2a34;border-radius:10px;padding:10px}
  .muted{color:#93a7b3;font-size:12px;margin-top:8px}
</style></head><body><div class="wrap">
<h1>SOAP Note</h1>
<form>
  <label><b>Subjective</b><br/><textarea placeholder="Main concerns, duration, context…"></textarea></label><br/>
  <label><b>Objective</b><br/><textarea placeholder="Observations, vitals, MSE findings…"></textarea></label><br/>
  <label><b>Assessment</b><br/><textarea placeholder="Differential considerations, risk, formulation…"></textarea></label><br/>
  <label><b>Plan</b><br/><textarea placeholder="Monitoring, safety steps, referrals, follow-up…"></textarea></label><br/>
  <p class="muted">Educational template; not a substitute for supervision/clinical judgment.</p>
</form>
</div></body></html>`;

export const SAFETY_PLAN_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Safety Plan — Collaborative Outline</title>
<style>
  body{background:#0b0f14;color:#e7edf2;font:14px/1.45 ui-sans-serif}
  .wrap{max-width:900px;margin:24px auto;padding:24px;border:1px solid #1d2a34;border-radius:14px;background:#0d1319}
  textarea{width:100%;min-height:80px;background:#0b1116;color:#e7edf2;border:1px solid #1d2a34;border-radius:10px;padding:10px}
  .muted{color:#93a7b3;font-size:12px;margin-top:8px}
</style></head><body><div class="wrap">
<h1>Safety Plan</h1>
<form>
  ${['Warning signs','Internal coping strategies','Places/activities for distraction','People who can help (contacts)','Professionals/agencies','Means-safety steps'].map(s=>`
  <label><b>${s}</b><br/><textarea placeholder="${s}…"></textarea></label><br/>`).join('')}
  <p class="muted">Crisis resources vary by region; add local numbers. This template is for educational use.</p>
</form>
</div></body></html>`;
