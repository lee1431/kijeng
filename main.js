	window.onscroll = function() {
      const scrollBtn = document.getElementById("scrollToTopBtn");
      if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        scrollBtn.style.display = "block";
      } else {
        scrollBtn.style.display = "none";
      }
    };

    // 버튼 클릭 시 최상위로 이동
    document.getElementById("scrollToTopBtn").onclick = function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
	
	