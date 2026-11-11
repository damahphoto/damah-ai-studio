/** DAMAH AI STUDIO image-generation backend. No client photos are forwarded. */
const json = (obj,status=200,headers={}) => new Response(JSON.stringify(obj),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers}});
function corsHeaders(origin,allowed){return {'access-control-allow-origin':allowed === '*'?'*':origin,'vary':'Origin','access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'content-type, authorization','access-control-max-age':'600'};}
function decodeB64(str){const bin=atob(str);const arr=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);return arr;}
export default {
 async fetch(request, env){
  const origin=request.headers.get('Origin') || '';
  const allowed=env.ALLOWED_ORIGIN || '';
  const originOkay=!!allowed && (allowed==='*'||origin===allowed || (allowed==='null' && origin==='null'));
  const headers=originOkay?corsHeaders(origin,allowed):{};
  if(request.method==='OPTIONS')return new Response(null,{status:originOkay?204:403,headers});
  const url=new URL(request.url);
  if(url.pathname==='/health' && request.method==='GET')return json({service:'DAMAH AI STUDIO',status:'online',configured:!!(env.OPENAI_API_KEY&&env.STUDIO_ACCESS_TOKEN&&allowed)},200,headers);
  if(url.pathname!=='/generate'||request.method!=='POST')return json({error:'Not found'},404,headers);
  if(!originOkay)return json({error:'허용되지 않은 웹사이트에서 요청했습니다. ALLOWED_ORIGIN을 확인하세요.'},403,headers);
  if(!env.OPENAI_API_KEY||!env.STUDIO_ACCESS_TOKEN)return json({error:'서버 비밀 설정이 완료되지 않았습니다.'},503,headers);
  const auth=request.headers.get('Authorization') || '';
  if(!auth.startsWith('Bearer ')||auth.slice(7)!==env.STUDIO_ACCESS_TOKEN)return json({error:'스튜디오 접근 암호가 올바르지 않습니다.'},401,headers);
  const length=Number(request.headers.get('Content-Length')||0);if(length>12000)return json({error:'요청이 너무 깁니다.'},413,headers);
  let body;try{body=await request.json()}catch{return json({error:'잘못된 요청 형식입니다.'},400,headers)}
  const prompt=typeof body.prompt==='string'?body.prompt.trim():'';
  if(prompt.length<3||prompt.length>1400)return json({error:'배경 설명은 3~1400자로 입력하세요.'},400,headers);
  const size=['1024x1024','1024x1536','1536x1024'].includes(body.size)?body.size:'1024x1536';
  const model=env.IMAGE_MODEL||'gpt-image-1.5';
  const finalPrompt=`Photorealistic EMPTY photographic background plate for compositing a real unchanged person in front. Absolutely no people, no human figures, no animals, no text, no watermarks. Natural photographic texture, plausible perspective, floor and grounding plane, professional soft lighting, generous clear central space for subject. Scene requested: ${prompt}`;
  let response;
  try{response=await fetch('https://api.openai.com/v1/images/generations',{method:'POST',headers:{'authorization':`Bearer ${env.OPENAI_API_KEY}`,'content-type':'application/json'},body:JSON.stringify({model,prompt:finalPrompt,size,n:1,quality:'medium',output_format:'png'})});}
  catch{return json({error:'이미지 생성 서비스에 연결할 수 없습니다.'},502,headers)}
  if(!response.ok){const errorText=(await response.text()).slice(0,400);return json({error:`AI 생성 실패 (${response.status})`,detail:errorText},502,headers)}
  let result;try{result=await response.json()}catch{return json({error:'AI 응답을 해석할 수 없습니다.'},502,headers)}
  const b64=result?.data?.[0]?.b64_json;if(!b64)return json({error:'이미지 데이터가 없습니다.'},502,headers);
  const bytes=decodeB64(b64);
  return new Response(bytes,{status:200,headers:{...headers,'content-type':'image/png','cache-control':'no-store','x-content-type-options':'nosniff'}});
 }
};
