
let idx=0, score=0, limit=5;
fetch('tests.json').then(r=>r.json()).then(t=>{ window.tests=t; show(); });

function show(){
 let t=tests[idx];
 document.getElementById('question').innerHTML=t.question;
 let box=document.getElementById('options');
 box.innerHTML='';
 t.options.forEach((o,i)=>{
   let b=document.createElement('button');
   b.innerText=o;
   b.onclick=()=>check(i,t.correct);
   box.appendChild(b);
 });
}

function check(i,c){
 if(i===c){ score++; }
 document.getElementById('nextBtn').style.display='block';
}

document.getElementById('nextBtn').onclick=()=>{
 idx++;
 if(idx>=tests.length){ alert('Score: '+score); return; }
 document.getElementById('nextBtn').style.display='none';
 show();
}
