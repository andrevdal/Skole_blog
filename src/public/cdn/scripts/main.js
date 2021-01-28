const themeToggle = document.querySelector("#dn");
const themeCSS = document.querySelector("#themecss");
// Theme switcher
themeToggle.addEventListener("click", (e) => {
	if (themeToggle.checked) {
		themeCSS.setAttribute("href", "/cdn/stylesheets/night.css");
	} else {
		themeCSS.setAttribute("href", "/cdn/stylesheets/light.css");
	}
});
