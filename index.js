async function fetchNotices() {
    const url = "https://api.github.com/repos/lee1431/kijeng/contents/json/notices.json";

    try {
        const response = await fetch(url, {
            headers: { 'Accept': 'application/vnd.github.v3+json' }
        });
        if (!response.ok) throw new Error(`네트워크 응답이 불량합니다. 상태 코드: ${response.status}`);

        const data = await response.json();
        
        // Base64로 인코딩된 데이터를 디코딩하면서 UTF-8로 처리
        const decodedContent = new TextDecoder("utf-8").decode(Uint8Array.from(atob(data.content), c => c.charCodeAt(0)));
        
        const notices = JSON.parse(decodedContent);
        return { notices, sha: data.sha };
    } catch (error) {
        console.error('공지사항 데이터를 가져오는 중 오류가 발생했습니다:', error);
        return { notices: [], sha: null };
    }
}

function displayNotices(notices) {
    const noticeList = document.getElementById("notice-list");

    const sortedData = notices.sort((a, b) => new Date(b.date) - new Date(a.date));
	
    const recentItems = sortedData.slice(0, 6);
	
    noticeList.innerHTML = ""; // 기존 목록 초기화

    recentItems.forEach((notice, index) => {
        const noticeItem = document.createElement("div");
        noticeItem.classList.add("d-flex", "text-body-secondary", "pt-2");
        noticeItem.innerHTML = `
			<div class="pb-1 mb-0 small lh-sm border-bottom w-100">
				<div class="d-flex justify-content-between">
					<strong class="text-gray-dark">${notice.title}</strong>
				</div>
				<span class="d-block">${notice.date}</span>
			</div>
        `;
        noticeList.appendChild(noticeItem);
    });
}

fetchNotices().then(data => displayNotices(data.notices));
