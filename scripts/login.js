window.addEventListener('load',e=>{
  e.preventDefault();
  let loginForm = document.getElementById("loginForm");
  console.log(loginForm);
  loginForm.onsubmit=()=>{
    const request=new XMLHttpRequest();
    const formData = new FormData(loginForm);
    request.open('POST','/login')
    request.setRequestHeader("Content-Type", "application/json")
    request.send(JSON.stringify(Object.fromEntries(formData)));
    request.close();
  }
})