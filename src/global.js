import './global.css';
import { gsap } from 'gsap';

window.gsap = gsap;

import Drawers from './components/Drawers/Drawers';
import VideoMask from './components/VideoMask';
import SkinConcernsSection from './components/SkinConcernsSection';
import Shop from './components/Shop/Shop';
import CartController from './components/Cart/CartController';
import TreatmentsSection from './components/TreatmentsSection';
import TreatmentsPage from './components/TreatmentsPage';
import Questions from './components/Questions';
import Products from './components/Shop/Products';
import SearchForm from './components/Search/SearchForm';
import SearchResults from './components/Search/SearchResults';
import CustomerLogin from './components/Customer/CustomerLogin';
import Addresses from './components/Customer/Addresses';
import QuantityField from './components/Shop/QuantityField';
import CartPage from './components/Shop/CartPage';
// import Announcements from './components/Utility/Automations/Announcements';
import Forms from './components/Utility/Forms';
import CollectionsRedirect from './components/Utility/Automations/CollectionsRedirect';
import CopyrightYear from './components/Utility/CopyrightYear';
import VideoControls from './components/Utility/VideoControls';

const GlobalComponents = () => {
  Drawers();
  VideoMask();
  SkinConcernsSection();
  TreatmentsSection();
  Shop();
  TreatmentsPage();
  Questions();
  Products();
  SearchForm();
  SearchResults();
  CustomerLogin();
  Addresses();
  QuantityField();
  CartController();
  CartPage();
  // Announcements();
  Forms();
  CollectionsRedirect();
  CopyrightYear();
  new VideoControls();
};
const init = () => {
  GlobalComponents();
};

$(function () {
  init();
});
