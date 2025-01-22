	function showContent(sectionId) {
		var contentSections = document.getElementsByClassName("content-section");
		for (var i = 0; i < contentSections.length; i++) {
			contentSections[i].style.display = "none";
		}
		document.getElementById(sectionId).style.display = "block";
	}

	function showSectionFromURL() {
		const urlParams = new URLSearchParams(window.location.search);
		const section = urlParams.get('section');
		if (section) {
			showContent(section);
		} else {
			showContent("end");
		}
	}

	document.addEventListener("DOMContentLoaded", showSectionFromURL);