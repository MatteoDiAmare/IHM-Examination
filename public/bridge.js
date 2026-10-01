// Provets mätning är skild från elevens trasiga kod. / Keep exam checks separate.
const missionId=Number(location.pathname.split('/')[2]);
const lang=new URLSearchParams(location.search).get('lang')==='en'?'en':'sv';
document.documentElement.lang=lang;
window.addEventListener('DOMContentLoaded',()=>document.querySelectorAll('[data-sv]').forEach(el=>el.textContent=el.dataset[lang]));
const evidence={requests:[],errors:[]};
window.addEventListener('error',e=>evidence.errors.push(e.message));
window.addEventListener('unhandledrejection',e=>evidence.errors.push(String(e.reason)));
const originalFetch=window.fetch.bind(window);
window.fetch=async(...args)=>{const response=await originalFetch(...args);let body;try{body=await response.clone().json();}catch{}if(evidence.requests.length>=30)evidence.requests.shift();evidence.requests.push({url:String(args[0]),method:args[1]?.method||'GET',status:response.status,body,at:new Date().toISOString()});return response;};
window.addEventListener('message',async e=>{
 if(e.origin!==location.origin||e.source!==parent||e.data?.type!=='check')return;
 let passed=false,detail='';
 try{
 switch(missionId){
 case 1:passed=document.querySelector('#status')?.dataset.ready==='true';break;
 case 2:{const el=document.querySelector('#artist');passed=!!el&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden'&&el.getBoundingClientRect().height>0;break;}
 case 3:document.querySelector('#status').dataset.playing='false';document.querySelector('#play').click();passed=document.querySelector('#status').dataset.playing==='true';break;
 case 4:passed=evidence.requests.some(r=>r.url==='/api/tracks'&&r.status===200)&&document.querySelectorAll('#tracks li').length===2;break;
 case 5:passed=localStorage.getItem('backstage-favourite')===document.querySelector('#favourite').value;break;
 case 6:passed=evidence.requests.some(r=>r.url==='/api/events'&&r.method==='POST'&&r.status===202&&r.body?.accepted);break;
 case 7:passed=evidence.requests.some(r=>r.url==='/api/encore'&&r.status===200)&&document.querySelector('#encore').textContent.includes('Encore: Moonrise');detail='render-only';break;
 }
 }catch(error){detail=error.message;}
 parent.postMessage({type:'check-result',missionId,token:e.data.token,passed,detail,evidence},location.origin);
});
