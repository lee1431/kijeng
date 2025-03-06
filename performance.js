function showSectionFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');
    if (section) {
        showContent(section);
    } else {
        showContent("endd");
    }
}

function showContent(sectionId) {
    // 모든 섹션을 숨김
    var contentSections = document.getElementsByClassName("content-section");
    for (var i = 0; i < contentSections.length; i++) {
        contentSections[i].style.display = "none";
    }
    
    // 대상 섹션 표시
    var targetDiv = document.getElementById(sectionId + "-imgList");
    if (targetDiv) {
        targetDiv.style.display = "block";
    }

    // sectionId가 유효하지 않으면 기본값 설정
    if (!sectionId) {
        sectionId = "endd";
    }

    // className으로 요소 찾기 (HTMLCollection 반환됨)
    var targetDivCollection = document.getElementsByClassName(sectionId + "-imgList");

    if (targetDivCollection.length > 0 && targetDivCollection[0].innerHTML.trim() !== "") {
        return; // 이미 콘텐츠가 있으면 추가 요청 방지
    } 

    // 공지사항 데이터 불러오기
    fetchNotices(sectionId).then(result => { 
        displayNotices(result.notices, sectionId); 
    });
}

async function fetchNotices(jsName) {
    const url = `https://api.github.com/repos/lee1431/kijeng/contents/json/${jsName}.json`;
    
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

// 데이터 디스플레이
function displayNotices(imgList, sectionId) {
    const imageListHtml = document.getElementById(sectionId + "-imgList");
    if (!imageListHtml) return;

    imageListHtml.innerHTML = ""; // 기존 목록 초기화

    imgList.sort((a, b) => {
	const extractedA = a.imgfilepath;
	const partsA = extractedA.split("/");
	const filenameA = partsA[2];
	const numA = parseInt(filenameA.substring(0,13), 10);
	
	const extractedB = b.imgfilepath;
	const partsB = extractedB.split("/");
	const filenameB = partsB[2];
	const numB = parseInt(filenameB.substring(0,13), 10);
	    
	return numB - numA;
    });
	
    let row = document.createElement("div");
    row.classList.add("row", "g-4"); // g-4는 간격 조정 (Bootstrap 5 기준)
	
    imgList.forEach((il, index) => {
        const noticeItem = document.createElement("div");
        noticeItem.classList.add("col-lg-4", "col-md-6", "col-sm-12", "text-center");
        noticeItem.innerHTML = `
            <img class="img-thumbnail" style="cursor: pointer; max-width: 90%;" src="https://raw.githubusercontent.com/lee1431/kijangeng/main/json/${il.imgfilepath}" onclick="showImage(this)" />
			<h6 class="text-center mt-2">${il.title}</h6>
        `;
        row.appendChild(noticeItem);

        // 3번째마다 새로운 row 생성
        if ((index + 1) % 3 === 0) {
            imageListHtml.appendChild(row);
            row = document.createElement("div");
            row.classList.add("row", "g-4");
        }
    });

    // 남은 이미지가 있으면 추가
    if (row.children.length > 0) {
        imageListHtml.appendChild(row);
    }
}

// 페이지가 로드될 때 실행
document.addEventListener("DOMContentLoaded", showSectionFromURL);

function showImage(img) {
    
    document.getElementById('modalImage').src = img.src;
    new bootstrap.Modal(document.getElementById('imageModal')).show();
    
}

