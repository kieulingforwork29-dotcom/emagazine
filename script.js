/* ============================================================
   script.js — E-Magazine "Từ Trang Sách Lên Màn Bạc"
   ============================================================ */


/* ── 1. READING PROGRESS BAR ──────────────────────────────── */
// Thanh vàng mỏng ở đỉnh trang, tăng theo tiến độ cuộn
const pfill = document.getElementById('pf');

function updateProgress() {
  const scrolled  = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct       = docHeight > 0 ? (scrolled / docHeight) * 100 : 0;
  pfill.style.width = pct + '%';
}


/* ── 2. STICKY NAV — đổi style khi cuộn qua hero ─────────── */
// Khi cuộn vượt quá chiều cao viewport (= qua hero), nav thu nhỏ lại
const nav        = document.querySelector('.topnav');
const heroHeight = window.innerHeight;

function updateNav() {
  if (window.scrollY > heroHeight * 0.8) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}


/* ── 3. GỌI CẢ HAI HÀM KHI CUỘN ─────────────────────────── */
window.addEventListener('scroll', () => {
  updateProgress();
  updateNav();
}, { passive: true }); // passive: true giúp cuộn mượt hơn trên mobile


/* ── 4. SCROLL FADE-IN (IntersectionObserver) ─────────────── */
// Mỗi element có class .fade-in sẽ xuất hiện dần khi cuộn đến
// CSS đã chuẩn bị: opacity:0 + translateY(28px) → chuyển về visible

const fadeEls = document.querySelectorAll('.fade-in');

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Thêm class .visible → CSS transition chạy
        entry.target.classList.add('visible');
        // Bỏ observe sau khi đã hiện — không cần theo dõi nữa
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,   // Kích hoạt khi 12% element xuất hiện trong viewport
    rootMargin: '0px 0px -40px 0px' // Trễ 40px từ đáy viewport
  }
);

fadeEls.forEach(el => fadeObserver.observe(el));


/* ── 5. LIGHTBOX ──────────────────────────────────────────── */
// Click ảnh trong .g3 hoặc .side-img để xem phóng to
// Click ngoài ảnh hoặc nút ✕ để đóng

// Tạo lightbox DOM động — không cần thêm vào HTML
const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.innerHTML = `
  <button class="lightbox-close" aria-label="Đóng">✕</button>
  <img src="" alt="Phóng to ảnh">
`;
document.body.appendChild(lightbox);

const lbImg   = lightbox.querySelector('img');
const lbClose = lightbox.querySelector('.lightbox-close');

// Hàm mở lightbox với ảnh được truyền vào
function openLightbox(src, alt) {
  lbImg.src = src;
  lbImg.alt = alt || '';
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden'; // Khóa cuộn trang khi lightbox mở
}

// Hàm đóng lightbox
function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = ''; // Trả lại cuộn trang
  // Xóa src sau khi animation đóng để tránh flash ảnh cũ lần sau
  setTimeout(() => { lbImg.src = ''; }, 200);
}

// Tìm tất cả ảnh trong .g3 và .side-img, gán sự kiện click
document.querySelectorAll('.g3 img, .side-img img').forEach(img => {
  img.addEventListener('click', () => {
    // Chỉ mở lightbox nếu ảnh đã có src thật (không phải placeholder trống)
    if (img.src && img.naturalWidth > 0) {
      openLightbox(img.src, img.alt);
    }
  });
});

// Đóng khi click nút ✕
lbClose.addEventListener('click', closeLightbox);

// Đóng khi click vào vùng nền tối bên ngoài ảnh
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

// Đóng khi nhấn phím Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && lightbox.classList.contains('open')) {
    closeLightbox();
  }
});


/* ── 6. SMOOTH SCROLL cho anchor link (nếu có menu sau này) ─ */
// Bắt tất cả <a href="#..."> và cuộn mượt tới đúng section
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = nav ? nav.offsetHeight + 16 : 0; // Trừ chiều cao nav cố định
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});


/* ── 7. ẨN PLACEHOLDER KHI ẢNH TẢI THÀNH CÔNG ───────────── */
// Khi <img> load xong và có nội dung thật → ẩn icon placeholder đi
document.querySelectorAll('img').forEach(img => {
  // Nếu ảnh đã load sẵn (cached)
  if (img.complete && img.naturalWidth > 0) {
    hidePlaceholder(img);
  }
  // Nếu ảnh tải sau
  img.addEventListener('load', () => {
    if (img.naturalWidth > 0) hidePlaceholder(img);
  });
});

function hidePlaceholder(img) {
  // Tìm .ph hoặc .hero-ph anh em gần nhất cùng parent
  const parent = img.parentElement;
  const ph = parent.querySelector('.ph, .hero-ph');
  if (ph) ph.style.display = 'none';
}

