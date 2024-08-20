const $header = document.querySelector("header");
const $h1 = $header.querySelector("h1");
const $form = $header.querySelector("form");
const $input = $header.querySelector("input");
const $openLikes = $header.querySelector(".open-likes");
const $category = $header.querySelector(".category");

const $h2 = document.querySelector("h2");
const $wrap = document.querySelector(".wrap");

const $modalSec = document.querySelector(".modal-sec");
const $modal = $modalSec.querySelector(".modal");
const $modalWrap = $modalSec.querySelector(".modal-wrap");
const $close = $modalSec.querySelector(".close");

const $pageSec = document.querySelector(".page-sec");

let mainList = []; //메인 화면에 보일 리스트
let likeList = JSON.parse(localStorage.getItem("likeList")) || []; //좋아요 목록 리스트

let curApiFun; //직전에 사용한 api, 검색 or 최신도서(default)
let category = ""; //category 검색중이 아니면 빈 문자열
let keyword = ""; //keyword 검색중이 아니면 빈 문자열

let totalResults = 0;
let page = 1;
const pagePerGroup = 5; //그룹당 페이지 수
const itemPerPage = 8; //페이지당 책 수

//검색
const searchItem = async (_, query, page) => {
  try {
    const url = `http://localhost:3000/api/search?query=${query}&page=${page}`;
    const res = await fetch(url);
    const data = await res.json();
    totalResults = data.totalResults;
    return data.item;
  } catch (error) {
    console.log(error);
    return [];
  }
};

//최신도서
const getNewItem = async (category, _, page) => {
  try {
    const url = `http://localhost:3000/api/newitem?category=${category}&page=${page}`;
    const res = await fetch(url);
    const data = await res.json();
    totalResults = data.totalResults;
    return data.item;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const movePage = async (newPage) => {
  page = newPage;
  const items = await curApiFun(category, keyword, page);
  mainList = items;
  draw(items, $wrap);
  pagination();
};

const pagination = () => {
  const totalPage = Math.ceil(totalResults / itemPerPage);
  const groupPage = Math.ceil(page / pagePerGroup); //현재 몇번째 그룹인지
  const firstPage = (groupPage - 1) * pagePerGroup + 1; //그룹내 첫번째 페이지
  const lastPage = Math.min(groupPage * pagePerGroup, totalPage); //그룹내 마지막 페이지
  const prevGroupFirstPage = (groupPage - 2) * pagePerGroup + 1; //이전 그룹 첫번째 페이지
  const nextGroupFirstPage = groupPage * pagePerGroup + 1; //다음 그룹 첫번째 페이지

  let paginationHtml = `<button class="prev" ${
    groupPage == 1 ? "disabled" : ""
  } onClick='movePage(${prevGroupFirstPage})'><i class="fas fa-arrow-left"></i></button>`;

  for (let i = firstPage; i <= lastPage; i++) {
    paginationHtml += `<button class="${
      i === page ? "on" : ""
    }" onClick='movePage(${i})'>${i}</button>`;
  }

  paginationHtml += `<button class="next" ${
    groupPage * pagePerGroup >= totalPage ? "disabled" : ""
  } onClick='movePage(${nextGroupFirstPage})'><i class="fas fas fa-arrow-right"></i></button>`;

  $pageSec.innerHTML = paginationHtml;
};

//좋아요 목록에 있는지
const isInLikeList = (isbn) => {
  let isIn = false;
  likeList.forEach((v) => {
    v.isbn === isbn ? (isIn = true) : null;
  });
  return isIn;
};

const createHtml = (item) => {
  const {
    cover,
    description,
    link,
    title,
    priceSales,
    author,
    publisher,
    isbn,
  } = item;
  return `<li class="item">
            <a href=${link} target="_blank"=true>
              <div class="photo" style="background-image: url(${cover})">
                <div class="description">${
                  description || "정보가 없습니다."
                }</div>
              </div>
              <span class="title">${title}</span>
              <strong class="price">${priceSales.toLocaleString(
                "ko-KR"
              )}원</strong>
              <div class="like ${
                isInLikeList(isbn) ? "on" : ""
              }" data-isbn=${isbn}>
              </div>
              <p class="maker">${author} / ${publisher}</p>
            </a>
          </li>`;
};

//책 리스트 화면에 띄우기
const draw = (items, parent) => {
  const htmls = items.map((item) => createHtml(item)).join("");
  parent.innerHTML = htmls;
  addEventToLike(); //좋아요 클릭이벤트 추가
};

const onLikeClick = (e, like, index) => {
  e.preventDefault();
  if (likeList.length === 20) return;
  if (like.classList.contains("on")) {
    like.classList.remove("on");
    const isbn = like.dataset.isbn;
    const newLikeList = likeList.filter((item) => item.isbn !== isbn);
    likeList = newLikeList;
    draw(likeList, $modalWrap);
    localStorage.setItem("likeList", JSON.stringify(likeList));
  } else {
    like.classList.add("on");
    const itemObj = mainList[index];
    likeList.push(itemObj);
    localStorage.setItem("likeList", JSON.stringify(likeList));
  }
};

//좋아요 클릭이벤트 추가
const addEventToLike = () => {
  const $likes = document.querySelectorAll(".like");
  $likes.forEach((like, index) => {
    like.addEventListener("click", (e) => onLikeClick(e, like, index));
  });
};

//화면 렌더링
const renderPage = async (apiFun) => {
  page = 1;
  curApiFun = apiFun;
  const items = await curApiFun(category, keyword, page);
  mainList = items;
  draw(items, $wrap);
  pagination();
};

//스크롤 시 헤더 이벤트
window.addEventListener("scroll", () => {
  if (window.scrollY > 0) {
    $header.classList.add("on");
  } else {
    $header.classList.remove("on");
  }
});

//좋아요 목록 열기
$openLikes.addEventListener("click", () => {
  draw(likeList, $modalWrap);
  $modalSec.classList.add("on");
});

//좋아요 목록 닫기
$close.addEventListener("click", () => {
  draw(mainList, $wrap);
  $modalSec.classList.remove("on");
});

$form.addEventListener("submit", async (e) => {
  e.preventDefault();
  keyword = $input.value.trim();
  if (keyword.length < 2 || keyword.length > 25) return;
  await renderPage(searchItem);
  $h2.innerText = `${keyword} 검색결과입니다.`;
});

//로고 클릭
$h1.addEventListener("click", () => {
  $input.value = "";
  keyword = "";
  category = "";
  init();
});

$category.addEventListener("click", async (e) => {
  const cid = e.target.dataset.cid;
  const text = e.target.innerText;
  category = cid;
  await renderPage(getNewItem);
  $h2.innerText = `${text} 검색결과입니다.`;
});

const init = async () => {
  await renderPage(getNewItem);
  $h2.innerText = `최신 도서 결과입니다.`;
};

init();
