

async function fetchData() {
    const url = "https://github.com/lee1431/web/blob/main/notices.json";

    try {
        const response = await fetch(url, {
            headers: { 'Accept': 'application/vnd.github.v3+json' }
        });
        if (!response.ok) throw new Error(`네트워크 응답이 불량합니다. 상태 코드: ${response.status}`);
	
        const data = await response.json();
        
        // Base64로 인코딩된 데이터를 디코딩하면서 UTF-8로 처리
        const decodedContent = new TextDecoder("utf-8").decode(Uint8Array.from(atob(data.content), c => c.charCodeAt(0)));
        
        const datas = JSON.parse(decodedContent);
		console.log("fetchData Length - "+JSON.stringify(datas, null, 2));
        return { datas, sha: data.sha };
    } catch (error) {
        console.error('공지사항 데이터를 가져오는 중 오류가 발생했습니다:', error);
        return { datas: [], sha: null };
    }
}

// Pagenation
function paginate(data, currentPage, pageSize) {
	const start = (currentPage - 1) * pageSize;
	const end = start + pageSize;
	return data.datas.slice(start, end);
}

function renderData(data) {
  const container = document.getElementById('data-container');
  container.innerHTML = ''; // 기존 데이터 제거
  data.forEach(item => {
    const div = document.createElement('div');
    div.textContent = item.title; // 데이터를 문자열로 표시 (커스터마이즈 가능)
    container.appendChild(div);
  });
}

// 페이지네이션 버튼 생성
function renderPagination(totalItems, currentPage, pageSize) {
	
	console.log(totalItems);
	console.log(currentPage);
	console.log(pageSize);
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = ''; // 기존 버튼 제거
  const totalPages = Math.ceil(totalItems / pageSize);

  // 이전 버튼
  const prevButton = document.createElement('button');
  prevButton.textContent = 'Previous';
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener('click', () => updatePage(currentPage - 1));
  pagination.appendChild(prevButton);

  // 페이지 번호 버튼
  for (let i = 1; i <= totalPages; i++) {
	  
    const button = document.createElement('button');
    button.textContent = i;
    button.className = i === currentPage ? 'active' : '';
    button.addEventListener('click', () => updatePage(i));
    pagination.appendChild(button);
  }

  // 다음 버튼
  const nextButton = document.createElement('button');
  nextButton.textContent = 'Next';
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener('click', () => updatePage(currentPage + 1));
  pagination.appendChild(nextButton);
}

// 현재 페이지 업데이트
let currentPage = 1;
const pageSize = 5; // 한 페이지에 표시할 항목 수

async function updatePage(page) {
  const data = await fetchData();
  console.log("111 "+ data);
  currentPage = page;
  const paginatedData = paginate(data, currentPage, pageSize);
  renderData(paginatedData);
  renderPagination(data.length, currentPage, pageSize);
}

updatePage(currentPage);

async function fetchNotices() {
    const url = "https://api.github.com/repos/lee1431/web/contents/notices.json";

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

// 공지사항 목록을 화면에 표시하기
function displayNotices(notices) {
    const noticeList = document.getElementById("notice-list");
    noticeList.innerHTML = ""; // 기존 목록 초기화

    notices.forEach((notice) => {
        const noticeItem = document.createElement("div");
        noticeItem.classList.add("col-md-6", "mb-4");
        noticeItem.innerHTML = `
            <div class="card card-header">
                <div class="card-body">
                    <h5 class="card-title">${notice.title}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">${notice.date}</h6>
                    <p class="card-text">${notice.content}</p>
                    ${notice.uid ? `<a href="https://llsshh.com/contact.html?view=${notice.link}" class="card-link">자세히 보기</a>` : ""}
                </div>
            </div>
        `;
        noticeList.appendChild(noticeItem);
    });
}

// 공지사항 추가 폼 제출 처리
document.getElementById('noticeForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

    // 기존 JSON 파일을 가져와서 새 공지사항을 추가한 뒤 GitHub에 업데이트
    const { notices = [], sha } = await fetchNotices();

    if (!sha) {
        alert('기존 공지사항 데이터를 가져오는 데 실패했습니다.');
        return;
    }

    // 새로운 공지사항 추가
    const newNotice = {
        title,
        content,
        date: new Date().toISOString().split('T')[0],
		uid: crypto.randomUUID()
    };
    notices.push(newNotice);

    // GitHub에 업데이트할 데이터 설정
    const updateData = {
        message: "공지사항 업데이트",
        content: btoa(unescape(encodeURIComponent(JSON.stringify(notices, null, 2)))),
        sha: sha // 기존 파일의 SHA 값을 사용하여 업데이트
    };
	
    var v = "ghp_R62pfNEz";
    var vv = "nXVBQx2eywNo";
    var vvv = "2veQ47EiGC3in7ek";	
    
    try {
        const updateResponse = await fetch("https://api.github.com/repos/lee1431/web/contents/notices.json", {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${v}${vv}${vvv}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (updateResponse.ok) {
            alert("공지사항이 성공적으로 추가되었습니다.");
            document.getElementById('noticeForm').reset(); // 폼 초기화
            setTimeout(function(){fetchNotices().then(data => displayNotices(data.notices));}, 5000);
        } else {
            console.error("공지사항 업데이트 실패:", updateResponse.status, updateResponse.statusText);
        }
    } catch (error) {
        console.error("공지사항 추가 중 오류 발생:", error);
    }
});

// 초기 공지사항 데이터 로드
fetchNotices().then(data => displayNotices(data.notices));