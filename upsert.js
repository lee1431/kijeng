
// 공지사항 추가 폼 제출 처리
document.getElementById('noticeForm').addEventListener('submit', async function (e) {
    e.preventDefault();

	const fsdir = document.getElementById('fsdir').value;
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
	const imageFile = document.getElementById("image").files[0];
	
    // 기존 JSON 파일을 가져와서 새 공지사항을 추가한 뒤 GitHub에 업데이트
    const { notices = [], sha } = await fetchNotices(fsdir);

    if (!sha) {
        alert('기존 공지사항 데이터를 가져오는 데 실패했습니다.');
        return;
    }
	
	
	const imagePath = `images/${fsdir}/${Date.now()}_${imageFile.name}`;	
	await uploadFileToGitHub(imagePath, await fileToBase64(imageFile));

    // 새로운 항목 추가
    const newNotice = {
        title,
        content,
        date: new Date().toISOString().split('T')[0],
		link: "#",
		jr: fsdir,
		imgfilepath: imagePath,
		uid: crypto.randomUUID()
    };
    notices.push(newNotice);

    // GitHub에 업데이트할 데이터 설정
    const updateData = {
        message: "업데이트",
        content: btoa(unescape(encodeURIComponent(JSON.stringify(notices, null, 2)))),
        sha: sha // 기존 파일의 SHA 값을 사용하여 업데이트
    };
	
    var v = "ghp_wMfZAjhSdjNnTIEb";
    var vv = "ozXeIpzsoYyBIA1LS55U";
	
	var jsonName = "";
	if(fsdir == "kongg") {
		jsonName = "notices";
	} else {
		jsonName = fsdir;
	}
    	
    try {
        const updateResponse = await fetch("https://api.github.com/repos/lee1431/kijeng/contents/json/"+ jsonName +".json", {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${v}${vv}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (updateResponse.ok) {
            alert("공지사항이 성공적으로 추가되었습니다.");
            document.getElementById('noticeForm').reset(); // 폼 초기화
            setTimeout(function(){fetchNotices(fsdir).then(data => displayNotices(data.notices));}, 5000);
        } else {
		alert("공지사항 업데이트 실패하였습니다. 새로고침 후 조금 뒤 다시 시도해 주세요!!");
        	console.error("공지사항 업데이트 실패:", updateResponse.status, updateResponse.statusText);
        }
    } catch (error) {
        console.error("공지사항 추가 중 오류 발생:", error);
    }
});



// GitHub에 파일 업로드
async function uploadFileToGitHub(filePath, content) {
	console.log("file path - "+filePath);
    const url = `https://api.github.com/repos/lee1431/kijeng/contents/json/${filePath}`;
    const data = {
        message: `Update ${filePath}`,
        content: content,
        branch: "main",
    };

var v = "ghp_wMfZAjhSdjNnTIEb";
    var vv = "ozXeIpzsoYyBIA1LS55U";
	
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
function sltBox() {
	const sltBoxJsonName = document.getElementById("optionSelect").value;

	var titleName = "";
	
	if(sltBoxJsonName == "kongg") {
		titleName = "공지사항";
	}
	if(sltBoxJsonName == "endd") {
		titleName = "에너지진단 실적";
	}
	if(sltBoxJsonName == "tab") {
		titleName = "TAB 실적";
	}
	if(sltBoxJsonName == "enp") {
		titleName = "에너지사용계획 실적";
	}
	if(sltBoxJsonName == "machine") {
		titleName = "기계설비 성능점검 실적";
	}
	if(sltBoxJsonName == "turnel") {
		titleName = "터널 제연설비 성능검증 실적";
	}
	
	const formList = document.getElementById("noticeForm");
    formList.innerHTML = ""; // 기존 목록 초기화
	
	const formItems = document.createElement("div");
	formItems.classList.add("container");
	formItems.id = sltBoxJsonName;
	formItems.innerHTML = `
			<h2 class="text-center mb-4">${titleName} 추가</h2>
			<div class="mb-3">
				<label for="title" class="form-label">제목</label>
				<input type="text" class="form-control" id="title" required>
			</div>
			<div class="mb-3">
				<label for="content" class="form-label">내용</label>
				<textarea class="form-control" placeholder="Comments" id="content" style="height: 150px" ></textarea>
			</div>
			<div class="mb-3">
				<label for="image">이미지 파일 :</label>
				<input type="file" id="image" name="image" accept="image/*" ><br><br>
			</div>
			<input type="hidden" id="fsdir" value="${sltBoxJsonName}" />
			<button type="submit" class="btn btn-primary">${titleName} 추가</button>
			`;
	formList.appendChild(formItems);
	
	
	if(sltBoxJsonName === undefined) {
		return;
	} else {
		fetchNotices(sltBoxJsonName).then(result => { displayNotices(result.notices); });
	}
}

async function fetchNotices(jsName) {
	var jsonFileName = "";
	if(jsName == "kongg") {
		jsonFileName = "notices";
	} else {
		jsonFileName = jsName;
	}
	console.log(jsonFileName + " <= ?>?? ");
	
    const url = "https://api.github.com/repos/lee1431/kijeng/contents/json/"+ jsonFileName +".json";

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
