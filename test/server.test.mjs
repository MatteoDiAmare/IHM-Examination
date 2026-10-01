import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createServer} from '../server.mjs';
test('local API, persistence and isolated broken mission',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'backstage-'));const server=createServer(dir);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 try{
 assert.equal((await fetch(base+'/api/health')).status,200);
 assert.equal((await (await fetch(base+'/api/tracks')).json()).length,2);
 assert.equal((await fetch(base+'/api/trakcs')).status,404);
 const post=(url,value)=>fetch(base+url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(value)});
 assert.equal((await post('/api/events',{type:'play',trackId:'night-drive',visitorId:null})).status,422);
 assert.equal((await post('/api/events',{type:'play',trackId:'night-drive',visitorId:'visitor-test'})).status,202);
 const session={id:'test-session',missions:[{answers:{observation:'A <script> is text'}}]};
 assert.equal((await post('/api/sessions/test-session',session)).status,200);
 assert.deepEqual(await (await fetch(base+'/api/sessions/test-session')).json(),session);
 assert.equal((await post('/api/sessions/other-session',session)).status,422);
 assert.equal((await fetch(base+'/api/sessions/unknown')).status,404);
 assert.equal((await fetch(base+'/api/encore')).status,200);
 const broken=await (await fetch(base+'/missions/01/app.js')).text();assert.throws(()=>new Function(broken),SyntaxError);
 assert.equal((await fetch(base+'/app.js')).status,200);
 }finally{await new Promise(resolve=>server.close(resolve));await rm(dir,{recursive:true,force:true});}
});
