"use strict";(()=>{var e={};e.id=883,e.ids=[883],e.modules={30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},18309:(e,t,s)=>{s.r(t),s.d(t,{headerHooks:()=>h,originalPathname:()=>P,patchFetch:()=>D,requestAsyncStorage:()=>d,routeModule:()=>u,serverHooks:()=>m,staticGenerationAsyncStorage:()=>c,staticGenerationBailout:()=>f});var r={};s.r(r),s.d(r,{GET:()=>l,OPTIONS:()=>p});var n=s(95419),o=s(69108),a=s(99678),i=s(78070);async function l(e,{params:t}){try{let{sessionId:e}=t;console.log("\uD83D\uDCC4 PDF requested for session:",e);let s=`
Career Assessment Results
Session ID: ${e}
Generated: ${new Date().toISOString()}

This is a placeholder PDF endpoint.
Actual PDF generation will be implemented with jsPDF or puppeteer.

To implement:
1. Install: npm install jspdf
2. Generate PDF from session data
3. Return as blob/buffer
    `.trim();return new i(s,{status:200,headers:{"Content-Type":"text/plain","Content-Disposition":`attachment; filename="career-assessment-${e}.txt"`}})}catch(e){return console.error("❌ PDF generation error:",e),i.json({error:"Failed to generate PDF: "+e.message},{status:500})}}async function p(){return i.json({},{status:200,headers:{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET, OPTIONS","Access-Control-Allow-Headers":"Content-Type"}})}let u=new n.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/pdf/[sessionId]/route",pathname:"/api/pdf/[sessionId]",filename:"route",bundlePath:"app/api/pdf/[sessionId]/route"},resolvedPagePath:"C:\\Users\\SEELANGOV\\Desktop\\Thandi.ai\\app\\api\\pdf\\[sessionId]\\route.js",nextConfigOutput:"",userland:r}),{requestAsyncStorage:d,staticGenerationAsyncStorage:c,serverHooks:m,headerHooks:h,staticGenerationBailout:f}=u,P="/api/pdf/[sessionId]/route";function D(){return(0,a.patchFetch)({serverHooks:m,staticGenerationAsyncStorage:c})}}};var t=require("../../../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),r=t.X(0,[638,206],()=>s(18309));module.exports=r})();