document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu functionality
  const iconMenu = document.querySelector('.icon-menu');
  const menuBody = document.querySelector('.menu__body');
  
  if (iconMenu) {
    iconMenu.addEventListener("click", function(e) {
      document.body.classList.toggle('menu-open');
      iconMenu.classList.toggle('active');
      menuBody.classList.toggle('active');
    });
  }

  // Close menu when clicking on a menu item
  const menuLinks = document.querySelectorAll('.menu__link');
  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      document.body.classList.remove('menu-open');
      iconMenu.classList.remove('active');
      menuBody.classList.remove('active');
    });
  });
});

const spollerButtons = document.querySelectorAll("[data-spoller] .spollers-faq__button");

spollerButtons.forEach((button) => {
  button.addEventListener("click", function () {
    const currentItem = button.closest("[data-spoller]");
    const content = currentItem.querySelector(".spollers-faq__text");

    const parent = currentItem.parentNode;
    const isOneSpoller = parent.hasAttribute("data-one-spoller");

    if (isOneSpoller) {
      const allItems = parent.querySelectorAll("[data-spoller]");
      allItems.forEach((item) => {
        if (item !== currentItem) {
          const otherContent = item.querySelector(".spollers-faq__text");
          item.classList.remove("active");
          otherContent.style.maxHeight = null;
        }
      });
    }

    if (currentItem.classList.contains("active")) {
      currentItem.classList.remove("active");
      content.style.maxHeight = null;
    } else {
      currentItem.classList.add("active");
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
});

// Function to change the main product image when thumbnails are clicked
function changeMainImage(imageSrc) {
  document.getElementById('main-product-image').src = imageSrc;
}
