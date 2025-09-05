// scr/JavaScript/menu-handler.js
document.addEventListener('DOMContentLoaded', function () {
  const navbarCollapse = document.querySelector('.navbar-collapse');

  document.querySelectorAll('.navbar-nav .dropdown-item, .navbar-nav > .nav-item > .nav-link').forEach(link => {
    link.addEventListener('click', function () {
      const isDropdownToggle = link.classList.contains('dropdown-toggle');

      if (!isDropdownToggle) {
        setTimeout(() => {
          const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse) || new bootstrap.Collapse(navbarCollapse);
          bsCollapse.hide();
        }, 150);
      }
    });
  });
});
