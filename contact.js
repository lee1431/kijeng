

async function fetchData() {
    const url = "https://github.com/lee1431/kijeng/blob/main/json/notices.json";

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


function renderData(data) {
  const container = document.getElementById('notice-list');
  container.innerHTML = ''; // 기존 데이터 제거
  data.forEach(item => {
    const div = document.createElement('div');
    div.textContent = item.title; // 데이터를 문자열로 표시 (커스터마이즈 가능)
    container.appendChild(div);
  });
}

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
                    ${notice.uid ? `<a href="https://kijeng.co.kr/contact.html?view=${notice.link}" class="card-link">자세히 보기</a>` : ""}
                </div>
            </div>
        `;
        noticeList.appendChild(noticeItem);
    });
}


// GitHub에 파일 업로드
async function uploadFileToGitHub(filePath, content) {
    const url = `https://api.github.com/repos/lee1431/kijangeng/contents/json/${filePath}`;
    const data = {
        message: `Update ${filePath}`,
        content: content,
        branch: "main",
    };

	var v = "ghp_qQQFxG8PkK0mLVzf2";
    var vv = "xtis7dvxmHR5J3UAWRl";
	
    const response = await fetch(url, {
        method: "PUT",
        headers: {
            Authorization: `token ${v}${vv}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload file.");
    }
}

// 파일을 Base64로 변환
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(",")[1]); // Base64 데이터 추출
        reader.onerror = (error) => reject(error);
    });
}


// 초기 공지사항 데이터 로드
fetchNotices().then(data => displayNotices(data.notices));


var mapContainer = document.getElementById('map'),
	mapOption = { 
		center: new kakao.maps.LatLng(37.568044,127.045357),
		level: 4
	};
var map = new kakao.maps.Map(mapContainer, mapOption);
var imageSrc = 'https://kijeng.co.kr/marker_map.png',
	imageSize = new kakao.maps.Size(180, 100),
	imageOption = {offset: new kakao.maps.Point(27, 69)};
var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption),
	markerPosition = new kakao.maps.LatLng(37.568104,127.045357);
var marker = new kakao.maps.Marker({
  position: markerPosition,
  image: markerImage
});
marker.setMap(map);


function sendEmail() {
	const recipient = "example@example.com";
    const subject = document.getElementById('mailSubject').value;
    const body = document.getElementById('mailBody').value;
    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
	
	window.location.href = mailtoLink;
}
