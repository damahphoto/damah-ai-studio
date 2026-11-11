const $=id=>document.getElementById(id);
const state={subject:null,bg:null,bgColor:'#f4f1ec',mask:null,brush:'move',brushSize:45,brushSoft:25,showMask:false,scale:1,offsetX:0,offsetY:0,bgBlur:0,bgBrightness:100,bgWarmth:0,bgScale:100,bgShiftX:0,bgShiftY:0,lightAngle:45,lightHeight:40,lightPower:35,lightTemp:5200,lightSoft:65,protect:true,shadow:true,shadowX:35,shadowY:30,shadowOpacity:35,shadowBlur:28,shadowScale:95,preset:'소프트 라이트',compare:false,quickTolerance:35,cutReady:false};
const presets=['하이키','로우키','렘브란트','버터플라이','스플릿','루프','브로드','숏','키아로스쿠로','실루엣','림 라이트','하드 라이트','소프트 라이트','바운스','탑 라이트','언더 라이트','골든 아워','블루 아워','데이 포 나이트','문라이트','윈도우 라이트','프랙티컬','파이어라이트','베니션 블라인드','대폴드','볼류메트릭','플랫 라이트','네온','틸 앤 오렌지','모노크롬 레드','스크린 글로우','패싱 라이트','스트로브','시어트리컬 라이트'];
const presetsMap={'하이키':[12,25,10000,90],'로우키':[-24,75,4400,30],'렘브란트':[30,55,4700,35],'버터플라이':[0,65,5500,50],'스플릿':[90,85,5000,15],'루프':[35,55,5200,50],'브로드':[55,40,5800,65],'숏':[-55,50,5000,45],'키아로스쿠로':[70,90,3500,15],'실루엣':[180,92,6500,15],'림 라이트':[150,55,6600,30],'하드 라이트':[45,85,5000,5],'소프트 라이트':[45,35,5200,65],'바운스':[40,22,5500,95],'탑 라이트':[0,68,5600,45],'언더 라이트':[180,60,4900,20],'골든 아워':[45,48,3200,65],'블루 아워':[-40,40,8500,75],'데이 포 나이트':[-65,60,9000,25],'문라이트':[60,45,9500,35],'윈도우 라이트':[60,55,6500,60],'프랙티컬':[-55,35,3400,65],'파이어라이트':[-45,70,2500,35],'베니션 블라인드':[60,65,5700,20],'대폴드':[45,50,5000,45],'볼류메트릭':[30,75,6000,70],'플랫 라이트':[0,10,5600,100],'네온':[-75,70,9000,25],'틸 앤 오렌지':[50,60,3300,45],'모노크롬 레드':[30,75,2500,30],'스크린 글로우':[0,25,8000,70],'패싱 라이트':[90,80,6200,18],'스트로브':[30,70,5800,10],'시어트리컬 라이트':[45,85,3700,30]};
function makeCanvas(w,h){let c=document.createElement('canvas');c.width=w;c.height=h;return c}
function imageFromFile(f){return new Promise((resolve,reject)=>{if(!f||!f.type.startsWith('image/')){reject(new Error('사진 파일을 선택해 주세요 (JPG, PNG, WEBP 권장).'));return}const url=URL.createObjectURL(f);let im=new Image;im.onload=()=>{URL.revokeObjectURL(url);resolve(im)};im.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('이 파일을 브라우저에서 읽을 수 없습니다. HEIC는 JPG로 변환 후 다시 시도해 주세요.'))};im.src=url})}
function updateStatus(msg){$('status').textContent=msg}
function makeControl(parent,name,key,min,max,step=1,unit=''){const el=document.createElement('div');el.className='control';el.innerHTML=`<label><span>${name}</span><output></output></label><input type="range" min="${min}" max="${max}" step="${step}">`;const input=el.querySelector('input'),output=el.querySelector('output');function refresh(){input.value=state[key];output.textContent=state[key]+unit}input.addEventListener('input',()=>{state[key]=Number(input.value);refresh();requestDraw()});refresh();$(parent).append(el);return refresh}
const refreshControls=[];let undoMask=null;
refreshControls.push(makeControl('backgroundControls','배경 확대','bgScale',70,240,1,'%'));
refreshControls.push(makeControl('backgroundControls','배경 좌우 이동','bgShiftX',-100,100,1,'%'));
refreshControls.push(makeControl('backgroundControls','배경 상하 이동','bgShiftY',-100,100,1,'%'));
refreshControls.push(makeControl('backgroundControls','배경 흐림','bgBlur',0,30,1,'px'));
refreshControls.push(makeControl('backgroundControls','배경 밝기','bgBrightness',30,170,1,'%'));
refreshControls.push(makeControl('backgroundControls','배경 온기','bgWarmth',-100,100));
refreshControls.push(makeControl('quickControls','단색 배경 허용 오차','quickTolerance',8,100,1,''));
refreshControls.push(makeControl('maskControls','브러시 부드러움','brushSoft',0,100,1,'%'));
refreshControls.push(makeControl('maskControls','브러시 크기','brushSize',5,300,1,'px'));
refreshControls.push(makeControl('maskControls','인물 크기','scale',0.1,2.5,0.01,'×'));
refreshControls.push(makeControl('maskControls','인물 가로 이동','offsetX',-100,100,1,'%'));
refreshControls.push(makeControl('maskControls','인물 세로 이동','offsetY',-100,100,1,'%'));
refreshControls.push(makeControl('lightControls','광원 방향','lightAngle',-180,180,1,'°'));
refreshControls.push(makeControl('lightControls','광원 높이','lightHeight',-90,90,1,'°'));
refreshControls.push(makeControl('lightControls','조명 강도','lightPower',0,100,1,'%'));
refreshControls.push(makeControl('lightControls','색온도','lightTemp',2500,10000,100,'K'));
refreshControls.push(makeControl('lightControls','빛의 부드러움','lightSoft',0,100,1,'%'));
refreshControls.push(makeControl('shadowControls','그림자 가로 위치','shadowX',-180,180,1,'px'));
refreshControls.push(makeControl('shadowControls','그림자 세로 위치','shadowY',-100,220,1,'px'));
refreshControls.push(makeControl('shadowControls','그림자 진하기','shadowOpacity',0,100,1,'%'));
refreshControls.push(makeControl('shadowControls','그림자 흐림','shadowBlur',0,90,1,'px'));
refreshControls.push(makeControl('shadowControls','그림자 크기','shadowScale',30,160,1,'%'));
const presetSelect=$('lightPreset');presets.forEach(p=>{const op=new Option(p,p);presetSelect.add(op)});presetSelect.value=state.preset;presetSelect.onchange=()=>{state.preset=presetSelect.value;const [a,p,t,s]=presetsMap[state.preset];state.lightAngle=a;state.lightPower=p;state.lightTemp=t;state.lightSoft=s;refreshControls.forEach(f=>f());requestDraw()};
function resetMask(){if(!state.subject)return;const {naturalWidth:w,naturalHeight:h}=state.subject;state.mask=makeCanvas(w,h);state.mask.getContext('2d').fillRect(0,0,w,h);}
async function loadSubject(f){if(!f)return;try{updateStatus('사진을 읽는 중입니다...');const im=await imageFromFile(f);state.subject=im;state.scale=1;state.offsetX=state.offsetY=0;state.cutReady=false;undoMask=null;resetMask();refreshControls.forEach(f=>f());$('empty').style.display='none';$('preview').style.display='block';$('dimensions').textContent=`${im.naturalWidth.toLocaleString()} × ${im.naturalHeight.toLocaleString()} px`;$('outputInfo').textContent=`원본 ${im.naturalWidth} × ${im.naturalHeight} px · 미리보기는 축소 표시됩니다.`;requestDraw();updateStatus('원본 사진 로딩 완료. 배경을 지우려면 분리 탭에서 브러시를 사용하거나 자동 배경 분리(베타)를 눌러주세요.')}catch(e){updateStatus(e.message)}}
$('subjectInput').addEventListener('change',e=>{loadSubject(e.target.files[0]);e.target.value=''});$('emptyInput').addEventListener('change',e=>{loadSubject(e.target.files[0]);e.target.value=''});$('backgroundInput').onchange=async e=>{if(!e.target.files[0])return;try{state.bg=await imageFromFile(e.target.files[0]);state.bgScale=100;state.bgShiftX=state.bgShiftY=0;refreshControls.forEach(f=>f());requestDraw();updateStatus(state.cutReady?'배경 사진 적용 완료.':'배경 사진을 불러왔습니다. 원본 배경 분리 후 표시됩니다.')}catch(err){updateStatus(err.message)}};
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tabs button').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.panel').forEach(x=>x.classList.toggle('active',x.id==='panel-'+b.dataset.tab))});
document.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{if(state.subject&&!state.cutReady)updateStatus('배경색이 선택됐습니다. 원본 배경을 제거하려면 상단의 단색 배경 빠른 분리 또는 자동 배경 분리를 실행하세요.');state.bgColor=b.dataset.color;state.bg=null;$('bgColor').value=state.bgColor;requestDraw()});$('bgColor').oninput=e=>{if(state.subject&&!state.cutReady)updateStatus('원본 배경을 먼저 분리해야 새 색상이 보입니다.');state.bgColor=e.target.value;state.bg=null;requestDraw()};
$('centerBackground').onclick=()=>{state.bgScale=100;state.bgShiftX=state.bgShiftY=0;refreshControls.forEach(f=>f());requestDraw()};
$('clearBackground').onclick=()=>{state.bg=null;requestDraw();updateStatus('배경 사진을 제거했습니다. 단색 배경이 표시됩니다.')};
$('shadowReset').onclick=()=>{Object.assign(state,{shadowX:35,shadowY:30,shadowOpacity:35,shadowBlur:28,shadowScale:95});refreshControls.forEach(f=>f());requestDraw()};
$('maskUndo').onclick=()=>{if(!undoMask||!state.mask){updateStatus('취소할 붓 작업이 없습니다.');return}const c=state.mask.getContext('2d');c.clearRect(0,0,state.mask.width,state.mask.height);c.drawImage(undoMask,0,0);undoMask=null;requestDraw();updateStatus('직전 붓 작업을 취소했습니다.')};
$('maskShow').onclick=()=>{state.showMask=!state.showMask;$('maskShow').classList.toggle('selected',state.showMask);requestDraw()};
$('compare').onchange=e=>{state.compare=e.target.checked;requestDraw()};$('protectFace').onchange=e=>{state.protect=e.target.checked;requestDraw()};$('shadowEnabled').onchange=e=>{state.shadow=e.target.checked;requestDraw()};
['paintOff','paintBg','paintErase','paintRestore'].forEach((id,i)=>{$(id).onclick=()=>{state.brush=['move','background','erase','restore'][i];['paintOff','paintBg','paintErase','paintRestore'].forEach(x=>$(x).classList.toggle('selected',x===id));updateStatus(state.brush==='move'?'인물을 드래그하여 이동합니다.':state.brush==='background'?'배경 사진을 드래그하여 이동합니다.':'사진을 드래그하여 마스크를 수정하세요.')}});
$('maskReset').onclick=()=>{state.cutReady=false;undoMask=null;resetMask();requestDraw();updateStatus('마스크를 초기화했습니다.')};$('reset').onclick=()=>{if(!confirm('현재 편집을 초기화할까요?'))return;location.reload()};$('fit').onclick=()=>requestDraw();
const canvas=$('preview');let drawPending=false;function requestDraw(){if(drawPending)return;drawPending=true;requestAnimationFrame(()=>{drawPending=false;previewDraw()})}
function drawScene(ctx,w,h,highQuality=false){if(!state.subject)return;const iw=state.subject.naturalWidth,ih=state.subject.naturalHeight,unit=w/iw;ctx.save();ctx.clearRect(0,0,w,h);if(state.compare){ctx.drawImage(state.subject,0,0,w,h);ctx.restore();return}
ctx.fillStyle=state.bgColor;ctx.fillRect(0,0,w,h);
if(state.bg){ctx.save();ctx.filter=`blur(${state.bgBlur*unit}px) brightness(${state.bgBrightness}%)`;const bw=state.bg.naturalWidth,bh=state.bg.naturalHeight,r=Math.max(w/bw,h/bh)*state.bgScale/100,ww=bw*r,hh=bh*r;ctx.drawImage(state.bg,(w-ww)/2+state.bgShiftX/100*w,(h-hh)/2+state.bgShiftY/100*h,ww,hh);ctx.restore()}else if(state.bgBrightness!==100){ctx.fillStyle=state.bgBrightness>100?`rgba(255,255,255,${Math.min(.6,(state.bgBrightness-100)/150)})`:`rgba(0,0,0,${Math.min(.7,(100-state.bgBrightness)/100)})`;ctx.fillRect(0,0,w,h)}
if(state.bgWarmth){ctx.fillStyle=state.bgWarmth>0?`rgba(255,150,60,${state.bgWarmth/700})`:`rgba(70,145,255,${-state.bgWarmth/700})`;ctx.fillRect(0,0,w,h)}
// Background illumination remains available when subject pixels are locked.
if(state.lightPower>0){ctx.save();const a=state.lightAngle*Math.PI/180;const px=w*(.5+Math.sin(a)*.65),py=h*(.5-Math.cos(a)*(.35+state.lightHeight/300));const radius=Math.max(w,h)*(.4+state.lightSoft/120);const g=ctx.createRadialGradient(px,py,0,px,py,radius);const warm=Math.max(0,(6000-state.lightTemp)/3500),cool=Math.max(0,(state.lightTemp-6000)/4000);g.addColorStop(0,`rgba(${Math.round(255-cool*85)},${Math.round(252-warm*100)},${Math.round(240-warm*160)},${state.lightPower/230})`);g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.restore()}
const sx=state.offsetX/100*w,sy=state.offsetY/100*h,sw=w*state.scale,sh=h*state.scale,x=(w-sw)/2+sx,y=(h-sh)/2+sy;
// Make alpha-masked ORIGINAL-RGB subject. No AI re-render of facial features.
const subj=makeCanvas(w,h),sc=subj.getContext('2d');sc.drawImage(state.subject,x,y,sw,sh);if(state.mask){sc.globalCompositeOperation='destination-in';sc.drawImage(state.mask,x,y,sw,sh);sc.globalCompositeOperation='source-over'}
if(state.shadow&&state.shadowOpacity>0&&state.mask&&state.cutReady){
 const sil=makeCanvas(w,h),s=sil.getContext('2d');s.drawImage(subj,0,0);s.globalCompositeOperation='source-in';s.fillStyle='#111311';s.fillRect(0,0,w,h);
 ctx.save();ctx.globalAlpha=state.shadowOpacity/100;ctx.filter=`blur(${Math.max(.1,state.shadowBlur*unit)}px)`;const cx=w/2,cy=h*.88,scale=state.shadowScale/100;
 ctx.translate(cx+state.shadowX*unit,cy+state.shadowY*unit);ctx.scale(scale,Math.min(1.1,Math.max(.12,scale*.36)));ctx.translate(-cx,-cy);ctx.drawImage(sil,0,0);ctx.restore();
}
// Apply lighting only to the isolated subject layer. 'source-atop' on the whole output would incorrectly tint the background.
if(!state.protect){
 sc.save();sc.globalCompositeOperation='source-atop';const angle=state.lightAngle*Math.PI/180;
 const px=w*(.5+Math.sin(angle)*.6),py=h*(.5-Math.cos(angle)*(.28+state.lightHeight/320)),r=Math.max(w,h)*(.32+state.lightSoft/130);
 const grad=sc.createRadialGradient(px,py,r*.01,px,py,r);const strength=state.lightPower/100;
 const warm=Math.max(0,(6000-state.lightTemp)/3500),cool=Math.max(0,(state.lightTemp-6000)/4000);
 grad.addColorStop(0,`rgba(${Math.round(255-cool*90)},${Math.round(242-warm*72)},${Math.round(230-warm*145)},${strength*.7})`);
 grad.addColorStop(1,'rgba(0,0,0,0)');sc.fillStyle=grad;sc.fillRect(0,0,w,h);sc.restore();
}
ctx.drawImage(subj,0,0);
if(state.showMask&&state.cutReady){ctx.save();ctx.globalAlpha=.26;ctx.fillStyle='#54df9e';ctx.drawImage(subj,0,0);ctx.globalCompositeOperation='source-atop';ctx.fillRect(0,0,w,h);ctx.restore()}
ctx.restore()}
function previewDraw(){if(!state.subject)return;const w=state.subject.naturalWidth,h=state.subject.naturalHeight;const factor=Math.min(1,1200/Math.max(w,h));canvas.width=Math.max(1,Math.round(w*factor));canvas.height=Math.max(1,Math.round(h*factor));drawScene(canvas.getContext('2d'),canvas.width,canvas.height)}
let dragging=false,last=null;function coord(e){const rect=canvas.getBoundingClientRect();return{x:(e.clientX-rect.left)/rect.width*state.subject.naturalWidth,y:(e.clientY-rect.top)/rect.height*state.subject.naturalHeight}}function paint(point){if(!state.subject||!state.mask)return;const c=state.mask.getContext('2d');const iw=state.subject.naturalWidth,ih=state.subject.naturalHeight;const x=(point.x-iw*(1-state.scale)/2-state.offsetX/100*iw)/state.scale,y=(point.y-ih*(1-state.scale)/2-state.offsetY/100*ih)/state.scale;const r=state.brushSize/Math.max(.1,state.scale);
 c.save();c.globalCompositeOperation=state.brush==='erase'?'destination-out':'source-over';
 if(state.brushSoft>0){const gradient=c.createRadialGradient(x,y,Math.max(0,r*(1-state.brushSoft/100)),x,y,r);gradient.addColorStop(0,'rgba(255,255,255,1)');gradient.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=gradient}else c.fillStyle='#fff';
 c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();c.restore();state.cutReady=true;requestDraw()}
