
let idx=0;let score=0;
fetch('data/tests.json')
.then(r=>r.json())
.then(t=>{window.tests=t;show();});

function show(){
 let q=tests[idx];
 document.getElementById('q').innerHTML=q.q;
 let opts=document.getElementById('opts');
 opts.innerHTML='';
 q.o.forEach((o,i)=>{
  let b=document.createElement('button');
  b.innerHTML=o;
  b.onclick=()=>select(i,q.c);
  opts.appendChild(b);
 });
}

function select(i,c){
 if(i===c) score++;
 document.getElementById('next').style.display='block';
}

document.getElementById('next').onclick=()=>{
 idx++;
 if(idx>=tests.length){
   finish();
   return;
 }
 document.getElementById('next').style.display='none';
 show();
}

function finish(){
 alert("Score: "+score+" / "+tests.length);
}
