for(let i=0;i<80;i++){
  let s = document.createElement("span");
  s.style.left = Math.random()*100+"vw";
  s.style.animationDuration = (5+Math.random()*10)+"s";
  document.getElementById("sparks").appendChild(s);
}