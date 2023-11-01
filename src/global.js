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
import CartPage from './components/Shop/CartPage';
// import Announcements from './components/Utility/Automations/Announcements';
import Forms from './components/Utility/Forms';
import CollectionsRedirect from './components/Utility/Automations/CollectionsRedirect';

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
  CartPage();
  CartDrawer();
  // Announcements();
  Forms();
  CollectionsRedirect();
};
const init = () => {
  GlobalComponents();
};

$(function () {
  init();
});
