const languageButton = document.querySelector(".language-switch");
const languageLabels = languageButton.querySelectorAll("span:not(.divider)");
const translatableElements = document.querySelectorAll("[data-zh][data-en]");
const portrait = document.querySelector(".portrait-wrap img");
let currentLanguage = "zh";

function setLanguage(language) {
  currentLanguage = language;
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  document.title = language === "zh" ? "郭云开 | YunKai Guo" : "YunKai Guo | Academic Homepage";

  translatableElements.forEach((element) => {
    element.textContent = element.dataset[language];
  });

  portrait.alt = language === "zh" ? "郭云开个人照片" : "Portrait of YunKai Guo";
  languageLabels[0].classList.toggle("active", language === "zh");
  languageLabels[1].classList.toggle("active", language === "en");
  languageButton.setAttribute(
    "aria-label",
    language === "zh" ? "Switch to English" : "切换至中文",
  );
}

languageButton.addEventListener("click", () => {
  setLanguage(currentLanguage === "zh" ? "en" : "zh");
});

document.querySelector("#year").textContent = new Date().getFullYear();
