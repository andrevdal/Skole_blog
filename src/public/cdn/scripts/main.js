const themeToggle = document.querySelector("#dn");
const themeCSS = document.querySelector("#themeCSS")
themeToggle.addEventListener("toggle", (e) => {
    if (themeToggle.value) {
        themeCSS.innerHTML = `<link href="/cdn/styles/night.css"/>`
    } else {
        themeCSS.innerHTML = `<link href="/cdn/styles/light.css"/>`
    }
})
