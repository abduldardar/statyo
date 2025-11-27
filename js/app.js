// app.js - loads data/data.json and renders Chart.js donut + line charts
async function loadData(){
  const resp = await fetch('data/data.json');
  const data = await resp.json();
  return data;
}

function formatLegend(labels, colors){
  const wrap = document.getElementById('donutLegend');
  wrap.innerHTML = '';
  labels.forEach((l,i) => {
    const d = document.createElement('div');
    d.className = 'item';
    const sw = document.createElement('span');
    sw.className = 'sw';
    sw.style.background = colors[i];
    d.appendChild(sw);
    const txt = document.createElement('div');
    txt.innerHTML = `<strong>${l}</strong>`;
    d.appendChild(txt);
    wrap.appendChild(d);
  });
}

function createDonut(ctx, labels, values, colors){
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        hoverOffset: 6
      }]
    },
    options: {
      responsive:true,
      plugins:{legend:{display:false}},
      cutout:'60%'
    }
  });
}

function createLine(ctx, timestamps, series, colors){
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: timestamps,
      datasets: series.map((s,idx)=>({
        label: s.label,
        data: s.data,
        fill:false,
        tension:0.2,
        borderColor: colors[idx],
        pointRadius:3
      }))
    },
    options:{
      responsive:true,
      plugins:{legend:{position:'bottom'}},
      scales:{y:{beginAtZero:true, max:100}}
    }
  });
}

function buildSummary(estimateNotes){
  const el = document.getElementById('summary');
  el.textContent = estimateNotes;
}

(async()=>{
  const payload = await loadData();

  // Top-level categories and colors come from data.json
  const categories = payload.current.categories;
  const labels = categories.map(c => c.name);
  const values = categories.map(c => c.percentage);
  const colors = categories.map(c => c.color);

  formatLegend(labels, colors);

  const donutCtx = document.getElementById('donutChart').getContext('2d');
  createDonut(donutCtx, labels, values, colors);

  // Line chart data: timestamps & per-category series
  const history = payload.history; // array of {date, categories: [{name, percentage}]}
  const timestamps = history.map(h=>h.date);
  const series = labels.map((lbl, idx)=>({
    label: lbl,
    data: history.map(h=> {
      const found = h.categories.find(c=>c.name===lbl);
      return found ? found.percentage : null;
    })
  }));

  const lineCtx = document.getElementById('lineChart').getContext('2d');
  createLine(lineCtx, timestamps, series, colors);

  // Summary (200 words max) provided in data.json
  buildSummary(payload.current.summary);
})();
