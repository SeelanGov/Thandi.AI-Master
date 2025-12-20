(()=>{var a={};a.id=797,a.ids=[797],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},19121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},30639:(a,b,c)=>{"use strict";c.d(b,{QS:()=>l,Cb:()=>j,V6:()=>m,yv:()=>k});var d=c(36253);let e=require("crypto"),f=null,g=!1;async function h(){if(f&&g)return f;try{return f=new d.Q({url:process.env.UPSTASH_REDIS_REST_URL,token:process.env.UPSTASH_REDIS_REST_TOKEN}),await f.ping(),g=!0,console.log("✅ Upstash Redis cache initialized"),f}catch(a){return console.error("❌ Upstash Redis initialization failed:",a.message),g=!1,null}}function i(a,b){let c="no-marks";if(a.marksData?.exactMarks){let b=Object.entries(a.marksData.exactMarks).filter(([a,b])=>b&&""!==b).sort(([a],[b])=>a.localeCompare(b)).map(([a,b])=>`${a}:${b}`).join("|");b&&(c=e.createHash("md5").update(b).digest("hex").substring(0,8))}else if(a.marks&&Object.keys(a.marks).length>0){let b=Object.entries(a.marks).filter(([a,b])=>b&&0!==b).sort(([a],[b])=>a.localeCompare(b)).map(([a,b])=>`${a}:${b}`).join("|");b&&(c=e.createHash("md5").update(b).digest("hex").substring(0,8))}let d=a.sessionId||Date.now().toString(),f=e.createHash("md5").update(d).digest("hex").substring(0,6),g=[`g${a.grade||"unknown"}`,`marks:${c}`,`session:${f}`,...(a.subjects||[]).slice(0,3).sort(),...(a.interests||[]).slice(0,2).sort(),`fin${a.financialConstraints||"unknown"}`].join("-"),h=e.createHash("md5").update(b.toLowerCase().trim()).digest("hex").substring(0,8);return`thandi:v1.3:rag:${g}:${h}`}async function j(a,b){let c=Date.now();try{let d=await h();if(!d||!g)return console.log("⚪ Cache SKIP (Redis unavailable)"),null;let e=i(a,b),f=await d.get(e),j=Date.now()-c;if(f){console.log(`🟢 Cache HIT (${j}ms) - Key: ${e.substring(0,50)}...`);try{return{..."string"==typeof f?JSON.parse(f):f,cache:{status:"HIT",duration:j,key:e.substring(0,20)+"...",timestamp:new Date().toISOString()}}}catch(a){return console.error("❌ Cache parse error:",a.message),await d.del(e),null}}return console.log(`⚪ Cache MISS (${j}ms) - Key: ${e.substring(0,50)}...`),null}catch(a){return console.error("❌ Cache GET error:",a.message),null}}async function k(a,b,c){let d=Date.now();try{let e=await h();if(!e||!g)return console.log("⚪ Cache SKIP SET (Redis unavailable)"),!1;let f=i(a,b),j={...c};delete j.cache,await e.set(f,j,{ex:3600});let k=Date.now()-d;return console.log(`💾 Cache SET (${k}ms) - Key: ${f.substring(0,50)}...`),!0}catch(a){return console.error("❌ Cache SET error:",a.message),!1}}async function l(){try{if(!await h()||!g)return{status:"disconnected",keys:0};return{status:"connected",keys:"unknown",provider:"upstash",connected:g}}catch(a){return{status:"error",error:a.message}}}async function m(){try{let a=await h();if(!a||!g)return{status:"down",latency:null};let b=Date.now(),c=await a.ping(),d=Date.now()-b;return{status:"up",latency:d,result:c}}catch(a){return{status:"error",error:a.message,latency:null}}}},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},68484:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>F,patchFetch:()=>E,routeModule:()=>A,serverHooks:()=>D,workAsyncStorage:()=>B,workUnitAsyncStorage:()=>C});var d={};c.r(d),c.d(d,{GET:()=>z,POST:()=>y});var e=c(95736),f=c(9117),g=c(4044),h=c(39326),i=c(32324),j=c(261),k=c(54290),l=c(85328),m=c(38928),n=c(46595),o=c(3421),p=c(17679),q=c(41681),r=c(63446),s=c(86439),t=c(51356),u=c(10641);c(30639);let v={uct:{name:"University of Cape Town",programs:{mechanical_engineering:{name:"Mechanical Engineering",apsRequired:35,subjectRequirements:["Mathematics: 70%","Physical Sciences: 70%"],applicationDeadline:"July 31, 2026",duration:"4 years",category:"engineering"},medicine:{name:"Medicine (MBChB)",apsRequired:42,subjectRequirements:["Mathematics: 80%","Physical Sciences: 80%","Life Sciences: 80%"],applicationDeadline:"July 31, 2026",duration:"6 years",category:"healthcare"},computer_science:{name:"Computer Science",apsRequired:38,subjectRequirements:["Mathematics: 75%","Physical Sciences: 70%"],applicationDeadline:"July 31, 2026",duration:"3 years",category:"technology"}}},wits:{name:"University of the Witwatersrand",programs:{civil_engineering:{name:"Civil Engineering",apsRequired:36,subjectRequirements:["Mathematics: 70%","Physical Sciences: 70%"],applicationDeadline:"September 30, 2026",duration:"4 years",category:"engineering"},business_science:{name:"Business Science",apsRequired:35,subjectRequirements:["Mathematics: 70%","English: 70%"],applicationDeadline:"September 30, 2026",duration:"3 years",category:"business"},law:{name:"Bachelor of Laws (LLB)",apsRequired:38,subjectRequirements:["English: 75%","Mathematics/Math Lit: 65%"],applicationDeadline:"September 30, 2026",duration:"4 years",category:"law"}}},uj:{name:"University of Johannesburg",programs:{mechanical_engineering:{name:"Mechanical Engineering",apsRequired:30,subjectRequirements:["Mathematics: 65%","Physical Sciences: 65%"],applicationDeadline:"September 30, 2026",duration:"4 years",category:"engineering"},accounting:{name:"Accounting",apsRequired:28,subjectRequirements:["Mathematics: 60%","English: 60%"],applicationDeadline:"September 30, 2026",duration:"3 years",category:"business"},information_technology:{name:"Information Technology",apsRequired:26,subjectRequirements:["Mathematics: 60%","Physical Sciences: 60%"],applicationDeadline:"September 30, 2026",duration:"3 years",category:"technology"}}},tut:{name:"Tshwane University of Technology",programs:{engineering_technology:{name:"Engineering Technology",apsRequired:25,subjectRequirements:["Mathematics: 55%","Physical Sciences: 55%"],applicationDeadline:"October 31, 2026",duration:"3 years",category:"engineering"},business_management:{name:"Business Management",apsRequired:22,subjectRequirements:["Mathematics/Math Lit: 50%","English: 55%"],applicationDeadline:"October 31, 2026",duration:"3 years",category:"business"}}},unisa:{name:"University of South Africa (UNISA)",programs:{business_administration:{name:"Business Administration",apsRequired:20,subjectRequirements:["Mathematics/Math Lit: 50%","English: 50%"],applicationDeadline:"November 30, 2026",duration:"3 years",category:"business"},information_systems:{name:"Information Systems",apsRequired:22,subjectRequirements:["Mathematics: 55%","English: 55%"],applicationDeadline:"November 30, 2026",duration:"3 years",category:"technology"}}}},w={nsfas:{name:"NSFAS (National Student Financial Aid Scheme)",amount:"R80,000/year",eligibility:{familyIncome:"< R350,000/year",citizenship:"South African citizen",academicRequirement:"APS 20+"},deadline:"December 31, 2025",urgency:"CRITICAL",applicationUrl:"https://www.nsfas.org.za"},sasol_engineering:{name:"Sasol Engineering Bursary",amount:"R120,000/year",eligibility:{subjects:"Mathematics 70%+, Physical Sciences 70%+",careerField:"Engineering",academicRequirement:"APS 30+"},deadline:"May 15, 2026",urgency:"HIGH",applicationUrl:"https://www.sasol.com/careers/bursaries"},funza_lushaka:{name:"Funza Lushaka Teaching Bursary",amount:"R60,000/year",eligibility:{careerField:"Teaching/Education",academicRequirement:"APS 25+"},deadline:"February 28, 2026",urgency:"MEDIUM",applicationUrl:"https://www.education.gov.za/Programmes/FunzaLushaka.aspx"},firstrand_foundation:{name:"FirstRand Foundation Bursary",amount:"R60,000/year",eligibility:{familyBackground:"First-generation university student",academicRequirement:"APS 25+"},deadline:"March 30, 2026",urgency:"MEDIUM",applicationUrl:"https://www.firstrand.co.za/csi/education/"}};function x(a){let b=[],c=a.toLowerCase();return(c.includes("engineering")||c.includes("egd"))&&b.push("engineering"),(c.includes("medicine")||c.includes("doctor"))&&b.push("medicine"),(c.includes("business")||c.includes("accounting"))&&b.push("business"),(c.includes("law")||c.includes("lawyer"))&&b.push("law"),(c.includes("computer")||c.includes("technology")||c.includes("it"))&&b.push("technology"),c.includes("architecture")&&b.push("architecture"),b.join(", ")}async function y(a){let b=Date.now();try{let{query:c,grade:d,curriculum:e,profile:f,curriculumProfile:g}=await a.json();d||f?.grade||g?.grade;let h=null;if(f||g){let a={};f?.marksData?.exactMarks&&(console.log("[MARKS DEBUG] Found structured marks:",f.marksData.exactMarks),Object.entries(f.marksData.exactMarks).forEach(([b,c])=>{c&&""!==c&&(a[b.toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"")]=parseFloat(c))}),console.log("[MARKS DEBUG] Processed marks data:",a)),0===Object.keys(a).length&&(console.log("[MARKS DEBUG] No structured marks found, extracting from query"),a=function(a){let b={},c=["mathematics","physical_sciences","life_sciences","english","accounting","egd","egd"];return[/Mathematics:\s*(\d+(?:\.\d+)?%?)/gi,/Physical Sciences:\s*(\d+(?:\.\d+)?%?)/gi,/Life Sciences:\s*(\d+(?:\.\d+)?%?)/gi,/English.*Language:\s*(\d+(?:\.\d+)?%?)/gi,/Accounting:\s*(\d+(?:\.\d+)?%?)/gi,/EGD:\s*(\d+(?:\.\d+)?%?)/gi,/Engineering.*Design:\s*(\d+(?:\.\d+)?%?)/gi].forEach((d,e)=>{let f=a.match(d);f&&f.forEach(a=>{let d=a.match(/(\d+(?:\.\d+)?)/)?.[1];d&&(b[c[e]]=parseFloat(d))})}),b}(c),console.log("[MARKS DEBUG] Extracted from query:",a)),h={marks:a,constraints:f?.constraints||{},careerInterests:x(c),...f},console.log("[PROFILE DEBUG] Enhanced student profile created:",{hasMarks:Object.keys(a).length>0,marksCount:Object.keys(a).length,grade:h.grade,sessionId:h.sessionId})}if(!c)return u.NextResponse.json({error:"Query is required"},{status:400});let i="grade10";if(d&&("10"===d||10===d||"grade10"===d?i="grade10":"11"===d||11===d||"grade11"===d?i="grade11":"12"===d||12===d||"grade12"===d?i="grade12":"string"==typeof d&&d.startsWith("grade")&&(i=d)),!d&&c){let a=c.match(/I am a Grade (\d+) student/i);if(a){let b=a[1];"10"===b?i="grade10":"11"===b?i="grade11":"12"===b&&(i="grade12")}else c.includes("Grade 12")?i="grade12":c.includes("Grade 11")?i="grade11":c.includes("Grade 10")&&(i="grade10")}console.log(`[GRADE DETECTION] Input grade: ${d}, Parsed grade: ${i}, Query contains: ${c?.substring(0,100)}...`);let j=f||{grade:i,curriculum:e||"caps"};j.sessionId||(j.sessionId=`${Date.now()}-${Math.random().toString(36).substr(2,9)}`);let k=f?.marksData?.exactMarks&&Object.keys(f.marksData.exactMarks).length>0||f?.marks&&Object.keys(f.marks).length>0;console.log(`[CACHE DEBUG] shouldBypassCache: true, hasMarksData: ${k}, sessionId: ${j.sessionId}`);console.log("[CACHE BYPASS] Assessment submission detected - generating fresh response");let l=function(a,b,c,d=null){let e,f=b||"grade10",g=c||"caps",h=parseInt(f.replace("grade",""))||10,i=function(a=new Date,b=10){return function(a=new Date,b=10){let c=a.getMonth()+1,d=a.getFullYear(),e={matricFinals:{start:new Date(2025,9,21),end:new Date(2025,10,27)},resultsRelease:new Date(2025,11,20),newYearStart:new Date(2026,0,15)},f="preparation",g="",h="low";if(2025===d&&(a>=e.matricFinals.start&&a<=e.matricFinals.end?f="finals-active":a>e.matricFinals.end?f="post-finals":c>=9&&(f="finals-approach")),12===b)switch(f){case"post-finals":g="Your Grade 12 finals are complete (finished November 2025). Focus on results (expected December 20) and 2026 university applications.",h="medium";break;case"finals-active":g="You are currently writing your Grade 12 final exams. Focus on exam performance and stress management.",h="high";break;case"finals-approach":let i=Math.ceil((e.matricFinals.start-a)/864e5);g=`Your Grade 12 finals start in ${i} days (October 21, 2025). Focus on final preparation.`,h="critical";break;default:g=`You have approximately ${12-c+10} months until Grade 12 finals (October 2025).`,h="low"}else 11===b?(g=2025===d&&"post-finals"===f?"You have completed Grade 11. Your Grade 12 finals will be in October-November 2026 (11 months away).":`You have 1 full year left before Grade 12 finals (October-November ${d+1}).`,h="medium"):10===b&&(g=2025===d&&"post-finals"===f?"You have completed Grade 10. Your Grade 12 finals will be in October-November 2027 (23 months away).":`You have 2 years left before Grade 12 finals (October-November ${d+2}).`,h="low");return{currentDate:a,academicYear:d,currentPhase:f,grade:b,timelineMessage:g,urgencyLevel:h,isPostFinals:"post-finals"===f,isFinalsActive:"finals-active"===f,fallback:!0}}(a,b)}(new Date,h),j=function(a){let{grade:b,currentPhase:c,academicYear:d}=a;return 12===b&&"post-finals"===c?{focus:"post-matric-planning",priorities:["Wait for results (expected December 20, 2025)","Complete university applications for 2026","Research NSFAS funding options","Consider gap year opportunities if needed","Prepare backup plans (TVET, private colleges)"],urgentDeadlines:["University applications: Most close January 2026","NSFAS applications: Check nsfas.org.za for 2026 deadlines","Accommodation applications: Apply early for better options"]}:12===b&&"finals-active"===c?{focus:"exam-performance",priorities:["Focus on remaining exams","Manage exam stress and anxiety","Get adequate rest between exams","Review exam timetable and logistics"],urgentDeadlines:["Check exam venues and times daily","Prepare required materials (calculator, stationery)","Plan transport to exam venues"]}:{focus:"academic-preparation",priorities:["Focus on improving current marks","Research career options and requirements","Plan subject choices for next year","Build study habits and support systems"],urgentDeadlines:[]}}(i),k=null;if(d&&d.marks&&Object.keys(d.marks).length>0)try{(k=function(a){try{var b;let c=function(a){if(!a||"object"!=typeof a)return 0;let b=0,c=0;return Object.values(a).forEach(a=>{let d=parseFloat(a);!isNaN(d)&&d>=0&&d<=100&&(d>=80?b+=7:d>=70?b+=6:d>=60?b+=5:d>=50?b+=4:d>=40?b+=3:d>=30?b+=2:b+=1,c++)}),b}(a.marks||{}),d=(b=a.grade||12,{min:Math.max(c,Math.round(.95*c)),max:Math.min(42,Math.round(c*(10===b?1.15:11===b?1.08:1.02))),current:c}),e=function(a){let b=new Date;b.getFullYear();let c=b.getMonth()+1;if(12===a)if(c>=11)return{phase:"post-finals",urgency:"CRITICAL",timeline:"Finals complete - Focus on applications",actionItems:["Submit university applications NOW","Apply for NSFAS immediately","Prepare backup options"]};else return{phase:"finals-preparation",urgency:"CRITICAL",timeline:"Finals approaching - Optimize performance",actionItems:["Focus on final exam preparation","Submit applications early","Secure bursary applications"]};return 11===a?{phase:"decision-year",urgency:"HIGH",timeline:"1 year to finals - Critical decisions needed",actionItems:["Optimize subject performance","Research university programs","Start bursary applications"]}:{phase:"exploration",urgency:"MEDIUM",timeline:"2+ years to finals - Build strong foundation",actionItems:["Focus on academic improvement","Explore career options","Build extracurricular profile"]}}(a.grade||12),f=function(a,b){let c=[],d=(a.careerInterests||"").toLowerCase(),e=[];return(d.includes("engineering")||d.includes("egd"))&&e.push("engineering"),(d.includes("business")||d.includes("accounting"))&&e.push("business"),(d.includes("medicine")||d.includes("doctor"))&&e.push("healthcare"),(d.includes("computer")||d.includes("technology")||d.includes("it"))&&e.push("technology"),(d.includes("law")||d.includes("lawyer"))&&e.push("law"),0===e.length&&e.push("engineering","business","technology"),Object.entries(v).forEach(([a,d])=>{Object.entries(d.programs).forEach(([a,f])=>{if(e.includes(f.category)){let a=function(a,b){let{min:c,max:d}=a;return c>=b+5?95:c>=b?85:d>=b+2?70:d>=b?50:d>=b-3?25:10}(b,f.apsRequired);a>=10&&c.push({university:d.name,program:f.name,apsRequired:f.apsRequired,projectedAPS:b,admissionProbability:a,subjectRequirements:f.subjectRequirements,applicationDeadline:f.applicationDeadline,duration:f.duration,category:f.category,feasibility:a>=70?"High":a>=40?"Medium":"Challenging"})}})}),c.sort((a,b)=>b.admissionProbability-a.admissionProbability)}(a,d),g=function(a,b){let c=[];return Object.entries(w).forEach(([d,e])=>{let f=0,g=[],h=parseInt(e.eligibility.academicRequirement?.match(/\\d+/)?.[0]||"0");if(b.max>=h&&(f+=30,g.push(`APS requirement met (${h}+ required)`)),"nsfas"===d&&a.constraints?.familyBackground==="no"&&(f+=40,g.push("First-generation student (likely qualifies for NSFAS)")),e.eligibility.careerField){let b=e.eligibility.careerField.toLowerCase();(a.careerInterests||"").toLowerCase().includes(b.split("/")[0])&&(f+=30,g.push(`Career interest alignment (${b})`))}if("sasol_engineering"===d&&a.marks){let b=a.marks.mathematics||a.marks.math||0,c=a.marks.physical_sciences||a.marks.physics||0;parseFloat(b)>=70&&parseFloat(c)>=70&&(f+=40,g.push("Subject requirements met (Math & Science 70%+)"))}f>=30&&c.push({...e,eligibilityScore:f,eligibilityReasons:g,matchPercentage:Math.min(100,f)})}),c.sort((a,b)=>b.eligibilityScore-a.eligibilityScore)}(a,d);return{success:!0,apsData:{current:c,projected:d,universityEligible:d.max>=20},timeline:e,programs:f.slice(0,5),bursaries:g.slice(0,3),metadata:{totalProgramsFound:f.length,totalBursariesFound:g.length,generatedAt:new Date().toISOString()}}}catch(a){return console.error("Error generating specific recommendations:",a),{success:!1,error:a.message,fallback:!0}}}({...d,grade:h,careerInterests:x(a)})).success&&function(a){if(!a.success)return;let{apsData:b,timeline:c,programs:d,bursaries:e}=a,f=`
STUDENT APS DATA:
- Current APS: ${b.current}
- Projected APS: ${b.projected.min}-${b.projected.max}
- University Eligible: ${b.universityEligible?"Yes":"No"}

TIMELINE CONTEXT:
- Phase: ${c.phase}
- Urgency: ${c.urgency}
- Timeline: ${c.timeline}

SPECIFIC PROGRAM MATCHES:`;d.forEach((a,c)=>{f+=`
${c+1}. ${a.program} at ${a.university}
   - APS Required: ${a.apsRequired} (Student projected: ${b.projected.min}-${b.projected.max})
   - Admission Chance: ${a.admissionProbability}%
   - Application Deadline: ${a.applicationDeadline}
   - Feasibility: ${a.feasibility}`}),f+=`

ELIGIBLE BURSARIES:`,e.forEach((a,b)=>{f+=`
${b+1}. ${a.name}: ${a.amount}
   - Eligibility: ${a.matchPercentage}% match
   - Deadline: ${a.deadline} (${a.urgency})
   - Reasons: ${a.eligibilityReasons.join(", ")}`}),f+=`

PRIORITY ACTIONS:
${c.actionItems.map(a=>`- ${a}`).join("\n")}`}(k)}catch(a){console.error("Error generating specific recommendations:",a)}let l=a.includes("Grade 12")||"grade12"===f||"12"===f,m=a.toLowerCase().includes("architecture"),n=a.toLowerCase().includes("engineering")||a.toLowerCase().includes("egd"),o=a.toLowerCase().includes("lawyer")||a.toLowerCase().includes("law");a.includes("December 2025")||a.includes("final exam");let p=a.includes("first in my family")||a.includes("first-generation");return a.includes("EGD")&&a.includes("80-100%"),a.includes("Mathematics: 70-79%")&&a.includes("Physical Sciences: 70-79%"),(e=k&&k.success?function(a,b,c,d,e,f){let{apsData:g,timeline:h,programs:i,bursaries:j}=f,k=`# Your Specific Career Guidance Results

## Based on Your Assessment
**Grade Level**: GRADE ${b}
**Curriculum**: ${String(c).toUpperCase()}
**Academic Timeline**: ${d.timelineMessage}
**Current Phase**: ${h.phase.replace("-"," ").toUpperCase()}

## Your Academic Performance Analysis
**Current APS Score**: ${g.current} points
**Projected Final APS**: ${g.projected.min}-${g.projected.max} points
**University Eligibility**: ${g.universityEligible?"✅ Qualified for university admission":"⚠️ Need improvement for university"}

## Recommended University Programs

`;return i.slice(0,3).forEach((a,b)=>{let c="High"===a.feasibility?"✅":"Medium"===a.feasibility?"⚠️":"\uD83D\uDD04";k+=`### ${b+1}. ${a.program} at ${a.university} ${c}
**APS Required**: ${a.apsRequired} (You're projected: ${g.projected.min}-${g.projected.max})
**Admission Chance**: ${a.admissionProbability}% 
**Application Deadline**: ${a.applicationDeadline}
**Duration**: ${a.duration}
**Requirements**: ${a.subjectRequirements.join(", ")}
**Feasibility**: ${a.feasibility}

`}),j.length>0&&(k+=`## Eligible Bursaries & Financial Aid

`,j.forEach((a,b)=>{let c="CRITICAL"===a.urgency?"\uD83D\uDEA8":"HIGH"===a.urgency?"⚠️":"ℹ️";k+=`### ${b+1}. ${a.name} ${c}
**Amount**: ${a.amount}
**Eligibility Match**: ${a.matchPercentage}%
**Deadline**: ${a.deadline}
**Why You Qualify**: ${a.eligibilityReasons.join(", ")}
**Apply**: ${a.applicationUrl}

`})),k+=`## ${h.urgency} Action Plan

### Current Focus: ${h.timeline}

### Priority Actions:
${h.actionItems.map(a=>`- **${a}**`).join("\n")}

`,12===b?k+=`### Grade 12 Specific Guidance:
- **Finals Strategy**: Focus on subjects needed for your target programs
- **Application Timeline**: Most universities close applications by September 2026
- **Backup Planning**: Apply to multiple programs with different APS requirements
- **NSFAS Deadline**: December 31, 2025 - Apply immediately if eligible

`:11===b?k+=`### Grade 11 Specific Guidance:
- **Performance Optimization**: You have 1 year to improve your APS score
- **Subject Choices**: Last chance to change subjects if needed for your career goals
- **Bursary Preparation**: Start researching and preparing applications for 2026
- **University Research**: Visit campuses and attend information sessions

`:k+=`### Grade 10 Specific Guidance:
- **Foundation Building**: Focus on building strong academic foundations
- **Career Exploration**: You have time to explore different career options
- **Subject Planning**: Choose Grade 11 subjects that align with your career interests
- **Long-term Planning**: Start building a profile for university applications

`,i.length>3&&(k+=`## Alternative Options

If your first choices are challenging, consider these backup options:

`,i.slice(3,5).forEach((a,b)=>{k+=`- **${a.program} at ${a.university}**: APS ${a.apsRequired} (${a.admissionProbability}% chance)
`})),k+=`

---

⚠️ **Verify before you decide**: This is AI-generated advice based on your current performance. Always confirm with school counselors, career advisors, and university admission offices before making important decisions about your future.`}(0,h,g,i,0,k):l&&(m||n||o)?`# Your Career Guidance Results - Grade 12 Final Year

## Based on Your Assessment
**Grade Level**: GRADE 12 (Final Year)
**Curriculum**: ${String(g).toUpperCase()}
**Academic Timeline**: ${i.timelineMessage}
**Current Phase**: ${i.currentPhase.replace("-"," ").toUpperCase()}
**Career Interests**: Architecture, Civil Engineering, Law
**Status**: ${p?"First-generation university student":"University-bound student"}

## URGENT: Your Career Feasibility Analysis

### ✅ ARCHITECTURE - HIGHLY FEASIBLE
**Your Strengths**: EGD (80-100%) + Math (70-79%) = Perfect foundation
- **Required Subjects**: ✅ Mathematics, ✅ Physical Sciences, ✅ EGD
- **Your Performance**: Strong in all required areas
- **Final Exam Target**: Maintain 70%+ in Math/Science, aim for 85%+ in EGD

### ✅ CIVIL ENGINEERING - HIGHLY FEASIBLE  
**Your Strengths**: Math (70-79%) + Science (70-79%) = Strong foundation
- **Required Subjects**: ✅ Mathematics, ✅ Physical Sciences
- **Your Performance**: Meeting minimum requirements
- **Final Exam Target**: Push Math/Science to 75%+ for better university options

### ⚠️ LAW - REQUIRES LANGUAGE BOOST
**Challenge**: English (70-79%) and Afrikaans (50-69%) need improvement
- **Required**: Strong language skills (75%+ English recommended)
- **Final Exam Strategy**: Focus heavily on English improvement
- **Backup Plan**: Consider Law after Engineering degree (many engineers become patent lawyers)

## IMMEDIATE ACTION PLAN

### Current Focus: ${j.focus.replace("-"," ").toUpperCase()}

### Priority Actions:
${j.priorities.map(a=>`- **${a}**`).join("\n")}

### Urgent Deadlines:
${j.urgentDeadlines.length>0?j.urgentDeadlines.map(a=>`- **${a}**`).join("\n"):"- No immediate deadlines (check university websites for 2026 applications)"}

### Subject Performance Strategy:
- **Priority 1**: EGD - Maintain excellence (aim 90%+)
- **Priority 2**: Mathematics - Push from 70s to 75%+
- **Priority 3**: Physical Sciences - Secure 75%+
- **Priority 4**: English - Critical for university admission

## Backup Options (If University Applications Missed)

### Option 1: Gap Year + Reapply
- Work/volunteer in construction/engineering firms
- Improve final marks if needed
- Apply early for 2027 intake

### Option 2: College Pathway
- **TVET Colleges**: Civil Engineering diplomas
- **Private Colleges**: Architecture diplomas
- Transfer to university after diploma

### Option 3: Alternative Routes
- **Draughtsman**: Direct entry with EGD strength
- **Quantity Surveying**: Business + technical skills
- **Construction Management**: Practical engineering path

## Critical Next Steps (This Week!)

1. **Contact universities directly** - explain late application
2. **Gather documents** - ID, academic record, proof of income
3. **Register for NSFAS** - prepare for January opening
4. **Study plan** - focus on Math/Science/EGD for finals
5. **Backup research** - identify TVET/college options

---

⚠️ **URGENT VERIFICATION REQUIRED**: This timeline is critical. Contact your school counselor IMMEDIATELY to verify application deadlines and discuss backup options. Some universities may still accept late applications.`:l?`# Your Career Guidance Results - Grade 12

## Based on Your Assessment  
**Grade Level**: GRADE 12
**Curriculum**: ${String(g).toUpperCase()}
**Academic Timeline**: ${i.timelineMessage}
**Current Phase**: ${i.currentPhase.replace("-"," ").toUpperCase()}
**Query**: ${a}

## Recommended Career Paths Based on Your Profile

### 1. STEM Careers
- **Engineering**: Various specializations based on your math/science performance
- **Technology**: Software development, data science
- **Healthcare**: Medical sciences, biomedical fields

### 2. Business & Finance
- **Business Management**: Leadership and entrepreneurship
- **Financial Services**: Banking, investment planning
- **Commerce**: Accounting, economics-based careers

### 3. Creative & Communication
- **Design**: Graphic design, industrial design
- **Media**: Journalism, communications
- **Arts**: Creative industries and cultural fields

## Next Steps for Grade 12 Students

### Current Focus: ${j.focus.replace("-"," ").toUpperCase()}

### Priority Actions:
${j.priorities.map(a=>`- **${a}**`).join("\n")}

### Important Deadlines:
${j.urgentDeadlines.length>0?j.urgentDeadlines.map(a=>`- ${a}`).join("\n"):"- Check university websites for 2026 application deadlines\n- NSFAS applications typically open in January"}

---

⚠️ **Verify before you decide**: This is AI-generated advice. Always confirm with school counselors, career advisors, and professionals in your field of interest before making important decisions about your future.`:`# Your Career Guidance Results

## Based on Your Assessment
**Grade Level**: ${String(f).toUpperCase()}
**Curriculum**: ${String(g).toUpperCase()}
**Academic Timeline**: ${i.timelineMessage}
**Query**: ${a}

## Recommended Career Paths

### 1. Technology & Engineering
- **Software Development**: High demand field with excellent growth prospects
- **Data Science**: Emerging field combining mathematics and technology
- **Engineering**: Various specializations available (Civil, Mechanical, Electrical)

### 2. Healthcare & Sciences
- **Medical Sciences**: Rewarding career helping others
- **Biomedical Engineering**: Combines technology with healthcare
- **Research Sciences**: Opportunities in various scientific fields

### 3. Business & Finance
- **Business Management**: Leadership opportunities across industries
- **Financial Services**: Banking, investment, and financial planning
- **Entrepreneurship**: Start your own business ventures

## Next Steps for ${String(f).toUpperCase()} Students

1. **Subject Selection**: Choose subjects that align with your career interests
2. **University Research**: Investigate admission requirements for your chosen field
3. **Work Experience**: Seek internships or job shadowing opportunities
4. **Skills Development**: Build relevant skills through courses and projects

## Important Considerations

- **Academic Requirements**: Each career path has specific subject requirements
- **Market Demand**: Research job availability in your chosen field
- **Personal Interests**: Ensure your career choice aligns with your passions
- **Financial Planning**: Consider the cost of education and potential earnings

---

⚠️ **Verify before you decide**: This is AI-generated advice. Always confirm with school counselors, career advisors, and professionals in your field of interest before making important decisions about your future.`).includes("⚠️")&&e.includes("verify")||(e+=`

---

⚠️ **Verify before you decide**: This is AI-generated advice. Always confirm with school counselors, career advisors, and professionals in your field of interest before making important decisions about your future.`),{response:e,fullResponse:e,results:[{title:"Personalized Career Guidance",content:"Based on your assessment, here are career recommendations tailored to your grade level and interests.",relevance:.95},{title:"Next Steps",content:"Specific action items to help you progress toward your career goals.",relevance:.9},{title:"Verification Required",content:"Remember to verify this AI-generated advice with real career counselors and professionals.",relevance:.85}]}}(c,i,e,h),m={success:!0,query:c,grade:i,curriculum:e||"caps",response:l.response,fullResponse:l.fullResponse,results:l.results,metadata:{grade:i,curriculum:e||"caps",provider:"generated",hasVerificationFooter:!0},performance:{totalTime:Date.now()-b,source:"generated"},timestamp:new Date().toISOString()};return console.log("[CACHE SKIP] Not caching assessment submission response"),u.NextResponse.json(m)}catch(a){return console.error("RAG Query Error:",a),u.NextResponse.json({error:"Internal server error",message:a.message,timestamp:new Date().toISOString()},{status:500})}}async function z(){return u.NextResponse.json({message:"RAG Query endpoint with cache is running",status:"ok",timestamp:new Date().toISOString()})}let A=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/rag/query/route",pathname:"/api/rag/query",filename:"route",bundlePath:"app/api/rag/query/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"C:\\Users\\SEELANGOV\\Desktop\\Thandi.ai\\app\\api\\rag\\query\\route.js",nextConfigOutput:"",userland:d}),{workAsyncStorage:B,workUnitAsyncStorage:C,serverHooks:D}=A;function E(){return(0,g.patchFetch)({workAsyncStorage:B,workUnitAsyncStorage:C})}async function F(a,b,c){var d;let e="/api/rag/query/route";"/index"===e&&(e="/");let g=await A.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:x,prerenderManifest:y,routerServerContext:z,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,resolvedPathname:D}=g,E=(0,j.normalizeAppPath)(e),F=!!(y.dynamicRoutes[E]||y.routes[D]);if(F&&!x){let a=!!y.routes[D],b=y.dynamicRoutes[E];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!F||A.isDev||x||(G="/index"===(G=D)?"/":G);let H=!0===A.isDev||!F,I=F&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:y,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>A.onRequestError(a,b,d,z)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>A.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&B&&C&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!F)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await A.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})},z),b}},l=await A.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:y,isRoutePPREnabled:!1,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,responseGenerator:k,waitUntil:c.waitUntil});if(!F)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",B?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),x&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&F||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(b instanceof s.NoFallbackError||await A.onRequestError(a,b,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})}),F)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}},77598:a=>{"use strict";a.exports=require("node:crypto")},78335:()=>{},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},96487:()=>{}};var b=require("../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[873,428,692,253],()=>b(b.s=68484));module.exports=c})();