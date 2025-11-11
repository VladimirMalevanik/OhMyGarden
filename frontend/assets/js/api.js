// Заглушка клиента API — оставлен для будущей интеграции
const BASE = (window.MYGARDEN_API_BASE || "").replace(/\/+$/,"");

async function api(path, opts={}) {
  if (!BASE) return null;
  const res = await fetch(`${BASE}${path}`, {
    headers: {"Content-Type":"application/json"},
    ...opts
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return await res.json();
}

export async function getStatus(tgId){
  if (!BASE) return {survey_done:false};
  return api(`/user/${tgId}/status`);
}
export async function markSurveyDone(tgId, initData){
  if (!BASE) return {ok:true};
  return api(`/register`, {
    method:"POST",
    body: JSON.stringify({ tg_id: tgId, init_data: initData, survey_done:true })
  });
}
