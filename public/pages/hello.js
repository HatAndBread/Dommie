function i(){let e="",t="";const l={};for(let n of d)l[n]=(m={},r)=>E(n,m,r);l.generate=()=>{const n=e;return e="",n};function E(n,m={},r){if(n==="text"){e+=`${t}${m}\n`;return}if(n==="comment"){e+=`${t}<!--${m}-->\n`;return}if(n==="custom")return;if(typeof m==="function")r=m,m={};let o="";for(let p in m)if(p==="subscribes")m[p].forEach((I)=>o+=` subscribes-${I.name}`);else if(p==="clicks"){const c=m[p];o+=` ${p}="${c.name}"`}else o+=` ${p}="${m[p]}"`;if(typeof r==="function")e+=`${t}<${n}${o}>\n`,t+="  ",r(),t=t.slice(0,-2),e+=`${t}</${n}>\n`;else if(r)throw new Error("Callback must be a function!");else if(f(n))e+=`${t}<${n}${o} />\n`;else e+=`${t}<${n}${o}></${n}>\n`}return l}var d=["a","abbr","acronym","address","area","article","aside","audio","b","base","bdi","bdo","big","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","comment","custom","data","datalist","dd","del","details","dfn","dialog","dir","div","dl","dt","em","embed","fencedframe","fieldset","figcaption","figure","font","footer","form","frame","frameset","h1","head","header","hgroup","hr","html","i","iframe","img","input","ins","kbd","label","legend","li","link","main","map","mark","marquee","menu","meta","meter","nav","nobr","noembed","noframes","noscript","object","ol","optgroup","option","output","p","param","picture","plaintext","portal","pre","progress","q","rb","rp","rt","rtc","ruby","s","samp","script","search","section","select","slot","small","source","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","text","textarea","tfoot","th","thead","time","title","tr","track","tt","u","ul","var","video","wbr","xmp"],b=["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"],f=(e)=>b.includes(e);function a(e,t,l){e.button({style:"background-color: green;",clicks:t},()=>{e.text("Increment")}),e.button({style:"background-color: orange;",clicks:l},()=>{e.text("Decrement")})}var $=(e)=>{return console.log("Here is the request!"),console.log(e),g(i())},s={value:0},u={increment:({replaceTargetInner:e,targets:t})=>{s.value++,e(s.value)},decrement:({replaceTargetInner:e,targets:t})=>{s.value--,e(s.value)},showSomething:({replaceTargetInner:e,targets:t})=>{const l=i();console.log(t),l.div(()=>{l.text("Hello"+Math.random()),l.div({subscribes:[u.showSomething]},()=>{l.text("I am a div")})}),e(l.generate())}},g=(e)=>{return e.div({style:"background-color: red;",root:!0},()=>{e.a({href:"https://www.google.com"},()=>{e.text("I am a link")}),e.text("I am some text"),e.br(),e.text("I am some more text"),e.div({subscribes:[u.decrement]},()=>{e.text(0)}),e.small(()=>{a(e,u.increment,u.decrement)}),e.div({id:"counter",subscribes:[u.increment,u.decrement]},()=>{e.text("0")}),e.div({subscribes:[u.showSomething]}),e.comment("This is a comment!"),e.button({clicks:u.showSomething},()=>{e.text("show something")}),e.script({src:"./index.js",type:"text/javascript"})}),e.generate()};export{g as t,$ as init,u as client};