function saveMaskUndo(){if(!state.mask)return;undoMask=makeCanvas(state.mask.width,state.mask.height);undoMask.getContext('2d').drawImage(state.mask,0,0)}
canvas.addEventListener('pointerdown',e=>{if(!state.subject)return;dragging=true;last=coord(e);canvas.setPointerCapture(e.pointerId);if(state.brush==='erase'||state.brush==='restore'){try{saveMaskUndo()}catch(e){undoMask=null}paint(last)}});
canvas.addEventListener('pointermove',e=>{if(!dragging||!state.subject)return;const p=coord(e);
 if(state.brush==='move'){state.offsetX+=100*(p.x-last.x)/state.subject.naturalWidth;state.offsetY+=100*(p.y-last.y)/state.subject.naturalHeight;refreshControls.forEach(f=>f());requestDraw()}
 else if(state.brush==='background'){state.bgShiftX+=100*(p.x-last.x)/state.subject.naturalWidth;state.bgShiftY+=100*(p.y-last.y)/state.subject.naturalHeight;refreshControls.forEach(f=>f());requestDraw()}
 else{const d=Math.hypot(p.x-last.x,p.y-last.y),count=Math.max(1,Math.ceil(d/Math.max(3,state.brushSize*.35)));for(let i=1;i<=count;i++)paint({x:last.x+(p.x-last.x)*i/count,y:last.y+(p.y-last.y)*i/count})}last=p});
