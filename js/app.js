const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
/**
 *  1.RENDER SONG
 *  2. SCROLL TOP
 *  3. PLAY/PAUSE/SEEK
 *  4.CD ROTATE
 *  5.NEXT,PREV
 *  6.RANDOM//suffle
 *  7.NEXT/REPEAT WHEN ENDED
 *  8.ACTIVE SONG
 *  9.SCROLL ACTIVE SONG INTO VIEW
 *  10. PLAYSONG WHEN CLICK 
 * Nhiệm vụ còn lại dành cho các bạn:
1. Hạn chế tối đa các bài hát bị lặp lại
2. Fix lỗi khi tua bài hát, click giữ một chút sẽ thấy lỗi, vì event updatetime nó liên tục chạy dẫn tới lỗi
3. Fix lỗi khi next tới 1-3 bài đầu danh sách thì không “scroll into view”
4. Lưu lại vị trí bài hát đang nghe, F5 lại ứng dụng không bị quay trở về bài đầu tiên
5. Thêm chức năng điều chỉnh âm lượng, lưu vị trí âm lượng người dùng đã chọn. Mặc định 100%
6. Bug khi bấm random sẽ lưu lại newIndex. Khi tắt random vẫn sẽ nhảy tới bài random kế tiếp
7.check osự kiện mouse release thì ghi vào localStorage
 */
const PLAYER_STORAGE_KEY = "F8_PLAYER";
const heading = $("header h2");
const thumb = $(".cd-thumb");
const audio = $("#audio");
const cd = $(".cd");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playList = $(".playlist");
const volume = $("#volume");
const app = {
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  isRepeat: false,
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  defaultVolume: 1,
  songs: [
    {
      name: "2AM",
      singer: "Justatee-bigdady",
      path: "music/1.mp3",
      image: "img/1.jpg",
    },
    {
      name: "YEU LAI TU DAU",
      singer: "KHAC VIET",
      path: "music/2.mp3",
      image: "img/2.jpg",
    },
    {
      name: "CRYING OVER YOU",
      singer: "Justatee-bigdady",
      path: "music/3.mp3",
      image: "img/3.jpg",
    },
    {
      name: "anh yeu em",
      singer: "khac viet",
      path: "music/5.mp3",
      image: "img/5.jpg",
    },
    {
      name: "anh muon",
      singer: "themen",
      path: "music/6.mp3",
      image: "img/6.jpg",
    },
    {
      name: "xinloiem",
      singer: "Justatee",
      path: "music/7.mp3",
      image: "img/7.jpg",
    },
    {
      name: "forveralone",
      singer: "Justatee",
      path: "music/8.mp3",
      image: "img/8.jpg",
    },
    {
      name: "kiep do den",
      singer: "Justatee",
      path: "music/9.mp3",
      image: "img/9.jpg",
    },
    {
      name: "bigcityboiz",
      singer: "Justatee",
      path: "music/10.mp3",
      image: "img/10.jpg",
    },
  ],
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `<div class="song${
        index === this.currentIndex ? " active" : ""
      }"data-index=${index}>
            <div class="thumb" style="background-image: url('${song.image}')">
            </div>
            <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
            </div>
            <div class="option">
                <i class="fas fa-ellipsis-h"></i>
            </div>
        </div>`;
    });
    playList.innerHTML = htmls.join("");
  },
  handlEvent: function () {
    const _this = this; // this ở đây là app

    const cdWidth = cd.offsetWidth;
    // xử lý cd quay

    const cdThumbAnimate = thumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 7000, // quay trong 10s
      iterations: Infinity, // loop vĩnh viễn
    });
    cdThumbAnimate.pause();

    document.onscroll = () => {
      const scrollTop = window.scrollY;
      const cdnewWidth = cdWidth - scrollTop;
      cd.style.width = cdnewWidth > 0 ? cdnewWidth + "px" : 0;
      cd.style.opacity = cdnewWidth / cdWidth;
      // cosole.log(document.documentElement.scrollTop);
    };
    playBtn.onclick = () => {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    audio.onplay = () => {
      $(".player").classList.add("playing");
      _this.isPlaying = true;
      cdThumbAnimate.play();
    };

    audio.onpause = () => {
      _this.isPlaying = false;
      $(".player").classList.remove("playing");
      cdThumbAnimate.pause();
    };

    // khi tiến độ bài hát thay đổi
    audio.ontimeupdate = () => {
      if (audio.duration) {
        const percent = (audio.currentTime / audio.duration) * 100;
        progress.value = percent;
      }
    };

    progress.onchange = (e) => {
      seekTime = (e.target.value * audio.duration) / 100;
      audio.currentTime = seekTime;
    };

    nextBtn.onclick = () => {
      _this.currentIndex++;
      if (_this.isRandom) {
        _this.playrandomSong();
      } else if (_this.currentIndex >= _this.songs.length) {
        _this.currentIndex = 0;
      }
      _this.loadcurrentSong();
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    prevBtn.onclick = () => {
      _this.currentIndex--;
      if (_this.currentIndex < 0) {
        _this.currentIndex = _this.songs.length - 1;
      }
      _this.loadcurrentSong();
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    randomBtn.onclick = () => {
      _this.isRandom = !_this.isRandom;
      randomBtn.classList.toggle("active", _this.isRandom);
      _this.playrandomSong();
      audio.play();
      _this.setConfig("isRandom", _this.isRandom);
    };

    audio.onended = () => {
      if (_this.isRepeat) {
        // _this.loadcurrentSong();
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    repeatBtn.onclick = () => {
      _this.isRepeat = !_this.isRepeat;
      repeatBtn.classList.toggle("active", _this.isRepeat);
      _this.setConfig("isRepeat", _this.isRepeat);
    };
    playList.onclick = (e) => {
      const songNode = e.target.closest(".song:not(.active)");
      if (songNode || e.target.closest(".option")) {
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadcurrentSong();
          audio.play();
          _this.render();
        }
      }
    };
    //oninput change continusly//ghi liên tục lên localStorage? có tối ưu
    volume.oninput = (e) => {
      // console.log(e.target.value);
      audio.volume = Math.ceil(e.target.value * 10) / 1000;
      _this.setConfig("defaultVolume", audio.volume);
    };
  },

  loadcurrentSong: function () {
    heading.textContent = this.currentSong.name;
    thumb.style.backgroundImage = `url(${this.currentSong.image})`;
    audio.src = this.currentSong.path;
  },
  playrandomSong: function () {
    let newIndex;
    let oldIndex = this.currentIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);
    if (this.isRandom) {
      this.currentIndex = newIndex;
    } else {
      this.currentIndex = oldIndex;
    }
    // this.loadcurrentSong();
  },
  scrollToActiveSong() {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 300);
  },
  loadConfig() {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
    this.defaultVolume = this.config.defaultVolume;
  },

  start: function () {
    // load cấu hình;
    this.loadConfig();
    // định nghĩa phương thức cho Object
    this.defineProperties();
    // lắng nghe event
    this.handlEvent();
    //load bài hát mở đầu
    this.loadcurrentSong();
    this.render();
    // hiển thị nút xử lý của player dựa theo load config
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);
    volume.value = Number(this.defaultVolume) * 100;
    audio.volume = volume.value / 100;
  },
};
app.start();
