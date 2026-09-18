import test from 'node:test';
import assert from 'node:assert/strict';
import { requireSameOrigin, cookieValue, requireAdmin, sha256 } from '../functions/_lib/auth.js';
import { boundedBody, safeCsv } from '../functions/_lib/security.js';
import { onRequest } from '../functions/_middleware.js';
const url = 'https://e-world-community.pages.dev/api/admin/content';
test('cross-site and missing-origin mutations rejected', () => {
 assert.equal(requireSameOrigin(new Request(url,{method:'POST'}),{}),false);
 assert.equal(requireSameOrigin(new Request(url,{method:'POST',headers:{origin:'https://evil.example'}}),{}),false);
 assert.equal(requireSameOrigin(new Request(url,{method:'POST',headers:{origin:new URL(url).origin}}),{}),true);
 assert.equal(requireSameOrigin(new Request(url,{headers:{'sec-fetch-site':'cross-site'}}),{}),false);
});
test('malformed cookies cannot crash parsing', () => {
 assert.equal(cookieValue(new Request(url,{headers:{cookie:'x=%zz'}}),'x'),'');
});
test('body cap works without Content-Length', async () => {
 await assert.rejects(boundedBody(new Request(url,{method:'POST',body:'x'.repeat(5000)}),4096),e=>e.status===413);
});
test('CSV formulas escaped including whitespace prefix', () => {
 for (const value of ['=1+1','+cmd','@SUM(1)','-1+2','  =1','\t=1']) assert.ok(safeCsv(value).startsWith('"\''));
 assert.equal(safeCsv('Team "A"'),'"Team ""A"""');
});
test('valid session still requires CSRF for writes', async () => {
 const token='a'.repeat(43);
 const env={DB:{prepare:()=>({bind:()=>({first:async()=>({csrf_token:'correct'})})})}};
 const req=new Request(url,{method:'PATCH',headers:{origin:new URL(url).origin,cookie:`__Host-eworld_admin=${token}`}});
 assert.equal((await requireAdmin(req,env,{csrf:true})).error.status,403);
});
test('middleware rejects null JSON and hides internal exceptions', async () => {
 const request=new Request(url,{method:'PATCH',headers:{origin:new URL(url).origin,'content-type':'application/json'},body:'null'});
 assert.equal((await onRequest({request,env:{},next:()=>{throw Error('private SQL')}})).status,400);
 const error=await onRequest({request:new Request(url),env:{},next:()=>{throw Error('private SQL')}});
 assert.equal(error.status,503); assert.ok(!(await error.text()).includes('SQL'));
});
test('bounded middleware forwards readable body', async () => {
 const request=new Request(url,{method:'PATCH',headers:{origin:new URL(url).origin,'content-type':'application/json'},body:'{"title":"Valid"}'});
 const result=await onRequest({request,env:{},next:async forwarded=>new Response((await forwarded.json()).title)});
 assert.equal(await result.text(),'Valid');
});
