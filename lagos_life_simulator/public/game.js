import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const socket = io();
const game = document.getElementById("game");
const loading = document.getElementById("loading");
const startScreen = document.getElementById("startScreen");
const playBtn = document.getElementById("playBtn");
playBtn.disabled = true;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bc5d4);
scene.fog = new THREE.Fog(0x9bc5d4, 65, 230);

const camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, .1, 500);
camera.position.set(0, 9, 14);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
game.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xe7f6ff, 0x68704c, 2));
const sun = new THREE.DirectionalLight(0xfff0d2, 2.2);
sun.position.set(-35, 70, 30); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -100; sun.shadow.camera.right = 100;
sun.shadow.camera.top = 100; sun.shadow.camera.bottom = -100;
scene.add(sun);

const mat = (color, roughness=0.9) => new THREE.MeshStandardMaterial({color, roughness});
const groundMat = mat(0x9a9b78), roadMat = mat(0x343b40), lineMat = mat(0xe7d9a4);
const buildingMats = [0xc9bba2,0xd3c7ae,0xa8b6b8,0xb8a28b,0xd8d2c3,0x8b9b9c].map(c=>mat(c));
const world = new THREE.Group(); scene.add(world);

function box(parent, x,y,z, sx,sy,sz, material, cast=true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz), material);
  mesh.position.set(x,y,z); mesh.castShadow=cast; mesh.receiveShadow=true; parent.add(mesh); return mesh;
}
box(world,0,-.35,0,320,.5,320,groundMat,false);

// Road grid, pavements and markings
for(let i=-3;i<=3;i++){
  const p=i*40;
  box(world,p,.0,0,12,.12,320,roadMat,false);
  box(world,0,.0,p,320,.12,12,roadMat,false);
  for(let n=-7;n<=7;n++){
    box(world,p,.075,n*20, .18,.025,5,lineMat,false);
    box(world,n*20,.075,p,5,.025,.18,lineMat,false);
  }
}
const sidewalkMat=mat(0xbab6a5);
for(let i=-3;i<=3;i++){
  const p=i*40;
  box(world,p+7,.05,0,2,.18,320,sidewalkMat,false);
  box(world,p-7,.05,0,2,.18,320,sidewalkMat,false);
  box(world,0,.05,p+7,320,.18,2,sidewalkMat,false);
  box(world,0,.05,p-7,320,.18,2,sidewalkMat,false);
}

// City blocks, varied buildings, windows, rooftops
function makeBuilding(x,z){
  const w=8+Math.random()*12, d=8+Math.random()*12, h=7+Math.random()*28;
  const group=new THREE.Group();
  const body=box(group,0,h/2,0,w,h,d,buildingMats[Math.floor(Math.random()*buildingMats.length)]);
  const roof=box(group,0,h+.25,0,w+.3,.5,d+.3,mat(0x77766f));
  const winMat=mat(0x52727a,.35);
  for(let y=2.3;y<h-1;y+=3.2){
    for(let xx=-w/2+1.3;xx<w/2-0.5;xx+=2.5){
      box(group,xx,y,d/2+.015,.9,1.25,.06,winMat,false);
      box(group,xx,y,-d/2-.015,.9,1.25,.06,winMat,false);
    }
    for(let zz=-d/2+1.3;zz<d/2-.5;zz+=2.5){
      box(group,w/2+.015,y,zz,.06,1.25,.9,winMat,false);
      box(group,-w/2-.015,y,zz,.06,1.25,.9,winMat,false);
    }
  }
  group.position.set(x,0,z); world.add(group);
}
for(let gx=-3;gx<3;gx++) for(let gz=-3;gz<3;gz++){
  const cx=gx*40+20, cz=gz*40+20;
  for(let n=0;n<5;n++){
    const x=cx+(Math.random()-.5)*23, z=cz+(Math.random()-.5)*23;
    if(Math.abs(x%40)>9 && Math.abs(z%40)>9) makeBuilding(x,z);
  }
}

