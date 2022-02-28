import "../scss/application.scss";
import jquery from "jquery";

window.$ = window.jQuery = jquery;
import Home from "./_modules/home";

$(function () {
  Home.init();
});
