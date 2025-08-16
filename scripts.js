
// LocalStorage keys
const LS_USERS = 'cortex_users';
const LS_SESSION = 'cortex_session';
const LS_PROJECTS = 'cortex_projects';

// Helpers
const save = (k,v)=>localStorage.setItem(k, JSON.stringify(v));
const load = (k,f)=>{ try{ return JSON.parse(localStorage.getItem(k)) ?? f }catch(e){ return f } };
const uid = ()=>Math.random().toString(36).slice(2)+Date.now().toString(36);

// Index
function buy(plan, price){
  alert(`Plano: ${plan}\nPreço: R$ ${price}\nCrie uma conta e fale com a equipe no painel.`);
}

// Auth
function register(){
  const username = document.getElementById('regUser').value.trim();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const pass = document.getElementById('regPass').value;
  if(!username || !email || !pass) return alert('Preencha todos os campos');
  const users = load(LS_USERS, []);
  if(users.some(u=>u.email===email)) return alert('E-mail já registrado');
  users.push({username,email,pass});
  save(LS_USERS, users);
  save(LS_SESSION, {email});
  alert('Conta criada! Vamos ao painel.');
  location.href='dashboard.html';
}
function login(){
  const email = document.getElementById('logEmail').value.trim().toLowerCase();
  const pass = document.getElementById('logPass').value;
  const users = load(LS_USERS, []);
  const ok = users.find(u=>u.email===email && u.pass===pass);
  if(!ok) return alert('Credenciais inválidas');
  save(LS_SESSION, {email});
  location.href='dashboard.html';
}
function logout(){ localStorage.removeItem(LS_SESSION); alert('Sessão encerrada'); location.href='index.html'; }
function currentUser(){
  const sess = load(LS_SESSION, null);
  if(!sess) return null;
  const users = load(LS_USERS, []);
  return users.find(u=>u.email===sess.email) || null;
}

// Dashboard
async function addProject(){
  const u = currentUser();
  if(!u){ alert('Faça login'); return location.href='auth.html'; }
  const title = document.getElementById('projName').value.trim();
  const desc = document.getElementById('projDesc').value.trim();
  const file = document.getElementById('projImage').files[0];
  const video = document.getElementById('projVideo').value.trim();
  if(!title) return alert('Informe o nome do projeto');
  let imageDataUrl = null;
  if(file){
    imageDataUrl = await new Promise((res,rej)=>{
      const r = new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file);
    });
  }
  const projects = load(LS_PROJECTS, []);
  projects.push({ id: uid(), owner: u.username, title, desc, imageDataUrl, videoUrl: video, createdAt: Date.now() });
  save(LS_PROJECTS, projects);
  renderMyProjects();
  alert('Projeto adicionado!');
}
function renderMyProjects(){
  const u = currentUser();
  const box = document.getElementById('myProjects');
  if(!box || !u) return;
  const projects = load(LS_PROJECTS, []).filter(p=>p.owner===u.username);
  box.innerHTML = projects.map(p=>`
    <div class="card">
      ${p.imageDataUrl ? `<img src="${p.imageDataUrl}" alt=""/>` : `<img src="assets/thumb${(Math.abs(p.title.length)%4)+1}.jpg" alt=""/>`}
      <h4>${p.title}</h4>
      <p class="note">${p.desc||''}</p>
      ${p.videoUrl ? `<a class="tag" href="${p.videoUrl}" target="_blank">Vídeo</a>` : ''}
      <div style="margin-top:8px"><button class="btn" onclick="removeProject('${p.id}')">Remover</button></div>
    </div>
  `).join('');
}
function removeProject(id){
  const projects = load(LS_PROJECTS, []);
  save(LS_PROJECTS, projects.filter(p=>p.id!==id));
  renderMyProjects();
}
(function(){
  if(location.pathname.endsWith('dashboard.html')){
    const u = currentUser();
    document.getElementById('currentUser').textContent = u ? '@'+u.username : '@anônimo';
    renderMyProjects();
  }
})();

// Create page
function generatePreview(){
  const name = document.getElementById('botName').value || 'Meu Bot';
  const platform = document.getElementById('platform').value;
  const mainFeature = document.getElementById('mainFeature').value;
  const theme = document.getElementById('theme').value;
  const mods = [...document.querySelectorAll('.mod:checked')].map(x=>x.value);
  const txt = `<strong>${name}</strong> • ${platform} • ${mainFeature} • Tema: ${theme}<br/>Módulos: ${mods.join(', ')||'Nenhum'}`;
  document.getElementById('previewText').innerHTML = txt;
}
document.addEventListener('keydown', e=>{ if(e.key.toLowerCase()==='g'){ const b=document.querySelector('button[onclick="generatePreview()"]'); if(b) b.click(); } });

// ==== PORTFÓLIO FIXO (sem login) ====

// Dados fixos da equipe
const team = [

  
];

// Dados fixos dos projetos
const portfolio = [
 ];

 
// ==========================
// PORTFÓLIO (LENDO DO ADMIN + EXCLUSÃO)
// ==========================
function renderPortfolio() {
  if (!location.pathname.endsWith("portfolio.html")) return;

  const filter = document.getElementById("memberFilter");
  const gallery = document.getElementById("portfolioGallery");
  const teamTable = document.querySelector("#teamTable tbody");

  let portfolio = JSON.parse(localStorage.getItem("portfolio_data") || "[]");

  // filtro de membros
  if (filter && filter.options.length === 0) {
    const members = [...new Set(portfolio.map(p => p.member))];
    filter.innerHTML = `<option value="">Todos</option>` +
      members.map(m => `<option value="${m}">${m}</option>`).join("");
  }

  const selected = filter ? filter.value : "";
  const q = (document.getElementById("searchInput")?.value || "").toLowerCase();

  const list = portfolio.filter(p =>
    (!selected || p.member === selected) &&
    (!q || p.title.toLowerCase().includes(q) || (p.desc || "").toLowerCase().includes(q))
  );

  // monta os cards com botão de excluir
  gallery.innerHTML = list.map(p => `
    <div class="card">
      <img src="${p.imageDataUrl || `assets/thumb${(Math.abs(p.title.length)%4)+1}.jpg`}" alt=""/>
      <h3>${p.title}</h3>
      <p class="note">${p.desc || ""}</p>
      <span class="tag">Feito por: @${p.member}</span>
      ${p.videoUrl ? `<a class="tag" href="${p.videoUrl}" target="_blank">Vídeo</a>` : ""}
      <button class="delete-btn" data-id="${p.title}">Excluir</button>
    </div>
  `).join("");

  // adiciona evento de exclusão
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      portfolio = portfolio.filter(p => p.title !== id); // remove do array
      localStorage.setItem("portfolio_data", JSON.stringify(portfolio)); // salva
      renderPortfolio(); // atualiza a tela
    });
  });

  // tabela de equipe
  const byMember = {};
  for(const p of portfolio){ byMember[p.member] = (byMember[p.member]||0)+1; }
  teamTable.innerHTML = Object.entries(byMember).map(([m,c]) =>
    `<tr><td>@${m}</td><td>${c}</td></tr>`
  ).join("");
}

document.addEventListener("DOMContentLoaded", renderPortfolio);
