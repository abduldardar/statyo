/**
 * fetch_data.js
 * Heuristic script to fetch predefined public reports and compute updated percentage estimates.
 * NOTE: This is a best-effort aggregator. It scrapes and parses public pages and PDFs where possible,
 * and blends signals into category percentages. Always verify results manually.
 *
 * Usage: node scripts/fetch_data.js
 */
const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');

const OUT = path.join(__dirname, '..', 'data', 'data.json');

// List of sources to fetch (examples). Add or remove sources as needed.
const sources = [
  {name: 'microsoft-ai-at-work', url: 'https://www.microsoft.com/en-us/worklab/work-trend-index/ai-at-work-is-here-now-comes-the-hard-part'},
  {name: 'mckinsey-state-of-ai', url: 'https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai-2024'},
  {name: 'openai-chatgpt-usage', url: 'https://openai.com/index/how-people-are-using-chatgpt/'},
  {name: 'stanford-ai-index', url: 'https://hai.stanford.edu/ai-index/2024-ai-index-report'},
  {name: 'deloitte-genai-2024', url: 'https://www.deloitte.com/us/en/insights/focus/cognitive-technologies/state-of-generative-ai-in-enterprise.html'}
];

// Simple helper to fetch text
async function fetchText(url){
  const r = await fetch(url, {redirect:'follow'});
  const t = await r.text();
  return t;
}

// Very simple heuristic parser: looks for keywords and counts occurrences to infer relative weights.
// This is NOT precise but produces a signal you can refine.
function scoreByKeywords(text){
  const lower = text.toLowerCase();
  const categories = {
    'productivity': ['email','meeting','summari','draft','present','copy','word','excel','office','document'],
    'creativity': ['image','art','design','music','creative','story','poem','photo','graphic','illustrat'],
    'education': ['student','learn','school','homework','teach','quiz','exam','education'],
    'development': ['code','developer','debug','stack','script','program','api','software','engineer'],
    'daily': ['recipe','travel','recipe','advice','daily','search','curios','ask','question']
  };
  const scores = {productivity:0,creativity:0,education:0,development:0,daily:0};
  for(const k in categories){
    categories[k].forEach(term=>{
      const re = new RegExp(term,'g');
      const m = lower.match(re);
      if(m) scores[k] += m.length;
    });
  }
  return scores;
}

(async ()=>{
  try{
    let aggregate = {productivity:0,creativity:0,education:0,development:0,daily:0};
    for(const s of sources){
      try{
        const text = await fetchText(s.url);
        const sc = scoreByKeywords(text);
        for(const k in sc) aggregate[k] += sc[k];
        console.log('fetched', s.name);
      }catch(e){
        console.warn('failed', s.name, e.message);
      }
    }
    const sum = Object.values(aggregate).reduce((a,b)=>a+b,0) || 1;
    const normalized = {
      productivity: Math.round(aggregate.productivity/sum*100),
      creativity: Math.round(aggregate.creativity/sum*100),
      education: Math.round(aggregate.education/sum*100),
      development: Math.round(aggregate.development/sum*100),
      daily: Math.round(aggregate.daily/sum*100)
    };

    // Read existing data file
    const dataPath = OUT;
    const existing = JSON.parse(fs.readFileSync(dataPath,'utf8'));
    const today = new Date().toISOString().slice(0,10);
    // Build categories array mapping names
    const categories = [
      {"name":"Productivité bureautique","percentage":normalized.productivity},
      {"name":"Créativité","percentage":normalized.creativity},
      {"name":"Apprentissage / Éducation","percentage":normalized.education},
      {"name":"Développement / Technique","percentage":normalized.development},
      {"name":"Usage quotidien / Curiosité","percentage":normalized.daily}
    ];
    existing.current.categories = existing.current.categories.map((c,idx)=>{
      c.percentage = categories[idx].percentage;
      return c;
    });
    // Append history point
    existing.history.push({date: today, categories});
    fs.writeFileSync(dataPath, JSON.stringify(existing,null,2),'utf8');
    console.log('Updated data.json with', normalized);
  }catch(e){
    console.error(e);
    process.exit(1);
  }
})();
