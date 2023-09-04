import Drawers from './components/Drawers/Drawers';
import VideoMask from './components/VideoMask';
import SkinConcernsSection from './components/SkinConcernsSection';
import Shop from './components/Shop/Shop';
import CartDrawer from './components/Drawers/CartDrawer';
import TreatmentsSection from './components/TreatmentsSection';
import TreatmentsPage from './components/TreatmentsPage';
import Questions from './components/Questions';
import Products from './components/Shop/Products';
import SearchForm from './components/Search/SearchForm';
import SearchResults from './components/Search/SearchResults';
import CustomerLogin from './components/Customer/CustomerLogin';
import Addresses from './components/Customer/Addresses';
import QuantityField from './components/Shop/QuantityField';

const GlobalComponents = () => {
  Drawers();
  VideoMask();
  SkinConcernsSection();
  TreatmentsSection();
  Shop();
  CartDrawer();
  TreatmentsPage();
  Questions();
  Products();
  SearchForm();
  SearchResults();
  CustomerLogin();
  Addresses();
  QuantityField();
};
const init = () => {
  GlobalComponents();
};

$(function () {
  init();
});
