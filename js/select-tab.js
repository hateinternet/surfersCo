'use sctrict';
(function () {
  var links = document.querySelector('.tabs__navigation');
  var linkClass = 'tabs__item';
  var activeLinkClass = 'tabs__item--active';
  var currentLink = document.querySelector('.' + activeLinkClass);

  var tabs = document.querySelectorAll('.tabs__text');
  var activeTabClass = 'tabs__text--active';
  var currentTab = document.querySelector('.' + activeTabClass);

  var isTabLink = function (evt) {
    return evt.target.classList.contains(linkClass) || evt.target.parentElement.classList.contains(linkClass);
  };

  var linkHandler = function (evt) {
    if (isTabLink(evt)) {
      evt.preventDefault();
      var element = evt.target.classList.contains(linkClass) ? evt.target : evt.target.parentElement;
      currentLink.classList.remove(activeLinkClass);
      element.classList.add(activeLinkClass);
      currentLink = element;

      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].dataset.tabContent === currentLink.dataset.tabName) {
          currentTab.classList.remove(activeTabClass);
          tabs[i].classList.add(activeTabClass);
          currentTab = tabs[i];
        }
      }
    }
  };

  links.addEventListener('click', linkHandler);
})();