const stop=()=>dragging=false;canvas.addEventListener('pointerup',stop);canvas.addEventListener('pointercancel',stop);
async function exportImage(){if(!state.subject){updateStatus('원본 사진을 먼저 업로드하세요.');return}const w=state.subject.naturalWidth,h=state.subject.naturalHeight;if(w*h>90000000&&!confirm('매우 큰 사진입니다. 기기 메모리 부족으로 저장에 실패할 수 있어요. 계속할까요?'))return;updateStatus('원본 해상도로 렌더링 중입니다...');await new Promise(r=>setTimeout(r,40));try{const c=makeCanvas(w,h);drawScene(c.getContext('2d'),w,h,true);const format=$('format').value;const blob=await new Promise((res,rej)=>c.toBlob(x=>x?res(x):rej(new Error('기기 캔버스 제한으로 내보내기에 실패했습니다.')),format,Number($('quality').value)/100));const link=document.createElement('a');const url=URL.createObjectURL(blob);link.href=url;link.download=`DAMAH_AI_STUDIO_${Date.now()}.${format==='image/png'?'png':'jpg'}`;link.click();setTimeout(()=>URL.revokeObjectURL(url),20000);updateStatus(`완료: ${w} × ${h}px, ${(blob.size/1024/1024).toFixed(1)}MB`)}catch(e){updateStatus('저장 실패: '+e.message)}}$('export').onclick=exportImage;$('export2').onclick=exportImage;$('quality').oninput=e=>$('qualityText').textContent=e.target.value+'%';