// Palm trees and street props
function palm(x,z){
  const trunk= new THREE.Mesh(new THREE.CylinderGeometry(.18,.3,5,7),mat(0x765237));
  trunk.position.set(x,2.5,z); trunk.rotation.z=(Math.random()-.5)*.12; trunk.castShadow=true; world.add(trunk);
  const leaves=mat(0x34764a);
  for(let i=0;i<7;i++){
    const leaf=new THREE.Mesh(new THREE.ConeGeometry(.35,4,5),leaves);
    leaf.position.set(x+Math.cos(i*Math.PI/3.5)*1.1,5.1,z+Math.sin(i*Math.PI/3.5)*1.1);
    leaf.rotation.z=Math.PI/2-Math.cos(i*Math.PI/3.5)*.45; leaf.rotation.x=Math.sin(i*Math.PI/3.5)*.45; world.add(leaf);
  }
}
for(let i=0;i<65;i++){const x=(Math.random()-.5)*280,z=(Math.random()-.5)*280;if(Math.abs(x%40)>8&&Math.abs(z%40)>8)palm(x,z);}

// Landmark sign
const sign=box(world,-5,3,-12,10,3,.35,mat(0x183b3d));
const canvas=document.createElement("canvas"); canvas.width=512;canvas.height=128;
const ctx=canvas.getContext("2d");ctx.fillStyle="#183b3d";ctx.fillRect(0,0,512,128);ctx.fillStyle="#ffbd43";ctx.font="bold 54px Arial";ctx.fillText("LAGOS",28,83);
const tex=new THREE.CanvasTexture(canvas);const signFace=new THREE.Mesh(new THREE.PlaneGeometry(9.5,2.4),new THREE.MeshBasicMaterial({map:tex}));signFace.position.set(-5,3,-11.79);world.add(signFace);

// Player avatar
function makeAvatar(color, name){
  const group=new THREE.Group();
  const skin=mat(0x8f5738), shirt=mat(color), trousers=mat(0x26394c), shoe=mat(0x17191c);
  const torso=box(group,0,1.45,0,.72,.9,.38,shirt);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.27,16,12),skin);head.position.y=2.12;head.castShadow=true;group.add(head);
  const hair=new THREE.Mesh(new THREE.SphereGeometry(.28,12,8,0,Math.PI*2,0,Math.PI/2),mat(0x171513));hair.position.y=2.22;group.add(hair);
  const legs=[];
  for(const x of [-.2,.2]){
    const leg=box(group,x,.65,0,.25,.75,.28,trousers);legs.push(leg);
    box(group,x,.17,.08,.28,.2,.42,shoe);
  }
  const arms=[];
  for(const x of [-.48,.48]){const arm=box(group,x,1.48,0,.2,.72,.22,skin);arms.push(arm);}
  group.userData={legs,arms};return group;
}
const local=makeAvatar("#f5ad32");scene.add(local);
const remote=new Map();
let myId=null, started=false, myName="New Lagosian";
const keys={};
let velocityY=0, onGround=true, moveRotation=0, lastSend=0;
const clock=new THREE.Clock();

function updateRemote(p){
  if(p.id===myId)return;
  let obj=remote.get(p.id);
  if(!obj){obj=makeAvatar(p.color);scene.add(obj);remote.set(p.id,obj);}
  obj.position.set(p.x,0,p.z);obj.rotation.y=p.rotation||0;obj.userData.name=p.name;
}
socket.on("welcome",data=>{
  myId=data.id;
  data.players.forEach(updateRemote);
  setOnlineCount(data.players.length);
});
socket.on("playerJoined",p=>{updateRemote(p);countOnline(remote.size + 1);});
socket.on("playerMoved",p=>updateRemote(p));
socket.on("playerLeft",id=>{const obj=remote.get(id);if(obj){scene.remove(obj);remote.delete(id);}countOnline(remote.size + 1);});
function setOnlineCount(value){
  const safeValue = Number(value);
  document.getElementById("onlineCount").textContent = String(Number.isFinite(safeValue) && safeValue > 0 ? safeValue : 1);
}
function countOnline(value = remote.size + 1){
  setOnlineCount(value);
}

function addChat(name,message,system=false){
  const p=document.createElement("p");
  if(system){p.className="system-msg";p.textContent=message;}
  else{const b=document.createElement("b");b.textContent=name+": ";p.append(b,document.createTextNode(message));}
  const boxEl=document.getElementById("chatMessages");boxEl.appendChild(p);boxEl.scrollTop=boxEl.scrollHeight;
  while(boxEl.children.length>30)boxEl.removeChild(boxEl.firstChild);
}
socket.on("chatMessage",m=>addChat(m.name,m.message));
socket.on("connect",()=>{
  playBtn.disabled = false;
  if(started){toast("Connected to the Lagos city server.");}
});
socket.on("disconnect",()=>{
  playBtn.disabled = true;
  addChat("SYSTEM","Connection lost. Reconnecting...",true);
});

