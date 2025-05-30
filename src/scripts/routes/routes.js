import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import LoginPage from '../pages/login/login-page';
import RegisterPage from '../pages/register/register-page';
import DetailPage from '../pages/detail/detail-page';
import AddStoryPage from '../pages/add-story/add-story-page';
import SavedPage from '../pages/saved/saved-page';

const routes = {
  '/': new HomePage(),
  '/saved': new SavedPage(),
  '/about': new AboutPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/detail/:id': new DetailPage(),
  '/add': new AddStoryPage(),
};

export default routes;