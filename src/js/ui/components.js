const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("sidebar-overlay");

const menuBtn = document.getElementById("header-menu-btn");
const closeBtn = document.getElementById("sidebar-close-btn");

const openSidebar = () => {
  sidebar.classList.add("open");
  overlay.classList.add("show");
  document.body.style.overflow = "hidden";
};

const closeSidebar = () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
  document.body.style.overflow = "";
};

menuBtn.addEventListener("click", openSidebar);

closeBtn.addEventListener("click", closeSidebar);

overlay.addEventListener("click", closeSidebar);

window.addEventListener("resize", () => {
  if (window.innerWidth >= 1024) {
    closeSidebar();
  }
});
