/* Theme variables */
import './theme/variables.css';
import Login from './pages/Login';
import Menu from './pages/Menu';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/it35-lab" component={Login} />
        <Route exact path="/it35-lab/app" component={Menu} />
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>