function toast(msg){const el=document.getElementById("toast");el.textContent=msg;el.style.opacity=1;setTimeout(()=>el.style.opacity=0,1800);}
function districtAt(x,z){
  if(x>45&&z>45)return "LEKKI";
  if(x<-45&&z>45)return "VICTORIA ISLAND";
  if(x>45&&z<-45)return "IKEJA";
  if(x<-45&&z<-45)return "YABA";
  return "LAGOS ISLAND";
}
function animate(){
  requestAnimationFrame(animate);
  const dt=Math.min(clock.getDelta(),.05);
  if(started){
    let dx=0,dz=0;
    if(keys.KeyW||keys.ArrowUp)dz-=1;
    if(keys.KeyS||keys.ArrowDown)dz+=1;
    if(keys.KeyA||keys.ArrowLeft)dx-=1;
    if(keys.KeyD||keys.ArrowRight)dx+=1;
    const moving=dx!==0||dz!==0;
    if(moving){
      const len=Math.hypot(dx,dz);dx/=len;dz/=len;
      const speed=(keys.ShiftLeft||keys.ShiftRight?13:7)*dt;
      local.position.x+=dx*speed;local.position.z+=dz*speed;
      moveRotation=Math.atan2(dx,dz);local.rotation.y=moveRotation;
      const swing=Math.sin(performance.now()*.012)*.55;
      local.userData.legs[0].rotation.x=swing;local.userData.legs[1].rotation.x=-swing;
      local.userData.arms[0].rotation.x=-swing*.7;local.userData.arms[1].rotation.x=swing*.7;
    }else{
      local.userData.legs.forEach(l=>l.rotation.x=0);local.userData.arms.forEach(a=>a.rotation.x=0);
    }
    if(keys.Space&&onGround){velocityY=7;onGround=false;}
    velocityY-=18*dt;local.position.y+=velocityY*dt;
    if(local.position.y<0){local.position.y=0;velocityY=0;onGround=true;}
    local.position.x=THREE.MathUtils.clamp(local.position.x,-145,145);
    local.position.z=THREE.MathUtils.clamp(local.position.z,-145,145);
    document.getElementById("district").textContent=districtAt(local.position.x,local.position.z);
    const now=performance.now();
    if(now-lastSend>80){socket.emit("move",{x:local.position.x,z:local.position.z,rotation:local.rotation.y});lastSend=now;}
  }
  const target=new THREE.Vector3(local.position.x,local.position.y+2,local.position.z);
  const desired=new THREE.Vector3(local.position.x,local.position.y+8,local.position.z+13);
  camera.position.lerp(desired,.09);camera.lookAt(target);
  renderer.render(scene,camera);
}
animate();
loading.style.display="none";

document.getElementById("playBtn").addEventListener("click",()=>{
  myName=document.getElementById("playerName").value.trim().slice(0,16)||"New Lagosian";
  document.getElementById("hudName").textContent=myName.toUpperCase();
  socket.emit("setName",myName);started=true;startScreen.classList.add("hidden");
  setTimeout(()=>startScreen.style.display="none",550);
  toast("Welcome to Lagos, "+myName+"!");
});
document.getElementById("chatForm").addEventListener("submit",e=>{
  e.preventDefault();const input=document.getElementById("chatInput");
  if(input.value.trim()){socket.emit("chat",input.value);input.value="";}
});
addEventListener("keydown",e=>{
  if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.code))e.preventDefault();
  keys[e.code]=true;
  if(e.code==="Enter"&&started)document.getElementById("chatInput").focus();
});
addEventListener("keyup",e=>keys[e.code]=false);
document.querySelectorAll("[data-key]").forEach(btn=>{
  const key=btn.dataset.key.toUpperCase();
  btn.addEventListener("pointerdown",e=>{e.preventDefault();keys["Key"+key]=true;});
  ["pointerup","pointerleave","pointercancel"].forEach(ev=>btn.addEventListener(ev,()=>keys["Key"+key]=false));
});
document.getElementById("runButton").addEventListener("pointerdown",()=>{keys.ShiftLeft=true;});
["pointerup","pointerleave","pointercancel"].forEach(ev=>document.getElementById("runButton").addEventListener(ev,()=>keys.ShiftLeft=false));

addEventListener("resize",()=>{
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);
});