$('quickCut').onclick=async()=>{
if(!state.subject){updateStatus('원본 사진을 먼저 불러오세요.');return}
const btn=$('quickCut');btn.disabled=true;updateStatus('가장자리 배경색을 분석하는 중...');await new Promise(r=>setTimeout(r,30));
try{
const iw=state.subject.naturalWidth,ih=state.subject.naturalHeight;
const ratio=Math.min(1,900/Math.max(iw,ih)),w=Math.max(1,Math.round(iw*ratio)),h=Math.max(1,Math.round(ih*ratio));
const sample=makeCanvas(w,h),cx=sample.getContext('2d',{willReadFrequently:true});cx.drawImage(state.subject,0,0,w,h);
const pixels=cx.getImageData(0,0,w,h).data;
const samples=[];for(let x=0;x<w;x+=Math.max(1,Math.floor(w/35))){for(const y of [0,h-1]){let i=(y*w+x)*4;samples.push([pixels[i],pixels[i+1],pixels[i+2]])}}
for(let y=0;y<h;y+=Math.max(1,Math.floor(h/35))){for(const x of [0,w-1]){let i=(y*w+x)*4;samples.push([pixels[i],pixels[i+1],pixels[i+2]])}}
const median=c=>samples.map(s=>s[c]).sort((a,b)=>a-b)[Math.floor(samples.length/2)];const base=[median(0),median(1),median(2)];const tolerance=state.quickTolerance;
const seen=new Uint8Array(w*h);const queue=new Int32Array(w*h);let head=0,tail=0;
function similar(q){let i=q*4;const d=Math.sqrt(((pixels[i]-base[0])**2+(pixels[i+1]-base[1])**2+(pixels[i+2]-base[2])**2)/3);return d<=tolerance*1.3}
function add(q){if(!seen[q]&&similar(q)){seen[q]=1;queue[tail++]=q}}
for(let x=0;x<w;x++){add(x);add((h-1)*w+x)}for(let y=0;y<h;y++){add(y*w);add(y*w+w-1)}
while(head<tail){const q=queue[head++],x=q%w,y=(q/w)|0;if(x>0)add(q-1);if(x<w-1)add(q+1);if(y>0)add(q-w);if(y<h-1)add(q+w)}
if(tail<Math.round(w*h*.015))throw new Error('배경으로 판단된 영역이 너무 적습니다. 단색 배경 사진인지 확인하고 허용 오차를 높여주세요.');
if(tail>Math.round(w*h*.97))throw new Error('사진 대부분이 배경으로 판단되었습니다. 허용 오차를 낮춰 다시 시도하세요.');
// Safety guard: a boundary flood must never erase the central portrait region.
// If background and dark facial/clothing pixels are similar, STOP before replacing the existing mask.
let central=0,removed=0;
for(let yy=Math.floor(h*.24);yy<Math.floor(h*.66);yy++)for(let xx=Math.floor(w*.32);xx<Math.floor(w*.68);xx++){
 const u=(xx-w*.5)/(w*.18),v=(yy-h*.45)/(h*.21);
 if(u*u+v*v<=1){central++;if(seen[yy*w+xx])removed++}
}
if(central&&removed/central>.22)throw new Error('인물 중심부까지 배경으로 판단되어 분리를 중단했습니다. 원본은 보존됩니다. 이 사진은 “자동 배경 분리 (베타)”를 사용하세요.');
// Border-flood results with too little foreground are unreliable.
if(tail>Math.round(w*h*.83))throw new Error('배경과 인물의 색상이 비슷해 안전한 분리가 어렵습니다. 원본은 보존됩니다. 자동 배경 분리(베타)를 이용하세요.');
const small=makeCanvas(w,h),sc=small.getContext('2d');const m=sc.createImageData(w,h);
for(let q=0;q<w*h;q++){const j=q*4;m.data[j]=m.data[j+1]=m.data[j+2]=255;m.data[j+3]=seen[q]?0:255}
sc.putImageData(m,0,0);const full=state.mask.getContext('2d');full.clearRect(0,0,iw,ih);full.imageSmoothingEnabled=true;full.drawImage(small,0,0,iw,ih);state.cutReady=true;requestDraw();updateStatus('단색 배경 빠른 분리 완료. 머리카락·의상 주변은 분리 탭에서 확인하고 브러시로 보정하세요.');
}catch(err){updateStatus('빠른 분리 실패: '+err.message)}finally{btn.disabled=false}
};

