// GitHub에서 JSON 파일 가져오기
async function fetchNotices() {
    const url = "https://api.github.com/repos/lee1431/web/contents/notices.json";

    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/vnd.github.v3.raw' // Raw 데이터 형태로 요청
            }
        });
        if (!response.ok) throw new Error('네트워크 응답이 불량합니다.');
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('공지사항 데이터를 가져오는 중 오류가 발생했습니다.', error);
        return [];
    }
}

// 공지사항을 화면에 표시
async function displayNotices() {
    const notices = await fetchNotices();
    const noticeList = document.querySelector('#notice .row');

    notices.forEach(notice => {
        const noticeCard = document.createElement('div');
        noticeCard.className = 'col-md-6 mb-3';
        noticeCard.innerHTML = `
            <div class="card shadow-sm">
                <div class="card-body">
                    <h5 class="card-title">${notice.title}</h5>
                    <p class="card-text text-muted">${notice.date}</p>
                    <p class="card-text">${notice.content}</p>
                    <a href="${notice.link}" class="btn btn-primary btn-sm">자세히 보기</a>
                    ${notice.file ? `<a href="${notice.file}" class="btn btn-primary btn-sm ms-2" download>파일 다운로드</a>` : ""}
                </div>
            </div>
        `;
        noticeList.appendChild(noticeCard);
    });
}

// 페이지 로드 시 공지사항 표시
document.addEventListener('DOMContentLoaded', displayNotices);