$('autoCut').onclick=async()=>{if(!state.subject){updateStatus('원본 사진을 먼저 불러오세요.');return}const btn=$('autoCut');btn.disabled=true;updateStatus('배경 분리 모델을 다운로드 중입니다. 첫 실행은 오래 걸릴 수 있으며 네트워크 연결이 필요합니다.');try{const {removeBackground}=await import('https://esm.sh/@imgly/background-removal@1.7.0');const source=makeCanvas(state.subject.naturalWidth,state.subject.naturalHeight);source.getContext('2d').drawImage(state.subject,0,0);const imgblob=await new Promise((res,rej)=>source.toBlob(b=>b?res(b):rej(new Error('원본 변환 실패')),'image/png'));const resultBlob=await removeBackground(imgblob,{progress:(key,current,total)=>{if(total)updateStatus(`배경 분리 준비: ${Math.round(current/total*100)}%`)}});const cut=await createImageBitmap(resultBlob);const mc=state.mask.getContext('2d');mc.clearRect(0,0,state.mask.width,state.mask.height);mc.drawImage(cut,0,0,state.mask.width,state.mask.height);const pixels=mc.getImageData(0,0,state.mask.width,state.mask.height);for(let i=0;i<pixels.data.length;i+=4){pixels.data[i]=255;pixels.data[i+1]=255;pixels.data[i+2]=255}mc.putImageData(pixels,0,0);state.cutReady=true;requestDraw();updateStatus('자동 배경 분리 완료. 가장자리는 분리 탭의 브러시로 수정해 주세요.')}catch(err){updateStatus('자동 분리에 실패했습니다. 브러시를 사용해 수동으로 수정하세요. '+err.message)}finally{btn.disabled=false}};
$('generateAI').onclick=async()=>{
 const prompt=$('aiPrompt').value.trim();if(!prompt){updateStatus('배경 설명을 입력하세요.');return}
 const endpoint=$('aiEndpoint').value.trim().replace(/\/$/,'');
 if(!/^https:\/\/[^\s]+$/.test(endpoint)){updateStatus('HTTPS AI 서버 주소를 정확히 입력해 주세요.');return}
 const token=$('studioToken').value.trim();if(!token){updateStatus('스튜디오 접근 암호를 입력하세요. API 키를 입력하면 안 됩니다.');return}
 const button=$('generateAI');button.disabled=true;button.textContent='배경 생성 중...';
 try{
  updateStatus('AI 배경 생성 중입니다. 사진 원본은 서버로 전송하지 않습니다.');
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),180000);
  let res;try{res=await fetch(endpoint+'/generate',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({prompt,size:$('aiSize').value}),signal:controller.signal})}finally{clearTimeout(timer)}
  if(!res.ok){const content=await res.json().catch(()=>({}));throw new Error(content.error||'서버 오류 '+res.status)}
  const blob=await res.blob();if(!blob.type.startsWith('image/'))throw new Error('AI 서버가 사진을 반환하지 않았습니다.');
  state.bg=await imageFromFile(blob);state.bgScale=100;state.bgShiftX=0;state.bgShiftY=0;refreshControls.forEach(f=>f());requestDraw();
  updateStatus(state.cutReady?'AI 배경 생성 완료. 합성 위치를 조절해 주세요.':'AI 배경 생성 완료. 인물을 먼저 분리하면 새 배경이 보입니다.');
 }catch(err){updateStatus('AI 생성 실패: '+(err.name==='AbortError'?'요청 시간 초과':err.message)+'. 서버 설정 및 접근 암호를 확인해 주세요.')}
 finally{button.disabled=false;button.textContent='AI 배경 생성'}
};
window.addEventListener('error',e=>updateStatus('실행 오류: '+e.message));window.addEventListener('unhandledrejection',e=>updateStatus('처리 오류: '+(e.reason?.message||e.reason)));console.log('DAMAH AI STUDIO v0.5 · background transform + feather brush + lighting layer fix');

$('aiEndpoint').value=localStorage.getItem('damah_ai_endpoint')||'';
$('aiEndpoint').addEventListener('change',()=>{const v=$('aiEndpoint').value.trim();if(v&&v.startsWith('https://'))localStorage.setItem('damah_ai_endpoint',v)});
